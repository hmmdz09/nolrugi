import React, { useState } from 'react';
import { Tag, ShieldCheck, Check } from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah, getDaysRemaining } from '../../utils/formatters';
import { Modal, cn } from '../common/ui';
import confetti from 'canvas-confetti';

interface DiscountModalProps {
  batch: InventoryBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyDiscount: (batchId: string, newDiscountPrice: number, strategy: string) => void;
}

const round500 = (v: number) => Math.round(v / 500) * 500;

export const DiscountModal: React.FC<DiscountModalProps> = ({ batch, isOpen, onClose, onApplyDiscount }) => {
  const daysLeft = batch ? getDaysRemaining(batch.expiryDate) : 99;
  const [selectedTier, setSelectedTier] = useState<number>(daysLeft <= 2 ? 3 : daysLeft <= 5 ? 2 : 1);

  if (!isOpen || !batch) return null;

  const normal = batch.sellingPrice;
  const hpp = batch.unitHpp;

  const tiers = [
    {
      tier: 1,
      name: 'Tahap 1 · Waspada',
      window: 'H-7 s/d H-5',
      price: Math.max(hpp, round500(normal * 0.85)),
      note: 'Jaga perputaran, margin tetap sehat',
      tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      tier: 2,
      name: 'Tahap 2 · Penyelamat kas',
      window: 'H-4 s/d H-2',
      price: Math.max(hpp, round500(normal * 0.7)),
      note: 'Percepat arus kas sebelum H-1',
      tone: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      tier: 3,
      name: 'Tahap 3 · Harga modal',
      window: 'H-1 / H-0',
      price: hpp,
      note: 'Modal kembali 100%, tanpa rugi kas',
      tone: 'text-rose-700 bg-rose-50 border-rose-200',
    },
  ];

  const current = tiers.find((t) => t.tier === selectedTier) ?? tiers[0];
  const protectedCapital = hpp * batch.stockQty;

  const handleApply = () => {
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 }, colors: ['#10b981', '#0f172a', '#34d399'] });
    onApplyDiscount(batch.id, current.price, current.name);
  };

  return (
    <Modal
      onClose={onClose}
      icon={<Tag className="w-4 h-4" />}
      title="Diskon bertahap"
      description="Pilih tingkat diskon. Harga tidak pernah turun di bawah HPP."
      footer={
        <>
          <button onClick={onClose} className="btn-ghost">
            Batal
          </button>
          <button onClick={handleApply} className="btn-brand">
            <Check className="w-4 h-4" />
            Terapkan {formatRupiah(current.price)}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[12px] text-slate-500">
              <span className="font-mono">{batch.batchCode}</span> · {batch.category}
            </div>
            <div className="mt-0.5 font-semibold text-ink">{batch.productName}</div>
            <div className="mt-1 text-[12px] text-slate-500 tabular">
              {batch.stockQty} {batch.unit} · {daysLeft <= 0 ? 'kedaluwarsa hari ini' : `${daysLeft} hari lagi`}
            </div>
          </div>
          <div className="text-right shrink-0 tabular">
            <div className="text-[11px] text-slate-500">Harga normal</div>
            <div className="font-semibold text-ink">{formatRupiah(normal)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Batas bawah (HPP)
            </div>
            <div className="mt-0.5 font-semibold text-ink tabular">{formatRupiah(hpp)}</div>
          </div>
          <div className="rounded-xl bg-brand-50/70 border border-brand-100 p-3">
            <div className="text-[11px] text-brand-700">Modal terlindungi</div>
            <div className="mt-0.5 font-semibold text-brand-800 tabular">{formatRupiah(protectedCapital)}</div>
          </div>
        </div>

        <div role="radiogroup" aria-label="Tahap diskon" className="space-y-2">
          {tiers.map((t) => {
            const active = t.tier === selectedTier;
            const pct = Math.round(((normal - t.price) / normal) * 100);
            return (
              <button
                key={t.tier}
                role="radio"
                aria-checked={active}
                onClick={() => setSelectedTier(t.tier)}
                className={cn(
                  'w-full text-left rounded-xl border p-3.5 flex items-center gap-3 transition-all',
                  active ? 'border-brand-500 ring-4 ring-brand-500/10 bg-white' : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <span
                  className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                    active ? 'border-brand-600' : 'border-slate-300'
                  )}
                >
                  {active && <span className="w-2 h-2 rounded-full bg-brand-600" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-ink">{t.name}</span>
                    <span className={cn('chip h-5', t.tone)}>{t.window}</span>
                  </span>
                  <span className="block text-[12px] text-slate-500 mt-0.5">
                    {t.note} · laba/unit {formatRupiah(Math.max(0, t.price - hpp))}
                  </span>
                </span>
                <span className="text-right shrink-0 tabular">
                  <span className="block font-semibold text-ink">{formatRupiah(t.price)}</span>
                  <span className="block text-[11px] text-rose-600 font-medium">-{pct}%</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
