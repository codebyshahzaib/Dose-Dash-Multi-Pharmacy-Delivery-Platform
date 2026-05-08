import prisma from '../config/prisma.js';

/* ── GET /api/orders/customer ───────────────────────────────────── */
/**
 * Customers see their overall orders, each containing potentially multiple pharmacy fulfillments.
 */
export const getCustomerOrders = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id }
    });
    if (!customer) return res.status(403).json({ message: 'Customer profile not found.' });

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: {
        fulfillments: {
          include: {
            pharmacy: { select: { id: true, name: true, city: true, phone: true } },
            rider: { include: { user: { select: { name: true, phone: true } } } },
            items: { include: { medicine: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ orders });
  } catch (err) {
    console.error('❌ getCustomerOrders error:', err.message);
    return res.status(500).json({ message: 'Failed to load orders.' });
  }
};

/* ── GET /api/orders/pharmacy ──────────────────────────────────── */
/**
 * Pharmacists see only their specific fulfillments (parts of a larger order).
 */
export const getPharmacyOrders = async (req, res) => {
  try {
    const owner = await prisma.pharmacyOwner.findUnique({
      where: { userId: req.user.id },
      include: { pharmacy: { select: { id: true } } }
    });
    
    if (!owner || !owner.pharmacy) {
      return res.status(403).json({ message: 'Pharmacy profile not found.' });
    }

    const fulfillments = await prisma.orderFulfillment.findMany({
      where: { pharmacyId: owner.pharmacy.id },
      include: {
        order: {
          include: {
            customer: { include: { user: { select: { name: true, email: true, phone: true } } } }
          }
        },
        rider: { include: { user: { select: { name: true, phone: true } } } },
        items: { include: { medicine: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ fulfillments });
  } catch (err) {
    console.error('❌ getPharmacyOrders error:', err.message);
    return res.status(500).json({ message: 'Failed to load fulfilments.' });
  }
};

/* ── PATCH /api/orders/fulfillments/:id/status ─────────────────── */
const VALID_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['DELIVERED'],
};

export const updateFulfillmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const role = req.user.role;

    const fulfillment = await prisma.orderFulfillment.findUnique({
      where: { id: parseInt(id) },
      include: { pharmacy: { include: { owner: true } } }
    });

    if (!fulfillment) return res.status(404).json({ message: 'Fulfillment not found.' });

    // Auth
    if (role === 'PHARMACY_OWNER') {
      if (fulfillment.pharmacy.owner.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not your fulfillment.' });
      }
    } else if (role === 'RIDER') {
      const rider = await prisma.rider.findUnique({ where: { userId: req.user.id } });
      if (!rider || fulfillment.riderId !== rider.id) {
        return res.status(403).json({ message: 'Not your assigned delivery.' });
      }
    }

    // State machine check
    const allowed = VALID_TRANSITIONS[fulfillment.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Cannot transition from ${fulfillment.status} to ${status}.` });
    }

    const updated = await prisma.orderFulfillment.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    // OPTIONAL: Logic to complete parent order if all fulfillments are delivered
    if (status === 'DELIVERED') {
      const allFulfillments = await prisma.orderFulfillment.findMany({
        where: { orderId: fulfillment.orderId }
      });
      const allDelivered = allFulfillments.every(f => f.status === 'DELIVERED');
      if (allDelivered) {
        await prisma.order.update({
          where: { id: fulfillment.orderId },
          data: { status: 'DELIVERED' }
        });
      }
    }

    return res.json({ message: `Status updated to ${status}.`, fulfillment: updated });
  } catch (err) {
    console.error('❌ updateFulfillmentStatus error:', err.message);
    return res.status(500).json({ message: 'Update failed.' });
  }
};

/* ── PATCH /api/orders/fulfillments/:id/assign-rider ───────────── */
export const assignRiderToFulfillment = async (req, res) => {
  try {
    const { id } = req.params;
    const { riderId } = req.body;

    const fulfillment = await prisma.orderFulfillment.findUnique({
      where: { id: parseInt(id) },
      include: { pharmacy: { include: { owner: true } } }
    });

    if (!fulfillment) return res.status(404).json({ message: 'Fulfillment not found.' });
    if (fulfillment.pharmacy.owner.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const rider = await prisma.rider.findUnique({ where: { id: parseInt(riderId) } });
    if (!rider) return res.status(404).json({ message: 'Rider not found.' });

    await prisma.orderFulfillment.update({
      where: { id: parseInt(id) },
      data: { riderId: rider.id }
    });

    return res.json({ message: 'Rider assigned successfully.' });
  } catch (err) {
    console.error('❌ assignRiderToFulfillment error:', err.message);
    return res.status(500).json({ message: 'Assignment failed.' });
  }
};
