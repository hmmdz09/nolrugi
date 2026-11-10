# NolRugi: AI-Powered Margin & Batch Expiry Rescue System
### Platform Manajemen Bisnis Terintegrasi Berbasis AI untuk UMKM Pangan & Produk Kemasan

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38bdf8.svg)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3-green.svg)](https://greensock.com/gsap/)

NolRugi adalah solusi digital inovatif yang dirancang khusus untuk memecahkan dua masalah terbesar **UMKM Pangan Olahan dan Produk Kemasan di Indonesia**:
1. **Pemborosan Pangan & Kerugian Stok (Food Waste & Expired Inventory Loss)** akibat pengelolaan manual dan keterlambatan rotasi barang di rak/etalase.
2. **Kekeliruan Penentuan HPP & Margin Terkikis (COGS Miscalculation)** yang menyebabkan pelaku usaha merugi tanpa sadar saat memberikan diskon asal-asalan.

---

## 🌟 Fitur Unggulan (Core Features)

### 1. Dynamic Dashboard (Kesehatan Margin & Risiko Stok)
- **Metrik Utama Real-Time:**
  - *Estimasi Kerugian Tertahan (H-14):* Total nilai Rupiah modal dari batch yang berisiko expired dalam 14 hari ke depan.
  - *Total Modal Terikat di Stok:* Akumulasi kas HPP yang tersimpan pada stok siap jual.
  - *Gross Margin Berjalan (%) & Proyeksi Net Profit:* Menghitung persentase laba kotor aktual.
  - *Skor Kesehatan Inventori FEFO (0-100%):* Indikator rotasi stok berdasarkan kepatuhan First-Expired First-Out.
- **Radar Risiko Kedaluwarsa & Dwell-Time:**
  - Tag filter: `Kritis (H-3)`, `Waspada (H-7)`, `Aman`, serta `Dwell-Time >21 Hari` (untuk kemasan polos yang lama mengendap di etalase).
- **AI Action Triggers:**
  - **Terapkan Diskon Bertahap (Clearance Markdown):** Menghitung harga titik impas (BEP) terendah agar modal HPP kembali tanpa risiko rugi uang tunai.
  - **Buat Paket Bundling:** Memasangkan produk kritis/slow-moving dengan produk best-seller ber-margin tinggi.
- **Grafik Tren Penjualan & Penyelamatan Margin:**
  - Visualisasi interaktif menggunakan Recharts membandingkan Omzet Bulanan vs Nilai Produk yang Berhasil Diselamatkan.

### 2. Batch & Expiry Tracker (Sistem FEFO & Dwell-Time)
- **Tabel Inventori Lengkap:**
  - Menampilkan Nama Produk, Kategori, Kode Batch, Tanggal Masuk, Tanggal Kedaluwarsa, Sisa Stok, HPP Satuan, Harga Jual, Status FEFO, dan tombol manipulasi kuantitas kilat (+/- 1 unit).
- **Dual-Input Simulation:**
  - *Input Manual Batch:* Form lengkap dengan auto-generate kode batch berdasarkan kategori.
  - *Simulasi AI Scan Tanggal (OCR Engine):* Simulasi pemindaian kamera AI dengan animasi laser scanner GSAP, deteksi teks stempel kedaluwarsa kemasan, tingkat akurasi (confidence score 96-99%), dan auto-fill langsung ke dalam inventori.
- **Filter Dwell-Time:** Menyaring produk kemasan polos tanpa tanggal cetak yang tersimpan lebih dari 21 hari di rak agar kualitas rasa/kerenyahan tetap terjaga.
- **Ekspor Data:** Fitur 1-klik unduh seluruh rekaman stok ke format CSV siap olah.

### 3. Smart HPP & Clearance Markdown Calculator
- **Kalkulator HPP Akurat:**
  - Input: Biaya Bahan Baku Pokok, Biaya Kemasan/Label, Alokasi Tenaga Kerja per Batch, Overhead (Listrik/Gas/Air), Total Jumlah Produk per Batch, dan Biaya Tetap Operasional Bulanan.
  - Output Live: HPP per Unit, Rekomendasi Harga Jual Normal (dengan slider target margin 20% - 50%), serta Titik Impas (BEP Unit & BEP Rupiah).
- **Emergency Clearance Optimizer:**
  - Memilih batch tertentu dari inventori untuk membedah batas harga diskon terendah agar modal kerja tidak hilang.

### 4. Laporan SAK-EMKM Sederhana & Skor Kesiapan KUR
- **Laporan Laba Rugi SAK-EMKM:**
  - Pendapatan Penjualan, Beban Pokok Penjualan (HPP), Penyelamatan Margin NolRugi, Kerugian Limbah Basi, Laba Kotor, Beban Operasional, Laba Sebelum Pajak (EBIT), PPh Final UMKM 0.5% (PP No. 55/2022), dan Laba Bersih Setelah Pajak (Net Profit).
  - Modal Cetak / PDF Preview resmi lengkap dengan kop surat UMKM dan tanda tangan pimpinan.
- **Credit Readiness Index (Skor Kesiapan KUR):**
  - Skor finansial 84/100 ("Sangat Siap Pengajuan KUR BRI / BNI / Mandiri / BSI").
  - Checklist Kepatuhan UU PDP (No. 27/2022) dengan enkripsi sisi klien dan toggle consent sharing perbankan.
  - Export berkas verifikasi KUR dalam format JSON terenkripsi.

### 5. Efek Animasi GSAP & UI/UX Halus
- Smooth staggered scroll reveal menggunakan GSAP `fromTo` & `animateFadeInUp`.
- Animated number ticker (`AnimatedCounter`) untuk transisi angka Rupiah dan skor secara bertahap.
- Animasi laser pemindaian OCR kamera visual.
- Perayaan konfeti (canvas-confetti) saat berhasil mengaktifkan skema penyelamatan harga.
- Sistem notifikasi Toast mengambang untuk memastikan setiap tombol memberikan feedback visual tanpa cela (zero broken buttons).

---

## 🚀 Panduan Menjalankan Proyek (Getting Started)

```bash
# 1. Jalankan development server
npm run dev

# 2. Buka di browser
http://localhost:5173/

# 3. Build untuk produksi
npm run build
```

---
Dibuat dengan dedikasi untuk pemberdayaan UMKM Pangan Indonesia. Sesuai dengan Blueprint **Luminux 2.0 Business Model Canvas (2026)**.
