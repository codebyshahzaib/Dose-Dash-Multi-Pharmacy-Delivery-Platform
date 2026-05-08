import prisma from '../config/prisma.js';

/* ── GET /pharmacists/profile ────────────────────────────────────── */
export const getProfile = async (req, res) => {
  try {
    const profile = await prisma.pharmacist.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Pharmacist profile not found.' });
    }

    return res.json({ profile });
  } catch (err) {
    console.error('❌ getProfile error:', err.message);
    return res.status(500).json({ message: 'Could not load profile.' });
  }
};

/* ── PUT /pharmacists/profile ────────────────────────────────────── */
export const updateProfile = async (req, res) => {
  try {
    const { licenseNumber, phone, specialization, city, experienceYears, isAvailable, name } = req.body;

    // Update User level name if provided
    if (name) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name },
      });
    }

    // Update Pharmacist profile
    const updated = await prisma.pharmacist.update({
      where: { userId: req.user.id },
      data: {
        licenseNumber,
        phone,
        specialization,
        city,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        isAvailable,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return res.json({
      message: 'Profile updated successfully.',
      profile: updated,
    });
  } catch (err) {
    console.error('❌ updateProfile error:', err.message);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
};
