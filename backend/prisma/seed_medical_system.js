import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Resetting for New Independent Fulfillment Ecosystem...');

  // 1. CLEAR ALL DATA (in order of dependencies)
  await prisma.orderFulfillmentItem.deleteMany();
  await prisma.orderFulfillment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.proposalAlternative.deleteMany();
  await prisma.proposalItem.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.pharmacyStock.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.pharmacy.deleteMany();
  await prisma.pharmacyOwner.deleteMany();
  await prisma.pharmacist.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.rider.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleared.');

  const saltRounds = 12;
  const commonPassword = await bcrypt.hash('password123', saltRounds);

  // 2. SEED MEDICINES (Catalog)
  console.log('💊 Seeding Medicines...');
  const meds = [
    { name: 'Panadol Extra', salt: 'Paracetamol', strength: '500mg', form: 'Tablet', packSize: '20 tablets', mrp: 150, manufacturer: 'GSK' },
    { name: 'Augmentin', salt: 'Amoxicillin', strength: '625mg', form: 'Tablet', packSize: '14 tablets', mrp: 450, manufacturer: 'GSK' },
    { name: 'Risek', salt: 'Omeprazole', strength: '40mg', form: 'Capsule', packSize: '14 capsules', mrp: 350, manufacturer: 'Getz' },
    { name: 'Flagyl', salt: 'Metronidazole', strength: '400mg', form: 'Tablet', packSize: '20 tablets', mrp: 80, manufacturer: 'Sanofi' },
    { name: 'Softin', salt: 'Loratadine', strength: '10mg', form: 'Tablet', packSize: '10 tablets', mrp: 120, manufacturer: 'GSK' },
    { name: 'Arinac', salt: 'Ibuprofen', strength: '200mg', form: 'Tablet', packSize: '20 tablets', mrp: 90, manufacturer: 'Abbott' },
    { name: 'Nexum', salt: 'Esomeprazole', strength: '40mg', form: 'Capsule', packSize: '14 capsules', mrp: 380, manufacturer: 'Getz' },
    { name: 'Gravinate', salt: 'Dimenhydrinate', strength: '50mg', form: 'Tablet', packSize: '20 tablets', mrp: 70, manufacturer: 'Searle' },
    { name: 'Disprin', salt: 'Aspirin', strength: '300mg', form: 'Tablet', packSize: '30 tablets', mrp: 40, manufacturer: 'Reckitt' },
    { name: 'Zantac', salt: 'Ranitidine', strength: '150mg', form: 'Tablet', packSize: '30 tablets', mrp: 180, manufacturer: 'GSK' },
    { name: 'Surbex-Z', salt: 'Multivitamins', strength: '500mg', form: 'Tablet', packSize: '30 tablets', mrp: 550, manufacturer: 'Abbott' },
    { name: 'Amoxil', salt: 'Amoxicillin', strength: '250mg', form: 'Capsule', packSize: '12 capsules', mrp: 140, manufacturer: 'GSK' },
    { name: 'Ponstan', salt: 'Mefenamic Acid', strength: '250mg', form: 'Tablet', packSize: '50 tablets', mrp: 280, manufacturer: 'Pfizer' },
    { name: 'Nuberol Forte', salt: 'Paracetamol', strength: '650mg', form: 'Tablet', packSize: '20 tablets', mrp: 220, manufacturer: 'Searle' },
    { name: 'Avil', salt: 'Pheniramine', strength: '25mg', form: 'Tablet', packSize: '20 tablets', mrp: 60, manufacturer: 'Sanofi' },
    { name: 'Coflar', salt: 'Cefaclor', strength: '250mg', form: 'Capsule', packSize: '6 capsules', mrp: 320, manufacturer: 'Getz' },
    { name: 'Tagamet', salt: 'Cimetidine', strength: '400mg', form: 'Tablet', packSize: '30 tablets', mrp: 210, manufacturer: 'GSK' },
    { name: 'Brufen', salt: 'Ibuprofen', strength: '400mg', form: 'Tablet', packSize: '30 tablets', mrp: 240, manufacturer: 'Abbott' },
    { name: 'Ventolin', salt: 'Salbutamol', strength: '100mcg', form: 'Inhaler', packSize: '200 doses', mrp: 480, manufacturer: 'GSK' },
    { name: 'Entamizole', salt: 'Metronidazole', strength: '250mg', form: 'Tablet', packSize: '20 tablets', mrp: 110, manufacturer: 'Abbott' }
  ];

  const createdMeds = [];
  for (const m of meds) {
    createdMeds.push(await prisma.medicine.create({ data: m }));
  }

  // 3. SEED USERS (Owners, Pharmacists, Customers, Riders)
  console.log('👥 Seeding Users & Rolled Profiles...');

  // Owner 1 & Pharmacy
  const owner1 = await prisma.user.create({
    data: {
      email: 'owner1@test.com', passwordHash: commonPassword, name: 'Lahore Owner', phone: '03001111111', role: 'PHARMACY_OWNER',
      pharmacyOwner: { create: {
        pharmacy: { create: { name: 'HealthFirst Lahore', city: 'Lahore', address: 'Gulberg III' } }
      } }
    },
    include: { pharmacyOwner: { include: { pharmacy: true } } }
  });

  // Owner 2 & Pharmacy
  const owner2 = await prisma.user.create({
    data: {
      email: 'owner2@test.com', passwordHash: commonPassword, name: 'Karachi Owner', phone: '03002222222', role: 'PHARMACY_OWNER',
      pharmacyOwner: { create: {
        pharmacy: { create: { name: 'MetroCare Karachi', city: 'Karachi', address: 'Clifton Block 4' } }
      } }
    },
    include: { pharmacyOwner: { include: { pharmacy: true } } }
  });

  // Pharmacists
  const pharmacist1 = await prisma.user.create({
    data: {
      email: 'pharm1@test.com', passwordHash: commonPassword, name: 'Dr. Ahmad', phone: '03003333333', role: 'PHARMACIST',
      pharmacist: { create: { isAvailable: true, experienceYears: 5, specialization: 'Clinical Pharmacy' } }
    },
    include: { pharmacist: true }
  });

  // Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer1@test.com', passwordHash: commonPassword, name: 'Usman Ali', phone: '03004444444', role: 'CUSTOMER',
      customer: { create: { city: 'Lahore', preferredAddress: 'Street 5, Gulberg' } }
    },
    include: { customer: true }
  });

  // Riders
  const rider1 = await prisma.user.create({
    data: {
      email: 'rider1@test.com', passwordHash: commonPassword, name: 'Rider Lahore', phone: '03005555555', role: 'RIDER',
      rider: { create: { city: 'Lahore', isAvailable: true, vehicleType: 'Motorbike', vehicleNumber: 'LHR-123' } }
    },
    include: { rider: true }
  });

  // 4. SEED PHARMACY STOCK
  console.log('📦 Seeding Pharmacy Stock...');
  const pharms = [owner1.pharmacyOwner.pharmacy, owner2.pharmacyOwner.pharmacy];
  for (const p of pharms) {
    // Each pharmacy gets 15 random medicines
    const subset = [...createdMeds].sort(() => 0.5 - Math.random()).slice(0, 15);
    for (const m of subset) {
      await prisma.pharmacyStock.create({
        data: {
          pharmacyId: p.id,
          medicineId: m.id,
          price: (Math.random() * (500 - 50) + 50).toFixed(2),
          isAvailable: true
        }
      });
    }
  }

  // 5. SEED WORKFLOW (Prescription -> Items -> Proposal -> Order)
  console.log('🔄 Seeding Sample Workflow...');

  // A. Prescription from Lahore Customer
  const rx = await prisma.prescription.create({
    data: {
      customerId: customer1.customer.id,
      pharmacistId: pharmacist1.pharmacist.id,
      fileUrl: '/uploads/prescriptions/sample_rx.jpg',
      notes: 'Please check these available salts.',
      status: 'ASSIGNED',
      items: {
        create: [
          { rawName: 'Panadol', rawStrength: '500mg', rawForm: 'Tablet', quantity: 2, medicineId: createdMeds[0].id },
          { rawName: 'Something for cough', rawForm: 'Syrup' }
        ]
      }
    }
  });

  // B. Proposal for the Prescription
  const proposal = await prisma.proposal.create({
    data: {
      prescriptionId: rx.id,
      pharmacistId: pharmacist1.pharmacist.id,
      totalPrice: 150.00,
      notes: 'Found alternatives for your city.',
      status: 'PENDING',
      items: {
        create: [
          {
            prescriptionItemId: (await prisma.prescriptionItem.findFirst({ where: { prescriptionId: rx.id, rawName: 'Panadol' } })).id,
            medicineId: createdMeds[0].id,
            originalPrice: 20.00,
            alternatives: {
              create: {
                pharmacyStockId: (await prisma.pharmacyStock.findFirst({ where: { medicineId: createdMeds[0].id, pharmacyId: owner1.pharmacyOwner.pharmacy.id } })).id,
                offeredPrice: 18.00,
                isSelected: true
              }
            }
          }
        ]
      }
    }
  });

  console.log('🚀 SEEDING COMPLETE');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
