import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  PackagePlus, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Percent, 
  ArrowRight
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import confetti from 'canvas-confetti';

interface BundleModalProps {
  expiringBatch: InventoryBatch | null;
  allBatches: InventoryBatch[];
  isOpen: boolean;
  onClose: () => void;
  onCreateBundle: (bundleName: string, partnerBatchName: string, bundlePrice: number, marginPct: number) => void;
}

export const BundleModal: React.FC<BundleModalProps> = ({
  expiringBatch,
  allBatches,
  isOpen,
  onClose,
  onCreateBundle,
}) => {
  if (!isOpen || !expiringBatch) return null;

  // Find suitable partner items (ideally high stock, high margin, safe expiry)
  const candidatePartners = allBatches.filter(
    (b) => b.id !== expiringBatch.id && b.stockQty > 5
  );

  const [partnerId, setPartnerId] = useState<string>(
    candidatePartners[0]?.id || ''
  );
  const [bundleDiscountPct, setBundleDiscountPct] = useState<number>(18);

  const partnerBatch = candidatePartners.find((b) => b.id === partnerId) || candidatePartners[0];

  if (!partnerBatch) return null;

  const combinedHpp = expiringBatch.unitHpp + partnerBatch.unitHpp;
  const originalTotalPrice = expiringBatch.sellingPrice + partnerBatch.sellingPrice;
  const calculatedBundlePrice = Math.max(
    combinedHpp * 1.15, // Ensure at least 15% margin
    Math.round((originalTotalPrice * (1 - bundleDiscountPct / 100)) / 1000) * 1000
  );
  const bundleProfit = calculatedBundlePrice - combinedHpp;
  const bundleMarginPct = (bundleProfit / calculatedBundlePrice) * 100;

  const bundleTitle = `Paket Hemat UMKM: ${expiringBatch.productName.split(' ')[0]} + ${partnerBatch.productName.split(' ')[0]}`;

  const handleCreate = () => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0d9488', '#10b981', '#6366f1'],
    });
    onCreateBundle(bundleTitle, partnerBatch.productName, calculatedBundlePrice, bundleMarginPct);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/30">
              <PackagePlus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  AI Bundling Creator: Penyelamat Stok Lambat
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                  Cross-Selling
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kombinasikan produk kritis/mengendap dengan produk favorit ber-margin tinggi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Partner Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Pilih Produk Pasangan (Bestseller High-Margin):
            </label>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {candidatePartners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} ({p.batchCode}) • Stok {p.stockQty} {p.unit} • Harga {formatRupiah(p.sellingPrice)}
                </option>
              ))}
            </select>
          </div>

          {/* Side-by-side Items in Bundle */}
          <div className="grid grid-cols-2 gap-3">
            {/* Expiring Item */}
            <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Item 1: Produk Kritis / Lambat
              </span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                {expiringBatch.productName}
              </h5>
              <div className="mt-2 text-[11px] space-y-0.5 text-slate-600 dark:text-slate-300">
                <div>HPP: {formatRupiah(expiringBatch.unitHpp)}</div>
                <div className="line-through text-slate-400">Normal: {formatRupiah(expiringBatch.sellingPrice)}</div>
              </div>
            </div>

            {/* Partner Item */}
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Item 2: Pasangan Populer
              </span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                {partnerBatch.productName}
              </h5>
              <div className="mt-2 text-[11px] space-y-0.5 text-slate-600 dark:text-slate-300">
                <div>HPP: {formatRupiah(partnerBatch.unitHpp)}</div>
                <div className="line-through text-slate-400">Normal: {formatRupiah(partnerBatch.sellingPrice)}</div>
              </div>
            </div>
          </div>

          {/* Discount Slider */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Diskon Promo Bundling:
              </span>
              <span className="px-2 py-0.5 rounded-full font-black text-xs bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                {bundleDiscountPct}% OFF
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={35}
              step={1}
              value={bundleDiscountPct}
              onChange={(e) => setBundleDiscountPct(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>10% (Konservatif)</span>
              <span>18% (Rekomendasi AI)</span>
              <span>35% (Cuci Gudang Kilat)</span>
            </div>
          </div>

          {/* Pricing & Margin Synthesis */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-teal-950 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs text-slate-300">Total Harga Normal 2 Barang:</span>
              <span className="text-xs line-through text-slate-400">
                {formatRupiah(originalTotalPrice)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs text-slate-300">Total HPP Gabungan:</span>
              <span className="text-xs font-semibold text-slate-200">
                {formatRupiah(combinedHpp)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[10px] text-teal-300 uppercase font-bold tracking-wider">
                  Harga Bundling Paket Baru:
                </div>
                <div className="text-xl font-black text-amber-300">
                  {formatRupiah(calculatedBundlePrice)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-teal-300 uppercase font-bold tracking-wider">
                  Margin Laba Bersih:
                </div>
                <div className="text-sm font-extrabold text-emerald-400">
                  +{formatRupiah(bundleProfit)} ({bundleMarginPct.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="flex-1 max-w-xs flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-md shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Aktifkan Paket Promo Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
};
