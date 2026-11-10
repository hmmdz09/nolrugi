import React, { useState } from 'react';
import {
  X,
  PackagePlus,
  CheckCircle2,
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
    combinedHpp * 1.15,
    Math.round((originalTotalPrice * (1 - bundleDiscountPct / 100)) / 1000) * 1000
  );
  const bundleProfit = calculatedBundlePrice - combinedHpp;
  const bundleMarginPct = (bundleProfit / calculatedBundlePrice) * 100;

  const bundleTitle = `Paket Hemat: ${expiringBatch.productName.split(' ')[0]} + ${partnerBatch.productName.split(' ')[0]}`;

  const handleCreate = () => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#5b58eb', '#ec4899', '#38bdf8'],
    });
    onCreateBundle(bundleTitle, partnerBatch.productName, calculatedBundlePrice, bundleMarginPct);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-[#5b58eb]">
              <PackagePlus className="w-5 h-5 text-[#5b58eb]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  AI Bundling: Penyelamat Stok Lambat
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#5b58eb] border border-indigo-100 whitespace-nowrap">
                  Cross-Selling
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-medium">
                <span>• Cross-selling stok lambat</span>
                <span>• Produk bestseller</span>
                <span>• Margin laba positif</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Partner Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Pilih Pasangan Produk (Bestseller High-Margin):
            </label>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-[#5b58eb] outline-none"
            >
              {candidatePartners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} ({p.batchCode}) • Stok {p.stockQty} {p.unit} • Normal {formatRupiah(p.sellingPrice)}
                </option>
              ))}
            </select>
          </div>

          {/* 2 Items in Bundle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                Item 1: Produk Kritis
              </span>
              <h5 className="text-xs font-extrabold text-slate-900 mt-1 truncate">
                {expiringBatch.productName}
              </h5>
              <div className="mt-2 text-[11px] space-y-0.5 text-slate-600 font-medium">
                <div>HPP: {formatRupiah(expiringBatch.unitHpp)}</div>
                <div className="line-through text-slate-400">Normal: {formatRupiah(expiringBatch.sellingPrice)}</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl border border-indigo-100 bg-indigo-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5b58eb] block">
                Item 2: Pasangan Populer
              </span>
              <h5 className="text-xs font-extrabold text-slate-900 mt-1 truncate">
                {partnerBatch.productName}
              </h5>
              <div className="mt-2 text-[11px] space-y-0.5 text-slate-600 font-medium">
                <div>HPP: {formatRupiah(partnerBatch.unitHpp)}</div>
                <div className="line-through text-slate-400">Normal: {formatRupiah(partnerBatch.sellingPrice)}</div>
              </div>
            </div>
          </div>

          {/* Slider */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900">
                Diskon Promo Bundling:
              </span>
              <span className="px-2.5 py-0.5 rounded-full font-black text-xs bg-indigo-50 text-[#5b58eb] border border-indigo-100">
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
              className="w-full accent-[#5b58eb] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>10% (Konservatif)</span>
              <span>18% (Rekomendasi AI)</span>
              <span>35% (Cuci Gudang)</span>
            </div>
          </div>

          {/* Clean Pricing & Margin Result */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#f8f9fe] to-[#eef0f8] border border-indigo-100 space-y-2.5">
            <div className="flex items-center justify-between border-b border-indigo-100/60 pb-2 text-xs">
              <span className="text-slate-500 font-medium">Total Harga Normal 2 Barang:</span>
              <span className="line-through text-slate-400 font-medium">
                {formatRupiah(originalTotalPrice)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-indigo-100/60 pb-2 text-xs">
              <span className="text-slate-500 font-medium">Total HPP Gabungan:</span>
              <span className="font-bold text-slate-800">
                {formatRupiah(combinedHpp)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[10px] text-[#5b58eb] uppercase font-extrabold tracking-wider">
                  Harga Paket Bundling:
                </div>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {formatRupiah(calculatedBundlePrice)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-emerald-600 uppercase font-extrabold tracking-wider">
                  Margin Laba Bersih:
                </div>
                <div className="text-sm font-black text-emerald-600 mt-0.5">
                  +{formatRupiah(bundleProfit)} ({bundleMarginPct.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="flex-1 max-w-xs flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5b58eb] hover:bg-[#4a47d4] shadow-md shadow-[#5b58eb]/25 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Aktifkan Paket Promo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
