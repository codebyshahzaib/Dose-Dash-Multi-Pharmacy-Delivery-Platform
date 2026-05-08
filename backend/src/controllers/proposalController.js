import prisma from '../config/prisma.js';

/* ── GET /proposals/search-medicines ─────────────────────────────── */
/**
 * Searches the global Medicine database for the suggestion system.
 */
export const searchMedicines = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ medicines: [] });

    const medicines = await prisma.medicine.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { salt: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 15
    });

    return res.json({ medicines });
  } catch (err) {
    console.error('❌ searchMedicines error:', err.message);
    return res.status(500).json({ message: 'Medicine search failed.' });
  }
};

/* ── POST /proposals/prescriptions/:id/items ─────────────────────── */
/**
 * Pharmacist transcribes prescription lines into system items.
 */
export const addPrescriptionItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { items = [] } = req.body; // [{ medicineId, rawName, rawStrength, rawForm, quantity, remarks }]

    const pharmacist = await prisma.pharmacist.findUnique({ where: { userId: req.user.id } });
    if (!pharmacist) return res.status(403).json({ message: 'Unauthorized pharmacist.' });

    const rx = await prisma.prescription.findUnique({ where: { id: parseInt(id) } });
    if (!rx || rx.pharmacistId !== pharmacist.id) {
      return res.status(404).json({ message: 'Prescription context not found.' });
    }

    const createdItems = await prisma.$transaction(async (tx) => {
      // Clear existing transcription items for this RX if any (to allow re-transcription)
      await tx.prescriptionItem.deleteMany({ where: { prescriptionId: rx.id } });

      return await tx.prescriptionItem.createMany({
        data: items.map(item => ({
          prescriptionId: rx.id,
          medicineId: item.medicineId ? parseInt(item.medicineId) : null,
          rawName: item.rawName,
          rawSalt: item.rawSalt || null,
          rawStrength: item.rawStrength || null,
          rawForm: item.rawForm || null,
          quantity: item.quantity ? parseInt(item.quantity) : null,
          originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : null,
          rawPackSize: item.rawPackSize ? parseInt(item.rawPackSize) : null,
          remarks: item.remarks || null
        }))
      });
    });

    return res.status(201).json({ message: 'Items transcribed successfully.', count: createdItems.count });
  } catch (err) {
    console.error('❌ addPrescriptionItems error:', err.message);
    return res.status(500).json({ message: 'Failed to transcribe items.' });
  }
};

/* ── GET /proposals/alternatives-by-salt ─────────────────────────── */
/**
 * Finds all pharmacy stock with the same salt, filtered by customer city.
 */
export const getAlternativesBySalt = async (req, res) => {
  try {
    const { salt, prescriptionId } = req.query;
    if (!salt || !prescriptionId) {
      return res.status(400).json({ message: 'Salt and Prescription ID required.' });
    }

    const rx = await prisma.prescription.findUnique({
      where: { id: parseInt(prescriptionId) },
      include: { customer: true }
    });

    if (!rx?.customer?.city) return res.status(404).json({ message: 'City context not found.' });

    // Logic: Find all pharmacy stock matching this salt, sorted by price
    const inventory = await prisma.pharmacyStock.findMany({
      where: {
        medicine: { salt: { contains: salt, mode: 'insensitive' } }
      },
      include: {
        medicine: true,
        pharmacy: { select: { id: true, name: true, city: true } }
      },
      orderBy: { price: 'asc' }
    });

    // Extract unique medicines from inventory for the 'Global' simplified view
    // This ensures we always have a pharmacyStockId for fulfillment mapping
    const seenMeds = new Set();
    const medicines = [];
    
    for (const inv of inventory) {
      if (!seenMeds.has(inv.medicineId)) {
        seenMeds.add(inv.medicineId);
        medicines.push(inv.medicine);
      }
    }

    return res.json({ 
      medicines, // Unique medicines found in any stock
      inventory  // Full stock list if needed
    });
  } catch (err) {
    console.error('❌ getAlternativesBySalt error:', err.message);
    return res.status(500).json({ message: 'Alternative lookup failed.' });
  }
};

/* ── POST /proposals ─────────────────────────────────────────────── */
/**
 * Pharmacist submits a final proposal based on transcribed items.
 */
export const createProposal = async (req, res) => {
  try {
    const { prescriptionId, notes, items = [] } = req.body; 
    // items: [{ prescriptionItemId, originalPrice, alternatives: [{ pharmacyStockId, offeredPrice }] }]

    const pharmacist = await prisma.pharmacist.findUnique({ where: { userId: req.user.id } });
    if (!pharmacist) return res.status(403).json({ message: 'Unauthorized pharmacist.' });

    const rx = await prisma.prescription.findUnique({ where: { id: parseInt(prescriptionId) } });
    if (!rx || rx.status === 'COMPLETED') return res.status(400).json({ message: 'Invalid prescription status.' });

    const proposal = await prisma.$transaction(async (tx) => {
      // Calculate total: sum of the first (recommended) alternative's offered price from each line item
      const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.alternatives[0]?.offeredPrice) || 0), 0);

      const newProp = await tx.proposal.create({
        data: {
          prescriptionId: rx.id,
          pharmacistId: pharmacist.id,
          notes,
          totalPrice, // Fixed: Save the aggregated value
          status: 'PENDING',
          items: {
            create: items.map(item => ({
              prescriptionItemId: item.prescriptionItemId,
              medicineId: item.medicineId || null,
              originalPrice: parseFloat(item.originalPrice),
              alternatives: {
                create: item.alternatives.map(alt => ({
                  pharmacyStockId: alt.pharmacyStockId,
                  offeredPrice: parseFloat(alt.offeredPrice),
                  quantity: parseInt(alt.quantity) || 1
                }))
              }
            }))
          }
        }
      });

      await tx.prescription.update({
        where: { id: rx.id },
        data: { status: 'PROPOSED' }
      });

      return newProp;
    });

    return res.status(201).json({ message: 'Proposal submitted.', proposal });
  } catch (err) {
    console.error('❌ createProposal error:', err.message);
    return res.status(500).json({ message: 'Failed to create proposal.' });
  }
};

/* ── PATCH /proposals/:id/status ─────────────────────────────────── */
/**
 * Customer accepts proposal. Split into independent pharmacy fulfillments.
 */
export const updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryAddress, selections = [] } = req.body;

    if (status === 'REJECTED') {
      await prisma.proposal.update({ where: { id: parseInt(id) }, data: { status: 'REJECTED' } });
      return res.json({ message: 'Proposal rejected.' });
    }

    const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
    const proposal = await prisma.proposal.findUnique({
      where: { id: parseInt(id) },
      include: { 
        prescription: true,
        items: { include: { alternatives: { include: { pharmacyStock: true } } } }
      }
    });

    if (!proposal || proposal.status !== 'PENDING') return res.status(400).json({ message: 'Proposal not available.' });

    await prisma.$transaction(async (tx) => {
      // 1. Process choices and ensure fulfillment records align with customer selections
      for (const sel of selections) {
        // If the customer selected a specific stock (potentially different from the pharmacist's initial suggestion)
        // we update the selection state.
        if (sel.pharmacyStockId) {
          // Find or create a matching alternative record for this stock choice
          // (This ensures the order splitting logic in Step 4 works correctly)
          let alt = await tx.proposalAlternative.findFirst({
            where: { proposalItemId: parseInt(sel.proposalItemId), pharmacyStockId: parseInt(sel.pharmacyStockId) }
          });

          if (!alt) {
            // Get price from stock
            const stock = await tx.pharmacyStock.findUnique({ where: { id: parseInt(sel.pharmacyStockId) } });
            alt = await tx.proposalAlternative.create({
              data: {
                proposalItemId: parseInt(sel.proposalItemId),
                pharmacyStockId: parseInt(sel.pharmacyStockId),
                isSelected: true,
                offeredPrice: stock.price,
                quantity: 1 // Default to 1, or handle quantity if provided
              }
            });
          } else {
            await tx.proposalAlternative.update({
              where: { id: alt.id },
              data: { isSelected: true }
            });
          }
        } else if (sel.alternativeId) {
          await tx.proposalAlternative.update({
            where: { id: parseInt(sel.alternativeId) },
            data: { isSelected: true }
          });
        }
      }

      // 2. Accept Proposal
      await tx.proposal.update({ where: { id: proposal.id }, data: { status: 'ACCEPTED' } });

      // 3. Create Order Parent (will update totalAmount after calculating fulfillments)
      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          proposalId: proposal.id,
          deliveryAddress: deliveryAddress || customer.preferredAddress,
          status: 'PENDING',
          totalAmount: 0 // Placeholder
        }
      });

      // 4. Group by Pharmacy for Splitting
      const pharmacyGroups = {};
      const selectedAlts = await tx.proposalAlternative.findMany({
        where: { proposalItem: { proposalId: proposal.id }, isSelected: true },
        include: { pharmacyStock: { include: { medicine: true } } }
      });

      for (const alt of selectedAlts) {
        const pId = alt.pharmacyStock.pharmacyId;
        if (!pharmacyGroups[pId]) pharmacyGroups[pId] = [];
        pharmacyGroups[pId].push(alt);
      }

      // 5. Create Independent Fulfillments & Calculate Grand Total
      let grandTotal = 0;
      for (const [pharmacyId, alts] of Object.entries(pharmacyGroups)) {
        // Recalculate subtotal for this pharmacy's share
        const subtotal = alts.reduce((sum, a) => {
          // Robust Unit Price Verification: (Stock Pack Price / Pack Size) * Requested Qty
          const packPrice = Number(a.pharmacyStock.price);
          const packSize = a.pharmacyStock.medicine.packSize || 1;
          const prescribedQty = a.quantity || 1;
          const itemTotal = (packPrice / packSize) * prescribedQty;
          return sum + itemTotal;
        }, 0);

        grandTotal += subtotal;

        await tx.orderFulfillment.create({
          data: {
            orderId: order.id,
            pharmacyId: parseInt(pharmacyId),
            subtotal,
            status: 'PENDING',
            items: {
              create: alts.map(a => {
                const pPrice = Number(a.pharmacyStock.price);
                const pSize = a.pharmacyStock.medicine.packSize || 1;
                const pQty = a.quantity || 1;
                return {
                  medicineId: a.pharmacyStock.medicineId,
                  quantity: pQty, 
                  priceAtPurchase: (pPrice / pSize) * pQty
                };
              })
            }
          }
        });
      }

      // Update parent order with verified grand total
      await tx.order.update({
        where: { id: order.id },
        data: { totalAmount: grandTotal || 0 }
      });

      // 6. Finalize Prescription
      await tx.prescription.update({
        where: { id: proposal.prescriptionId },
        data: { status: 'COMPLETED' }
      });
    });

    return res.json({ message: 'Order created and split by pharmacy successfully.' });
  } catch (err) {
    console.error('❌ updateProposalStatus error:', err.message);
    return res.status(500).json({ message: 'Fulfillment creation failed.' });
  }
};

/* ── GET Lists (Helper clones) ─────────────────────────────────── */
export const getPharmacistProposals = async (req, res) => {
  const profile = await prisma.pharmacist.findUnique({ where: { userId: req.user.id } });
  const proposals = await prisma.proposal.findMany({
    where: { pharmacistId: profile.id },
    include: { 
      prescription: { include: { customer: { include: { user: true } } } },
      items: { 
        include: { 
          prescriptionItem: true, 
          alternatives: { 
            include: { 
              pharmacyStock: { include: { medicine: true, pharmacy: true } } 
            } 
          } 
        } 
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return res.json({ proposals });
};

export const getIncomingPrescriptions = async (req, res) => {
  const profile = await prisma.pharmacist.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(403).json({ message: 'Pharmacist not found.' });
  const prescriptions = await prisma.prescription.findMany({
    where: { status: 'PENDING' }, // Or assigned to them
    include: { customer: { include: { user: true } }, items: true },
    orderBy: { createdAt: 'desc' }
  });
  return res.json({ prescriptions });
};

export const getCustomerProposals = async (req, res) => {
  const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
  const proposals = await prisma.proposal.findMany({
    where: { prescription: { customerId: customer.id } },
    include: { 
      pharmacist: { include: { user: true } },
      prescription: { include: { customer: true } },
      items: { 
        include: { 
          prescriptionItem: true, 
          alternatives: { include: { pharmacyStock: { include: { medicine: true, pharmacy: true } } } } 
        } 
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return res.json({ proposals });
};
