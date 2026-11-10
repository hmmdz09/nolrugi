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
      label: 'Margin Laba Aman',
      badgeColor: 'bg-indigo-50 text-[#5b58eb] border-indigo-100',
      bullets: [
        'Diskon 15% dari harga normal',
        `Laba per pcs: +${formatRupiah(Math.max(0, Math.round(normalPrice * 0.85 / 500) * 500 - hpp))}`,
        'Menjaga perputaran stok tetap positif',
      ],
    },
    {
      tier: 2,
      title: 'Tahap 2: Penyelamat Kas (H-4 s/d H-2)',
      discountPct: 30,
      price: Math.max(hpp, Math.round(normalPrice * 0.70 / 500) * 500),
      label: 'Prioritas Likuidasi',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-100',
      bullets: [
        'Diskon 30% dari harga normal',
        `Laba per pcs: +${formatRupiah(Math.max(0, Math.round(normalPrice * 0.70 / 500) * 500 - hpp))}`,
        'Percepat arus kas sebelum mendekati H-1',
      ],
    },
    {
      tier: 3,
      title: 'Tahap 3: Emergency BEP Clearance (H-1 / H-0)',
      discountPct: Math.round(((normalPrice - hpp) / normalPrice) * 100),
      price: hpp,
      label: 'Harga Modal (0% Rugi)',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-100',
      bullets: [
        `Diskon maksimal hingga harga modal (${formatRupiah(hpp)})`,
        'Pemulihan 100% modal kerja tanpa rugi kas',
        'Mencegah kerugian barang basi/musnah',
      ],
    },
  ];

  const currentSelection = tiers.find((t) => t.tier === selectedTier) || tiers[0];
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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#5b58eb] border border-indigo-100 whitespace-nowrap">
                  BEP Optimizer
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-medium">
                <span>• Optimasi diskon</span>
                <span>• Batas HPP pokok</span>
                <span>• 0% rugi kas</span>
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
          {/* Target Batch Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#5b58eb] whitespace-nowrap">
                  {batch.batchCode} • {batch.category}
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {batch.productName}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-medium">
                  <span>Stok: <strong>{batch.stockQty} {batch.unit}</strong></span>
                  <span>•</span>
                  <span>Sisa: <strong>{daysLeft <= 0 ? 'Hari Ini' : `${daysLeft} Hari Lagi`}</strong></span>
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

          {/* Principle Callout - Point-by-point grid */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <div className="flex items-center gap-2 pb-1.5 border-b border-indigo-100/70 text-xs font-bold text-[#5b58eb]">
              <ShieldCheck className="w-4 h-4 text-[#5b58eb]" />
              <span>Batas Aman Likuidasi Modal (Prinsip NolRugi):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Harga Lantai (HPP):</span>
                <strong className="text-slate-900 font-black">{formatRupiah(hpp)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Modal Terlindungi:</span>
                <strong className="text-emerald-600 font-black">{formatRupiah(totalPotentialLossWithoutAction)}</strong>
              </div>
            </div>
          </div>

          {/* Skenario Diskon List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800">
              Pilih Skenario Diskon Bertahap:
            </div>

            {tiers.map((tier) => {
              const isSelected = selectedTier === tier.tier;
              return (
                <div
                  key={tier.tier}
                  onClick={() => setSelectedTier(tier.tier)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#5b58eb] bg-[#f8f9fe] ring-1 ring-[#5b58eb]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#5b58eb] bg-[#5b58eb]'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">
                        {tier.title}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${tier.badgeColor}`}
                    >
                      {tier.label}
                    </span>
                  </div>

                  {/* Bullet points instead of long paragraphs */}
                  <div className="mt-2 pl-6 space-y-0.5 text-[11px] text-slate-600 font-medium">
                    {tier.bullets.map((b, bi) => (
                      <div key={bi} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2.5 pl-6 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">Harga Rekomendasi:</span>
                    <div className="flex items-center gap-2">
                      <span className="line-through text-slate-400 text-[10px]">
                        {formatRupiah(normalPrice)}
                      </span>
                      <span className="font-black text-[#5b58eb] text-sm">
                        {formatRupiah(tier.price)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5b58eb] hover:bg-[#4a47d4] shadow-md shadow-[#5b58eb]/25 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Terapkan Harga Diskon ({formatRupiah(currentSelection.price)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
