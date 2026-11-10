import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingDown, 
  Coins, 
  ArrowRight
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah, getDaysRemaining } from '../../utils/formatters';
import confetti from 'canvas-confetti';

interface DiscountModalProps {
  batch: InventoryBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyDiscount: (batchId: string, newDiscountPrice: number, strategy: string) => void;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  batch,
  isOpen,
  onClose,
  onApplyDiscount,
}) => {
  if (!isOpen || !batch) return null;

  const daysLeft = getDaysRemaining(batch.expiryDate);
  const normalPrice = batch.sellingPrice;
  const hpp = batch.unitHpp;
  const currentMargin = ((normalPrice - hpp) / normalPrice) * 100;

  // Clearance calculation:
  // Floor price is pure HPP (break-even point)
  // Recommended discount based on days remaining:
  // H <= 2: 40% discount or at HPP
  // H <= 5: 25% discount
  // H <= 7: 15% discount
  const defaultTier = daysLeft <= 2 ? 3 : daysLeft <= 5 ? 2 : 1;
  const [selectedTier, setSelectedTier] = useState<number>(defaultTier);

  const tiers = [
    {
      tier: 1,
      name: 'Tahap 1: Flash Diskon Waspada (H-7 s/d H-5)',
      discountPct: 15,
      price: Math.max(hpp, Math.round(normalPrice * 0.85 / 500) * 500),
      label: 'Margin Tipis Aman',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      description: 'Menarik pembeli cepat tanpa mengorbankan seluruh laba usaha.',
    },
    {
      tier: 2,
      name: 'Tahap 2: Diskon Agresif Penyelamat Modal (H-4 s/d H-2)',
      discountPct: 30,
      price: Math.max(hpp, Math.round(normalPrice * 0.70 / 500) * 500),
      label: 'Prioritas Likuidasi Kas',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      description: 'Mencegah pembusukan total, uang kas segera kembali ke rekening.',
    },
    {
      tier: 3,
      name: 'Tahap 3: Emergency Break-Even Clearance (H-1 / H-0)',
      discountPct: Math.round(((normalPrice - hpp) / normalPrice) * 100),
      price: hpp,
      label: 'Harga Modal Murni (0% Rugi Kas)',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
      description: 'Batas diskon paling rendah! Modal HPP 100% terselamatkan tanpa kerugian uang riil.',
    },
  ];

  const currentSelection = tiers.find((t) => t.tier === selectedTier) || tiers[0];
  const unitProfitAtDiscount = currentSelection.price - hpp;
  const totalRecovery = currentSelection.price * batch.stockQty;
  const totalPotentialLossWithoutAction = hpp * batch.stockQty;

  const handleApply = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#14b8a6', '#f59e0b'],
    });
    onApplyDiscount(
      batch.id,
      currentSelection.price,
      `${currentSelection.name} (${formatRupiah(currentSelection.price)})`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  AI Markdown Rescue: Diskon Bertahap
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  BEP Optimizer
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hitung harga diskon teraman agar modal HPP kembali tanpa risiko rugi kas.
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

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Batch Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Batch: {batch.batchCode} • {batch.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {batch.productName}
                </h4>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <span>Stok Sisa: <strong>{batch.stockQty} {batch.unit}</strong></span>
                  <span>•</span>
                  <span>Masa Simpan: <strong>{daysLeft <= 0 ? 'Hari Ini' : `${daysLeft} Hari Lagi`}</strong></span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-slate-400">HPP Pokok (Modal):</div>
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {formatRupiah(hpp)}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  Harga Normal: {formatRupiah(normalPrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Core Principle Callout */}
          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
              <strong>Prinsip NolRugi:</strong> Harga terendah dibatasi pada <strong>{formatRupiah(hpp)}</strong> (Harga Pokok Penjualan). Menjual di atas harga ini tetap menghasilkan kas positif dan menyelamatkan{' '}
              <strong>{formatRupiah(totalPotentialLossWithoutAction)}</strong> modal yang terancam musnah.
            </div>
          </div>

          {/* Strategy Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Pilih Skenario Diskon AI:</span>
              <span className="text-[11px] font-normal text-slate-500">
                Otomatis disesuaikan dengan kedaluwarsa H-{daysLeft}
              </span>
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {tiers.map((t) => {
                const isSelected = selectedTier === t.tier;
                return (
                  <button
                    key={t.tier}
                    type="button"
                    onClick={() => setSelectedTier(t.tier)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all relative flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-400'
                          }`}
                        >
                          {isSelected && '✓'}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {t.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.badgeColor}`}>
                        {t.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pl-6 text-xs">
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {t.description}
                      </p>
                      <div className="text-right shrink-0">
                        <span className="line-through text-slate-400 text-[10px] mr-1.5">
                          {formatRupiah(normalPrice)}
                        </span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(t.price)}
                        </span>
                        <span className="text-[10px] ml-1 font-bold text-rose-500">
                          (-{t.discountPct}%)
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Financial Impact Breakdown Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-teal-950 text-white shadow-lg">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5 mb-2.5">
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              Proyeksi Pemulihan Kas (Cash Rescue)
            </h5>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="text-[10px] text-slate-400">Total Kas Pulih</div>
                <div className="text-xs sm:text-sm font-extrabold text-emerald-400 mt-0.5">
                  {formatRupiah(totalRecovery)}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="text-[10px] text-slate-400">Laba Bersih/Pcs</div>
                <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                  {unitProfitAtDiscount >= 0 ? `+${formatRupiah(unitProfitAtDiscount)}` : 'Impas (Rp 0)'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="text-[10px] text-slate-400">Kerugian Dicegah</div>
                <div className="text-xs sm:text-sm font-black text-amber-400 mt-0.5">
                  {formatRupiah(totalPotentialLossWithoutAction)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
            onClick={handleApply}
            className="flex-1 max-w-xs flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Terapkan Harga Diskon ({formatRupiah(currentSelection.price)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

