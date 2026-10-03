import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses reset dan seeding database Dimsum Intan...');

  // 1. Bersihkan seluruh data dari database
  console.log('🧹 Membersihkan seluruh data database...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.shiftSession.deleteMany();
  await prisma.pettyCash.deleteMany();
  await prisma.factoryInvoiceItem.deleteMany();
  await prisma.factoryInvoice.deleteMany();
  await prisma.fixedExpense.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.outlet.deleteMany();

  // 2. Buat Akun Khusus Owner
  console.log('👤 Membuat akun khusus Owner...');
  const ownerPassHash = await bcrypt.hash('owner123', 10);
  const ownerPinHash = await bcrypt.hash('9999', 10);

  const userOwner = await prisma.user.create({
    data: {
      id: 'usr_owner_01',
      name: 'Owner Dimsum Intan',
      username: 'owner',
      passwordHash: ownerPassHash,
      pinHash: ownerPinHash,
      role: Role.OWNER,
    },
  });

  console.log('✅ Berhasil menghapus semua data dan membuat akun Owner:');
  console.log(`   - ID: ${userOwner.id}`);
  console.log(`   - Nama: ${userOwner.name}`);
  console.log('   - Username: owner');
  console.log('   - Password: owner123');
  console.log('   - PIN Otorisasi: 9999');
  console.log('   - Role: OWNER');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
