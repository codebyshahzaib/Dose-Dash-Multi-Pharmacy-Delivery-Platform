import prisma from '../config/prisma.js';

export const listAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await prisma.pharmacy.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        city: true,
        address: true
      },
      orderBy: { name: 'asc' }
    });

    return res.json({ pharmacies });
  } catch (err) {
    console.error('❌ listAllPharmacies error:', err.message);
    return res.status(500).json({ message: 'Failed to fetch pharmacies.' });
  }
};
