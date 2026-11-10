import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ChevronDown, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  AlertOctagon, 
  Wallet, 
  HeartPulse, 
  PackagePlus, 
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah, getBatchStatus, getDaysRemaining } from '../../utils/formatters';
import { sampleHistoricalRevenue } from '../../data/initialData';
import { IsometricIllustration } from '../common/IsometricIllustration';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend 
} from 'recharts';

interface SkillalleyDashboardViewProps {
  batches: InventoryBatch[];
  selectedBatchId: string;
  onSelectBatchId: (id: string) => void;
  onTriggerDiscount: (batch: InventoryBatch) => void;
  onTriggerBundle: (batch: InventoryBatch) => void;
  onNavigateToTab: (tab: 'inventory' | 'calculator' | 'reports') => void;
}

export const SkillalleyDashboardView: React.FC<SkillalleyDashboardViewProps> = ({
  batches,
  selectedBatchId,
  onSelectBatchId,
  onTriggerDiscount,
  onTriggerBundle,
  onNavigateToTab,
}) => {
  const [filterRisk, setFilterRisk] = useState<'all' | 'kritis' | 'waspada' | 'dwell'>('all');

  // Core Metrics
  const potentialLoss14Days = batches.reduce((acc, b) => {
    const daysLeft = getDaysRemaining(b.expiryDate);
    if (daysLeft <= 14 && daysLeft >= 0) {
      return acc + (b.unitHpp * b.stockQty);
    }
    return acc;
  }, 0);

  const totalTiedCapital = batches.reduce(
    (acc, b) => acc + (b.unitHpp * b.stockQty),
    0
  );

  const totalPotentialRevenue = batches.reduce(
    (acc, b) => acc + ((b.discountPrice || b.sellingPrice) * b.stockQty),
    0
  );

  const grossMarginPct = totalPotentialRevenue > 0
    ? ((totalPotentialRevenue - totalTiedCapital) / totalPotentialRevenue) * 100
    : 0;

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
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 pb-12"
    >
      {/* 1. TOP HERO CARD (Exact matching Skillalley "Get Thousands Premium Courses") */}
      <motion.div
        whileHover={{ y: -2 }}
        className="relative bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden"
      >
        <div className="max-w-md z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Selamatkan Margin &amp; Cegah Food Waste.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Sistem cerdas FEFO &amp; kalkulator likuidasi otomatis untuk UMKM Pangan Kemasan. Dapatkan rekomendasi harga titik impas (BEP) tanpa risiko boncos kas. 🔥
          </p>
          <div className="mt-5 flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigateToTab('calculator')}
              className="px-5 py-2.5 rounded-xl bg-[#5b58eb] hover:bg-[#4a47d4] text-white text-xs font-bold shadow-md shadow-[#5b58eb]/25 transition-all flex items-center gap-2"
            >
              <span>Aktifkan AI Rescue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors"
            >
              Buka Radar FEFO
            </button>
          </div>
        </div>

        {/* 3D Isometric Stepped Illustration on the right */}
        <div className="shrink-0 flex items-center justify-center">
          <IsometricIllustration variant="hero" />
        </div>
      </motion.div>

      {/* 2. 4 CORE METRIC CARDS (Sleek minimalist style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-4 sm:p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Kerugian H-14</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-extrabold text-rose-600">
              <AnimatedCounter value={potentialLoss14Days} format="rupiah" />
            </div>
            <span className="text-[10px] text-slate-400">
              {criticalCount + warningCount} batch butuh tindakan
            </span>
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-4 sm:p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Modal di Stok</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#5b58eb] flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900">
              <AnimatedCounter value={totalTiedCapital} format="rupiah" />
            </div>
            <span className="text-[10px] text-slate-400">Kas modal persediaan</span>
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-4 sm:p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Gross Margin</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-extrabold text-emerald-600">
              <AnimatedCounter value={grossMarginPct} format="percent" />
            </div>
            <span className="text-[10px] text-slate-400">&gt; 30% Standar Sehat</span>
          </div>
        </motion.div>

        {/* Metric 4 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-4 sm:p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Skor FEFO</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <HeartPulse className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-extrabold text-amber-600">
              <AnimatedCounter value={fefoHealthScore} format="score" suffix="/100" />
            </div>
            <span className="text-[10px] text-slate-400">Rotasi Stok Terkendali</span>
          </div>
        </motion.div>
      </div>

      {/* 3. DATE SELECTOR & TIMELINE ITEMS (Exact matching Skillalley Monday 31 Aug list) */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-white space-y-6">
        {/* Header with Date dropdown & Filter pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2 cursor-pointer">
              <span>Senin, 10 Nov 2026</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#5b58eb]">
              Radar Kedaluwarsa
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-50 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setFilterRisk('all')}
              className={`px-3 py-1 rounded-xl transition-all ${
                filterRisk === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Semua ({batches.length})
            </button>
            <button
              onClick={() => setFilterRisk('kritis')}
              className={`px-3 py-1 rounded-xl transition-all ${
                filterRisk === 'kritis'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Kritis ({criticalCount})
            </button>
            <button
              onClick={() => setFilterRisk('waspada')}
              className={`px-3 py-1 rounded-xl transition-all ${
                filterRisk === 'waspada'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-600 hover:bg-amber-50'
              }`}
            >
              Waspada ({warningCount})
            </button>
            <button
              onClick={() => setFilterRisk('dwell')}
              className={`px-3 py-1 rounded-xl transition-all ${
                filterRisk === 'dwell'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-orange-600 hover:bg-orange-50'
              }`}
            >
              Dwell ({dwellCount})
            </button>
          </div>
        </div>

        {/* Timeline Items Grid matching Skillalley Cards */}
        <div className="space-y-4">
          {filteredAlertBatches.slice(0, 4).map((batch, index) => {
            const isSelected = selectedBatchId === batch.id;
            const daysLeft = getDaysRemaining(batch.expiryDate);
            const isHighlight = index === 1; // Highlight second card in bright violet #5b58eb like the image!

            // Urgency score calculation
            const healthScore = Math.max(
              40,
              Math.min(95, 100 - (daysLeft <= 2 ? 25 : daysLeft <= 5 ? 15 : 5))
            );

            return (
              <motion.div
                key={batch.id}
                layout
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => onSelectBatchId(batch.id)}
                className={`cursor-pointer rounded-[24px] p-5 sm:p-6 transition-all relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isHighlight
                    ? 'bg-[#5b58eb] text-white shadow-xl shadow-[#5b58eb]/30'
                    : isSelected
                    ? 'bg-[#f4f6fd] text-slate-900 border-2 border-[#5b58eb] shadow-sm'
                    : 'bg-[#f8fafc] hover:bg-[#f1f4f9] text-slate-900 border border-slate-100'
                }`}
              >
                {/* Left Accent Stripe */}
                <div
                  className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full ${
                    isHighlight
                      ? 'bg-white'
                      : daysLeft <= 3
                      ? 'bg-rose-500'
                      : daysLeft <= 7
                      ? 'bg-amber-500'
                      : 'bg-[#5b58eb]'
                  }`}
                />

                {/* Left 3D Icon & Content */}
                <div className="flex items-center gap-4 pl-3">
                  <IsometricIllustration
                    variant={isHighlight ? 'pillar' : 'small'}
                    className="w-12 h-12"
                  />

                  <div>
                    {/* Time & Urgency Pill */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold flex items-center gap-1 ${
                          isHighlight ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {daysLeft <= 0
                          ? 'Kedaluwarsa Hari Ini'
                          : `Masa Simpan Sisa ${daysLeft} Hari (${batch.batchCode})`}
                      </span>
                    </div>

                    {/* Title */}
                    <h4
                      className={`text-base font-extrabold mt-1 tracking-tight ${
                        isHighlight ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {batch.productName}
                    </h4>

                    {/* Subtitle */}
                    <p
                      className={`text-xs mt-0.5 max-w-md ${
                        isHighlight ? 'text-indigo-100' : 'text-slate-500'
                      }`}
                    >
                      Stok {batch.stockQty} {batch.unit} • HPP: {formatRupiah(batch.unitHpp)} • Normal: {formatRupiah(batch.sellingPrice)}
                    </p>
                  </div>
                </div>

                {/* Right: Circular Score & Arrow Button */}
                <div className="flex items-center gap-3 self-end sm:self-center pr-2">
                  {/* Circular Score Badge matching image */}
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                      isHighlight
                        ? 'border-white/40 text-white bg-white/10'
                        : 'border-slate-200 text-slate-700 bg-white shadow-2xs'
                    }`}
                  >
                    {healthScore}
                  </div>

                  <motion.button
                    whileHover={{ x: 3 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerDiscount(batch);
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      isHighlight
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-white hover:bg-[#5b58eb] text-slate-400 hover:text-white border border-slate-200 shadow-2xs'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. REVENUE & RESCUE TRENDS CHART (Skillalley soft card) */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Tren Omzet vs Margin Terselamatkan
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Efektivitas AI Markdown &amp; Paket Bundling terhadap Likuiditas Kas UMKM
            </p>
          </div>
          <div className="p-2 rounded-xl bg-indigo-50 text-[#5b58eb]">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sampleHistoricalRevenue}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorOmzetSkill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b58eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#5b58eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRescuedSkill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Jt`}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: any) => [formatRupiah(Number(val)), '']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  fontSize: '11px',
                  color: '#1e293b',
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
              <Area
                type="monotone"
                dataKey="omzet"
                name="Omzet Total"
                stroke="#5b58eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorOmzetSkill)"
              />
              <Area
                type="monotone"
                dataKey="rescuedValue"
                name="Kas Diselamatkan"
                stroke="#ec4899"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRescuedSkill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

