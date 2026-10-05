import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * =======================================================================
 * PANDUAN MENAMBAH CABANG BARU DI SEED DATABASE
 * =======================================================================
 * Untuk menambahkan cabang baru melalui file seed ini:
 * 1. Tambahkan data cabang baru pada array `INITIAL_OUTLETS` di bawah.
 * 2. Pastikan `code` bersifat unik (misal: 'DG-04' untuk Dago).
 * 3. Jika ingin membuatkan kasir khusus untuk cabang tersebut, tambahkan
 *    juga di array `INITIAL_USERS` dengan `outletId` yang sesuai.
 * 4. Jalankan perintah di terminal: `npm run seed` (di dalam folder backend).
 * =======================================================================
 */

export const INITIAL_OUTLETS = [
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
  // CONTOH CABANG KE-4 (Dapat di-uncomment jika ingin langsung diaktifkan):
  // {
  //   id: 'out_dg_04',
  //   code: 'DG-04',
  //   name: 'Cabang Dago Heritage',
  //   city: 'Bandung',
  //   address: 'Jl. Ir. H. Juanda No. 102, Coblong, Kota Bandung',
  //   phone: '0812-5566-7788',
  //   targetDailySales: 5500000,
  // },
];

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

  // 2. Buat Master Data Outlet
  console.log(`🏢 Mendaftarkan ${INITIAL_OUTLETS.length} master cabang outlet...`);
  for (const outlet of INITIAL_OUTLETS) {
    await prisma.outlet.upsert({
      where: { code: outlet.code },
      update: {
        name: outlet.name,
        city: outlet.city,
        address: outlet.address,
        phone: outlet.phone,
        targetDailySales: outlet.targetDailySales,
      },
      create: {
        id: outlet.id,
        code: outlet.code,
        name: outlet.name,
        city: outlet.city,
        address: outlet.address,
        phone: outlet.phone,
        targetDailySales: outlet.targetDailySales,
      },
    });
    console.log(`   ✅ Cabang aktif: ${outlet.name} [${outlet.code}]`);
  }

  // 3. Buat Kredensial Password Standar
  console.log('👤 Membuat akun pengguna (Owner, Supervisor, dan Kasir)...');
  const defaultPasswordHash = await bcrypt.hash('kasir123', 10);
  const ownerPasswordHash = await bcrypt.hash('owner123', 10);
  const spvPasswordHash = await bcrypt.hash('spv123', 10);

  const defaultPinHash = await bcrypt.hash('1234', 10);
  const ownerPinHash = await bcrypt.hash('9999', 10);

  // Akun Owner
  const userOwner = await prisma.user.upsert({
    where: { username: 'owner' },
    update: {
      passwordHash: ownerPasswordHash,
      pinHash: ownerPinHash,
    },
    create: {
      id: 'usr_owner_01',
      name: 'Owner Dimsum Intan',
      username: 'owner',
      passwordHash: ownerPasswordHash,
      pinHash: ownerPinHash,
      role: Role.OWNER,
    },
  });

  // Akun Supervisor Area
  await prisma.user.upsert({
    where: { username: 'spv' },
    update: {
      passwordHash: spvPasswordHash,
      pinHash: defaultPinHash,
    },
    create: {
      id: 'usr_spv_01',
      name: 'Supervisor Operasional',
      username: 'spv',
      passwordHash: spvPasswordHash,
      pinHash: defaultPinHash,
      role: Role.SUPERVISOR,
    },
  });

  // Akun Kasir Per Cabang
  const cashiers = [
    { username: 'kasir_du', name: 'Kasir Dipatiukur', outletId: 'out_du_01' },
    { username: 'kasir_ru', name: 'Kasir Riau', outletId: 'out_ru_02' },
    { username: 'kasir_bb', name: 'Kasir Buah Batu', outletId: 'out_bb_03' },
  ];

  for (const cashier of cashiers) {
    await prisma.user.upsert({
      where: { username: cashier.username },
      update: {
        passwordHash: defaultPasswordHash,
        outletId: cashier.outletId,
      },
      create: {
        name: cashier.name,
        username: cashier.username,
        passwordHash: defaultPasswordHash,
        role: Role.KASIR,
        outletId: cashier.outletId,
      },
    });
  }

  console.log('✅ Berhasil mendaftarkan seluruh akun:');
  console.log(`   - Owner: username "owner", password "owner123", PIN "9999"`);
  console.log(`   - Supervisor: username "spv", password "spv123", PIN "1234"`);
  console.log(`   - Kasir DU: username "kasir_du", password "kasir123"`);
  console.log(`   - Kasir Riau: username "kasir_ru", password "kasir123"`);
  console.log(`   - Kasir Buah Batu: username "kasir_bb", password "kasir123"`);
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
