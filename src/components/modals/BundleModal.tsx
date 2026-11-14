import React, { useState } from 'react';
import { PackagePlus, Check, Plus } from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { Field, Modal } from '../common/ui';

interface BundleModalProps {
  expiringBatch: InventoryBatch | null;
  allBatches: InventoryBatch[];
  isOpen: boolean;
  onClose: () => void;
  onCreateBundle: (bundleName: string, partnerBatchName: string, bundlePrice: number, marginPct: number) => void;
}

const Item = ({ b, label, tone }: { b: InventoryBatch; label: string; tone: string }) => (
  <div className="rounded-xl border border-slate-200 p-3 min-w-0 flex-1">
    <div className={`text-[11px] font-semibold ${tone}`}>{label}</div>
    <div className="mt-1 text-[13px] font-semibold text-ink line-clamp-2 leading-snug">{b.productName}</div>
    <div className="mt-1.5 text-[12px] text-slate-500 tabular">
      HPP {formatRupiah(b.unitHpp)} · {formatRupiah(b.sellingPrice)}
    </div>
  </div>
);


export const BundleModal: React.FC<BundleModalProps> = ({
  expiringBatch,
  allBatches,
  isOpen,
  onClose,
  onCreateBundle,
}) => {
  const candidates = allBatches.filter((b) => b.id !== expiringBatch?.id && b.stockQty > 5);
  const [partnerId, setPartnerId] = useState<string>(candidates[0]?.id || '');
  const [discountPct, setDiscountPct] = useState<number>(18);

  if (!isOpen || !expiringBatch) return null;

  const partner = candidates.find((b) => b.id === partnerId) || candidates[0];

  if (!partner) {
    return (
      <Modal onClose={onClose} icon={<PackagePlus className="w-4 h-4" />} title="Paket bundling">
        <p className="text-[13px] text-slate-600">
          Belum ada produk lain dengan stok cukup (&gt; 5 unit) untuk dipasangkan.
        </p>
      </Modal>
    );
  }

  const combinedHpp = expiringBatch.unitHpp + partner.unitHpp;
  const originalTotal = expiringBatch.sellingPrice + partner.sellingPrice;
  const bundlePrice = Math.max(combinedHpp * 1.15, Math.round((originalTotal * (1 - discountPct / 100)) / 1000) * 1000);
  const profit = bundlePrice - combinedHpp;
  const marginPct = (profit / bundlePrice) * 100;
  const title = `Paket Hemat: ${expiringBatch.productName.split(' ')[0]} + ${partner.productName.split(' ')[0]}`;

  const handleCreate = () => {
    onCreateBundle(title, partner.productName, bundlePrice, marginPct);
  };

  return (
    <Modal
      onClose={onClose}
      icon={<PackagePlus className="w-4 h-4" />}
      title="Paket bundling"
      description="Pasangkan stok berisiko dengan produk yang laris agar cepat terjual."
      footer={
        <>
          <button onClick={onClose} className="btn-ghost">
            Batal
          </button>
          <button onClick={handleCreate} className="btn-brand">
            <Check className="w-4 h-4" />
            Aktifkan paket
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Pasangkan dengan">
          <select value={partner.id} onChange={(e) => setPartnerId(e.target.value)} className="input">
            {candidates.map((p) => (
              <option key={p.id} value={p.id}>
                {p.productName} · stok {p.stockQty} {p.unit}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-stretch gap-2">
          <Item b={expiringBatch} label="Produk berisiko" tone="text-rose-600" />
          <div className="flex items-center text-slate-300">
            <Plus className="w-4 h-4" />
          </div>
          <Item b={partner} label="Pasangan" tone="text-brand-700" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-slate-700">Diskon paket</span>
            <span className="chip bg-slate-900 text-white border-slate-900 tabular">{discountPct}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={35}
            value={discountPct}
            onChange={(e) => setDiscountPct(Number(e.target.value))}
            className="w-full accent-brand-600"
            aria-label="Diskon paket"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>10% konservatif</span>
            <span>18% disarankan</span>
            <span>35% cuci gudang</span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-100 divide-y divide-slate-100 text-[13px] tabular">
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-500">Harga normal 2 produk</span>
            <span className="text-slate-400 line-through">{formatRupiah(originalTotal)}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-500">HPP gabungan</span>
            <span className="text-slate-700">{formatRupiah(combinedHpp)}</span>
          </div>
          <div className="flex items-end justify-between px-4 py-3">
            <div>
              <div className="text-[12px] text-slate-500">Harga paket</div>
              <div className="text-xl font-semibold text-ink">{formatRupiah(bundlePrice)}</div>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-slate-500">Laba</div>
              <div className="font-semibold text-brand-600">
                +{formatRupiah(profit)} ({marginPct.toLocaleString('id-ID', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
