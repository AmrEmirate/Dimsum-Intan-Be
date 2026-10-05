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

  // 2. Buat Master Data 3 Outlet Dimsum Intan
  console.log('🏢 Membuat master data 3 outlet...');
  await prisma.outlet.upsert({
    where: { code: 'DU-01' },
    update: {},
    create: {
      id: 'out_du_01',
      code: 'DU-01',
      name: 'Cabang Dipatiukur',
      city: 'Bandung',
      address: 'Jl. Dipati Ukur No. 42, Coblong, Kota Bandung',
      phone: '0812-2233-4455',
      targetDailySales: 4000000,
    },
  });

  await prisma.outlet.upsert({
    where: { code: 'RU-02' },
    update: {},
    create: {
      id: 'out_ru_02',
      code: 'RU-02',
      name: 'Cabang R.E. Martadinata (Riau)',
      city: 'Bandung',
      address: 'Jl. L. L. R.E. Martadinata No. 88, Cihapit, Bandung Wetan',
      phone: '0812-3344-5566',
      targetDailySales: 5000000,
    },
  });

  await prisma.outlet.upsert({
    where: { code: 'BB-03' },
    update: {},
    create: {
      id: 'out_bb_03',
      code: 'BB-03',
      name: 'Cabang Buah Batu',
      city: 'Bandung',
      address: 'Jl. Buah Batu No. 154, Turangga, Lengkong, Bandung',
      phone: '0812-4455-6677',
      targetDailySales: 4500000,
    },
  });

  // 3. Buat Akun Khusus Owner
  console.log('👤 Membuat akun khusus Owner...');
  const ownerPassHash = await bcrypt.hash('owner123', 10);
  const ownerPinHash = await bcrypt.hash('9999', 10);

  const userOwner = await prisma.user.upsert({
    where: { username: 'owner' },
    update: {
      passwordHash: ownerPassHash,
      pinHash: ownerPinHash,
    },
    create: {
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
