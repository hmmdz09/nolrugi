import React, { useEffect, useRef, useState } from 'react';
import { 
  AlertOctagon, 
  Wallet, 
  TrendingUp, 
  HeartPulse, 
  Sparkles, 
  Clock, 
  ArrowUpRight, 
  Tag, 
  PackagePlus, 
  Layers, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah, getBatchStatus, getDaysRemaining } from '../../utils/formatters';
import { sampleHistoricalRevenue } from '../../data/initialData';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { animateFadeInUp } from '../../utils/gsapAnimations';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend,
  BarChart,
  Bar
} from 'recharts';

interface DashboardViewProps {
  batches: InventoryBatch[];
  onTriggerDiscount: (batch: InventoryBatch) => void;
  onTriggerBundle: (batch: InventoryBatch) => void;
  onNavigateToTab: (tab: 'inventory' | 'calculator' | 'reports') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  batches,
  onTriggerDiscount,
  onTriggerBundle,
  onNavigateToTab,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filterRisk, setFilterRisk] = useState<'all' | 'kritis' | 'waspada' | 'dwell'>('all');

  // GSAP Entrance Animations
  useEffect(() => {
    if (containerRef.current) {
      animateFadeInUp(containerRef.current.querySelectorAll('.gsap-card'), {
        stagger: 0.08,
        y: 20,
        duration: 0.6,
      });
      animateFadeInUp(containerRef.current.querySelectorAll('.gsap-panel'), {
        delay: 0.25,
        stagger: 0.12,
        y: 25,
        duration: 0.7,
      });
    }
  }, []);

  // 1. Calculate Core Metrics
  // Estimasi Kerugian Tertahan: Total HPP of items expiring in <= 14 days
  const potentialLoss14Days = batches.reduce((acc, b) => {
    const daysLeft = getDaysRemaining(b.expiryDate);
    if (daysLeft <= 14 && daysLeft >= 0) {
      return acc + (b.unitHpp * b.stockQty);
    }
    return acc;
  }, 0);

  // Total Modal Terikat di Seluruh Stok
  const totalTiedCapital = batches.reduce(
    (acc, b) => acc + (b.unitHpp * b.stockQty),
    0
  );

  // Total Nilai Jual Potensial
  const totalPotentialRevenue = batches.reduce(
    (acc, b) => acc + ((b.discountPrice || b.sellingPrice) * b.stockQty),
    0
  );

  // Real-time Gross Margin
  const grossMarginPct = totalPotentialRevenue > 0
    ? ((totalPotentialRevenue - totalTiedCapital) / totalPotentialRevenue) * 100
    : 0;

  // Running Net Profit projection (assuming 12% operational overhead)
  const netProfitProjected = (totalPotentialRevenue - totalTiedCapital) * 0.88;

  // FEFO Health Score (0-100%)
  // Deduct penalty for critical items and dwell-time alerts
  const criticalCount = batches.filter(
    (b) => getBatchStatus(b.expiryDate, b.entryDate, b.packagingType).status === 'kritis'
  ).length;
  const warningCount = batches.filter(
    (b) => getBatchStatus(b.expiryDate, b.entryDate, b.packagingType).status === 'waspada'
  ).length;
  const dwellCount = batches.filter(
    (b) => getBatchStatus(b.expiryDate, b.entryDate, b.packagingType).status === 'dwell-alert'
  ).length;

  const fefoHealthScore = Math.max(
    20,
    Math.min(100, Math.round(100 - (criticalCount * 14) - (warningCount * 6) - (dwellCount * 4)))
  );

  // Filtered Alert List
  const filteredAlertBatches = batches.filter((b) => {
    const st = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType).status;
    if (filterRisk === 'kritis') return st === 'kritis';
    if (filterRisk === 'waspada') return st === 'waspada';
    if (filterRisk === 'dwell') return st === 'dwell-alert';
    return st === 'kritis' || st === 'waspada' || st === 'dwell-alert';
  });

  return (
    <div ref={containerRef} className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="gsap-card relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-teal-500/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-300 via-teal-500 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Margin & Waste Sentinel • Pantauan Real-Time</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Cegah Makanan Basi, Kunci Margin Maksimal UMKM
          </h1>
          <p className="mt-2 text-sm text-teal-100/80 leading-relaxed max-w-2xl">
            Sistem pengawasan cerdas FEFO (First-Expired, First-Out) mendeteksi risiko barang mendekati batas masa simpan, menghitung diskon titik impas (BEP), dan merekomendasikan bundling agar modal Anda tidak pernah hangus.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95"
            >
              <span>Buka Radar FEFO ({batches.length} Batch)</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToTab('calculator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all backdrop-blur-sm"
            >
              <span>Kalkulator HPP & Cuci Stok</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Estimasi Kerugian Tertahan */}
        <div className="gsap-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Kerugian Tertahan (H-14)
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              <AnimatedCounter value={potentialLoss14Days} format="rupiah" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>{criticalCount + warningCount} batch berisiko expired</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target Rescue:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Penyelamatan 100%</span>
          </div>
        </div>

        {/* Card 2: Total Modal Terikat di Stok */}
        <div className="gsap-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Modal Terikat di Stok
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              <AnimatedCounter value={totalTiedCapital} format="rupiah" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Dari {batches.reduce((a, b) => a + b.stockQty, 0)} unit kemasan siap jual
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Likuiditas Kas:</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">Perputaran Sehat</span>
          </div>
        </div>

        {/* Card 3: Real-Time Gross Margin & Net Profit */}
        <div className="gsap-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Gross Margin Berjalan
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              <AnimatedCounter value={grossMarginPct} format="percent" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>Proyeksi Net Profit:</span>
              <strong className="text-slate-700 dark:text-slate-200">
                {formatRupiah(netProfitProjected)}
              </strong>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Ambang Sehat:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">&gt; 30% Standar F&amp;B</span>
          </div>
        </div>

        {/* Card 4: Skor Kesehatan Inventori FEFO */}
        <div className="gsap-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Skor Kesehatan FEFO
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              <AnimatedCounter value={fefoHealthScore} format="score" suffix="/100" />
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-1000 ${
                  fefoHealthScore >= 80
                    ? 'bg-emerald-500'
                    : fefoHealthScore >= 60
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${fefoHealthScore}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Status Rotasi:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {fefoHealthScore >= 80 ? 'Optimal' : 'Perlu Tindakan Cuci Stok'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Waste Risk Alert Panel & Sales/Waste Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Interactive Waste Risk Alert Panel */}
        <div className="gsap-panel lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header with Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Radar Risiko Kedaluwarsa &amp; Dwell-Time
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-900/40">
                    Live FEFO
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daftar batch yang membutuhkan tindakan penyelamatan harga segera.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto text-xs font-semibold">
                <button
                  onClick={() => setFilterRisk('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterRisk === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Semua ({batches.length})
                </button>
                <button
                  onClick={() => setFilterRisk('kritis')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterRisk === 'kritis'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  }`}
                >
                  Kritis ({criticalCount})
                </button>
                <button
                  onClick={() => setFilterRisk('waspada')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterRisk === 'waspada'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  }`}
                >
                  Waspada ({warningCount})
                </button>
                <button
                  onClick={() => setFilterRisk('dwell')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterRisk === 'dwell'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30'
                  }`}
                >
                  Dwell ({dwellCount})
                </button>
              </div>
            </div>

            {/* Alert List Cards */}
            <div className="mt-4 space-y-3">
              {filteredAlertBatches.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tidak ada batch dalam kategori risiko ini
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Seluruh persediaan Anda dalam kondisi rotasi FEFO aman.
                  </p>
                </div>
              ) : (
                filteredAlertBatches.map((batch) => {
                  const statusInfo = getBatchStatus(
                    batch.expiryDate,
                    batch.entryDate,
                    batch.packagingType
                  );
                  const potentialLoss = batch.unitHpp * batch.stockQty;

                  return (
                    <div
                      key={batch.id}
                      className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all shadow-2xs hover:shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Left: Product & Batch metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${statusInfo.badgeClass}`}>
                              {statusInfo.label}
                            </span>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {batch.batchCode}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {batch.category}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                            {batch.productName}
                          </h4>

                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            <span>Sisa: <strong>{batch.stockQty} {batch.unit}</strong></span>
                            <span>•</span>
                            <span>HPP: <strong>{formatRupiah(batch.unitHpp)}</strong></span>
                            <span>•</span>
                            <span>
                              Potensi Rugi:{' '}
                              <strong className="text-rose-600 dark:text-rose-400 font-black">
                                {formatRupiah(potentialLoss)}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Right: AI Action Triggers */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700/60">
                          <button
                            onClick={() => onTriggerDiscount(batch)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xs hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                            title="Hitung harga break-even teraman untuk likuidasi tanpa rugi kas"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Terapkan Diskon Bertahap</span>
                          </button>

                          <button
                            onClick={() => onTriggerBundle(batch)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors"
                            title="Buat paket hemat cross-selling dengan produk lain"
                          >
                            <PackagePlus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>Buat Paket Bundling</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Menampilkan {filteredAlertBatches.length} batch dari total {batches.length} batch</span>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>Kelola Seluruh Inventori FEFO</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Sales & Waste Trends Chart */}
        <div className="gsap-panel lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tren Penjualan &amp; Penyelamatan Margin
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Komparasi Omzet vs Nilai Produk yang Berhasil Diselamatkan
                </p>
              </div>
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            {/* Recharts Area Graph */}
            <div className="h-64 sm:h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={sampleHistoricalRevenue}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorOmzet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorRescued" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Jt`}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatRupiah(Number(val)), '']}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.92)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="omzet"
                    name="Omzet Total"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOmzet)"
                  />
                  <Area
                    type="monotone"
                    dataKey="rescuedValue"
                    name="Nilai Diselamatkan"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRescued)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Insights Callout */}
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  Efektivitas Penyelamatan AI:
                </span>{' '}
                Bulan ini NolRugi berhasil mengonversi <strong>Rp 8.250.000</strong> barang berisiko expired menjadi kas tunai riil. Kerugian limbah makanan ditekan hingga tinggal <strong>0.23%</strong> dari total omzet!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

