import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
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

  const defaultTier = daysLeft <= 2 ? 3 : daysLeft <= 5 ? 2 : 1;
  const [selectedTier, setSelectedTier] = useState<number>(defaultTier);

  const tiers = [
    {
      tier: 1,
      title: 'Tahap 1: Diskon Waspada (H-7 s/d H-5)',
      discountPct: 15,
      price: Math.max(hpp, Math.round(normalPrice * 0.85 / 500) * 500),
      label: 'Margin Tipis',
      badgeColor: 'bg-indigo-50 text-[#5b58eb] border-indigo-100',
      description: 'Menarik pembeli cepat tanpa mengorbankan seluruh laba usaha.',
    },
    {
      tier: 2,
      title: 'Tahap 2: Diskon Penyelamat Modal (H-4 s/d H-2)',
      discountPct: 30,
      price: Math.max(hpp, Math.round(normalPrice * 0.70 / 500) * 500),
      label: 'Prioritas Kas',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-100',
      description: 'Mencegah pembusukan total, uang kas modal segera kembali.',
    },
    {
      tier: 3,
      title: 'Tahap 3: Emergency BEP Clearance (H-1 / H-0)',
      discountPct: Math.round(((normalPrice - hpp) / normalPrice) * 100),
      price: hpp,
      label: 'Harga Modal (0% Rugi)',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-100',
      description: 'Batas diskon terendah! Modal HPP 100% pulih tanpa rugi kas riil.',
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
      colors: ['#5b58eb', '#f43f5e', '#10b981'],
    });
    onApplyDiscount(
      batch.id,
      currentSelection.price,
      `${currentSelection.title} (${formatRupiah(currentSelection.price)})`
    );
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
              <Sparkles className="w-5 h-5 text-[#5b58eb]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  AI Markdown Rescue: Diskon Bertahap
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#5b58eb] border border-indigo-100">
                  BEP Optimizer
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Hitung harga diskon teraman agar modal HPP kembali tanpa risiko rugi kas.
              </p>
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
          {/* Target Batch Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#5b58eb]">
                  {batch.batchCode} • {batch.category}
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {batch.productName}
                </h4>
                <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-600 font-medium">
                  <span>Stok: <strong>{batch.stockQty} {batch.unit}</strong></span>
                  <span>•</span>
                  <span>Simpan: <strong>{daysLeft <= 0 ? 'Hari Ini' : `${daysLeft} Hari Lagi`}</strong></span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Modal HPP:</div>
                <div className="text-sm font-black text-slate-900">
                  {formatRupiah(hpp)}
                </div>
                <div className="text-[11px] text-slate-500 font-medium line-through mt-0.5">
                  {formatRupiah(normalPrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Principle Callout */}
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#5b58eb] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed font-medium">
              <strong className="text-slate-900">Prinsip NolRugi:</strong> Harga terendah dibatasi pada <strong>{formatRupiah(hpp)}</strong> (HPP Modal). Menjual di atas harga ini menyelamatkan kas modal <strong>{formatRupiah(totalPotentialLossWithoutAction)}</strong> dari risiko basi.
            </div>
          </div>

          {/* Skenario Diskon List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">
              Pilih Skenario Diskon AI:
            </label>

            <div className="space-y-2">
              {tiers.map((t) => {
                const isSelected = selectedTier === t.tier;
                return (
                  <button
                    key={t.tier}
                    type="button"
                    onClick={() => setSelectedTier(t.tier)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'border-[#5b58eb] bg-[#f8f9fe] shadow-xs ring-1 ring-[#5b58eb]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                            isSelected
                              ? 'border-[#5b58eb] bg-[#5b58eb] text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                        <span className="font-extrabold text-xs text-slate-900">
                          {t.title}
                        </span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${t.badgeColor}`}>
                        {t.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pl-6 text-xs mt-1">
                      <p className="text-slate-500 text-[11px] font-medium pr-2">
                        {t.description}
                      </p>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-[#5b58eb]">
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

          {/* Recovery Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Kas Modal Terselamatkan:</div>
              <div className="text-base font-black text-white mt-0.5">
                {formatRupiah(totalRecovery)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Laba per Unit:</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                {unitProfitAtDiscount >= 0 ? `+${formatRupiah(unitProfitAtDiscount)}` : 'Impas (Rp 0)'}
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
            onClick={handleApply}
            className="flex-1 max-w-xs flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5b58eb] hover:bg-[#4a47d4] shadow-md shadow-[#5b58eb]/25 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Terapkan Harga ({formatRupiah(currentSelection.price)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
