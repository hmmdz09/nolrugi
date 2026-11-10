import { InventoryBatch } from '../types';

/**
 * Generates initial realistic Indonesian F&B Packaged MSME data.
 * Dates are calculated dynamically relative to today's date so the demo
 * always displays active realistic critical, warning, and dwell-time alerts.
 */
export const getInitialBatches = (): InventoryBatch[] => {
  const today = new Date();
  
  const formatDateOffset = (daysOffset: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'batch-001',
      productName: 'Roti Sobek Cokelat Keju Organik',
      category: 'Roti & Kue',
      batchCode: 'RS-2026-C2',
      entryDate: formatDateOffset(-5),
      expiryDate: formatDateOffset(2), // H-2 (Kritis)
      stockQty: 24,
      initialQty: 40,
      unit: 'pcs',
      unitHpp: 8500,
      sellingPrice: 15000,
      packagingType: 'kemasan-berlabel',
      location: 'Rak Display Roti A1',
      notes: 'Roti basah tanpa pengawet sintetik. Segera rescue sebelum berjamur.',
      isRescued: false,
    },
    {
      id: 'batch-002',
      productName: 'Frozen Risol Mayo Pedas (Isi 10)',
      category: 'Frozen Food',
      batchCode: 'RM-2026-D4',
      entryDate: formatDateOffset(-25),
      expiryDate: formatDateOffset(3), // H-3 (Kritis)
      stockQty: 35,
      initialQty: 50,
      unit: 'pack',
      unitHpp: 18000,
      sellingPrice: 32000,
      packagingType: 'kemasan-berlabel',
      location: 'Freezer Showcase 1',
      notes: 'Wajib suhu -18C. Sisa 3 hari masa simpan optimal.',
      isRescued: false,
    },
    {
      id: 'batch-003',
      productName: 'Sambal Roa Khas Manado Jar 150ml',
      category: 'Sambal & Bumbu',
      batchCode: 'SR-2026-B3',
      entryDate: formatDateOffset(-45),
      expiryDate: formatDateOffset(6), // H-6 (Waspada)
      stockQty: 42,
      initialQty: 80,
      unit: 'jar',
      unitHpp: 22000,
      sellingPrice: 38000,
      packagingType: 'kemasan-berlabel',
      location: 'Rak Bumbu Kaca Tengah',
      notes: 'Segel aluminium foil aman. Cocok dibundling dengan Keripik.',
      isRescued: false,
    },
    {
      id: 'batch-004',
      productName: 'Kopi Susu Gula Aren Botol 250ml',
      category: 'Minuman',
      batchCode: 'KS-2026-E1',
      entryDate: formatDateOffset(-4),
      expiryDate: formatDateOffset(5), // H-5 (Waspada)
      stockQty: 30,
      initialQty: 60,
      unit: 'botol',
      unitHpp: 7500,
      sellingPrice: 16000,
      packagingType: 'kemasan-berlabel',
      location: 'Chiller Depan Kasir',
      notes: 'Mengandung susu pasteurisasi segar.',
      isRescued: false,
    },
    {
      id: 'batch-005',
      productName: 'Keripik Pisang Lumer Cokelat 200g',
      category: 'Keripik & Camilan',
      batchCode: 'KP-2026-A1',
      entryDate: formatDateOffset(-27), // Dwell time 27 hari (>21h alert!)
      expiryDate: formatDateOffset(40),
      stockQty: 58,
      initialQty: 75,
      unit: 'pouch',
      unitHpp: 10500,
      sellingPrice: 20000,
      packagingType: 'kemasan-polos',
      location: 'Rak Gondola Depan B2',
      notes: 'Kemasan polos standing pouch transparan. Berisiko tengik/alot jika mengendap lama.',
      isRescued: false,
    },
    {
      id: 'batch-006',
      productName: 'Bumbu Rawon Spesial Pasta 200g',
      category: 'Sambal & Bumbu',
      batchCode: 'BR-2026-H5',
      entryDate: formatDateOffset(-24), // Dwell time 24 hari (>21h alert!)
      expiryDate: formatDateOffset(50),
      stockQty: 20,
      initialQty: 30,
      unit: 'jar',
      unitHpp: 14000,
      sellingPrice: 25000,
      packagingType: 'kemasan-polos',
      location: 'Rak Gudang Bahan Siap Jual',
      notes: 'Bumbu sangrai tradisional kemasan pouch polos.',
      isRescued: false,
    },
    {
      id: 'batch-007',
      productName: 'Keripik Singkong Balado Daun Jeruk 250g',
      category: 'Keripik & Camilan',
      batchCode: 'SB-2026-F2',
      entryDate: formatDateOffset(-10),
      expiryDate: formatDateOffset(65), // Aman
      stockQty: 85,
      initialQty: 100,
      unit: 'pouch',
      unitHpp: 9000,
      sellingPrice: 18000,
      packagingType: 'kemasan-berlabel',
      location: 'Rak Camilan Utama',
      notes: 'Perputaran stok tinggi, fast-moving favorit pelanggan.',
      isRescued: false,
    },
    {
      id: 'batch-008',
      productName: 'Nastar Nanas Wisman Toples 350g',
      category: 'Roti & Kue',
      batchCode: 'NN-2026-G1',
      entryDate: formatDateOffset(-12),
      expiryDate: formatDateOffset(80), // Aman
      stockQty: 28,
      initialQty: 35,
      unit: 'jar',
      unitHpp: 38000,
      sellingPrice: 65000,
      packagingType: 'kemasan-berlabel',
      location: 'Etalase Kaca Depan',
      notes: 'Kue kering premium mentega Wijsman, segel toples kedap udara.',
      isRescued: false,
    },
  ];
};

export const sampleHistoricalRevenue = [
  { month: 'Jun 2026', omzet: 28500000, rescuedValue: 3400000, wasteLoss: 450000 },
  { month: 'Jul 2026', omzet: 32400000, rescuedValue: 4100000, wasteLoss: 320000 },
  { month: 'Agu 2026', omzet: 37800000, rescuedValue: 5600000, wasteLoss: 210000 },
  { month: 'Sep 2026', omzet: 35200000, rescuedValue: 4800000, wasteLoss: 280000 },
  { month: 'Okt 2026', omzet: 42100000, rescuedValue: 6900000, wasteLoss: 180000 },
  { month: 'Nov 2026 (Berjalan)', omzet: 46800000, rescuedValue: 8250000, wasteLoss: 110000 },
];

