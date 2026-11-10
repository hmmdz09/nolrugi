export type ProductCategory = 'Roti & Kue' | 'Keripik & Camilan' | 'Frozen Food' | 'Minuman' | 'Sambal & Bumbu';

export type StockStatus = 'kritis' | 'waspada' | 'aman' | 'dwell-alert';

export interface InventoryBatch {
  id: string;
  productName: string;
  category: ProductCategory;
  batchCode: string;
  entryDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  stockQty: number; // in units (pcs/jar/pack)
  initialQty: number;
  unit: string; // pcs, jar, pack, pouch
  unitHpp: number; // Raw cost per unit in IDR
  sellingPrice: number; // Normal retail price in IDR
  discountPrice?: number; // Clearance price if applied
  packagingType: 'kemasan-berlabel' | 'kemasan-polos'; // Polos has dwell-time risk
  location: string; // Rak A, Freezer 2, etc.
  notes?: string;
  isRescued?: boolean;
}

export interface HppInputs {
  productName: string;
  rawMaterialCost: number; // Bahan baku pokok
  packagingCost: number; // Kemasan & label
  laborCost: number; // Alokasi tenaga kerja per batch
  overheadCost: number; // Listrik, gas, sewa, air
  batchOutputUnits: number; // Total produk dihasilkan
  monthlyFixedCost: number; // Biaya tetap operasional bulanan untuk BEP
  targetMarginPct: number; // Target margin 20% - 50%
}

export interface HppResults {
  totalBatchCost: number;
  hppPerUnit: number;
  recommendedPrice: number;
  unitProfit: number;
  bepUnits: number;
  bepRupiah: number;
  variableCostPerUnit: number;
}

export interface ClearanceRecommendation {
  batchId: string;
  productName: string;
  daysRemaining: number;
  currentPrice: number;
  hppPrice: number; // Absolute floor break-even price
  recommendedDiscountPct: number;
  recommendedClearancePrice: number;
  potentialLossAvoided: number;
  strategyDescription: string;
  urgencyLevel: 'tinggi' | 'sedang' | 'rendah';
}

export interface BundleIdea {
  id: string;
  bundleName: string;
  expiringItem: InventoryBatch;
  expiringQty: number;
  partnerItem: InventoryBatch;
  partnerQty: number;
  combinedHpp: number;
  originalPrice: number;
  bundlePrice: number;
  bundleDiscountPct: number;
  marginPct: number;
}

export interface FinancialMetricSAKEMKM {
  period: string;
  grossRevenue: number;
  cogsSold: number; // HPP Penjualan
  rescuedMarginGain: number; // Nilai produk terselamatkan oleh sistem NolRugi
  wastedInventoryLoss: number; // Kerugian produk expired
  grossProfit: number;
  operationalExpenses: number;
  ebit: number; // Laba operasional sebelum pajak
  finalTaxPP55: number; // PPh Final 0.5% PP No. 55/2022
  netProfit: number;
}

export interface CreditReadinessComponent {
  title: string;
  score: number; // 0-100
  weight: number;
  description: string;
  status: 'optimal' | 'cukup' | 'perlu-ditingkatkan';
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}

