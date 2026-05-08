import prisma from '../config/prisma.js';

/* ── GET /api/admin/stats ───────────────────────────────────────── */
export const getPlatformStats = async (req, res) => {
  try {
    const [users, pharmacies, medicines, orders, prescriptions] = await Promise.all([
      prisma.user.count(),
      prisma.pharmacy.count({ where: { isActive: true } }),
      prisma.medicine.count(),
      prisma.order.count(),
      prisma.prescription.count()
    ]);

    const revenue = await prisma.orderFulfillment.aggregate({
      _sum: { subtotal: true },
      where: { status: 'DELIVERED' }
    });

    return res.json({
      stats: {
        totalUsers: users,
        activePharmacies: pharmacies,
        totalMedicines: medicines,
        totalOrders: orders,
        totalPrescriptions: prescriptions,
        totalRevenue: revenue._sum.subtotal || 0
      }
    });
  } catch (err) {
    console.error('❌ getPlatformStats error:', err.message);
    return res.status(500).json({ message: 'Failed to load platform stats.' });
  }
};

/* ── GET /api/admin/users ───────────────────────────────────────── */
export const listUsers = async (req, res) => {
  try {
    const { role, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, createdAt: true,
        pharmacist: {
          select: { id: true, isPrimary: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return res.json({ users });
  } catch (err) {
    console.error('❌ listUsers error:', err.message);
    return res.status(500).json({ message: 'Failed to list users.' });
  }
};

/* ── PATCH /api/admin/users/:id ─────────────────────────────────── */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });

    return res.json({
      message: `User ${updated.isActive ? 'activated' : 'deactivated'}.`,
      user: updated
    });
  } catch (err) {
    console.error('❌ toggleUserStatus error:', err.message);
    return res.status(500).json({ message: 'Failed to update user.' });
  }
};

/* ── POST /api/admin/pharmacist ─────────────────────────────────── */
export const createPharmacist = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const passwordHash = await (await import('bcryptjs')).default.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone || null,
        role: 'PHARMACIST',
        pharmacist: {
          create: {
            isAvailable: true,
            experienceYears: 0,
            specialization: 'System Pharmacist'
          }
        }
      },
      select: { id: true, name: true, email: true, role: true }
    });

    return res.status(201).json({
      message: 'Central pharmacist created successfully.',
      user: newUser
    });
  } catch (err) {
    console.error('❌ createPharmacist error:', err.message);
    return res.status(500).json({ message: 'Failed to create pharmacist profile.' });
  }
};

/* ── DELETE /api/admin/users/:id ────────────────────────────────── */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Block deleting self
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Administrative suicide blocked. You cannot delete your own account.' });
    }

    await prisma.user.delete({ where: { id: userId } });

    return res.json({ message: `User ${user.email} and all associated data have been permanently removed.` });
  } catch (err) {
    console.error('❌ deleteUser error:', err.message);
    return res.status(500).json({ message: 'Failed to delete user. Ensure they have no active orders or dependencies.' });
  }
};

/* ── PATCH /api/admin/pharmacists/:id/primary ────────────────── */
export const setPrimaryPharmacist = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacistId = parseInt(id);

    // 1. Verify existence
    const pharmacist = await prisma.pharmacist.findUnique({
      where: { id: pharmacistId },
      include: { user: true }
    });

    if (!pharmacist) return res.status(404).json({ message: 'Pharmacist profile not found.' });

    // 2. Perform swap in transaction
    await prisma.$transaction([
      // Reset all others
      prisma.pharmacist.updateMany({
        where: { id: { not: pharmacistId } },
        data: { isPrimary: false }
      }),
      // Set chosen one
      prisma.pharmacist.update({
        where: { id: pharmacistId },
        data: { isPrimary: true }
      })
    ]);

    return res.json({ 
      message: `Authority Handover Successful: ${pharmacist.user.name} is now the primary pharmacist.`,
      primaryId: pharmacistId 
    });
  } catch (err) {
    console.error('❌ setPrimaryPharmacist error:', err.message);
    return res.status(500).json({ message: 'Failed to set primary pharmacist.' });
  }
};
