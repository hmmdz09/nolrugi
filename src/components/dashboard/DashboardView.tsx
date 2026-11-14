import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Tag,
  PackagePlus,
  CalendarClock,
  MapPin,
  Boxes,
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
  v === 0 ? '0' : v >= 1_000_000 ? `${(v / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt` : `${Math.round(v / 1000)} rb`;

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
      label: 'Perlu tindakan',
      value: <>{actionable} <span className="text-[15px] text-slate-400">/ {batches.length} batch</span></>,
      sub: `${counts.kritis} kritis · ${counts.waspada} waspada`,
      accent: actionable > 0,
    },
    {
      label: 'Modal tertahan di stok',
      value: <AnimatedCounter value={tiedCapital} format="rupiah" />,
      sub: `${batches.length} batch aktif`,
    },
    {
      label: 'Margin kotor',
      value: <AnimatedCounter value={grossMargin} format="percent" />,
      sub: grossMargin >= 30 ? 'Sehat (≥ 30%)' : 'Di bawah 30%',
    },
    {
      label: 'Skor kesehatan FEFO',
      value: <AnimatedCounter value={fefoScore} format="score" suffix=" / 100" />,
      sub: fefoScore >= 75 ? 'Rotasi terkendali' : fefoScore >= 50 ? 'Perlu perhatian' : 'Rotasi berisiko',
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
          <p className="text-[13px] text-slate-500">{greeting()}, Dewi</p>
          <h1 className="mt-1 text-[22px] sm:text-[26px] font-semibold text-ink text-balance">
            {potentialLoss14 > 0 ? (
              <>
                <span className="num text-rose-700">{formatRupiah(potentialLoss14)}</span> berisiko terbuang dalam 14 hari
              </>
            ) : (
              'Semua stok dalam kondisi aman'
            )}
          </h1>
          {actionable > 0 && (
            <p className="mt-1.5 text-[13px] text-slate-500">
              Selamatkan {actionable} batch kritis dan waspada lewat diskon aman atau bundling.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigateToTab('inventory')} className="btn-secondary">
            Kelola batch
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPIs: one quiet strip, numbers carry the weight */}
      <section
        className="card grid grid-cols-2 xl:grid-cols-4 divide-slate-200 [&>*]:border-slate-200 overflow-hidden"
        aria-label="Indikator utama"
      >
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className={cn(
              'p-5 flex flex-col min-w-0',
              i % 2 === 1 && 'border-l',
              i >= 2 && 'border-t xl:border-t-0',
              i === 2 && 'xl:border-l'
            )}
          >
            <span className="text-[12.5px] text-slate-500 truncate">{k.label}</span>
            <div
              className={cn(
                'mt-2 num text-[20px] sm:text-[24px] font-semibold leading-none',
                k.accent ? 'text-rose-700' : 'text-ink'
              )}
            >
              {k.value}
            </div>
            <div className="mt-auto pt-3">
              {k.meter !== undefined ? (
                <div className="flex flex-col gap-1.5">
                  <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        k.meter >= 75 ? 'bg-brand-500' : k.meter >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      )}
                      style={{ width: `${k.meter}%` }}
                    />
                  </div>
                  <span className="text-[12px] text-slate-500 truncate">{k.sub}</span>
                </div>
              ) : (
                <p className="text-[12px] text-slate-500 truncate">{k.sub}</p>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Radar + detail */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card xl:col-span-2 flex flex-col min-w-0">
          <CardHeader
            title="Radar kedaluwarsa"
            description="Risiko tertinggi di atas. Pilih baris untuk detail."
          />
          <div className="px-5 pb-3 overflow-x-auto no-scrollbar">
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

          <div className="hidden md:flex items-center gap-4 px-5 h-8 border-t border-slate-100 bg-slate-50/60 text-[11.5px] text-slate-500">
            <span className="w-11 shrink-0">Sisa</span>
            <span className="flex-1">Produk</span>
            <span className="w-32 shrink-0">Stok tersisa</span>
            <span className="w-[84px] shrink-0">Status</span>
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
                      active ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                    )}
                  >
                    {active && <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-ink" />}

                    {/* Days-left tile */}
                    <div
                      className={cn(
                        'w-11 h-11 rounded-lg border border-slate-200 bg-white flex flex-col items-center justify-center shrink-0',
                        s.text
                      )}
                    >
                      <span className="num text-[15px] font-semibold leading-none">
                        {st.daysLeft <= 0 ? '0' : st.daysLeft}
                      </span>
                      <span className="text-[10px] mt-0.5 text-slate-500">hari</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[14px] font-medium text-ink truncate">{batch.productName}</span>
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

                    <div className="hidden md:flex w-32 shrink-0 items-center gap-2" title="Sisa stok">
                      <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-slate-400" style={{ width: `${shelfPct}%` }} />
                      </div>
                      <span className="num w-9 text-right text-[12px] text-slate-500">
                        {Math.round((batch.stockQty / Math.max(1, batch.initialQty)) * 100)}%
                      </span>
                    </div>

                    <div className="hidden sm:flex w-[84px] shrink-0">
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
              <h3 className="mt-3 text-[17px] font-semibold leading-snug text-ink">{selected.batch.productName}</h3>
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
                <dt className="text-slate-500 text-[12px]">HPP / unit</dt>
                <dd className="mt-1 font-semibold text-ink tabular">{formatRupiah(selected.batch.unitHpp)}</dd>
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

            <div className="mx-5 mb-4 flex items-baseline justify-between rounded-lg bg-rose-50/60 border border-rose-100 px-3 py-2.5">
              <span className="text-[12.5px] text-rose-800">Rugi jika tidak terjual</span>
              <span className="num text-[15px] font-semibold text-rose-700">
                {formatRupiah(selected.batch.unitHpp * selected.batch.stockQty)}
              </span>
            </div>
            <div className="p-5 pt-0 grid grid-cols-2 gap-2">
              <button onClick={() => onTriggerDiscount(selected.batch)} className="btn-primary">
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
                  <span className="w-2 h-2 rounded-full bg-ink" /> Omzet
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-500" /> Terselamatkan
                </span>
              </div>
            }
          />
          <div className="h-64 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleHistoricalRevenue} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gOmzet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a1a17" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#1a1a17" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRescue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#437c5d" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#437c5d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#ecebe7" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(m: string) => m.split(' ')[0]}
                  tick={{ fontSize: 11, fill: '#a3a19a' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => compactRp(v)}
                  tick={{ fontSize: 11, fill: '#a3a19a' }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [formatRupiah(Number(val)), name]}
                  cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }}
                  contentStyle={{
                    background: '#121210',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 12,
                    color: '#fff',
                    padding: '8px 12px',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                />
                <Area type="monotone" dataKey="omzet" name="Omzet" stroke="#1a1a17" strokeWidth={1.75} fill="url(#gOmzet)" />
                <Area
                  type="monotone"
                  dataKey="rescuedValue"
                  name="Terselamatkan"
                  stroke="#437c5d"
                  strokeWidth={1.75}
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
              <span className="num text-[24px] font-medium text-ink">{formatRupiah(lastMonth.omzet)}</span>
              <span className="chip h-5 bg-brand-50 text-brand-700 border-brand-200 tabular">
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
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[12px]">
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
