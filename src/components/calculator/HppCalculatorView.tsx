import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  ShieldAlert, 
  Sparkles, 
  Coins, 
  CheckCircle2, 
  Percent, 
  Info,
  ArrowRight
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah, getDaysRemaining } from '../../utils/formatters';
import { AnimatedCounter } from '../common/AnimatedCounter';
import confetti from 'canvas-confetti';

interface HppCalculatorViewProps {
  batches: InventoryBatch[];
  onApplyClearancePrice: (batchId: string, newPrice: number) => void;
}

export const HppCalculatorView: React.FC<HppCalculatorViewProps> = ({
  batches,
  onApplyClearancePrice,
}) => {
  const [activeMode, setActiveMode] = useState<'standard' | 'clearance'>('standard');

  // Standard HPP Form Inputs
  const [productName, setProductName] = useState<string>('Keripik Pisang Lumer Cokelat');
  const [rawMaterialCost, setRawMaterialCost] = useState<number>(350000);
  const [packagingCost, setPackagingCost] = useState<number>(75000);
  const [laborCost, setLaborCost] = useState<number>(100000);
  const [overheadCost, setOverheadCost] = useState<number>(50000);
  const [batchOutputUnits, setBatchOutputUnits] = useState<number>(50);
  const [monthlyFixedCost, setMonthlyFixedCost] = useState<number>(2500000);
  const [targetMarginPct, setTargetMarginPct] = useState<number>(35);

  // Clearance batch selector
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');

  // Math
  const totalBatchVariableCost = rawMaterialCost + packagingCost + laborCost + overheadCost;
  const hppPerUnit = batchOutputUnits > 0 ? totalBatchVariableCost / batchOutputUnits : 0;
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

  // Selected batch for clearance
  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const daysLeft = selectedBatch ? getDaysRemaining(selectedBatch.expiryDate) : 0;
  const clearanceFloorPrice = selectedBatch ? selectedBatch.unitHpp : 0;
  const potentialLoss = selectedBatch ? selectedBatch.unitHpp * selectedBatch.stockQty : 0;

  const clearanceSchedule = [
    {
      level: 'Waspada (H-7)',
      discountPct: 20,
      price: selectedBatch ? Math.max(clearanceFloorPrice, Math.round(selectedBatch.sellingPrice * 0.8 / 500) * 500) : 0,
      description: 'Menstimulasi penjualan cepat dengan margin laba tipis aman.',
    },
    {
      level: 'Kritis (H-3)',
      discountPct: 35,
      price: selectedBatch ? Math.max(clearanceFloorPrice, Math.round(selectedBatch.sellingPrice * 0.65 / 500) * 500) : 0,
      description: 'Diskon agresif untuk menyelamatkan likuiditas kas modal.',
    },
    {
      level: 'Emergency BEP (H-1)',
      discountPct: selectedBatch ? Math.round(((selectedBatch.sellingPrice - clearanceFloorPrice) / selectedBatch.sellingPrice) * 100) : 0,
      price: clearanceFloorPrice,
      description: 'Harga Modal Murni (HPP). Kas 100% kembali, 0% rugi kas riil.',
    },
  ];

  const handleApplyClearance = (price: number) => {
    if (!selectedBatch) return;
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#5b58eb', '#f43f5e', '#10b981'],
    });
    onApplyClearancePrice(selectedBatch.id, price);
  };

  return (
    <div className="space-y-5 pb-12 w-full">
      {/* 1. Header Card with Clean Segmented Control */}
      <div className="bg-white rounded-[28px] p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Kalkulator Penyelamat Margin UMKM
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#5b58eb] border border-indigo-100">
              Formula HPP &amp; BEP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Hitung biaya pokok produksi secara menyeluruh dan tetapkan batas diskon terendah agar modal tidak boncos.
          </p>
        </div>

        {/* Clean Pill Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/60 self-start md:self-auto">
          <button
            onClick={() => setActiveMode('standard')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'standard'
                ? 'bg-[#5b58eb] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Kalkulator HPP</span>
          </button>
          <button
            onClick={() => setActiveMode('clearance')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'clearance'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Clearance Optimizer</span>
          </button>
        </div>
      </div>

      {activeMode === 'standard' ? (
        /* MODE 1: Standard Interactive HPP & BEP */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-[28px] p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Komponen Biaya Produksi per Batch
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Alokasi biaya langsung dan tidak langsung untuk satu kali sesi masak/produksi.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-indigo-50 text-[#5b58eb]">
                <Coins className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nama Produk / Resep
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#5b58eb]/20 focus:border-[#5b58eb]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    1. Biaya Bahan Baku Pokok (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={rawMaterialCost}
                    onChange={(e) => setRawMaterialCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#5b58eb]/20 focus:border-[#5b58eb]"
                  />
                  <span className="text-[10px] text-slate-400">Tepung, minyak, bumbu, telur, dll.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    2. Biaya Kemasan &amp; Label (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="2000"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#5b58eb]/20 focus:border-[#5b58eb]"
                  />
                  <span className="text-[10px] text-slate-400">Pouch, toples jar, stiker label printing.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    3. Upah Tenaga Kerja per Batch (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#5b58eb]/20 focus:border-[#5b58eb]"
                  />
                  <span className="text-[10px] text-slate-400">Upah tukang masak atau pekerja.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    4. Overhead (Gas, Listrik, Air) (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="2000"
                    value={overheadCost}
                    onChange={(e) => setOverheadCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#5b58eb]/20 focus:border-[#5b58eb]"
                  />
                  <span className="text-[10px] text-slate-400">Porsi gas LPG &amp; listrik alat.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    5. Total Hasil Jadi per Batch (Pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={batchOutputUnits}
                    onChange={(e) => setBatchOutputUnits(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/40 font-extrabold text-[#5b58eb] outline-none focus:ring-2 focus:ring-[#5b58eb]"
                  />
                  <span className="text-[10px] text-slate-400">Jumlah kemasan siap jual.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    6. Biaya Tetap Bulanan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={monthlyFixedCost}
                    onChange={(e) => setMonthlyFixedCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#5b58eb]/20 focus:border-[#5b58eb]"
                  />
                  <span className="text-[10px] text-slate-400">Sewa kios, wifi, dsb untuk BEP.</span>
                </div>
              </div>

              {/* Target Margin Slider */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-[#5b58eb]" />
                    Target Margin Keuntungan Usaha:
                  </span>
                  <span className="px-3 py-0.5 rounded-full font-black text-xs bg-indigo-50 text-[#5b58eb] border border-indigo-100">
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
                  className="w-full accent-[#5b58eb] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>20% (Grosir/Reseller)</span>
                  <span>35% (Ritel UMKM Sehat)</span>
                  <span>50% (Dapur Premium)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Clean Output Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-[28px] p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#5b58eb] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Hasil Kalkulasi Real-Time
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Otomatis
                </span>
              </div>

              {/* HPP per Unit */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500">HPP per Pcs (Harga Pokok Modal):</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
                  <AnimatedCounter value={hppPerUnit} format="rupiah" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Total biaya produksi: {formatRupiah(totalBatchVariableCost)} ({batchOutputUnits} pcs)
                </p>
              </div>

              {/* Recommended Selling Price */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <div className="text-xs font-bold text-[#5b58eb] flex items-center justify-between">
                  <span>Rekomendasi Harga Jual Normal:</span>
                  <span className="text-[10px] bg-white text-[#5b58eb] px-2 py-0.5 rounded-full font-bold shadow-2xs">
                    Margin {targetMarginPct}%
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#5b58eb] mt-1 tracking-tight">
                  <AnimatedCounter value={recommendedSellingPrice} format="rupiah" />
                </div>
                <div className="text-xs text-slate-600 mt-1 flex items-center justify-between font-medium">
                  <span>Laba Bersih per Unit:</span>
                  <strong className="text-emerald-600 font-extrabold">+{formatRupiah(unitProfit)}</strong>
                </div>
              </div>

              {/* BEP Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    BEP Unit (Titik Impas)
                  </span>
                  <span className="text-lg font-black text-slate-900 block mt-1">
                    {bepUnits.toLocaleString('id-ID')} Pcs
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Target jualan/bulan
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    BEP Omzet (Rupiah)
                  </span>
                  <span className="text-sm font-black text-slate-900 block mt-1 truncate">
                    {formatRupiah(bepRupiah)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Omzet balik modal
                  </span>
                </div>
              </div>
            </div>

            {/* Explanatory callout */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#5b58eb] mt-0.5 shrink-0" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900">Formula NolRugi:</strong>{' '}
                <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px] text-[#5b58eb] font-bold border border-indigo-100">
                  Harga = HPP ÷ (1 - Margin%)
                </code>{' '}
                menjamin margin laba riil akurat tanpa terpotong diskon promosi.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: Emergency Clearance Optimizer */
        <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Emergency Clearance Optimizer: Likuidasi Tanpa Boncos Kas
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                  Zero Cash Loss
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Sistem menghitung batas diskon terendah yang diizinkan agar penjual memperoleh kembali seluruh biaya modal pokok (HPP).
              </p>
            </div>

            {/* Batch Selector */}
            <div className="w-full sm:w-72">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Pilih Batch dari Inventori:
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-[#5b58eb]"
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
              {/* Batch Overview 4 Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Harga Jual Normal</span>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {formatRupiah(selectedBatch.sellingPrice)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <span className="text-[10px] text-[#5b58eb] uppercase font-bold">HPP Satuan (Batas Lantai)</span>
                  <div className="text-base font-black text-[#5b58eb] mt-1">
                    {formatRupiah(clearanceFloorPrice)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <span className="text-[10px] text-amber-700 uppercase font-bold">Sisa Waktu Simpan</span>
                  <div className="text-base font-black text-amber-700 mt-1">
                    {daysLeft <= 0 ? 'Hari Ini' : `${daysLeft} Hari Lagi`}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
                  <span className="text-[10px] text-rose-700 uppercase font-bold">Potensi Rugi Musnah</span>
                  <div className="text-base font-black text-rose-700 mt-1">
                    {formatRupiah(potentialLoss)}
                  </div>
                </div>
              </div>

              {/* 3 Step Markdown Action Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800">
                  Opsi Skenario Diskon Bertahap (Actionable Markdown Steps):
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {clearanceSchedule.map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#5b58eb] transition-all flex flex-col justify-between space-y-3 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900">
                            {tier.level}
                          </span>
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                            Diskon {tier.discountPct}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-medium">
                          {tier.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <div className="text-[10px] text-slate-400 font-medium">Harga Jual Diskon:</div>
                        <div className="text-xl font-black text-[#5b58eb] mt-0.5">
                          {formatRupiah(tier.price)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Laba/Pcs: <strong className="text-emerald-600">+{formatRupiah(Math.max(0, tier.price - clearanceFloorPrice))}</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyClearance(tier.price)}
                          className="mt-3.5 w-full py-2.5 rounded-xl text-xs font-bold bg-[#5b58eb] hover:bg-[#4a47d4] text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-[#5b58eb]/20"
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
