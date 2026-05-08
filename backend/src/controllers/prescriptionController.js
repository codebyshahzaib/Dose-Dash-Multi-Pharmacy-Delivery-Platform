import prisma from '../config/prisma.js';

/* ── POST /prescriptions/upload ──────────────────────────────────── */
export const uploadPrescription = async (req, res) => {
  try {
    const { notes } = req.body;
    const file = req.file;

    // Validations
    if (!file) {
      return res.status(400).json({ message: 'Prescription file is required.' });
    }

    // NEW: Auto-assign to the PRIMARY pharmacist if set, else fall back to the first active
    let pharmacist = await prisma.pharmacist.findFirst({
      where: { 
        isPrimary: true,
        user: { isActive: true } 
      }
    });

    // Fallback if no primary is designated yet
    if (!pharmacist) {
      pharmacist = await prisma.pharmacist.findFirst({
        where: { user: { isActive: true } },
        orderBy: { id: 'asc' }
      });
    }

    if (!pharmacist) {
      return res.status(503).json({ message: 'No pharmacists are currently active in the system.' });
    }

    // Get customer profile from logged-in user
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
    });
    if (!customer) {
      return res.status(403).json({ message: 'Customer profile not found.' });
    }

    // Create prescription record
    const prescription = await prisma.prescription.create({
      data: {
        customerId: customer.id,
        pharmacistId: pharmacist.id,
        fileUrl: `/uploads/prescriptions/${file.filename}`,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        pharmacist: { include: { user: { select: { name: true } } } },
      },
    });

    return res.status(201).json({
      message: 'Prescription uploaded successfully!',
      prescription: {
        id: prescription.id,
        fileUrl: prescription.fileUrl,
        notes: prescription.notes,
        status: prescription.status,
        pharmacist: prescription.pharmacist.user.name,
        createdAt: prescription.createdAt,
      },
    });
  } catch (err) {
    console.error('❌ uploadPrescription error:', err.message);
    return res.status(500).json({ message: 'Upload failed. Please try again.' });
  }
};

/* ── GET /prescriptions/my ───────────────────────────────────────── */
export const getMyPrescriptions = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
    });
    if (!customer) {
      return res.status(403).json({ message: 'Customer profile not found.' });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { customerId: customer.id },
      include: {
        pharmacist: { include: { user: { select: { name: true } } } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const list = prescriptions.map((p) => ({
      id: p.id,
      fileUrl: p.fileUrl,
      notes: p.notes,
      status: p.status,
      pharmacist: p.pharmacist?.user?.name || 'System Pharmacist',
      createdAt: p.createdAt,
    }));

    return res.json({ prescriptions: list });
  } catch (err) {
    console.error('❌ getMyPrescriptions error:', err.message);
    return res.status(500).json({ message: 'Could not load prescriptions.' });
  }
};

/* ── DELETE /prescriptions/:id ───────────────────────────────────── */
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
    });

    if (!customer) {
      return res.status(403).json({ message: 'Customer profile not found.' });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: parseInt(id) }
    });

    if (!prescription || prescription.customerId !== customer.id) {
      return res.status(404).json({ message: 'Prescription not found or unauthorized.' });
    }

    if (prescription.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Cannot delete a prescription after an order has been finalized.' });
    }

    await prisma.prescription.delete({
      where: { id: parseInt(id) }
    });

    return res.json({ message: 'Prescription successfully withdrawn and deleted.' });
  } catch (err) {
    console.error('❌ deletePrescription error:', err.message);
    return res.status(500).json({ message: 'Could not delete prescription.' });
  }
};
