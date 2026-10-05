import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Menjalankan pembersihan total database Dimsum Intan...');

  // 1. Bersihkan SELURUH data tabel tanpa sisa
  console.log('🧹 Menghapus semua data (transaksi, menu, shift, kas kecil, biaya, cabang & user)...');
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

  // 2. Buat HANYA SATU akun login Owner / Admin saja (Database 100% bersih tanpa data cabang dummy)
  console.log('👑 Mendaftarkan satu-satunya akun login Owner / Admin...');
  const ownerPasswordHash = await bcrypt.hash('owner123', 10);
  const ownerPinHash = await bcrypt.hash('9999', 10);

  const owner = await prisma.user.create({
    data: {
      id: 'usr_owner_01',
      name: 'Owner Dimsum Intan',
      username: 'owner',
      passwordHash: ownerPasswordHash,
      pinHash: ownerPinHash,
      role: Role.OWNER,
      outletId: null,
    },
  });

  console.log('====================================================');
  console.log('✅ DATABASE 100% BERSIH (KOSONG DARI DATA DUMMY)');
  console.log('👑 Akun Tunggal Admin / Owner:');
  console.log(`   - Username : ${owner.username}`);
  console.log('   - Password : owner123');
  console.log('   - PIN Auth : 9999');
  console.log('   - Role     : OWNER');
  console.log('ℹ️  Seluruh cabang, menu & staf dapat diinput murni dari web app.');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
