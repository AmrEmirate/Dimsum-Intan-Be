# Dimsum-Intan-Be

Backend API untuk Sistem Web POS dan Akuntansi Sederhana Dimsum Intan (3 Outlet).

## Fitur Utama
- **Autentikasi & Otorisasi RBAC**: Owner, Supervisor, Kasir (dengan verifikasi PIN Supervisor/Owner untuk void & hapus data).
- **POS & Transaksi Penjualan**: Kasir Shift, pesanan Dine-in / Takeaway, pembayaran Tunai / QRIS, cetak struk, void transaksi.
- **Sesi Shift Kasir**: Buka shift, rekap uang fisik, hitung selisih kas otomatis.
- **Modul Kas Kecil (Petty Cash)**: Pencatatan pengeluaran darurat outlet + upload bukti nota fisik.
- **Tagihan Suplai Pabrik**: Faktur kiriman dimsum pabrik, jatuh tempo, dan pelunasan.
- **Beban Operasional Tetap**: Pencatatan biaya sewa lapak 3 outlet, listrik, internet, gaji.
- **Master Menu & HPP**: Perhitungan margin keuntungan dan harga pokok penjualan dimsum.
- **Laporan Laba Rugi & Arus Kas**: Laba kotor, laba bersih otomatis.
- **Notifikasi WhatsApp**: Integrasi bot WhatsApp via WhatsApp Web JS.

## Tech Stack
- Node.js & TypeScript
- Express.js
- Prisma ORM & PostgreSQL
- Zod & JWT Authentication
- WhatsApp Web JS

## Cara Menjalankan
1. Copy `.env.example` ke `.env` dan sesuaikan koneksi database PostgreSQL.
2. Install dependensi:
   ```bash
   npm install
   ```
3. Generate Prisma Client & Migrasi:
   ```bash
   npx prisma generate
   ```
4. Jalankan server dev:
   ```bash
   npm run dev
   ```
