import prisma from '../config/prisma.js';

/* ── GET /api/riders/profile ────────────────────────────────────── */
export const getRiderProfile = async (req, res) => {
  try {
    const profile = await prisma.rider.findUnique({
      where: { userId: req.user.id },
      include: { 
        user: { select: { name: true, email: true, phone: true } },
        affiliatedPharmacy: { select: { id: true, name: true, city: true, address: true, phone: true } }
      }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Rider profile not found.' });
    }

    return res.json({ profile });
  } catch (err) {
    console.error('❌ getRiderProfile error:', err.message);
    return res.status(500).json({ message: 'Could not load rider profile.' });
  }
};

/* ── PUT /api/riders/profile ────────────────────────────────────── */
export const updateRiderProfile = async (req, res) => {
  try {
    const { vehicleType, vehicleNumber, isAvailable, name, phone, city } = req.body;

    if (name || phone) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name, phone }
      });
    }

    const updated = await prisma.rider.update({
      where: { userId: req.user.id },
      data: {
        vehicleType,
        vehicleNumber,
        city,
        isAvailable: isAvailable !== undefined ? (isAvailable === true || isAvailable === 'true') : undefined
      },
      include: { 
        user: { select: { name: true, email: true, phone: true } },
        affiliatedPharmacy: { select: { id: true, name: true, city: true, address: true } }
      }
    });

    return res.json({ message: 'Profile updated.', profile: updated });
  } catch (err) {
    console.error('❌ updateRiderProfile error:', err.message);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
};

/* ── GET /api/riders/available-cities ────────────────────────────── */
export const getAvailableCities = async (req, res) => {
  try {
    // Get unique cities where pharmacies exist
    const cities = await prisma.pharmacy.findMany({
      where: { isActive: true },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' }
    });

    return res.json({ cities: cities.map(c => c.city) });
  } catch (err) {
    console.error('❌ getAvailableCities error:', err.message);
    return res.status(500).json({ message: 'Failed to load cities.' });
  }
};

/* ── GET /api/riders/pharmacies-by-city?city=<city> ────────────── */
export const getPharmaciesByCity = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ message: 'City is required.' });
    }

    const pharmacies = await prisma.pharmacy.findMany({
      where: { city, isActive: true },
      include: {
        affiliatedRiders: { 
          select: { 
            id: true, 
            user: { select: { name: true } },
            vehicleType: true,
            vehicleNumber: true 
          } 
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.json({ pharmacies });
  } catch (err) {
    console.error('❌ getPharmaciesByCity error:', err.message);
    return res.status(500).json({ message: 'Failed to load pharmacies.' });
  }
};

/* ── POST /api/riders/affiliate-pharmacy ───────────────────────── */
export const affiliateWithPharmacy = async (req, res) => {
  try {
    const { pharmacyId, vehicleType, vehicleNumber } = req.body;

    if (!pharmacyId) {
      return res.status(400).json({ message: 'Pharmacy ID is required.' });
    }

    // Verify pharmacy exists and is active
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: parseInt(pharmacyId) }
    });

    if (!pharmacy || !pharmacy.isActive) {
      return res.status(404).json({ message: 'Pharmacy not found or inactive.' });
    }

    // Update rider with affiliation and vehicle details
    const updatedRider = await prisma.rider.update({
      where: { userId: req.user.id },
      data: {
        affiliatedPharmacyId: parseInt(pharmacyId),
        city: pharmacy.city,
        vehicleType: vehicleType || undefined,
        vehicleNumber: vehicleNumber || undefined
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        affiliatedPharmacy: { select: { id: true, name: true, city: true, address: true, phone: true } }
      }
    });

    return res.json({ 
      message: `Successfully affiliated with ${pharmacy.name}`, 
      profile: updatedRider 
    });
  } catch (err) {
    console.error('❌ affiliateWithPharmacy error:', err.message);
    return res.status(500).json({ message: 'Failed to affiliate with pharmacy.' });
  }
};

/* ── GET /api/riders/orders ────────────────────────────────────── */
/**
 * Riders see fulfillments assigned to them with full delivery details.
 */
export const getRiderOrders = async (req, res) => {
  try {
    const rider = await prisma.rider.findUnique({
      where: { userId: req.user.id }
    });
    if (!rider) {
      return res.status(403).json({ message: 'Rider profile not found.' });
    }

    const fulfillments = await prisma.orderFulfillment.findMany({
      where: { riderId: rider.id },
      include: {
        order: {
          include: {
            customer: { 
              include: { 
                user: { select: { name: true, phone: true } } 
              } 
            },
          }
        },
        pharmacy: { select: { id: true, name: true, address: true, city: true, phone: true, latitude: true, longitude: true } },
        items: { include: { medicine: { select: { id: true, name: true, salt: true, strength: true, form: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ fulfillments });
  } catch (err) {
    console.error('❌ getRiderOrders error:', err.message);
    return res.status(500).json({ message: 'Failed to load deliveries.' });
  }
};

/* ── PUT /api/riders/fulfillment/:fulfillmentId/status ──────────── */
export const updateFulfillmentStatus = async (req, res) => {
  try {
    const { fulfillmentId } = req.params;
    const { status, pickedUp, paymentReceived } = req.body;

    const rider = await prisma.rider.findUnique({
      where: { userId: req.user.id }
    });

    if (!rider) {
      return res.status(403).json({ message: 'Rider profile not found.' });
    }

    // Verify this fulfillment belongs to this rider
    const fulfillment = await prisma.orderFulfillment.findUnique({
      where: { id: parseInt(fulfillmentId) }
    });

    if (!fulfillment || fulfillment.riderId !== rider.id) {
      return res.status(403).json({ message: 'Not authorized to update this fulfillment.' });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const updated = await prisma.orderFulfillment.update({
      where: { id: parseInt(fulfillmentId) },
      data: { status },
      include: {
        order: { include: { customer: { include: { user: { select: { name: true, phone: true } } } } } },
        pharmacy: { select: { name: true, address: true, city: true, phone: true } },
        items: { include: { medicine: true } }
      }
    });

    return res.json({ message: `Status updated to ${status}`, fulfillment: updated });
  } catch (err) {
    console.error('❌ updateFulfillmentStatus error:', err.message);
    return res.status(500).json({ message: 'Failed to update fulfillment status.' });
  }
};

/* ── POST /api/riders/accept-order/:fulfillmentId ────────────── */
export const acceptOrder = async (req, res) => {
  try {
    const { fulfillmentId } = req.params;

    const rider = await prisma.rider.findUnique({
      where: { userId: req.user.id }
    });

    if (!rider) {
      return res.status(403).json({ message: 'Rider profile not found.' });
    }

    const fulfillment = await prisma.orderFulfillment.findUnique({
      where: { id: parseInt(fulfillmentId) }
    });

    if (!fulfillment || fulfillment.riderId !== rider.id) {
      return res.status(403).json({ message: 'Not authorized for this order.' });
    }

    if (fulfillment.status !== 'PENDING') {
      return res.status(400).json({ message: 'Order has already been accepted.' });
    }

    const updated = await prisma.orderFulfillment.update({
      where: { id: parseInt(fulfillmentId) },
      data: { status: 'CONFIRMED' },
      include: {
        order: { 
          include: { 
            customer: { 
              include: { 
                user: { select: { id: true, name: true, phone: true } } 
              } 
            }
          } 
        },
        pharmacy: { select: { id: true, name: true, address: true, city: true, phone: true, latitude: true, longitude: true } },
        items: { include: { medicine: true } }
      }
    });

    return res.json({ 
      message: 'Order accepted successfully!', 
      fulfillment: updated 
    });
  } catch (err) {
    console.error('❌ acceptOrder error:', err.message);
    return res.status(500).json({ message: 'Failed to accept order.' });
  }
};
