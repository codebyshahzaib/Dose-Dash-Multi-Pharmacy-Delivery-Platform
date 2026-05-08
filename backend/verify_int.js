import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Verifying Integer Types ---');
  
  const med = await prisma.medicine.findFirst({
    select: { name: true, packSize: true, mrp: true }
  });
  
  const stock = await prisma.pharmacyStock.findFirst({
    select: { price: true }
  });

  console.log('Sample Medicine:', med);
  console.log('Medicine packSize type:', typeof med.packSize);
  console.log('Medicine mrp type:', typeof med.mrp);
  
  console.log('Sample Stock:', stock);
  console.log('Stock price type:', typeof stock.price);

  if (Number.isInteger(med.packSize) && Number.isInteger(med.mrp) && Number.isInteger(stock.price)) {
    console.log('✅ SUCCESS: All fields are properly stored as Integers.');
  } else {
    console.log('❌ FAILURE: Some fields are not Integers.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
