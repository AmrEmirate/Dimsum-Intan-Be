import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses reset dan seeding ulang database Dimsum Intan...');

  // 1. Bersihkan SELURUH data tabel dari database
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

  // 2. Buat Master Data 3 Outlet Dasar Dimsum Intan
  console.log('🏢 Mendaftarkan master data 3 cabang outlet...');
  await prisma.outlet.createMany({
    data: [
      {
        id: 'out_du_01',
        code: 'DU-01',
        name: 'Cabang Dipatiukur',
        city: 'Bandung',
        address: 'Jl. Dipati Ukur No. 42, Coblong, Kota Bandung',
        phone: '0812-2233-4455',
        targetDailySales: 4000000,
      },
      {
        id: 'out_ru_02',
        code: 'RU-02',
        name: 'Cabang R.E. Martadinata (Riau)',
        city: 'Bandung',
        address: 'Jl. L. L. R.E. Martadinata No. 88, Cihapit, Bandung Wetan',
        phone: '0812-3344-5566',
        targetDailySales: 5000000,
      },
      {
        id: 'out_bb_03',
        code: 'BB-03',
        name: 'Cabang Buah Batu',
        city: 'Bandung',
        address: 'Jl. Buah Batu No. 154, Turangga, Lengkong, Bandung',
        phone: '0812-4455-6677',
        targetDailySales: 4500000,
      },
    ],
  });

  // 3. Buat SATU AKUN SAJA: Khusus Login Owner
  console.log('👑 Membuat akun tunggal khusus Owner...');
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
    },
  });

  console.log('====================================================');
  console.log('✅ DATABASE BERHASIL DIRESET & DI-SEEDING!');
  console.log('👑 Akun Login Tersedia (Hanya Owner):');
  console.log(`   - Username : ${owner.username}`);
  console.log('   - Password : owner123');
  console.log('   - PIN Auth : 9999');
  console.log('   - Role     : OWNER (Akses Penuh Seluruh Cabang & Modul)');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
