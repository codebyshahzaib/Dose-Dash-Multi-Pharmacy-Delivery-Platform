import prisma from '../config/prisma.js';

/**
 * Finds all pharmacies in a specific city that carry a given medicine.
 */
export const getMedicineStockInCity = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { city } = req.query;

    if (!city) return res.status(400).json({ message: 'City context is required.' });

    const inventory = await prisma.pharmacyStock.findMany({
      where: {
        medicineId: parseInt(medicineId),
        pharmacy: { city: { equals: city, mode: 'insensitive' } },
        isAvailable: true
      },
      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true
          }
        }
      },
      orderBy: { price: 'asc' }
    });

    return res.json({ inventory });
  } catch (err) {
    console.error('❌ getMedicineStockInCity error:', err.message);
    return res.status(500).json({ message: 'Stock lookup failed.' });
  }
};

/**
 * Finds pharmacies that have ALL medicines in a list (Optimization).
 */
export const findOptimizedFulfillment = async (req, res) => {
  try {
    const { medicineIds, city } = req.body; // Array of medicine IDs

    if (!city || !medicineIds?.length) {
      return res.status(400).json({ message: 'Medicines and city are required.' });
    }

    // Find pharmacies in this city that have at least one of these medicines
    const stocks = await prisma.pharmacyStock.findMany({
      where: {
        medicineId: { in: medicineIds.map(id => parseInt(id)) },
        pharmacy: { city: { equals: city, mode: 'insensitive' } },
        isAvailable: true
      },
      include: { pharmacy: true, medicine: true }
    });

    // Group by pharmacy
    const pharmacyGroups = {};
    stocks.forEach(s => {
      if (!pharmacyGroups[s.pharmacyId]) {
        pharmacyGroups[s.pharmacyId] = {
          pharmacy: s.pharmacy,
          availableCount: 0,
          totalPrice: 0,
          items: []
        };
      }
      pharmacyGroups[s.pharmacyId].availableCount++;
      pharmacyGroups[s.pharmacyId].totalPrice += parseFloat(s.price);
      pharmacyGroups[s.pharmacyId].items.push(s);
    });

    // Sort by coverage descending, then price ascending
    const sortedPharmacies = Object.values(pharmacyGroups).sort((a, b) => {
      if (b.availableCount !== a.availableCount) return b.availableCount - a.availableCount;
      return a.totalPrice - b.totalPrice;
    });

    return res.json({ recommendations: sortedPharmacies });
  } catch (err) {
    console.error('❌ findOptimizedFulfillment error:', err.message);
    return res.status(500).json({ message: 'Optimization failed.' });
  }
};
