import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  CheckCircle2, 
  Percent, 
  AlertTriangle,
  Info,
  Sliders,
  ArrowRight,
  Zap,
  HelpCircle
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah, getBatchStatus, getDaysRemaining } from '../../utils/formatters';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { animateFadeInUp } from '../../utils/gsapAnimations';
import confetti from 'canvas-confetti';

interface HppCalculatorViewProps {
  batches: InventoryBatch[];
  onApplyClearancePrice: (batchId: string, newPrice: number) => void;
}

export const HppCalculatorView: React.FC<HppCalculatorViewProps> = ({
  batches,
  onApplyClearancePrice,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<'standard' | 'clearance'>('standard');

  // Standard HPP Form Inputs
  const [productName, setProductName] = useState<string>('Keripik Pisang Lumer Cokelat');
  const [rawMaterialCost, setRawMaterialCost] = useState<number>(350000); // Pisang kepok, cokelat leleh, minyak
  const [packagingCost, setPackagingCost] = useState<number>(75000); // Standing pouch zip lock + label foil
  const [laborCost, setLaborCost] = useState<number>(100000); // 2 jam pengerjaan batch
  const [overheadCost, setOverheadCost] = useState<number>(50000); // Gas LPG, listrik sealer
  const [batchOutputUnits, setBatchOutputUnits] = useState<number>(50); // Menghasilkan 50 pouch
  const [monthlyFixedCost, setMonthlyFixedCost] = useState<number>(2500000); // Sewa tempat & biaya tetap bulanan
  const [targetMarginPct, setTargetMarginPct] = useState<number>(35); // Slider 20% - 50%

  // Emergency Clearance Optimizer State
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');

  // GSAP Animation
  useEffect(() => {
    if (containerRef.current) {
      animateFadeInUp(containerRef.current.querySelectorAll('.gsap-card'), {
        stagger: 0.08,
        y: 20,
        duration: 0.6,
      });
    }
  }, [activeMode]);

  /**
   * BUSINESS LOGIC FORMULA CALCULATIONS:
   * 1. Total Biaya Variabel per Batch = Bahan Baku + Kemasan + Tenaga Kerja + Overhead
   * 2. HPP per Unit = Total Biaya Variabel per Batch / Total Unit Dihasilkan
   * 3. Rekomendasi Harga Jual Normal = HPP / (1 - (Target Margin % / 100))
   * 4. Laba Kotor per Unit = Harga Jual - HPP
   * 5. BEP Unit = Biaya Tetap Bulanan / Laba Kontribusi per Unit (Harga Jual - Biaya Variabel)
   * 6. BEP Rupiah = BEP Unit * Harga Jual Normal
   */
  const totalBatchVariableCost =
    rawMaterialCost + packagingCost + laborCost + overheadCost;
  const hppPerUnit =
    batchOutputUnits > 0 ? totalBatchVariableCost / batchOutputUnits : 0;
  const recommendedSellingPrice =
    targetMarginPct < 100
      ? Math.round(hppPerUnit / (1 - targetMarginPct / 100) / 500) * 500
      : hppPerUnit;
  const unitProfit = recommendedSellingPrice - hppPerUnit;
  const contributionMarginPerUnit = recommendedSellingPrice - hppPerUnit;
  const bepUnits =
    contributionMarginPerUnit > 0
      ? Math.ceil(monthlyFixedCost / contributionMarginPerUnit)
      : 0;
  const bepRupiah = bepUnits * recommendedSellingPrice;

  // Selected Batch for Clearance Optimizer
  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const daysLeft = selectedBatch ? getDaysRemaining(selectedBatch.expiryDate) : 0;
  const clearanceFloorPrice = selectedBatch ? selectedBatch.unitHpp : 0;
  const potentialLoss = selectedBatch ? selectedBatch.unitHpp * selectedBatch.stockQty : 0;

  // Progressive clearance calculation
  const clearanceSchedule = [
    {
      level: 'Waspada (H-7)',
      discountPct: 20,
      price: selectedBatch ? Math.max(clearanceFloorPrice, Math.round(selectedBatch.sellingPrice * 0.8 / 500) * 500) : 0,
      description: 'Menstimulasi penjualan cepat dengan margin laba tipis.',
    },
    {
      level: 'Kritis (H-3)',
      discountPct: 35,
      price: selectedBatch ? Math.max(clearanceFloorPrice, Math.round(selectedBatch.sellingPrice * 0.65 / 500) * 500) : 0,
      description: 'Diskon agresif untuk menyelamatkan likuiditas kas modal.',
    },
    {
      level: 'Emergency BEP (H-1/H-0)',
      discountPct: selectedBatch ? Math.round(((selectedBatch.sellingPrice - clearanceFloorPrice) / selectedBatch.sellingPrice) * 100) : 0,
      price: clearanceFloorPrice,
      description: 'Harga Modal Murni (HPP). Kas 100% kembali, 0% kerugian uang riil.',
    },
  ];

  const handleApplyClearance = (price: number) => {
    if (!selectedBatch) return;
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    onApplyClearancePrice(selectedBatch.id, price);
  };

  return (
    <div ref={containerRef} className="space-y-6 pb-12">
      {/* Top Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Kalkulator Penyelamat Margin UMKM
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              Formula HPP &amp; BEP Akurat
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hitung biaya pokok produksi secara menyeluruh dan tetapkan batas diskon terendah agar modal tidak boncos.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setActiveMode('standard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'standard'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Kalkulator HPP &amp; Margin</span>
          </button>
          <button
            onClick={() => setActiveMode('clearance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'clearance'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Emergency Clearance Optimizer</span>
          </button>
        </div>
      </div>

      {activeMode === 'standard' ? (
        /* MODE 1: Standard Interactive HPP & BEP Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Input Parameters */}
          <div className="gsap-card lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Komponen Biaya Produksi per Batch
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Masukkan seluruh alokasi biaya langsung dan tidak langsung untuk satu kali sesi masak/produksi.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <Coins className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Produk / Resep
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    1. Biaya Bahan Baku Pokok (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={rawMaterialCost}
                    onChange={(e) => setRawMaterialCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[10px] text-slate-400">Tepung, minyak, bumbu, telur, dll.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    2. Biaya Kemasan &amp; Label (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="2000"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[10px] text-slate-400">Pouch, toples jar, stiker label printing.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    3. Alokasi Upah Tenaga Kerja (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[10px] text-slate-400">Upah per batch pengerjaan atau juru masak.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    4. Overhead (Gas, Listrik, Air) (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="2000"
                    value={overheadCost}
                    onChange={(e) => setOverheadCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[10px] text-slate-400">Porsi pemakaian gas LPG &amp; listrik alat.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    5. Total Hasil Jadi per Batch (Pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={batchOutputUnits}
                    onChange={(e) => setBatchOutputUnits(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 font-black text-emerald-800 dark:text-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400">Jumlah kemasan utuh yang siap dijual.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    6. Biaya Tetap Usaha Bulanan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={monthlyFixedCost}
                    onChange={(e) => setMonthlyFixedCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[10px] text-slate-400">Sewa kios, gaji tetap, wifi untuk hitung BEP.</span>
                </div>
              </div>

              {/* Margin Slider (20% - 50%) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-teal-600" />
                    Target Margin Keuntungan Usaha:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full font-black text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700">
                    {targetMarginPct}% Target Margin
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={50}
                  step={1}
                  value={targetMarginPct}
                  onChange={(e) => setTargetMarginPct(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>20% (Grosir / Reseller)</span>
                  <span>35% (Rekomendasi Ritel UMKM)</span>
                  <span>50% (Premium / Dapur Khusus)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Real-Time Auto-Calculated Outputs */}
          <div className="gsap-card lg:col-span-5 space-y-4">
            {/* Main Result Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs uppercase font-bold tracking-wider text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Hasil Kalkulasi Otomatis
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  Real-Time
                </span>
              </div>

              {/* HPP Satuan */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-xs text-slate-300">HPP per Pcs (Modal Dasar):</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                  <AnimatedCounter value={hppPerUnit} format="rupiah" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Total biaya produksi: {formatRupiah(totalBatchVariableCost)} untuk {batchOutputUnits} pcs
                </p>
              </div>

              {/* Rekomendasi Harga Jual Normal */}
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
                <div className="text-xs text-emerald-300 font-semibold flex items-center justify-between">
                  <span>Rekomendasi Harga Jual Normal:</span>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                    Margin {targetMarginPct}%
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 tracking-tight">
                  <AnimatedCounter value={recommendedSellingPrice} format="rupiah" />
                </div>
                <div className="text-xs text-emerald-200/90 mt-1 flex items-center justify-between">
                  <span>Laba Bersih per Unit:</span>
                  <strong className="text-white">+{formatRupiah(unitProfit)}</strong>
                </div>
              </div>

              {/* Titik Impas (BEP) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    BEP Unit (Titik Impas)
                  </span>
                  <span className="text-lg font-black text-amber-300 block mt-1">
                    {bepUnits.toLocaleString('id-ID')} Pcs
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Target jualan/bulan
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    BEP Omzet (Rupiah)
                  </span>
                  <span className="text-xs sm:text-sm font-black text-amber-300 block mt-1 truncate">
                    {formatRupiah(bepRupiah)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Omzet balik modal
                  </span>
                </div>
              </div>
            </div>

            {/* Educational Formula Explanation Callout */}
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                <div className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
                  <span className="font-bold">Rumus NolRugi:</span> Rekomendasi harga dihitung menggunakan formula mark-up berbasis margin: <br />
                  <code className="bg-teal-200/50 dark:bg-teal-900/60 px-1 py-0.5 rounded font-mono text-[11px]">
                    Harga = HPP ÷ (1 - Margin%)
                  </code>. Cara ini menjamin margin keuntungan riil sesuai harapan, berbeda dari markup sederhana yang sering membuat UMKM salah estimasi laba.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: Emergency Clearance Optimizer Mode */
        <div className="gsap-card bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Emergency Clearance Optimizer: Likuidasi Tanpa Boncos Kas
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-900/40">
                  Zero Cash Loss
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sistem menghitung batas diskon paling murah yang diizinkan agar penjual memperoleh kembali biaya pokok modal (HPP).
              </p>
            </div>

            {/* Batch Selector */}
            <div className="w-full sm:w-72">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Pilih Batch Kedaluwarsa dari Inventori:
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-rose-500"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.productName} ({b.batchCode}) • H-{getDaysRemaining(b.expiryDate)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedBatch && (
            <div className="space-y-6">
              {/* Target Batch Overview Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Harga Jual Normal</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatRupiah(selectedBatch.sellingPrice)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                    HPP Satuan (Batas Lantai)
                  </span>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {formatRupiah(clearanceFloorPrice)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold">
                    Sisa Waktu Simpan
                  </span>
                  <div className="text-base font-black text-amber-700 dark:text-amber-300 mt-0.5">
                    {daysLeft <= 0 ? 'Hari Ini' : `${daysLeft} Hari Lagi`}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold">
                    Potensi Rugi jika Dibuang
                  </span>
                  <div className="text-base font-black text-rose-700 dark:text-rose-300 mt-0.5">
                    {formatRupiah(potentialLoss)}
                  </div>
                </div>
              </div>

              {/* Clearance Optimization Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Matriks Rekomendasi Diskon Bertahap (Actionable Markdown Steps):
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {clearanceSchedule.map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex flex-col justify-between space-y-3 shadow-xs hover:border-teal-500 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {tier.level}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                            Diskon {tier.discountPct}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {tier.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400">Harga Jual Diskon:</div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(tier.price)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Laba/Pcs: <strong>+{formatRupiah(Math.max(0, tier.price - clearanceFloorPrice))}</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyClearance(tier.price)}
                          className="mt-3 w-full py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Terapkan Harga Ini</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

