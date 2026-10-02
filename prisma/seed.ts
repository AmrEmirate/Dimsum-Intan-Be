import { PrismaClient, Role, OrderType, PaymentMethod, OrderStatus, ShiftStatus, PettyCashCategory, PettyCashStatus, InvoiceStatus, FixedExpenseCategory, ExpenseStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding database Dimsum Intan...');

  // 1. Bersihkan database terlebih dahulu untuk menghindari bentrok id/code
  console.log('🧹 Membersihkan data lama...');
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
  console.log('🏪 Membuat data outlet...');
  const outletDu = await prisma.outlet.create({
    data: {
      id: 'du',
      code: 'DU-01',
      name: 'Outlet 01 - Dipatiukur',
      city: 'Bandung',
      address: 'Jl. Dipatiukur No. 45, Coblong, Bandung',
      phone: '0812-3344-5501',
      targetDailySales: 7500000,
    },
  });

  const outletRiau = await prisma.outlet.create({
    data: {
      id: 'riau',
      code: 'RU-02',
      name: 'Outlet 02 - Riau',
      city: 'Bandung',
      address: 'Jl. L.L.R.E. Martadinata No. 88, Cihapit, Bandung',
      phone: '0812-3344-5502',
      targetDailySales: 8500000,
    },
  });

  const outletBatu = await prisma.outlet.create({
    data: {
      id: 'batu',
      code: 'BB-03',
      name: 'Outlet 03 - Buah Batu',
      city: 'Bandung',
      address: 'Jl. Buah Batu No. 120, Turangga, Bandung',
      phone: '0812-3344-5503',
      targetDailySales: 6000000,
    },
  });

  // 3. Buat Master Data Pengguna (Users)
  console.log('👥 Membuat data pengguna...');
  const ownerPassHash = await bcrypt.hash('owner123', 10);
  const spvPassHash = await bcrypt.hash('spv123', 10);
  const kasirPassHash = await bcrypt.hash('kasir123', 10);
  const spvPinHash = await bcrypt.hash('1234', 10);
  const ownerPinHash = await bcrypt.hash('9999', 10);

  const userOwner = await prisma.user.create({
    data: {
      id: 'usr_owner_01',
      name: 'Hj. Intan Permata',
      username: 'owner',
      passwordHash: ownerPassHash,
      pinHash: ownerPinHash,
      role: Role.OWNER,
    },
  });

  const userSpv = await prisma.user.create({
    data: {
      id: 'usr_spv_01',
      name: 'Hendra Wijaya (SPV)',
      username: 'supervisor',
      passwordHash: spvPassHash,
      pinHash: spvPinHash,
      role: Role.SUPERVISOR,
      outletId: outletDu.id,
    },
  });

  const userKasir = await prisma.user.create({
    data: {
      id: 'usr_ksr_01',
      name: 'Siti Rahma',
      username: 'kasir',
      passwordHash: kasirPassHash,
      role: Role.KASIR,
      outletId: outletDu.id,
    },
  });

  // 4. Buat Master Menu Items & HPP
  console.log('🥟 Membuat master menu dimsum...');
  const menuData = [
    {
      id: 'dim_01',
      code: 'MEN-001',
      name: 'Dimsum Ayam Mentai Special',
      category: 'mentai',
      price: 25000,
      costPrice: 11500,
      stock: 42,
      description: '4 pcs siomay ayam padat dengan saus mentai bakar tobiko gurih pedas.',
      image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'dim_02',
      code: 'MEN-002',
      name: 'Dimsum Udang Keju Mentai',
      category: 'mentai',
      price: 28000,
      costPrice: 13000,
      stock: 35,
      description: 'Siomay isi daging udang segar dengan melted cheese & torch saus mentai.',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'dim_03',
      code: 'KUK-001',
      name: 'Hakau Udang Kristal Intan',
      category: 'kukus',
      price: 24000,
      costPrice: 10800,
      stock: 28,
      description: 'Kulit transparan tipis kenyal berisi udang cincang utuh manis berair.',
      image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'dim_04',
      code: 'KUK-002',
      name: 'Siomay Ayam Jamur Shiitake',
      category: 'kukus',
      price: 20000,
      costPrice: 9200,
      stock: 50,
      description: 'Olahan paha ayam cincang dipadu jamur shiitake aromatik lembut.',
      image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'dim_05',
      code: 'KUK-003',
      name: 'Dimsum Nori Crabstick',
      category: 'kukus',
      price: 22000,
      costPrice: 9800,
      stock: 22,
      description: 'Dibalut rumput laut panggang gurih dengan topping kepiting stick impor.',
      image: 'https://images.unsplash.com/photo-1615719413546-198b25453f85?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'dim_06',
      code: 'KUK-004',
      name: 'Angsio Kaki Ayam Lada Hitam',
      category: 'kukus',
      price: 21000,
      costPrice: 8500,
      stock: 16,
      description: 'Ceker empuk bumbu merah rempah manis gurih khas cantonese authentic.',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'dim_07',
      code: 'GOR-001',
      name: 'Pangsit Udang Goreng Mayonaise',
      category: 'goreng',
      price: 23000,
      costPrice: 10200,
      stock: 30,
      description: 'Pangsit renyah keemasan isi udang dengan saus dipping mayo manis gurih.',
      image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'dim_08',
      code: 'GOR-002',
      name: 'Lumpia Udang Kulit Tahu',
      category: 'goreng',
      price: 24000,
      costPrice: 10500,
      stock: 18,
      description: 'Kulit tahu lembut digoreng garing berisi udang dan rebung harum.',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'dim_09',
      code: 'GOR-003',
      name: 'Wonton Crispy Chilli Oil',
      category: 'goreng',
      price: 22000,
      costPrice: 9000,
      stock: 25,
      description: 'Wonton garing renyah disiram minyak cabai pedas harum rempah Szechuan.',
      image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'dim_10',
      code: 'DRK-001',
      name: 'Es Teh Manis Melati Jumbo',
      category: 'minuman',
      price: 7000,
      costPrice: 2000,
      stock: 150,
      description: 'Teh melati seduh segar dingin ukuran 22oz pelepas dahaga.',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'dim_11',
      code: 'DRK-002',
      name: 'Badak Sarsaparilla Float',
      category: 'minuman',
      price: 18000,
      costPrice: 8500,
      stock: 24,
      description: 'Minuman legendaris cap Badak Medan disajikan dingin dengan es krim vanila.',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'dim_12',
      code: 'DRK-003',
      name: 'Es Jeruk Nipis Murni Selasih',
      category: 'minuman',
      price: 12000,
      costPrice: 4000,
      stock: 40,
      description: 'Perasan jeruk nipis asli segar dingin dengan biji selasih kaya serat.',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
  ];

  for (const m of menuData) {
    await prisma.menuItem.create({ data: m });
  }

  // 5. Buat Sesi Shift Kasir Aktif
  console.log('⏰ Membuat sesi shift aktif...');
  const activeShift = await prisma.shiftSession.create({
    data: {
      id: 'shf_live_01',
      shiftName: 'Shift 1 Pagi',
      outletId: outletDu.id,
      cashierId: userKasir.id,
      terminalId: 'POS-01 Terminal',
      startTime: new Date('2026-09-07T08:30:00.000Z'),
      startingCash: 500000,
      cashSales: 1650000,
      qrisSales: 2850000,
      pettyCashOut: 70000,
      expectedCash: 2080000, // 500000 + 1650000 - 70000
      status: ShiftStatus.ACTIVE,
    },
  });

  // 6. Buat Contoh Riwayat Transaksi (Orders)
  console.log('🧾 Membuat riwayat order POS...');
  await prisma.order.create({
    data: {
      id: 'ord_101',
      invoiceNumber: 'INV/DU/20260907/001',
      outletId: outletDu.id,
      orderType: OrderType.DINE_IN,
      tableNumber: 'Meja 04',
      customerName: 'Bpk. Rangga',
      subtotal: 88000,
      discount: 0,
      total: 88000,
      hppTotal: 37800,
      paymentMethod: PaymentMethod.CASH,
      cashReceived: 100000,
      changeAmount: 12000,
      cashierId: userKasir.id,
      status: OrderStatus.PAID,
      createdAt: new Date('2026-09-07T09:45:00.000Z'),
      items: {
        create: [
          { menuId: 'dim_01', name: 'Dimsum Ayam Mentai Special', price: 25000, costPrice: 11500, quantity: 2, notes: 'Ekstra pedas' },
          { menuId: 'dim_03', name: 'Hakau Udang Kristal Intan', price: 24000, costPrice: 10800, quantity: 1 },
          { menuId: 'dim_10', name: 'Es Teh Manis Melati Jumbo', price: 7000, costPrice: 2000, quantity: 2 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      id: 'ord_102',
      invoiceNumber: 'INV/DU/20260907/002',
      outletId: outletDu.id,
      orderType: OrderType.TAKEAWAY,
      customerName: 'Ibu Nindy',
      subtotal: 79000,
      discount: 5000,
      total: 74000,
      hppTotal: 36200,
      paymentMethod: PaymentMethod.QRIS,
      cashierId: userKasir.id,
      status: OrderStatus.PAID,
      createdAt: new Date('2026-09-07T10:15:00.000Z'),
      items: {
        create: [
          { menuId: 'dim_02', name: 'Dimsum Udang Keju Mentai', price: 28000, costPrice: 13000, quantity: 2 },
          { menuId: 'dim_07', name: 'Pangsit Udang Goreng Mayonaise', price: 23000, costPrice: 10200, quantity: 1 },
        ],
      },
    },
  });

  // 7. Buat Data Kas Kecil (Petty Cash)
  console.log('💵 Membuat data kas kecil...');
  await prisma.pettyCash.create({
    data: {
      id: 'pc_01',
      expenseNumber: 'PC-DU-2609-001',
      outletId: outletDu.id,
      cashierId: userKasir.id,
      amount: 30000,
      category: PettyCashCategory.ES_BATU,
      description: 'Es batu kristal 2 bal untuk freezer bar minuman',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e49017aed81?w=500&auto=format&fit=crop&q=80',
      status: PettyCashStatus.DISETUJUI,
      verifiedById: userSpv.id,
      verifiedAt: new Date('2026-09-07T10:00:00.000Z'),
      createdAt: new Date('2026-09-07T09:15:00.000Z'),
    },
  });

  await prisma.pettyCash.create({
    data: {
      id: 'pc_02',
      expenseNumber: 'PC-DU-2609-002',
      outletId: outletDu.id,
      cashierId: userKasir.id,
      amount: 40000,
      category: PettyCashCategory.GALON_AIR,
      description: 'Galon air mineral 2 galon merk Aqua',
      receiptImageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80',
      status: PettyCashStatus.MENUNGGU_VERIFIKASI,
      createdAt: new Date('2026-09-07T11:30:00.000Z'),
    },
  });

  await prisma.pettyCash.create({
    data: {
      id: 'pc_03',
      expenseNumber: 'PC-RU-2609-001',
      outletId: outletRiau.id,
      cashierId: userKasir.id,
      amount: 55000,
      category: PettyCashCategory.PLASTIK_KEMASAN,
      description: 'Kantong kresek HD takeaway & sendok garpu plastik',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e49017aed81?w=500&auto=format&fit=crop&q=80',
      status: PettyCashStatus.DISETUJUI,
      verifiedById: userSpv.id,
      verifiedAt: new Date('2026-09-07T11:45:00.000Z'),
      createdAt: new Date('2026-09-07T10:30:00.000Z'),
    },
  });

  // 8. Buat Data Tagihan Pabrik (Factory Invoices)
  console.log('🏭 Membuat tagihan suplai pabrik...');
  await prisma.factoryInvoice.create({
    data: {
      id: 'fac_inv_01',
      invoiceNumber: 'INV-PBR-2024-10-04',
      supplierName: 'PT Dimsum Prima Rasa (Pusat)',
      outletId: outletDu.id,
      issueDate: new Date('2024-10-04'),
      dueDate: new Date('2024-10-14'),
      totalAmount: 18500000,
      status: InvoiceStatus.LUNAS,
      bankAccount: 'BCA 7788-990-112 a.n PT Dimsum Prima Rasa',
      paidAt: new Date('2024-10-12'),
      proofImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      items: {
        create: [
          { itemName: 'Dimsum Siomay Ayam Beku (Pouch 100 pcs)', quantity: 15, unit: 'Pouch', unitCost: 650000, total: 9750000 },
          { itemName: 'Hakau Udang Beku (Pouch 50 pcs)', quantity: 10, unit: 'Pouch', unitCost: 520000, total: 5200000 },
          { itemName: 'Saus Mentai Intan Formula (Drigen 5L)', quantity: 7, unit: 'Drigen', unitCost: 507142, total: 3550000 },
        ],
      },
    },
  });

  await prisma.factoryInvoice.create({
    data: {
      id: 'fac_inv_02',
      invoiceNumber: 'INV-PBR-2024-10-18',
      supplierName: 'PT Dimsum Prima Rasa (Pusat)',
      outletId: outletRiau.id,
      issueDate: new Date('2024-10-18'),
      dueDate: new Date('2024-10-28'),
      totalAmount: 22400000,
      status: InvoiceStatus.LUNAS,
      bankAccount: 'BCA 7788-990-112 a.n PT Dimsum Prima Rasa',
      paidAt: new Date('2024-10-26'),
      proofImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      items: {
        create: [
          { itemName: 'Dimsum Siomay Ayam Beku (Pouch 100 pcs)', quantity: 20, unit: 'Pouch', unitCost: 650000, total: 13000000 },
          { itemName: 'Dimsum Nori Crabstick (Pouch 100 pcs)', quantity: 10, unit: 'Pouch', unitCost: 580000, total: 5800000 },
          { itemName: 'Chili Oil Premium Intan (Drigen 5L)', quantity: 6, unit: 'Drigen', unitCost: 600000, total: 3600000 },
        ],
      },
    },
  });

  await prisma.factoryInvoice.create({
    data: {
      id: 'fac_inv_03',
      invoiceNumber: 'INV-PBR-2024-10-28',
      supplierName: 'PT Dimsum Prima Rasa (Pusat)',
      outletId: outletBatu.id,
      issueDate: new Date('2024-10-28'),
      dueDate: new Date('2024-11-08'),
      totalAmount: 23300000,
      status: InvoiceStatus.BELUM_LUNAS,
      bankAccount: 'BCA 7788-990-112 a.n PT Dimsum Prima Rasa',
      items: {
        create: [
          { itemName: 'Dimsum Siomay Ayam Beku (Pouch 100 pcs)', quantity: 18, unit: 'Pouch', unitCost: 650000, total: 11700000 },
          { itemName: 'Hakau Udang Beku (Pouch 50 pcs)', quantity: 12, unit: 'Pouch', unitCost: 520000, total: 6240000 },
          { itemName: 'Lumpia Kulit Tahu Beku (Pouch 50 pcs)', quantity: 10, unit: 'Pouch', unitCost: 536000, total: 5360000 },
        ],
      },
    },
  });

  // 9. Buat Data Beban Operasional Tetap (Fixed Expenses)
  console.log('💡 Membuat beban operasional tetap...');
  await prisma.fixedExpense.create({
    data: {
      id: 'fix_01',
      code: 'OPX-SEW-DU',
      title: 'Sewa Lapak Cabang Dipatiukur (Bulan Ini)',
      category: FixedExpenseCategory.SEWA_LAPAK,
      outletId: outletDu.id,
      amount: 7500000,
      period: 'Oktober 2024',
      status: ExpenseStatus.LUNAS,
      dueDate: new Date('2024-10-05'),
      autoDebet: true,
    },
  });

  await prisma.fixedExpense.create({
    data: {
      id: 'fix_02',
      code: 'OPX-SEW-RU',
      title: 'Sewa Lapak Cabang Riau (Bulan Ini)',
      category: FixedExpenseCategory.SEWA_LAPAK,
      outletId: outletRiau.id,
      amount: 9000000,
      period: 'Oktober 2024',
      status: ExpenseStatus.LUNAS,
      dueDate: new Date('2024-10-05'),
      autoDebet: true,
    },
  });

  await prisma.fixedExpense.create({
    data: {
      id: 'fix_03',
      code: 'OPX-SEW-BB',
      title: 'Sewa Lapak Cabang Buah Batu (Bulan Ini)',
      category: FixedExpenseCategory.SEWA_LAPAK,
      outletId: outletBatu.id,
      amount: 6500000,
      period: 'Oktober 2024',
      status: ExpenseStatus.LUNAS,
      dueDate: new Date('2024-10-05'),
      autoDebet: true,
    },
  });

  await prisma.fixedExpense.create({
    data: {
      id: 'fix_04',
      code: 'OPX-PAY-ALL',
      title: 'Payroll Gaji Pokok Kasir & Kru Dapur (12 Karyawan 3 Outlet)',
      category: FixedExpenseCategory.PAYROLL_GAJI,
      amount: 18500000,
      period: 'Oktober 2024',
      status: ExpenseStatus.LUNAS,
      dueDate: new Date('2024-10-25'),
      autoDebet: true,
    },
  });

  await prisma.fixedExpense.create({
    data: {
      id: 'fix_05',
      code: 'OPX-ELC-ALL',
      title: 'Listrik PLN Steamer Dimsum & Freezer 3 Cabang',
      category: FixedExpenseCategory.LISTRIK,
      amount: 3800000,
      period: 'Oktober 2024',
      status: ExpenseStatus.LUNAS,
      dueDate: new Date('2024-10-20'),
      autoDebet: true,
    },
  });

  await prisma.fixedExpense.create({
    data: {
      id: 'fix_06',
      code: 'OPX-NET-ALL',
      title: 'Internet Fiber Dedicated Cloud POS & CCTV Realtime',
      category: FixedExpenseCategory.INTERNET_POS,
      amount: 950000,
      period: 'Oktober 2024',
      status: ExpenseStatus.TERJADWAL,
      dueDate: new Date('2024-11-05'),
      autoDebet: false,
    },
  });

  console.log('✅ Seeding database Dimsum Intan selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
