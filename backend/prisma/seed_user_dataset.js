import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- Wiping Database ---');
  await prisma.orderFulfillmentItem.deleteMany();
  await prisma.orderFulfillment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.proposalAlternative.deleteMany();
  await prisma.proposalItem.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.pharmacyStock.deleteMany();
  await prisma.pharmacy.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.pharmacist.deleteMany();
  await prisma.pharmacyOwner.deleteMany();
  await prisma.rider.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.user.deleteMany();

  console.log('--- Seeding Roles & Users ---');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('shahzaib', salt);

  // Users
  const customerUser = await prisma.user.create({
    data: {
      email: 'shah@gmail.com',
      passwordHash: hashedPassword,
      name: 'Shahzaib Customer',
      role: 'CUSTOMER',
      customer: { create: { city: 'Lahore', preferredAddress: 'DHA Phase 5, Lahore' } }
    }
  });

  const pharmacistUser = await prisma.user.create({
    data: {
      email: 'doctor@pharmaboy.com',
      passwordHash: hashedPassword,
      name: 'Dr. Ahmad',
      role: 'PHARMACIST',
      pharmacist: { create: { specialization: 'Clinical Pharmacology', isAvailable: true, isPrimary: true } }
    }
  });

  const ownerUser = await prisma.user.create({
    data: {
      email: 'wner@healthfirst.com',
      passwordHash: hashedPassword,
      name: 'HealtohFirst Admin',
      role: 'PHARMACY_OWNER',
      pharmacyOwner: { create: {} }
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@pharmaboy.com',
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'shahzaib', 10),
      name: process.env.ADMIN_NAME || 'Super Admin',
      role: 'ADMIN',
      admin: { create: {} }
    }
  });

  const riderUser = await prisma.user.create({
    data: {
      email: 'rider@pharmaboy.com',
      passwordHash: hashedPassword,
      name: 'Speedy Rider',
      role: 'RIDER',
      rider: { create: { vehicleType: 'Bike', isAvailable: true } }
    }
  });

  const pharmacy = await prisma.pharmacy.create({
    data: {
      name: 'HealthFirst Lahore',
      city: 'Lahore',
      address: 'Main Boulevard, Gulberg, Lahore',
      isActive: true,
      owner: { connect: { id: (await prisma.pharmacyOwner.findFirst()).id } }
    }
  });

  console.log('--- Seeding Medicines & Inventory ---');
  const medicinesData = [
    { name: "Norvasc", salt: "Amlodipine", form: "Tablet", strength: "5mg", packSize: 30, price: 580, manufacturer: "Pfizer" },
    { name: "Norvasc", salt: "Amlodipine", form: "Tablet", strength: "10mg", packSize: 30, price: 950, manufacturer: "Pfizer" },
    { name: "Amcard", salt: "Amlodipine", form: "Tablet", strength: "5mg", packSize: 20, price: 290, manufacturer: "Getz Pharma" },
    { name: "Amcard", salt: "Amlodipine", form: "Tablet", strength: "10mg", packSize: 20, price: 520, manufacturer: "Getz Pharma" },
    { name: "Amodip", salt: "Amlodipine", form: "Tablet", strength: "5mg", packSize: 30, price: 310, manufacturer: "Mass Pharma" },
    { name: "Amodip", salt: "Amlodipine", form: "Tablet", strength: "10mg", packSize: 30, price: 550, manufacturer: "Mass Pharma" },
    { name: "Panadol", salt: "Paracetamol", form: "Tablet", strength: "500mg", packSize: 200, price: 1050, manufacturer: "GSK" },
    { name: "Panadol CF", salt: "Paracetamol", form: "Tablet", strength: "500mg", packSize: 100, price: 800, manufacturer: "GSK" },
    { name: "Febrol", salt: "Paracetamol", form: "Tablet", strength: "500mg", packSize: 100, price: 450, manufacturer: "Reckitt" },
    { name: "Calpol", salt: "Paracetamol", form: "Tablet", strength: "500mg", packSize: 100, price: 480, manufacturer: "GSK" },
    { name: "Augmentin", salt: "Amoxicillin + Clavulanic Acid", form: "Tablet", strength: "625mg", packSize: 12, price: 450, manufacturer: "GSK" },
    { name: "Augmentin", salt: "Amoxicillin + Clavulanic Acid", form: "Tablet", strength: "1g", packSize: 12, price: 780, manufacturer: "GSK" },
    { name: "Amclav", salt: "Amoxicillin + Clavulanic Acid", form: "Tablet", strength: "625mg", packSize: 10, price: 380, manufacturer: "Getz Pharma" },
    { name: "Amclav", salt: "Amoxicillin + Clavulanic Acid", form: "Tablet", strength: "1g", packSize: 10, price: 650, manufacturer: "Getz Pharma" },
    { name: "Curam", salt: "Amoxicillin + Clavulanic Acid", form: "Tablet", strength: "625mg", packSize: 14, price: 410, manufacturer: "Sandoz" },
    { name: "Curam", salt: "Amoxicillin + Clavulanic Acid", form: "Tablet", strength: "1g", packSize: 14, price: 720, manufacturer: "Sandoz" },
    { name: "Nexum", salt: "Esomeprazole", form: "Capsule", strength: "20mg", packSize: 14, price: 380, manufacturer: "Getz Pharma" },
    { name: "Nexum", salt: "Esomeprazole", form: "Capsule", strength: "40mg", packSize: 14, price: 620, manufacturer: "Getz Pharma" },
    { name: "Esome", salt: "Esomeprazole", form: "Capsule", strength: "20mg", packSize: 14, price: 350, manufacturer: "Searle" },
    { name: "Esome", salt: "Esomeprazole", form: "Capsule", strength: "40mg", packSize: 14, price: 580, manufacturer: "Searle" },
    { name: "Risek", salt: "Omeprazole", form: "Capsule", strength: "20mg", packSize: 14, price: 320, manufacturer: "Getz Pharma" },
    { name: "Risek", salt: "Omeprazole", form: "Capsule", strength: "40mg", packSize: 14, price: 510, manufacturer: "Getz Pharma" },
    { name: "Omega", salt: "Omeprazole", form: "Capsule", strength: "20mg", packSize: 14, price: 300, manufacturer: "Ferozsons" },
    { name: "Omega", salt: "Omeprazole", form: "Capsule", strength: "40mg", packSize: 14, price: 490, manufacturer: "Ferozsons" },
    { name: "Lipiget", salt: "Atorvastatin", form: "Tablet", strength: "10mg", packSize: 10, price: 250, manufacturer: "Getz Pharma" },
    { name: "Lipiget", salt: "Atorvastatin", form: "Tablet", strength: "20mg", packSize: 10, price: 420, manufacturer: "Getz Pharma" },
    { name: "Lipitor", salt: "Atorvastatin", form: "Tablet", strength: "10mg", packSize: 30, price: 1200, manufacturer: "Pfizer" },
    { name: "Lipitor", salt: "Atorvastatin", form: "Tablet", strength: "20mg", packSize: 30, price: 2100, manufacturer: "Pfizer" },
    { name: "Novidat", salt: "Ciprofloxacin", form: "Tablet", strength: "250mg", packSize: 10, price: 220, manufacturer: "Sami Pharma" },
    { name: "Novidat", salt: "Ciprofloxacin", form: "Tablet", strength: "500mg", packSize: 10, price: 410, manufacturer: "Sami Pharma" },
    { name: "Ciproxin", salt: "Ciprofloxacin", form: "Tablet", strength: "250mg", packSize: 10, price: 350, manufacturer: "Bayer" },
    { name: "Ciproxin", salt: "Ciprofloxacin", form: "Tablet", strength: "500mg", packSize: 10, price: 650, manufacturer: "Bayer" },
    { name: "Glucophage", salt: "Metformin", form: "Tablet", strength: "500mg", packSize: 50, price: 450, manufacturer: "Merck" },
    { name: "Glucophage", salt: "Metformin", form: "Tablet", strength: "1000mg", packSize: 30, price: 600, manufacturer: "Merck" },
    { name: "Getformin", salt: "Metformin", form: "Tablet", strength: "500mg", packSize: 50, price: 380, manufacturer: "Getz Pharma" },
    { name: "Getformin", salt: "Metformin", form: "Tablet", strength: "1000mg", packSize: 30, price: 520, manufacturer: "Getz Pharma" },
    { name: "Monas", salt: "Montelukast", form: "Tablet", strength: "5mg", packSize: 14, price: 280, manufacturer: "Getz Pharma" },
    { name: "Monas", salt: "Montelukast", form: "Tablet", strength: "10mg", packSize: 14, price: 450, manufacturer: "Getz Pharma" },
    { name: "Myteka", salt: "Montelukast", form: "Tablet", strength: "5mg", packSize: 14, price: 310, manufacturer: "Hilton" },
    { name: "Myteka", salt: "Montelukast", form: "Tablet", strength: "10mg", packSize: 14, price: 490, manufacturer: "Hilton" },
    { name: "Siter", salt: "Sitagliptin", form: "Tablet", strength: "50mg", packSize: 14, price: 600, manufacturer: "Getz Pharma" },
    { name: "Siter", salt: "Sitagliptin", form: "Tablet", strength: "100mg", packSize: 14, price: 1100, manufacturer: "Getz Pharma" },
    { name: "Januvia", salt: "Sitagliptin", form: "Tablet", strength: "50mg", packSize: 28, price: 2400, manufacturer: "MSD" },
    { name: "Januvia", salt: "Sitagliptin", form: "Tablet", strength: "100mg", packSize: 28, price: 4500, manufacturer: "MSD" },
    { name: "Concor", salt: "Bisoprolol", form: "Tablet", strength: "2.5mg", packSize: 14, price: 250, manufacturer: "Merck" },
    { name: "Concor", salt: "Bisoprolol", form: "Tablet", strength: "5mg", packSize: 14, price: 420, manufacturer: "Merck" },
    { name: "Bisocor", salt: "Bisoprolol", form: "Tablet", strength: "2.5mg", packSize: 20, price: 280, manufacturer: "Getz Pharma" },
    { name: "Bisocor", salt: "Bisoprolol", form: "Tablet", strength: "5mg", packSize: 20, price: 490, manufacturer: "Getz Pharma" },
    { name: "Zithromax", salt: "Azithromycin", form: "Tablet", strength: "250mg", packSize: 6, price: 450, manufacturer: "Pfizer" },
    { name: "Zithromax", salt: "Azithromycin", form: "Tablet", strength: "500mg", packSize: 3, price: 450, manufacturer: "Pfizer" },
    { name: "Azomax", salt: "Azithromycin", form: "Tablet", strength: "250mg", packSize: 6, price: 320, manufacturer: "Getz Pharma" },
    { name: "Azomax", salt: "Azithromycin", form: "Tablet", strength: "500mg", packSize: 3, price: 320, manufacturer: "Getz Pharma" },
    { name: "Flagyl", salt: "Metronidazole", form: "Tablet", strength: "200mg", packSize: 20, price: 150, manufacturer: "Sanofi" },
    { name: "Flagyl", salt: "Metronidazole", form: "Tablet", strength: "400mg", packSize: 20, price: 280, manufacturer: "Sanofi" },
    { name: "Metodine", salt: "Metronidazole", form: "Tablet", strength: "400mg", packSize: 20, price: 240, manufacturer: "Nabiqasim" },
    { name: "Voltral", salt: "Diclofenac Sodium", form: "Tablet", strength: "50mg", packSize: 20, price: 350, manufacturer: "Novartis" },
    { name: "Voltral", salt: "Diclofenac Sodium", form: "Tablet", strength: "100mg", packSize: 20, price: 620, manufacturer: "Novartis" },
    { name: "Artifen", salt: "Diclofenac Sodium", form: "Tablet", strength: "50mg", packSize: 20, price: 280, manufacturer: "Abbott" },
    { name: "Diclo", salt: "Diclofenac Sodium", form: "Tablet", strength: "50mg", packSize: 20, price: 210, manufacturer: "Highnoon" },
    { name: "Xobix", salt: "Meloxicam", form: "Tablet", strength: "7.5mg", packSize: 10, price: 220, manufacturer: "Getz Pharma" },
    { name: "Xobix", salt: "Meloxicam", form: "Tablet", strength: "15mg", packSize: 10, price: 390, manufacturer: "Getz Pharma" },
    { name: "Mobic", salt: "Meloxicam", form: "Tablet", strength: "7.5mg", packSize: 10, price: 350, manufacturer: "Boehringer" },
    { name: "Mobic", salt: "Meloxicam", form: "Tablet", strength: "15mg", packSize: 10, price: 600, manufacturer: "Boehringer" },
    { name: "Softin", salt: "Loratadine", form: "Tablet", strength: "10mg", packSize: 10, price: 180, manufacturer: "Bosch" },
    { name: "Lorfast", salt: "Loratadine", form: "Tablet", strength: "10mg", packSize: 10, price: 165, manufacturer: "Berlex" },
    { name: "Klaricid", salt: "Clarithromycin", form: "Tablet", strength: "250mg", packSize: 10, price: 650, manufacturer: "Abbott" },
    { name: "Klaricid", salt: "Clarithromycin", form: "Tablet", strength: "500mg", packSize: 10, price: 1200, manufacturer: "Abbott" },
    { name: "Claritek", salt: "Clarithromycin", form: "Tablet", strength: "250mg", packSize: 10, price: 510, manufacturer: "Getz Pharma" },
    { name: "Claritek", salt: "Clarithromycin", form: "Tablet", strength: "500mg", packSize: 10, price: 950, manufacturer: "Getz Pharma" },
    { name: "Ventolin", salt: "Salbutamol", form: "Syrup", strength: "2mg/5ml", packSize: 1, price: 120, manufacturer: "GSK" },
    { name: "Salbo", salt: "Salbutamol", form: "Syrup", strength: "2mg/5ml", packSize: 1, price: 95, manufacturer: "Nabiqasim" },
    { name: "Zantac", salt: "Ranitidine", form: "Tablet", strength: "150mg", packSize: 30, price: 450, manufacturer: "GSK" },
    { name: "Neotack", salt: "Ranitidine", form: "Tablet", strength: "150mg", packSize: 30, price: 320, manufacturer: "Searle" },
    { name: "Avil", salt: "Pheniramine", form: "Tablet", strength: "25mg", packSize: 50, price: 350, manufacturer: "Sanofi" },
    { name: "Phenergan", salt: "Promethazine", form: "Tablet", strength: "25mg", packSize: 50, price: 320, manufacturer: "Sanofi" },
    { name: "Keflex", salt: "Cephalexin", form: "Capsule", strength: "250mg", packSize: 12, price: 380, manufacturer: "GSK" },
    { name: "Keflex", salt: "Cephalexin", form: "Capsule", strength: "500mg", packSize: 12, price: 700, manufacturer: "GSK" },
    { name: "Ceporex", salt: "Cephalexin", form: "Capsule", strength: "250mg", packSize: 12, price: 340, manufacturer: "GSK" },
    { name: "Ceporex", salt: "Cephalexin", form: "Capsule", strength: "500mg", packSize: 12, price: 640, manufacturer: "GSK" },
    { name: "Rocephin", salt: "Ceftriaxone", form: "Injection", strength: "500mg", packSize: 1, price: 850, manufacturer: "Roche" },
    { name: "Rocephin", salt: "Ceftriaxone", form: "Injection", strength: "1g", packSize: 1, price: 1450, manufacturer: "Roche" },
    { name: "Xone", salt: "Ceftriaxone", form: "Injection", strength: "500mg", packSize: 1, price: 420, manufacturer: "Getz Pharma" },
    { name: "Xone", salt: "Ceftriaxone", form: "Injection", strength: "1g", packSize: 1, price: 750, manufacturer: "Getz Pharma" },
    { name: "Ceftra", salt: "Ceftriaxone", form: "Injection", strength: "1g", packSize: 1, price: 680, manufacturer: "Sami Pharma" },
    { name: "Entamizole", salt: "Metronidazole+Diloxanide", form: "Tablet", strength: "250mg", packSize: 20, price: 350, manufacturer: "Abbott" },
    { name: "Entamizole DS", salt: "Metronidazole+Diloxanide", form: "Tablet", strength: "500mg", packSize: 15, price: 420, manufacturer: "Abbott" },
    { name: "D-Met", salt: "Metronidazole+Diloxanide", form: "Tablet", strength: "250mg", packSize: 20, price: 290, manufacturer: "Sami Pharma" },
    { name: "Brufen", salt: "Ibuprofen", form: "Tablet", strength: "200mg", packSize: 30, price: 180, manufacturer: "Abbott" },
    { name: "Brufen", salt: "Ibuprofen", form: "Tablet", strength: "400mg", packSize: 30, price: 320, manufacturer: "Abbott" },
    { name: "Ibugesic", salt: "Ibuprofen", form: "Tablet", strength: "400mg", packSize: 30, price: 250, manufacturer: "Highnoon" },
    { name: "Lasilix", salt: "Furosemide", form: "Tablet", strength: "40mg", packSize: 50, price: 250, manufacturer: "Sanofi" },
    { name: "Furo", salt: "Furosemide", form: "Tablet", strength: "40mg", packSize: 50, price: 180, manufacturer: "Bosch" },
    { name: "Serpina", salt: "Reserpine", form: "Tablet", strength: "0.25mg", packSize: 100, price: 450, manufacturer: "Himalaya" },
    { name: "Inderal", salt: "Propranolol", form: "Tablet", strength: "10mg", packSize: 50, price: 380, manufacturer: "AstraZeneca" },
    { name: "Inderal", salt: "Propranolol", form: "Tablet", strength: "40mg", packSize: 50, price: 720, manufacturer: "AstraZeneca" },
    { name: "Lowplat", salt: "Clopidogrel", form: "Tablet", strength: "75mg", packSize: 10, price: 450, manufacturer: "Getz Pharma" },
    { name: "Plavix", salt: "Clopidogrel", form: "Tablet", strength: "75mg", packSize: 14, price: 1250, manufacturer: "Sanofi" },
    { name: "Capoten", salt: "Captopril", form: "Tablet", strength: "25mg", packSize: 20, price: 480, manufacturer: "Bristol-Myers" },
    { name: "Capoten", salt: "Captopril", form: "Tablet", strength: "50mg", packSize: 20, price: 850, manufacturer: "Bristol-Myers" },
    { name: "Captor", salt: "Captopril", form: "Tablet", strength: "25mg", packSize: 20, price: 320, manufacturer: "Bosch" }
  ];

  for (const med of medicinesData) {
    const createdMed = await prisma.medicine.create({
      data: {
        name: med.name,
        salt: med.salt,
        form: med.form,
        strength: med.strength,
        packSize: med.packSize,
        manufacturer: med.manufacturer,
        mrp: med.price,
        requiresRx: false
      }
    });

    await prisma.pharmacyStock.create({
      data: {
        pharmacyId: pharmacy.id,
        medicineId: createdMed.id,
        price: med.price,
        isAvailable: true
      }
    });
  }

  console.log(`--- Seeded 100 Medicines for ${pharmacy.name} ---`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
