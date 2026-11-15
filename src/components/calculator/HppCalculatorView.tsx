import React, { useState } from 'react';
import { Calculator, ShieldAlert, Check, Info, Coins } from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah, getBatchStatus } from '../../utils/formatters';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { CardHeader, Field, PageHeader, Segmented, StatusChip, cn } from '../common/ui';

interface HppCalculatorViewProps {
  batches: InventoryBatch[];
  onApplyClearancePrice: (batchId: string, newPrice: number) => void;
}

const round500 = (v: number) => Math.round(v / 500) * 500;

const MoneyInput: React.FC<{
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  suffix?: string;
}> = ({ label, hint, value, onChange, step = 1000, suffix = 'Rp' }) => (
  <Field label={label} hint={hint}>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-slate-600 pointer-events-none">{suffix}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className={cn('input', suffix.length > 2 ? 'pl-11' : 'pl-9')}
      />
    </div>
  </Field>
);

export const HppCalculatorView: React.FC<HppCalculatorViewProps> = ({ batches, onApplyClearancePrice }) => {
  const [mode, setMode] = useState<'standard' | 'clearance'>('standard');

  const [productName, setProductName] = useState('Keripik Pisang Lumer Cokelat');
  const [rawMaterialCost, setRawMaterialCost] = useState(350000);
  const [packagingCost, setPackagingCost] = useState(75000);
  const [laborCost, setLaborCost] = useState(100000);
  const [overheadCost, setOverheadCost] = useState(50000);
  const [batchOutputUnits, setBatchOutputUnits] = useState(50);
  const [monthlyFixedCost, setMonthlyFixedCost] = useState(2500000);
  const [targetMarginPct, setTargetMarginPct] = useState(35);

  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');

  const totalVariable = rawMaterialCost + packagingCost + laborCost + overheadCost;
  const hppPerUnit = batchOutputUnits > 0 ? totalVariable / batchOutputUnits : 0;
  // Round UP to the nearest Rp 500 so the real margin never falls below target
  const recommendedPrice = targetMarginPct < 100 ? Math.ceil(hppPerUnit / (1 - targetMarginPct / 100) / 500) * 500 : hppPerUnit;
  const realMargin = recommendedPrice > 0 ? ((recommendedPrice - hppPerUnit) / recommendedPrice) * 100 : 0;
  const unitProfit = recommendedPrice - hppPerUnit;
  const bepUnits = unitProfit > 0 ? Math.ceil(monthlyFixedCost / unitProfit) : 0;
  const bepRupiah = bepUnits * recommendedPrice;

  const costParts = [
    { label: 'Bahan baku', value: rawMaterialCost, color: 'bg-brand-700' },
    { label: 'Kemasan', value: packagingCost, color: 'bg-brand-400' },
    { label: 'Tenaga kerja', value: laborCost, color: 'bg-brand-300' },
    { label: 'Overhead', value: overheadCost, color: 'bg-rose-300' },
  ];

  const selected = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const st = selected ? getBatchStatus(selected.expiryDate, selected.entryDate, selected.packagingType) : null;
  const floor = selected?.unitHpp ?? 0;

  const schedule = selected
    ? [
        { level: 'Waspada', window: 'H-7 s/d H-5', price: Math.max(floor, round500(selected.sellingPrice * 0.8)), note: 'Perputaran tetap untung' },
        { level: 'Kritis', window: 'H-4 s/d H-2', price: Math.max(floor, round500(selected.sellingPrice * 0.65)), note: 'Prioritaskan likuiditas kas' },
        { level: 'Harga modal', window: 'H-1 / H-0', price: floor, note: '0% rugi kas, modal kembali utuh' },
      ]
    : [];

  const applyClearance = (price: number) => {
    if (!selected) return;
    onApplyClearancePrice(selected.id, price);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Perhitungan"
        title="Kalkulator HPP & harga aman"
        description="Hitung harga pokok per unit, harga jual sesuai target margin, titik impas bulanan, dan batas aman diskon."
        actions={
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'standard', label: <><Calculator className="w-3.5 h-3.5" /> HPP & BEP</> },
              { value: 'clearance', label: <><ShieldAlert className="w-3.5 h-3.5" /> Clearance</> },
            ]}
          />
        }
      />

      {mode === 'standard' ? (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="card card-hover rise xl:col-span-3">
            <CardHeader title="Komponen biaya per batch" description="Isi biaya untuk satu kali produksi." icon={<Coins className="w-4 h-4" />} />
            <div className="px-5 pb-5 space-y-5">
              <Field label="Nama produk / resep">
                <input value={productName} onChange={(e) => setProductName(e.target.value)} className="input" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MoneyInput label="Bahan baku" hint="Tepung, bumbu, minyak, dll." value={rawMaterialCost} onChange={setRawMaterialCost} step={5000} />
                <MoneyInput label="Kemasan & label" hint="Pouch, toples, stiker" value={packagingCost} onChange={setPackagingCost} step={2000} />
                <MoneyInput label="Tenaga kerja" hint="Upah produksi per batch" value={laborCost} onChange={setLaborCost} step={5000} />
                <MoneyInput label="Overhead" hint="Gas, listrik, air" value={overheadCost} onChange={setOverheadCost} step={2000} />
                <MoneyInput label="Hasil jadi per batch" hint="Jumlah unit siap jual" value={batchOutputUnits} onChange={(v) => setBatchOutputUnits(Math.max(1, v))} step={1} suffix="pcs" />
                <MoneyInput label="Biaya tetap bulanan" hint="Sewa, internet, dsb. (untuk BEP)" value={monthlyFixedCost} onChange={setMonthlyFixedCost} step={100000} />
              </div>

              <div className="pt-5 border-t border-white/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold text-slate-700">Target margin</span>
                  <span className="chip bg-brand-700 text-white border-slate-900 tabular">{targetMarginPct}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={50}
                  value={targetMarginPct}
                  onChange={(e) => setTargetMarginPct(Number(e.target.value))}
                  className="w-full accent-brand-600"
                  aria-label="Target margin"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>20% grosir</span>
                  <span>35% ritel sehat</span>
                  <span>50% premium</span>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 space-y-4">
            <div className="card rise overflow-hidden">
              <div className="p-5 bg-brand-950 text-white">
                <div className="text-[12px] text-brand-200">Harga jual disarankan</div>
                <div className="mt-1 text-[32px] font-semibold tabular">
                  <AnimatedCounter value={recommendedPrice} format="rupiah" />
                </div>
                <div className="mt-1 text-[12px] text-brand-200/90 tabular">
                  Laba {formatRupiah(unitProfit)} / unit · margin riil {realMargin.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%
                </div>
              </div>
              <dl className="divide-y divide-white/70 text-[13px] tabular">
                <div className="flex justify-between px-5 py-3">
                  <dt className="text-slate-500">HPP per unit</dt>
                  <dd className="font-semibold text-ink">{formatRupiah(hppPerUnit)}</dd>
                </div>
                <div className="flex justify-between px-5 py-3">
                  <dt className="text-slate-500">Total biaya batch</dt>
                  <dd className="font-semibold text-ink">{formatRupiah(totalVariable)}</dd>
                </div>
                <div className="flex justify-between px-5 py-3">
                  <dt className="text-slate-500">BEP / bulan</dt>
                  <dd className="font-semibold text-ink">{bepUnits.toLocaleString('id-ID')} unit</dd>
                </div>
                <div className="flex justify-between px-5 py-3">
                  <dt className="text-slate-500">Omzet balik modal</dt>
                  <dd className="font-semibold text-ink">{formatRupiah(bepRupiah)}</dd>
                </div>
              </dl>
            </div>

            <div className="card card-hover rise p-5">
              <div className="text-[13px] font-semibold text-ink">Struktur biaya</div>
              <div className="mt-3 flex h-2.5 rounded-full overflow-hidden bg-white/70">
                {costParts.map((p) =>
                  p.value > 0 ? (
                    <div key={p.label} className={p.color} style={{ width: `${(p.value / Math.max(1, totalVariable)) * 100}%` }} />
                  ) : null
                )}
              </div>
              <ul className="mt-3 space-y-2 text-[12px]">
                {costParts.map((p) => (
                  <li key={p.label} className="flex items-center gap-2 text-slate-600">
                    <span className={cn('w-2 h-2 rounded-sm', p.color)} />
                    {p.label}
                    <span className="ml-auto tabular font-medium text-ink">
                      {((p.value / Math.max(1, totalVariable)) * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card rounded-[24px] p-4 flex gap-3 text-[12px] text-slate-600 leading-relaxed">
              <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <p>
                Rumus: <code className="font-mono text-[11px] bg-white/70 px-1.5 py-0.5 rounded text-ink">Harga = HPP ÷ (1 − margin)</code>.
                Margin dihitung dari harga jual (bukan markup dari HPP) dan dibulatkan ke atas per Rp 500, jadi margin riil tidak pernah di bawah target.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <CardHeader
            title="Clearance optimizer"
            description="Jadwal diskon bertahap yang tidak pernah menembus harga modal."
            icon={<ShieldAlert className="w-4 h-4" />}
            actions={
              <select
                value={selected?.id}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="input w-56 sm:w-72"
                aria-label="Pilih batch"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.productName} ({b.batchCode})
                  </option>
                ))}
              </select>
            }
          />
          {selected && st && (
            <div className="px-5 pb-5 space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { k: 'Harga normal', v: formatRupiah(selected.sellingPrice) },
                  { k: 'Batas bawah (HPP)', v: formatRupiah(floor) },
                  { k: 'Sisa masa simpan', v: st.daysLeft <= 0 ? 'Hari ini' : `${st.daysLeft} hari`, chip: true },
                  { k: 'Modal berisiko', v: formatRupiah(floor * selected.stockQty), danger: true },
                ].map((x) => (
                  <div key={x.k} className="rounded-[20px] bg-white/55 border border-white/80 p-3.5">
                    <div className="text-[12px] text-slate-500">{x.k}</div>
                    <div className={cn('mt-1 font-semibold tabular flex items-center gap-2', x.danger ? 'text-rose-600' : 'text-ink')}>
                      {x.v}
                      {x.chip && <StatusChip status={st.status} />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {schedule.map((t, i) => {
                  const pct = Math.round(((selected.sellingPrice - t.price) / selected.sellingPrice) * 100);
                  const isCurrent = selected.discountPrice === t.price;
                  return (
                    <div key={t.level} className={cn('rounded-[20px] border p-4 flex flex-col', isCurrent ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-white/80')}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-slate-500">Tahap {i + 1}</span>
                        <span className="chip h-5 bg-rose-50 text-rose-700 border-rose-200 tabular">-{pct}%</span>
                      </div>
                      <div className="mt-2 text-[15px] font-semibold text-ink">{t.level}</div>
                      <div className="text-[12px] text-slate-500">{t.window} · {t.note}</div>
                      <div className="mt-4 text-2xl font-semibold text-ink tabular">{formatRupiah(t.price)}</div>
                      <div className="text-[12px] text-brand-600 font-medium tabular">
                        Laba/unit +{formatRupiah(Math.max(0, t.price - floor))}
                      </div>
                      <button onClick={() => applyClearance(t.price)} className={cn('mt-4', isCurrent ? 'btn-secondary' : 'btn-primary')}>
                        <Check className="w-4 h-4" />
                        {isCurrent ? 'Sedang aktif' : 'Terapkan harga'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
