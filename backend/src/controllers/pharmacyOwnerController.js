import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

/* ── Private Helper ────────────────────────────────────────────── */
async function ensurePharmacyProfile(user) {
  // 1. Find or create the PharmacyOwner (the bridge)
  let owner = await prisma.pharmacyOwner.findUnique({
    where: { userId: user.id },
    include: { pharmacy: true }
  });

  if (!owner) {
    owner = await prisma.pharmacyOwner.create({
      data: { userId: user.id },
      include: { pharmacy: true }
    });
  }

  // 2. Ensure the single Pharmacy branch exists
  if (!owner.pharmacy) {
    const newPharmacy = await prisma.pharmacy.create({
      data: {
        ownerId: owner.id,
        name: `${user.name}'s Pharmacy`,
        isActive: true
      }
    });
    owner.pharmacy = newPharmacy;
  }

  return owner;
}

/* ── GET /api/pharmacy-owner/settings ────────────────────────────── */
export const getPharmacySettings = async (req, res) => {
  try {
    const owner = await ensurePharmacyProfile(req.user);
    // Return both so frontend doesn't break, but center data on pharmacy
    return res.json({ 
      owner,
      pharmacy: owner.pharmacy
    });
  } catch (err) {
    console.error('❌ getPharmacySettings error:', err.message);
    return res.status(500).json({ message: 'Failed to load settings.' });
  }
};

/* ── PUT /api/pharmacy-owner/settings ────────────────────────────── */
export const updatePharmacySettings = async (req, res) => {
  try {
    const { name, address, city, latitude, longitude, phone, isActive, licenseNumber } = req.body;
    const owner = await ensurePharmacyProfile(req.user);
    const pharmacyId = owner.pharmacy.id;

    const updatedPharmacy = await prisma.pharmacy.update({
      where: { id: pharmacyId },
      data: {
        name,
        address,
        city,
        phone,
        licenseNumber,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true
      }
    });

    return res.json({ message: 'Store profile updated successfully!', pharmacy: updatedPharmacy });
  } catch (err) {
    console.error('❌ updatePharmacySettings error:', err.message);
    return res.status(500).json({ message: 'Failed to update store profile.' });
  }
};

/* ── GET /api/pharmacy/inventory/search ───────────────────────────── */
export const searchGlobalMedicines = async (req, res) => {
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
      take: 10
    });

    return res.json({ medicines });
  } catch (err) {
    console.error('❌ searchGlobalMedicines error:', err.message);
    return res.status(500).json({ message: 'Search failed.' });
  }
};

/* ── POST /api/pharmacy/inventory ────────────────────────────────── */
export const addMedicineToPharmacy = async (req, res) => {
  try {
    const { medicineId, price, stockQuantity, isAvailable } = req.body;
    const owner = await ensurePharmacyProfile(req.user);
    const pharmacyId = owner.pharmacy.id;

    // Upsert PharmacyStock record
    const stock = await prisma.pharmacyStock.upsert({
      where: {
        pharmacyId_medicineId: {
          pharmacyId: pharmacyId,
          medicineId: parseInt(medicineId)
        }
      },
      update: {
        price: parseFloat(price),
        isAvailable: isAvailable !== undefined ? isAvailable : true
      },
      create: {
        pharmacyId: pharmacyId,
        medicineId: parseInt(medicineId),
        price: parseFloat(price),
        isAvailable: isAvailable !== undefined ? isAvailable : true
      }
    });

    return res.status(201).json({ message: 'Medicine linked to pharmacy!', stock });
  } catch (err) {
    console.error('❌ addMedicineToPharmacy error:', err.message);
    return res.status(500).json({ message: 'Failed to add medicine to inventory.' });
  }
};

/* ── GET /api/pharmacy-owner/inventory ───────────────────────────── */
export const getPharmacyInventory = async (req, res) => {
  try {
    const owner = await ensurePharmacyProfile(req.user);
    const inventory = await prisma.pharmacyStock.findMany({
      where: { pharmacyId: owner.pharmacy.id },
      include: {
        medicine: true
      }
    });

    return res.json({ inventory });
  } catch (err) {
    console.error('❌ getPharmacyInventory error:', err.message);
    return res.status(500).json({ message: 'Failed to load inventory.' });
  }
};

export const createAndLinkMedicine = async (req, res) => {
  try {
    const { 
      name, genericName, manufacturer, strength, form, category, 
      packSize, price 
    } = req.body;

    // 1. Mandatory Clinical Validation
    const missing = [];
    if (!name) missing.push('Brand Name');
    if (!genericName) missing.push('Active Ingredient (Salt)');
    if (!manufacturer) missing.push('Manufacturer');
    if (!strength) missing.push('Strength');
    if (!form) missing.push('Presentation Form');
    if (!price) missing.push('Price');

    if (missing.length > 0) {
      return res.status(400).json({ 
        message: `Missing clinical data: ${missing.join(', ')}. All fields are required for medical verification.` 
      });
    }

    const owner = await ensurePharmacyProfile(req.user);
    const pharmacyId = owner.pharmacy.id;

    // Use a transaction for atomic Global -> Local linking
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check for Clinical Identity Match (Name + Strength + Form)
      let medicine = await tx.medicine.findFirst({
        where: {
          name: { equals: name.trim(), mode: 'insensitive' },
          strength: { equals: strength.trim(), mode: 'insensitive' },
          form: { equals: form.trim(), mode: 'insensitive' }
        }
      });

      let statusMessage = '';
      if (medicine) {
        statusMessage = 'Existing clinical identity matched. Updating your store inventory.';
      } else {
        // Create new Global Medicine Record
        medicine = await tx.medicine.create({
          data: {
            name: name.trim(),
            salt: genericName.trim(),
            manufacturer: manufacturer.trim(),
            strength: strength.trim(),
            form: form.trim(),
            category: category?.trim() || 'General',
            packSize: packSize?.trim() || 'Standard Pack',
            requiresRx: false
          }
        });
        statusMessage = 'New medicine registered in global catalog and linked to your store.';
      }

      // 2. Link to Pharmacy with independent price
      const stock = await tx.pharmacyStock.upsert({
        where: {
          pharmacyId_medicineId: {
            pharmacyId,
            medicineId: medicine.id
          }
        },
        create: {
          pharmacyId,
          medicineId: medicine.id,
          price: parseFloat(price),
          isAvailable: true
        },
        update: {
          price: parseFloat(price),
          isAvailable: true
        }
      });

      return { medicine, stock, statusMessage };
    });

    return res.status(201).json({ 
      message: result.statusMessage, 
      medicine: result.medicine,
      stock: result.stock
    });
  } catch (err) {
    console.error('❌ createAndLinkMedicine error:', err.message);
    return res.status(500).json({ message: 'Internal server error during medicine registration.' });
  }
};

/* ── GET /api/pharmacy-owner/orders ───────────────────────────────── */
export const getPharmacyOrders = async (req, res) => {
  try {
    const owner = await ensurePharmacyProfile(req.user);
    
    // In the New Schema, pharmacies track OrderFulfillment
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
    return res.status(500).json({ message: 'Failed to load order fulfillments.' });
  }
};

/* ── GET /api/pharmacy-owner/affiliated-riders ──────────────────── */
export const getAffiliatedRiders = async (req, res) => {
  try {
    const owner = await ensurePharmacyProfile(req.user);
    const pharmacyId = owner.pharmacy.id;

    const riders = await prisma.rider.findMany({
      where: { affiliatedPharmacyId: pharmacyId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ riders });
  } catch (err) {
    console.error('❌ getAffiliatedRiders error:', err.message);
    return res.status(500).json({ message: 'Failed to load affiliated riders.' });
  }
};

/* ── POST /api/pharmacy-owner/fulfillment/:fulfillmentId/assign-rider ── */
export const assignRiderToFulfillment = async (req, res) => {
  try {
    const { fulfillmentId } = req.params;
    const { riderId } = req.body;

    if (!riderId) {
      return res.status(400).json({ message: 'Rider ID is required.' });
    }

    const owner = await ensurePharmacyProfile(req.user);
    const pharmacyId = owner.pharmacy.id;

    // Verify the fulfillment belongs to this pharmacy
    const fulfillment = await prisma.orderFulfillment.findUnique({
      where: { id: parseInt(fulfillmentId) }
    });

    if (!fulfillment || fulfillment.pharmacyId !== pharmacyId) {
      return res.status(403).json({ message: 'Not authorized to assign to this order.' });
    }

    // Verify the rider is affiliated with this pharmacy
    const rider = await prisma.rider.findUnique({
      where: { id: parseInt(riderId) },
      include: { user: true }
    });

    if (!rider || rider.affiliatedPharmacyId !== pharmacyId) {
      return res.status(403).json({ message: 'Rider is not affiliated with your pharmacy.' });
    }

    // Assign the rider and set status to PREPARING only if currently PENDING/CONFIRMED
    const currentStatus = fulfillment.status;
    const newStatus = (currentStatus === 'PENDING' || currentStatus === 'CONFIRMED') ? 'PREPARING' : currentStatus;

    const updated = await prisma.orderFulfillment.update({
      where: { id: parseInt(fulfillmentId) },
      data: {
        riderId: parseInt(riderId),
        status: newStatus
      },
      include: {
        order: {
          include: {
            customer: { include: { user: { select: { name: true, phone: true } } } }
          }
        },
        pharmacy: { select: { name: true, address: true, city: true, phone: true } },
        rider: { include: { user: { select: { name: true, phone: true } } } },
        items: { include: { medicine: true } }
      }
    });

    return res.json({
      message: `Order assigned to ${rider.user.name}. Status: ${newStatus}`,
      fulfillment: updated
    });
  } catch (err) {
    console.error('❌ assignRiderToFulfillment error:', err.message);
    return res.status(500).json({ message: 'Failed to assign rider.' });
  }
};

/* ── PUT /api/pharmacy-owner/fulfillment/:fulfillmentId/status ──── */
export const updateFulfillmentStatusPharmacy = async (req, res) => {
  try {
    const { fulfillmentId } = req.params;
    const { status } = req.body;

    const owner = await ensurePharmacyProfile(req.user);
    const pharmacyId = owner.pharmacy.id;

    const fulfillment = await prisma.orderFulfillment.findUnique({
      where: { id: parseInt(fulfillmentId) }
    });

    if (!fulfillment || fulfillment.pharmacyId !== pharmacyId) {
      return res.status(403).json({ message: 'Not authorized.' });
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
        rider: { include: { user: { select: { name: true, phone: true } } } },
        items: { include: { medicine: true } }
      }
    });

    return res.json({
      message: `Status updated to ${status}`,
      fulfillment: updated
    });
  } catch (err) {
    console.error('❌ updateFulfillmentStatusPharmacy error:', err.message);
    return res.status(500).json({ message: 'Failed to update status.' });
  }
};

/* ── POST /api/pharmacy-owner/register-rider ───────────────────── */
export const registerRider = async (req, res) => {
  try {
    const { name, email, password, phone, vehicleType, vehicleNumber } = req.body;

    // Validation
    const missing = [];
    if (!name) missing.push('Name');
    if (!email) missing.push('Email');
    if (!password) missing.push('Password');
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const owner = await ensurePharmacyProfile(req.user);
    const pharmacyId = owner.pharmacy.id;
    const pharmacyCity = owner.pharmacy.city;

    const passwordHash = await bcrypt.hash(password, 12);

    // Create User + Rider in a single transaction, pre-linked to this pharmacy
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone: phone || null,
          role: 'RIDER',
          rider: {
            create: {
              city: pharmacyCity || null,
              vehicleType: vehicleType || null,
              vehicleNumber: vehicleNumber || null,
              isAvailable: true,
              affiliatedPharmacyId: pharmacyId
            }
          }
        },
        select: { id: true, email: true, name: true, phone: true, role: true }
      });

      return newUser;
    });

    return res.status(201).json({
      message: `Rider "${result.name}" registered and linked to your pharmacy.`,
      rider: result
    });
  } catch (err) {
    console.error('❌ registerRider error:', err.message);
    return res.status(500).json({ message: 'Failed to register rider.' });
  }
};
