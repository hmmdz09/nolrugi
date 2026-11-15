import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowRight,
  Tag,
  PackagePlus,
  Inbox,
  ShieldAlert,
  Layers,
  Wallet,
  Percent,
  CalendarDays,
} from 'lucide-react';
import { InventoryBatch, StockStatus } from '../../types';
import { formatRupiah, formatDateIndo, getBatchStatus } from '../../utils/formatters';
import { ProductThumbnail, getProductImageUrl } from '../../utils/productImages';
import { sampleHistoricalRevenue } from '../../data/initialData';
import { Segmented, StatusChip, STATUS_STYLES, cn } from '../common/ui';

interface DashboardViewProps {
  batches: InventoryBatch[];
  selectedBatchId: string;
  onSelectBatchId: (id: string) => void;
  onTriggerDiscount: (batch: InventoryBatch) => void;
  onTriggerBundle: (batch: InventoryBatch) => void;
  onNavigateToTab: (tab: 'inventory' | 'calculator') => void;
}

type RiskFilter = 'all' | 'kritis' | 'waspada' | 'dwell-alert';

const STATUS_ORDER: Record<StockStatus, number> = { kritis: 0, waspada: 1, 'dwell-alert': 2, aman: 3 };

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 19) return 'Selamat sore';
  return 'Selamat malam';
};

const compactRp = (v: number) =>
  v === 0 ? '0' : v >= 1_000_000 ? `${(v / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt` : `${Math.round(v / 1000)} rb`;

const pct = (v: number) => v.toLocaleString('id-ID', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

/** "Rp" rendered quiet, digits loud — mirrors the faded ".00" in the reference */
const Money: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
  <span className={cn('num', className)}>
    <span className="text-[0.62em] font-semibold text-slate-400 mr-1 align-[0.18em]">Rp</span>
    {Math.round(value).toLocaleString('id-ID')}
  </span>
);

const DeltaBadge: React.FC<{ value: number; invert?: boolean }> = ({ value, invert }) => {
  const good = invert ? value <= 0 : value >= 0;
  return (
    <span
      className={cn(
        'num inline-flex items-center h-6 px-2 rounded-full text-[11.5px] font-bold',
        good ? 'bg-brand-500/12 text-brand-700' : 'bg-rose-500/10 text-rose-600'
      )}
    >
      {value >= 0 ? '+' : ''}
      {pct(value)}%
    </span>
  );
};

const CornerLink: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className="btn-icon w-9 h-9 shrink-0 group/corner"
  >
    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/corner:translate-x-0.5 group-hover/corner:-translate-y-0.5" />
  </button>
);

/* ───────────── Semicircle dash gauge ───────────── */
const DashGauge: React.FC<{ value: number }> = ({ value }) => {
  const N = 24;
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * N);
  const cx = 110;
  const cy = 108;
  const r1 = 74;
  const r2 = 98;
  return (
    <svg viewBox="0 0 220 120" className="w-full max-w-[260px] mx-auto" role="img" aria-label={`Skor ${value} dari 100`}>
      {Array.from({ length: N }).map((_, i) => {
        const a = Math.PI - (i / (N - 1)) * Math.PI;
        const x1 = cx + r1 * Math.cos(a);
        const y1 = cy - r1 * Math.sin(a);
        const x2 = cx + r2 * Math.cos(a);
        const y2 = cy - r2 * Math.sin(a);
        const on = i < filled;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            strokeWidth={9}
            strokeLinecap="round"
            className="gauge-seg"
            style={{ animationDelay: `${i * 22}ms` }}
            stroke={on ? (i / N < 0.5 ? '#a68ded' : '#8b6fe0') : 'rgb(255 255 255 / 0.9)'}
          />
        );
      })}
    </svg>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  batches,
  selectedBatchId,
  onSelectBatchId,
  onTriggerDiscount,
  onTriggerBundle,
  onNavigateToTab,
}) => {
  const [filter, setFilter] = useState<RiskFilter>('all');
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);

  const enriched = useMemo(
    () =>
      batches
        .map((b) => ({ batch: b, st: getBatchStatus(b.expiryDate, b.entryDate, b.packagingType) }))
        .sort((a, b) => STATUS_ORDER[a.st.status] - STATUS_ORDER[b.st.status] || a.st.daysLeft - b.st.daysLeft),
    [batches]
  );

  const counts = enriched.reduce(
    (acc, { st }) => ({ ...acc, [st.status]: acc[st.status] + 1 }),
    { kritis: 0, waspada: 0, 'dwell-alert': 0, aman: 0 } as Record<StockStatus, number>
  );

  const potentialLoss14 = enriched.reduce(
    (acc, { batch, st }) => (st.daysLeft <= 14 && st.daysLeft >= 0 ? acc + batch.unitHpp * batch.stockQty : acc),
    0
  );
  const tiedCapital = batches.reduce((a, b) => a + b.unitHpp * b.stockQty, 0);
  const potentialRevenue = batches.reduce((a, b) => a + (b.discountPrice || b.sellingPrice) * b.stockQty, 0);
  const grossMargin = potentialRevenue > 0 ? ((potentialRevenue - tiedCapital) / potentialRevenue) * 100 : 0;
  const fefoScore = Math.max(
    20,
    Math.min(100, Math.round(100 - counts.kritis * 14 - counts.waspada * 6 - counts['dwell-alert'] * 4))
  );
  const rescuedCount = batches.filter((b) => b.isRescued).length;
  const actionable = counts.kritis + counts.waspada;

  const months = sampleHistoricalRevenue;
  const lastIdx = months.length - 1;
  const lastMonth = months[lastIdx];
  const prevMonth = months[lastIdx - 1];
  const omzetGrowth = ((lastMonth.omzet - prevMonth.omzet) / prevMonth.omzet) * 100;
  const rescueGrowth = ((lastMonth.rescuedValue - prevMonth.rescuedValue) / prevMonth.rescuedValue) * 100;
  const maxOmzet = Math.max(...months.map((m) => m.omzet));
  const axisMax = Math.ceil(maxOmzet / 10_000_000) * 10_000_000;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * axisMax);
  const focusIdx = hoverMonth ?? lastIdx;

  const list = enriched.filter(({ st }) => (filter === 'all' ? true : st.status === filter));
  const selected = enriched.find((e) => e.batch.id === selectedBatchId) ?? enriched[0];
  const selShelf = selected
    ? (() => {
      const total = Math.max(
        1,
        (new Date(selected.batch.expiryDate).getTime() - new Date(selected.batch.entryDate).getTime()) / 86_400_000
      );
      return Math.max(4, Math.min(100, (selected.st.dwellDays / total) * 100));
    })()
    : 0;

  const stats = [
    {
      icon: ShieldAlert,
      value: <Money value={potentialLoss14} />,
      label: 'Potensi rugi dalam 14 hari ke depan',
      tone: potentialLoss14 > 0 ? 'text-rose-600' : 'text-ink',
      onClick: () => onNavigateToTab('inventory'),
    },
    {
      icon: Layers,
      value: <span className="num">{actionable}</span>,
      label: `Batch perlu tindakan dari ${batches.length} aktif`,
      onClick: () => onNavigateToTab('inventory'),
    },
    {
      icon: Wallet,
      value: <Money value={tiedCapital} />,
      label: 'Modal tertahan di stok gudang',
      onClick: () => onNavigateToTab('inventory'),
    },
    {
      icon: Percent,
      value: <span className="num">{pct(grossMargin)}%</span>,
      label: grossMargin >= 30 ? 'Margin kotor, di atas standar 30%' : 'Margin kotor, di bawah standar 30%',
      onClick: () => onNavigateToTab('calculator'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-5"
    >
      {/* Greeting */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between rise">
        <div>
          <h1 className="text-[28px] sm:text-[34px] font-bold text-ink leading-tight">{greeting()}, Dewi!</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            {actionable > 0
              ? `${actionable} batch kritis & waspada menunggu diselamatkan minggu ini.`
              : 'Semua stok dalam kondisi aman.'}
          </p>
        </div>
        <button onClick={() => onNavigateToTab('inventory')} className="btn-primary self-start md:self-auto">
          Kelola batch
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* ───────── Left / main ───────── */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-5 min-w-0">
          {/* Stat cards */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" aria-label="Indikator utama">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.label}
                  onClick={s.onClick}
                  className="card card-hover rise text-left p-4 sm:p-5 flex flex-col min-w-0 group"
                  style={{ animationDelay: `${60 + i * 60}ms` }}
                >
                  <span className="icon-orb transition-transform duration-300 group-hover:scale-110 group-hover:text-brand-600">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  </span>
                  <div className={cn('mt-6 sm:mt-8 text-[20px] sm:text-[26px] font-bold leading-none truncate', s.tone ?? 'text-ink')}>
                    {s.value}
                  </div>
                  <p className="mt-2 text-[12.5px] leading-snug text-slate-500 line-clamp-2">{s.label}</p>
                </button>
              );
            })}
          </section>

          {/* Bar chart */}
          <section className="card p-5 sm:p-6 rise" style={{ animationDelay: '280ms' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-bold text-ink">Omzet & stok terselamatkan</h2>
                <p className="mt-0.5 text-[13px] text-slate-500">Ringkasan 6 bulan terakhir dari semua batch</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-white/70 border border-white text-[12.5px] font-semibold text-slate-700">
                  <CalendarDays className="w-4 h-4 text-slate-500" />
                  6 bulan
                </span>
                <CornerLink onClick={() => onNavigateToTab('calculator')} label="Buka kalkulator margin" />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
              <div>
                <div className="flex items-center gap-2 text-[12.5px] text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-300" /> Omzet bulan ini
                </div>
                <div className="mt-1 flex items-center gap-2.5">
                  <Money value={lastMonth.omzet} className="text-[22px] sm:text-[26px] font-bold text-ink" />
                  <DeltaBadge value={omzetGrowth} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[12.5px] text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600" /> Nilai terselamatkan
                </div>
                <div className="mt-1 flex items-center gap-2.5">
                  <Money value={lastMonth.rescuedValue} className="text-[22px] sm:text-[26px] font-bold text-ink" />
                  <DeltaBadge value={rescueGrowth} />
                </div>
              </div>
            </div>

            {/* Chart body */}
            <div className="mt-6 flex gap-3">
              <div className="flex flex-col-reverse justify-between h-56 pb-7 text-[11px] text-slate-400 num w-11 shrink-0 text-right">
                {ticks.map((t) => (
                  <span key={t} className="leading-none -mb-[5px]">
                    {compactRp(t)}
                  </span>
                ))}
              </div>
              <div className="relative flex-1 min-w-0" onMouseLeave={() => setHoverMonth(null)}>
                {/* grid */}
                <div className="absolute inset-x-0 top-0 h-56 -translate-y-0 pb-7 flex flex-col justify-between pointer-events-none">
                  {ticks.map((t) => (
                    <div key={t} className="border-t border-dashed border-slate-300/60" />
                  ))}
                </div>
                <div className="relative h-56 flex items-end justify-around gap-2 sm:gap-4 pb-7">
                  {months.map((m, i) => {
                    const focus = i === focusIdx;
                    const hOmzet = (m.omzet / axisMax) * 100;
                    const rescueShare = m.rescuedValue / m.omzet;
                    return (
                      <div
                        key={m.month}
                        className="group/bar relative h-full flex-1 max-w-[56px] flex flex-col justify-end items-center cursor-pointer outline-none"
                        onMouseEnter={() => setHoverMonth(i)}
                        onFocus={() => setHoverMonth(i)}
                        tabIndex={0}
                        aria-label={`${m.month}: omzet ${formatRupiah(m.omzet)}, terselamatkan ${formatRupiah(m.rescuedValue)}`}
                      >
                        {focus && (
                          <div
                            className={cn(
                              'absolute z-10 bottom-[calc(var(--h)+18px)] whitespace-nowrap rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-pop px-3 py-2 text-[12px] animate-fade-in',
                              i >= months.length - 2 ? 'right-0' : i <= 1 ? 'left-0' : 'left-1/2 -translate-x-1/2'
                            )}
                            style={{ ['--h' as string]: `${(hOmzet / 100) * (224 - 28)}px` }}
                          >
                            <div className="flex items-center gap-2 font-semibold text-ink num">
                              <span className="w-2 h-2 rounded-full bg-brand-300" />
                              {formatRupiah(m.omzet)}
                            </div>
                            <div className="flex items-center gap-2 font-semibold text-ink num mt-0.5">
                              <span className="w-2 h-2 rounded-full bg-brand-600" />
                              {formatRupiah(m.rescuedValue)}
                            </div>
                          </div>
                        )}
                        <div
                          className="bar-grow relative w-full flex flex-col justify-end gap-[2px] origin-bottom"
                          style={{ height: `${hOmzet}%`, animationDelay: `${300 + i * 70}ms` }}
                        >
                          {focus && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-brand-500" />
                          )}
                          <div
                            className={cn(
                              'w-full rounded-[10px] transition-all duration-300',
                              focus ? 'bg-brand-700' : 'bg-brand-200/90 group-hover/bar:bg-brand-300'
                            )}
                            style={{ flexGrow: 1 - rescueShare }}
                          />
                          <div
                            className={cn(
                              'w-full rounded-[10px] transition-all duration-300',
                              focus ? 'bg-brand-400 stripes' : 'bg-brand-300/60 group-hover/bar:bg-brand-300'
                            )}
                            style={{ flexGrow: rescueShare, minHeight: 10 }}
                          />
                        </div>
                        <span
                          className={cn(
                            'absolute -bottom-7 text-[12px] font-semibold transition-colors',
                            focus ? 'text-brand-600' : 'text-slate-400'
                          )}
                        >
                          {m.month.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Radar table */}
          <section className="card rise" style={{ animationDelay: '360ms' }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 sm:p-6 pb-3 sm:pb-4">
              <div>
                <h2 className="text-[18px] font-bold text-ink">Radar kedaluwarsa</h2>
                <p className="mt-0.5 text-[13px] text-slate-500">Risiko tertinggi di atas. Pilih baris untuk detail.</p>
              </div>
              <div className="overflow-x-auto no-scrollbar -mx-1 px-1 pr-6 sm:pr-1 fade-right sm:[mask-image:none]">
                <Segmented<RiskFilter>
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: 'all', label: 'Semua', count: batches.length },
                    { value: 'kritis', label: 'Kritis', count: counts.kritis },
                    { value: 'waspada', label: 'Waspada', count: counts.waspada },
                    { value: 'dwell-alert', label: 'Dwell', count: counts['dwell-alert'] },
                  ]}
                />
              </div>
            </div>

            <ul className="px-2 sm:px-3 pb-3 space-y-1.5">
              {list.length === 0 && (
                <li className="py-12 flex flex-col items-center text-center text-slate-500">
                  <Inbox className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">Tidak ada batch di kategori ini</p>
                  <p className="text-[12px]">Stok kamu aman untuk filter ini.</p>
                </li>
              )}
              {list.slice(0, 6).map(({ batch, st }) => {
                const active = selected?.batch.id === batch.id;
                const s = STATUS_STYLES[st.status];
                return (
                  <li key={batch.id}>
                    <button
                      onClick={() => onSelectBatchId(batch.id)}
                      aria-pressed={active}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-[20px] flex items-center gap-3 sm:gap-4 border transition-all duration-300',
                        active
                          ? 'bg-white/85 border-white shadow-[0_8px_24px_-14px_rgb(70_50_140/0.45)]'
                          : 'border-transparent hover:bg-white/55 hover:border-white/80 hover:translate-x-0.5'
                      )}
                    >
                      <div className="relative shrink-0">
                        <ProductThumbnail batch={batch} size="md" className="rounded-xl shadow-xs" />
                        <span
                          className={cn(
                            'absolute -top-1.5 -right-1.5 h-4 px-1 rounded-full border border-white text-[9.5px] font-bold num shadow-xs flex items-center justify-center',
                            st.daysLeft <= 3 ? 'bg-rose-500 text-white' : st.daysLeft <= 7 ? 'bg-amber-500 text-white' : 'bg-brand-500 text-white'
                          )}
                        >
                          {st.daysLeft <= 0 ? '0h' : `H-${st.daysLeft}`}
                        </span>
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-ink truncate">{batch.productName}</span>
                        <span className="block text-[12px] text-slate-500 truncate">
                          <span className="font-mono text-[11px] font-medium">{batch.batchCode}</span> · {batch.category}
                        </span>
                      </span>
                      <span className="hidden md:block w-28 text-[12.5px] text-slate-600 num">
                        {batch.stockQty} {batch.unit}
                        <span className="block text-[11.5px] text-slate-400">stok</span>
                      </span>
                      <span className="hidden sm:block w-[92px] shrink-0">
                        <StatusChip status={st.status} />
                      </span>
                      <span className="hidden lg:block w-24 text-right text-[12.5px] font-semibold text-slate-600 num">
                        {formatRupiah(batch.unitHpp * batch.stockQty)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {list.length > 6 && (
              <div className="px-5 pb-5">
                <button onClick={() => onNavigateToTab('inventory')} className="btn-secondary w-full">
                  +{list.length - 6} batch lainnya
                </button>
              </div>
            )}
          </section>
        </div>

        {/* ───────── Right column ───────── */}
        <aside className="xl:col-span-4 2xl:col-span-3 space-y-5 min-w-0 xl:self-start xl:sticky xl:top-28">
          {selected && (
            <section className="card card-hover p-5 sm:p-6 rise" style={{ animationDelay: '200ms' }} aria-label="Detail batch terpilih">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[17px] font-bold text-ink">Batch terpilih</h2>
                  <p className="mt-0.5 text-[13px] text-slate-500 truncate">{selected.batch.productName}</p>
                </div>
                <CornerLink onClick={() => onNavigateToTab('inventory')} label="Buka di Batch & FEFO" />
              </div>

              {/* Product Photo Banner */}
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-white shadow-sm h-32">
                <img
                  src={getProductImageUrl(selected.batch)}
                  alt={selected.batch.productName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                  <div className="text-white">
                    <div className="text-[11px] font-mono opacity-80">{selected.batch.batchCode} · {selected.batch.location}</div>
                    <div className="text-[14px] font-bold leading-tight drop-shadow-sm truncate">{selected.batch.productName}</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-[13px]">
                <span className="font-semibold text-ink">Umur simpan terpakai</span>
                <StatusChip status={selected.st.status} label={selected.st.label} />
              </div>
              <div className="mt-2.5 h-9 rounded-full bg-white/80 border border-white p-1 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full stripes transition-[width] duration-700',
                    selected.st.status === 'kritis' ? 'bg-rose-400' : selected.st.status === 'waspada' ? 'bg-amber-400' : 'bg-brand-400'
                  )}
                  style={{ width: `${selShelf}%` }}
                />
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <dt className="text-slate-500 text-[12px]">Kedaluwarsa</dt>
                  <dd className="mt-0.5 font-semibold text-ink">{formatDateIndo(selected.batch.expiryDate)}</dd>
                  <dd className={cn('text-[12px] font-semibold', STATUS_STYLES[selected.st.status].text)}>
                    {selected.st.daysLeft <= 0 ? 'Hari ini' : `${selected.st.daysLeft} hari lagi`}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-[12px]">Stok</dt>
                  <dd className="mt-0.5 font-semibold text-ink num">
                    {selected.batch.stockQty} / {selected.batch.initialQty} {selected.batch.unit}
                  </dd>
                  <dd className="text-[12px] text-slate-500">{selected.batch.location}</dd>
                </div>
              </dl>

              <div className="mt-4 rounded-[18px] bg-white/70 border border-white px-4 py-3 flex items-baseline justify-between">
                <span className="text-[12.5px] text-slate-600">Rugi jika tidak terjual</span>
                <Money value={selected.batch.unitHpp * selected.batch.stockQty} className="text-[16px] font-bold text-rose-600" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => onTriggerDiscount(selected.batch)} className="btn-brand">
                  <Tag className="w-4 h-4" />
                  Diskon aman
                </button>
                <button onClick={() => onTriggerBundle(selected.batch)} className="btn-secondary">
                  <PackagePlus className="w-4 h-4" />
                  Bundling
                </button>
              </div>
            </section>
          )}

          <section className="card card-hover p-5 sm:p-6 rise" style={{ animationDelay: '300ms' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-bold text-ink">Skor kesehatan FEFO</h2>
                <p className="mt-0.5 text-[13px] text-slate-500">Seberapa terkendali rotasi stokmu</p>
              </div>
              <CornerLink onClick={() => onNavigateToTab('inventory')} label="Lihat batch" />
            </div>

            <div className="relative mt-4">
              <DashGauge value={fefoScore} />
              <div className="absolute inset-x-0 bottom-0 text-center">
                <div className="num text-[34px] font-bold text-ink leading-none">{fefoScore}</div>
                <div className="mt-1 text-[12px] font-semibold text-slate-500">dari 100</div>
              </div>
            </div>

            <p className="mt-4 text-center text-[13px] leading-relaxed text-slate-600 text-balance">
              {fefoScore >= 75
                ? 'Rotasi terkendali. Pertahankan urutan FEFO di rak.'
                : fefoScore >= 50
                  ? `Perlu perhatian: ${counts.kritis} kritis dan ${counts.waspada} waspada bisa diselamatkan hari ini.`
                  : 'Rotasi berisiko. Prioritaskan diskon pada batch kritis.'}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-white/70 border border-white px-4 py-3">
                <div className="text-[12px] text-slate-500">Diberi aksi</div>
                <div className="num mt-0.5 text-[18px] font-bold text-ink">
                  {rescuedCount}
                  <span className="text-[13px] text-slate-400 font-semibold"> / {batches.length}</span>
                </div>
              </div>
              <div className="rounded-[18px] bg-white/70 border border-white px-4 py-3">
                <div className="text-[12px] text-slate-500">Food waste</div>
                <div className="num mt-0.5 text-[18px] font-bold text-ink">{compactRp(lastMonth.wasteLoss)}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex h-2 rounded-full overflow-hidden bg-white/80 gap-0.5">
                {(['kritis', 'waspada', 'dwell-alert', 'aman'] as StockStatus[]).map((k) =>
                  counts[k] > 0 ? (
                    <div
                      key={k}
                      className={cn('rounded-full', STATUS_STYLES[k].bar)}
                      style={{ width: `${(counts[k] / Math.max(1, batches.length)) * 100}%` }}
                      title={`${STATUS_STYLES[k].label}: ${counts[k]}`}
                    />
                  ) : null
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px]">
                {(['kritis', 'waspada', 'dwell-alert', 'aman'] as StockStatus[]).map((k) => (
                  <div key={k} className="flex items-center gap-2 text-slate-600">
                    <span className={cn('w-2 h-2 rounded-full', STATUS_STYLES[k].dot)} />
                    {STATUS_STYLES[k].label}
                    <span className="ml-auto font-bold text-ink num">{counts[k]}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </motion.div>
  );
};
