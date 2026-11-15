import React, { useState } from 'react';
import { Tag, ShieldCheck, Check, TrendingUp, Coins } from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah, getDaysRemaining } from '../../utils/formatters';
import { ProductThumbnail } from '../../utils/productImages';
import { Modal, cn } from '../common/ui';

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
      tone: 'text-brand-700 bg-brand-50 border-brand-200',
    },
    {
      tier: 2,
      name: 'Tahap 2 · Penyelamat kas',
      window: 'H-4 s/d H-2',
      price: Math.max(hpp, round500(normal * 0.7)),
      tone: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      tier: 3,
      name: 'Tahap 3 · Harga modal',
      window: 'H-1 / H-0',
      price: hpp,
      tone: 'text-rose-700 bg-rose-50 border-rose-200',
    },
  ];

  const current = tiers.find((t) => t.tier === selectedTier) ?? tiers[0];
  const protectedCapital = hpp * batch.stockQty;
  const currentUnitProfit = Math.max(0, current.price - hpp);
  const currentTotalProfit = currentUnitProfit * batch.stockQty;
  const currentMargin = current.price > 0 ? ((current.price - hpp) / current.price) * 100 : 0;
  const currentRevenue = current.price * batch.stockQty;

  const handleApply = () => {
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
            <span>Terapkan {formatRupiah(current.price)}</span>
            <span className="opacity-80 text-[11.5px] font-normal hidden sm:inline">
              ({currentTotalProfit > 0 ? `+${formatRupiah(currentTotalProfit)} untung` : '0% rugi kas'})
            </span>
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-[20px] border border-white/80 p-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <ProductThumbnail batch={batch} size="lg" className="rounded-2xl" />
            <div className="min-w-0">
              <div className="font-semibold text-ink leading-tight">{batch.productName}</div>
              <div className="mt-1 text-[12px] text-slate-500 tabular">
                {batch.stockQty} {batch.unit} · {daysLeft <= 0 ? 'kedaluwarsa hari ini' : `${daysLeft} hari lagi`}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0 tabular">
            <div className="text-[11px] text-slate-500">Harga normal</div>
            <div className="font-semibold text-ink">{formatRupiah(normal)}</div>
          </div>
        </div>

        {/* Dynamic Profit, Protected Capital & Revenue Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="rounded-[18px] bg-white/60 border border-white/80 p-3 shadow-xs">
            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Modal Terlindungi
            </div>
            <div className="mt-1 text-[15px] font-bold text-ink tabular">{formatRupiah(protectedCapital)}</div>
          </div>

          <div
            className={cn(
              'rounded-[18px] border p-3 shadow-xs transition-colors',
              currentTotalProfit > 0
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            )}
          >
            <div className="text-[11px] font-medium flex items-center gap-1 text-slate-600">
              <TrendingUp className={cn('w-3.5 h-3.5', currentTotalProfit > 0 ? 'text-emerald-600' : 'text-amber-600')} />
              <span>Estimasi Untung (Laba)</span>
            </div>
            <div
              className={cn(
                'mt-1 text-[15px] font-bold tabular',
                currentTotalProfit > 0 ? 'text-emerald-700' : 'text-amber-700'
              )}
            >
              {currentTotalProfit > 0 ? `+${formatRupiah(currentTotalProfit)}` : 'Rp 0 (Titik Impas)'}
            </div>
          </div>

          <div className="rounded-[18px] bg-white/60 border border-white/80 p-3 shadow-xs">
            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <Coins className="w-3.5 h-3.5 text-slate-500" /> Total Kas Masuk
            </div>
            <div className="mt-1 text-[15px] font-bold text-ink tabular">{formatRupiah(currentRevenue)}</div>
          </div>
        </div>

        <div role="radiogroup" aria-label="Tahap diskon" className="space-y-2">
          {tiers.map((t) => {
            const active = t.tier === selectedTier;
            const pct = Math.round(((normal - t.price) / normal) * 100);
            const unitProfit = Math.max(0, t.price - hpp);
            const totalProfit = unitProfit * batch.stockQty;

            return (
              <button
                key={t.tier}
                role="radio"
                aria-checked={active}
                onClick={() => setSelectedTier(t.tier)}
                className={cn(
                  'w-full text-left rounded-[20px] border p-3.5 flex items-center gap-3 transition-all',
                  active ? 'border-brand-500 ring-4 ring-brand-500/10 bg-white shadow-xs' : 'border-white/80 hover:border-slate-300 bg-white/40'
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
                    <span className="text-[13.5px] font-bold text-ink">{t.name}</span>
                    <span className={cn('chip h-5', t.tone)}>{t.window}</span>
                  </span>

                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                        totalProfit > 0
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      )}
                    >
                      {totalProfit > 0 ? `+${formatRupiah(totalProfit)} untung` : 'Rp 0 untung'}
                    </span>
                  </div>
                </span>
                <span className="text-right shrink-0 tabular">
                  <span className="block text-[15px] font-bold text-ink">{formatRupiah(t.price)}</span>
                  <span className="block text-[11.5px] text-rose-600 font-semibold">-{pct}%</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
