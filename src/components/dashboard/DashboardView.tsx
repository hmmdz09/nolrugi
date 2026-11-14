import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Wallet,
  TrendingUp,
  Activity,
  ArrowRight,
  Tag,
  PackagePlus,
  CalendarClock,
  MapPin,
  Boxes,
  Calculator,
  Inbox,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { InventoryBatch, StockStatus } from '../../types';
import { formatRupiah, formatDateIndo, getBatchStatus } from '../../utils/formatters';
import { sampleHistoricalRevenue } from '../../data/initialData';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { CardHeader, Segmented, StatusChip, STATUS_STYLES, cn } from '../common/ui';

interface DashboardViewProps {
  batches: InventoryBatch[];
  selectedBatchId: string;
  onSelectBatchId: (id: string) => void;
  onTriggerDiscount: (batch: InventoryBatch) => void;
  onTriggerBundle: (batch: InventoryBatch) => void;
  onNavigateToTab: (tab: 'inventory' | 'calculator' | 'reports') => void;
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
  v >= 1_000_000 ? `${(v / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt` : `${Math.round(v / 1000)} rb`;

export const DashboardView: React.FC<DashboardViewProps> = ({
  batches,
  selectedBatchId,
  onSelectBatchId,
  onTriggerDiscount,
  onTriggerBundle,
  onNavigateToTab,
}) => {
  const [filter, setFilter] = useState<RiskFilter>('all');

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

  const lastMonth = sampleHistoricalRevenue[sampleHistoricalRevenue.length - 1];
  const prevMonth = sampleHistoricalRevenue[sampleHistoricalRevenue.length - 2];
  const omzetGrowth = ((lastMonth.omzet - prevMonth.omzet) / prevMonth.omzet) * 100;

  const list = enriched.filter(({ st }) => (filter === 'all' ? true : st.status === filter));
  const selected = enriched.find((e) => e.batch.id === selectedBatchId) ?? enriched[0];

  const actionable = counts.kritis + counts.waspada;

  const kpis = [
    {
      label: 'Potensi rugi 14 hari',
      value: <AnimatedCounter value={potentialLoss14} format="rupiah" />,
      sub: `${actionable} batch perlu tindakan`,
      icon: AlertTriangle,
      tone: 'text-rose-600 bg-rose-50',
      accent: true,
    },
    {
      label: 'Modal tertahan di stok',
      value: <AnimatedCounter value={tiedCapital} format="rupiah" />,
      sub: `${batches.length} batch aktif`,
      icon: Wallet,
      tone: 'text-sky-700 bg-sky-50',
    },
    {
      label: 'Margin kotor',
      value: <AnimatedCounter value={grossMargin} format="percent" />,
      sub: grossMargin >= 30 ? 'Di atas standar sehat 30%' : 'Di bawah standar 30%',
      icon: TrendingUp,
      tone: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Skor kesehatan FEFO',
      value: <AnimatedCounter value={fefoScore} format="score" suffix=" / 100" />,
      sub: fefoScore >= 75 ? 'Rotasi terkendali' : fefoScore >= 50 ? 'Perlu perhatian' : 'Rotasi berisiko',
      icon: Activity,
      tone: 'text-amber-700 bg-amber-50',
      meter: fefoScore,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[13px] text-slate-500">{greeting()}, Dewi 👋</p>
          <h1 className="mt-1 text-[22px] sm:text-2xl font-bold tracking-tight text-ink">
            {actionable > 0 ? (
              <>
                Ada <span className="text-rose-600">{actionable} batch</span> yang perlu diselamatkan minggu ini
              </>
            ) : (
              'Semua stok dalam kondisi aman'
            )}
          </h1>
        </div>
        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <button onClick={() => onNavigateToTab('calculator')} className="btn-secondary">
            <Calculator className="w-4 h-4" />
            Hitung HPP
          </button>
          <button onClick={() => onNavigateToTab('inventory')} className="btn-brand">
            Kelola batch
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Indikator utama">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-5 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-slate-500">{k.label}</span>
                <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center', k.tone)}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div
                className={cn(
                  'mt-3 text-[22px] font-bold tracking-tight tabular',
                  k.accent ? 'text-rose-600' : 'text-ink'
                )}
              >
                {k.value}
              </div>
              <p className="mt-1 text-[12px] text-slate-500">{k.sub}</p>
              {k.meter !== undefined && (
                <div className="mt-auto pt-3">
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        k.meter >= 75 ? 'bg-emerald-500' : k.meter >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      )}
                      style={{ width: `${k.meter}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Radar + detail */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card xl:col-span-2 flex flex-col min-w-0">
          <CardHeader
            title="Radar kedaluwarsa"
            description="Diurutkan dari risiko tertinggi. Klik baris untuk melihat detail."
            actions={
              <button onClick={() => onNavigateToTab('inventory')} className="btn-ghost h-8 px-2.5 hidden sm:inline-flex">
                Lihat semua
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          />
          <div className="px-5 pb-3 overflow-x-auto no-scrollbar">
            <Segmented<RiskFilter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'Semua', count: batches.length },
                { value: 'kritis', label: 'Kritis', count: counts.kritis },
                { value: 'waspada', label: 'Waspada', count: counts.waspada },
                { value: 'dwell-alert', label: 'Dwell > 21 hari', count: counts['dwell-alert'] },
              ]}
            />
          </div>

          <ul className="border-t border-slate-100 divide-y divide-slate-100 flex-1">
            {list.length === 0 && (
              <li className="py-14 flex flex-col items-center text-center text-slate-500">
                <Inbox className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">Tidak ada batch di kategori ini</p>
                <p className="text-[12px]">Stok kamu aman untuk filter ini.</p>
              </li>
            )}
            {list.slice(0, 6).map(({ batch, st }) => {
              const active = selected?.batch.id === batch.id;
              const s = STATUS_STYLES[st.status];
              const shelfPct = Math.max(
                4,
                Math.min(100, (batch.stockQty / Math.max(1, batch.initialQty)) * 100)
              );
              return (
                <li key={batch.id}>
                  <button
                    onClick={() => onSelectBatchId(batch.id)}
                    aria-pressed={active}
                    className={cn(
                      'relative w-full text-left px-5 py-3.5 flex items-center gap-4 transition-colors',
                      active ? 'bg-brand-50/60' : 'hover:bg-slate-50'
                    )}
                  >
                    {active && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-600" />}

                    {/* Days-left tile */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 tabular',
                        s.chip
                      )}
                    >
                      <span className="text-[15px] font-bold leading-none">
                        {st.daysLeft <= 0 ? '0' : st.daysLeft}
                      </span>
                      <span className="text-[10px] font-semibold mt-0.5 opacity-90">hari</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[14px] font-semibold text-ink truncate">{batch.productName}</span>
                        {batch.isRescued && (
                          <span className="chip h-5 bg-brand-50 text-brand-700 border-brand-200 hidden sm:inline-flex">
                            Diselamatkan
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-x-3 gap-y-1 flex-wrap text-[12px] text-slate-500">
                        <span className="font-mono text-[11px] text-slate-600">{batch.batchCode}</span>
                        <span className="hidden sm:inline">{batch.category}</span>
                        <span className="tabular">
                          {batch.stockQty} {batch.unit} · HPP {formatRupiah(batch.unitHpp)}
                        </span>
                      </div>
                    </div>

                    <div className="hidden md:block w-28 shrink-0">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1 tabular">
                        <span>Sisa stok</span>
                        <span>{Math.round((batch.stockQty / Math.max(1, batch.initialQty)) * 100)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={cn('h-full rounded-full', s.bar)} style={{ width: `${shelfPct}%` }} />
                      </div>
                    </div>

                    <div className="hidden sm:flex w-[88px] shrink-0 justify-end">
                      <StatusChip status={st.status} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          {list.length > 6 && (
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="border-t border-slate-100 h-11 text-[13px] font-semibold text-slate-600 hover:text-ink hover:bg-slate-50 rounded-b-2xl"
            >
              +{list.length - 6} batch lainnya
            </button>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <aside className="card flex flex-col xl:self-start xl:sticky xl:top-24" aria-label="Detail batch terpilih">
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Batch terpilih</span>
                <StatusChip status={selected.st.status} label={selected.st.label} />
              </div>
              <h3 className="mt-3 text-[17px] font-bold leading-snug text-ink">{selected.batch.productName}</h3>
              <p className="mt-1 text-[12px] text-slate-500">
                <span className="font-mono">{selected.batch.batchCode}</span> · {selected.batch.category}
              </p>
            </div>

            <dl className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-4 text-[13px]">
              <div>
                <dt className="text-slate-500 flex items-center gap-1.5 text-[12px]">
                  <CalendarClock className="w-3.5 h-3.5" /> Kedaluwarsa
                </dt>
                <dd className="mt-1 font-semibold text-ink">{formatDateIndo(selected.batch.expiryDate)}</dd>
                <dd className={cn('text-[12px] font-medium', STATUS_STYLES[selected.st.status].text)}>
                  {selected.st.daysLeft <= 0 ? 'Hari ini' : `${selected.st.daysLeft} hari lagi`}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 flex items-center gap-1.5 text-[12px]">
                  <Boxes className="w-3.5 h-3.5" /> Stok
                </dt>
                <dd className="mt-1 font-semibold text-ink tabular">
                  {selected.batch.stockQty} / {selected.batch.initialQty} {selected.batch.unit}
                </dd>
                <dd className="text-[12px] text-slate-500">Masuk {selected.st.dwellDays} hari lalu</dd>
              </div>
              <div>
                <dt className="text-slate-500 text-[12px]">Modal tertahan</dt>
                <dd className="mt-1 font-semibold text-ink tabular">
                  {formatRupiah(selected.batch.unitHpp * selected.batch.stockQty)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 text-[12px]">Harga jual</dt>
                <dd className="mt-1 font-semibold text-ink tabular">
                  {formatRupiah(selected.batch.discountPrice || selected.batch.sellingPrice)}
                </dd>
                {selected.batch.discountPrice && (
                  <dd className="text-[12px] text-slate-400 line-through tabular">
                    {formatRupiah(selected.batch.sellingPrice)}
                  </dd>
                )}
              </div>
              <div className="col-span-2">
                <dt className="text-slate-500 flex items-center gap-1.5 text-[12px]">
                  <MapPin className="w-3.5 h-3.5" /> Lokasi
                </dt>
                <dd className="mt-1 font-medium text-ink">{selected.batch.location}</dd>
              </div>
              {selected.batch.notes && (
                <div className="col-span-2 rounded-lg bg-slate-50 border border-slate-100 p-3 text-[12px] text-slate-600 leading-relaxed">
                  {selected.batch.notes}
                </div>
              )}
            </dl>

            <div className="p-5 pt-1 grid grid-cols-2 gap-2">
              <button onClick={() => onTriggerDiscount(selected.batch)} className="btn-brand">
                <Tag className="w-4 h-4" />
                Diskon aman
              </button>
              <button onClick={() => onTriggerBundle(selected.batch)} className="btn-secondary">
                <PackagePlus className="w-4 h-4" />
                Bundling
              </button>
            </div>
          </aside>
        )}
      </section>

      {/* Trend + summary */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card xl:col-span-2 min-w-0">
          <CardHeader
            title="Omzet vs nilai stok terselamatkan"
            description="6 bulan terakhir"
            actions={
              <div className="hidden sm:flex items-center gap-4 text-[12px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-800" /> Omzet
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-brand-500" /> Terselamatkan
                </span>
              </div>
            }
          />
          <div className="h-64 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleHistoricalRevenue} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gOmzet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e293b" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRescue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eef0f3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(m: string) => m.split(' ')[0]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => compactRp(v)}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [formatRupiah(Number(val)), name]}
                  cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }}
                  contentStyle={{
                    background: '#0f172a',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 12,
                    color: '#fff',
                    padding: '8px 12px',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                />
                <Area type="monotone" dataKey="omzet" name="Omzet" stroke="#1e293b" strokeWidth={2} fill="url(#gOmzet)" />
                <Area
                  type="monotone"
                  dataKey="rescuedValue"
                  name="Terselamatkan"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#gRescue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 flex flex-col">
          <span className="eyebrow">Bulan berjalan</span>
          <div className="mt-3">
            <div className="text-[13px] text-slate-500">Omzet</div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-[22px] font-bold tracking-tight text-ink tabular">{formatRupiah(lastMonth.omzet)}</span>
              <span className="chip h-5 bg-emerald-50 text-emerald-700 border-emerald-200 tabular">
                +{omzetGrowth.toLocaleString('id-ID', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Nilai stok terselamatkan</span>
              <span className="font-semibold text-brand-700 tabular">{formatRupiah(lastMonth.rescuedValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Kerugian food waste</span>
              <span className="font-semibold text-rose-600 tabular">{formatRupiah(lastMonth.wasteLoss)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Batch diberi aksi</span>
              <span className="font-semibold text-ink tabular">
                {rescuedCount} / {batches.length}
              </span>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="text-[12px] font-semibold text-slate-700 mb-2">Komposisi status stok</div>
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
              {(['kritis', 'waspada', 'dwell-alert', 'aman'] as StockStatus[]).map((k) =>
                counts[k] > 0 ? (
                  <div
                    key={k}
                    className={STATUS_STYLES[k].bar}
                    style={{ width: `${(counts[k] / Math.max(1, batches.length)) * 100}%` }}
                    title={`${STATUS_STYLES[k].label}: ${counts[k]}`}
                  />
                ) : null
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              {(['kritis', 'waspada', 'dwell-alert', 'aman'] as StockStatus[]).map((k) => (
                <div key={k} className="flex items-center gap-2 text-slate-600">
                  <span className={cn('w-2 h-2 rounded-full', STATUS_STYLES[k].dot)} />
                  {STATUS_STYLES[k].label}
                  <span className="ml-auto font-semibold text-ink tabular">{counts[k]}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => onNavigateToTab('reports')} className="btn-secondary mt-5 w-full">
            Buka laporan SAK-EMKM
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </motion.div>
  );
};
