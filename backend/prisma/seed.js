import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name     = process.env.ADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    console.log('ℹ️  Seed skipped — ADMIN_EMAIL / ADMIN_PASSWORD not set.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', name },
    create: {
      email,
      passwordHash,
      name,
      role: 'ADMIN',
      admin: { create: {} },
    },
  });

  // Ensure admin profile row exists (if user was updated, not created)
  await prisma.admin.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  console.log(`✅ Admin seeded: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
