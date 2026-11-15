import React, { useState, useEffect, useRef } from 'react';
import {
  ScanLine,
  RefreshCw,
  Check,
  Upload,
  Camera,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { InventoryBatch, ProductCategory } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { Field, PageHeader, cn } from '../common/ui';

interface ScanDateViewProps {
  onBatchScanned: (newBatch: Omit<InventoryBatch, 'id' | 'initialQty' | 'isRescued'>) => void;
}

interface SamplePreset {
  id: string;
  name: string;
  short: string;
  category: ProductCategory;
  unit: string;
  unitHpp: number;
  sellingPrice: number;
  packagingType: 'kemasan-berlabel' | 'kemasan-polos';
  detectedText: string;
  expiryOffset: number;
  extractedBatch: string;
  confidence: number;
  samplePhoto: string;
}

const isoDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().split('T')[0];
};

const ddmmyyyy = (iso: string) => iso.split('-').reverse().join('/');

const PRESETS: SamplePreset[] = [
  {
    id: 'p1',
    name: 'Roti Gandum Kismis Lembut',
    short: 'Roti Gandum',
    category: 'Roti & Kue',
    unit: 'pcs',
    unitHpp: 8500,
    sellingPrice: 15000,
    packagingType: 'kemasan-berlabel',
    detectedText: 'EXP: {d} BATCH: RG-2026-X1',
    expiryOffset: 4,
    extractedBatch: 'RG-2026-X1',
    confidence: 98.7,
    samplePhoto: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p2',
    name: 'Sambal Cumi Asin Cabe Ijo Jar 180g',
    short: 'Sambal Cumi',
    category: 'Sambal & Bumbu',
    unit: 'jar',
    unitHpp: 21000,
    sellingPrice: 36000,
    packagingType: 'kemasan-berlabel',
    detectedText: 'BEST BEFORE: {d} LOT: SC-26-9A',
    expiryOffset: 10,
    extractedBatch: 'SC-2026-9A',
    confidence: 97.4,
    samplePhoto: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p3',
    name: 'Keripik Tempe Sagu Renyah 250g',
    short: 'Keripik Tempe',
    category: 'Keripik & Camilan',
    unit: 'pouch',
    unitHpp: 11000,
    sellingPrice: 20000,
    packagingType: 'kemasan-berlabel',
    detectedText: 'EXP {d} BATCH: KT-114',
    expiryOffset: 6,
    extractedBatch: 'KT-2026-114',
    confidence: 99.1,
    samplePhoto: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p4',
    name: 'Dimsum Ayam Jamur Frozen (Isi 12)',
    short: 'Dimsum Frozen',
    category: 'Frozen Food',
    unit: 'pack',
    unitHpp: 22000,
    sellingPrice: 38000,
    packagingType: 'kemasan-berlabel',
    detectedText: 'EXP DATE: {d} -18C BATCH: DJ-202',
    expiryOffset: 3,
    extractedBatch: 'DJ-2026-202',
    confidence: 96.8,
    samplePhoto: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80',
  },
];

export const ScanDateView: React.FC<ScanDateViewProps> = ({ onBatchScanned }) => {
  const [presetIdx, setPresetIdx] = useState(0);
  const [progress, setProgress] = useState(100);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productName, setProductName] = useState(PRESETS[0].name);
  const [category, setCategory] = useState<ProductCategory>(PRESETS[0].category);
  const [batchCode, setBatchCode] = useState(PRESETS[0].extractedBatch);
  const [expiryDate, setExpiryDate] = useState(() => isoDate(PRESETS[0].expiryOffset));
  const [stockQty, setStockQty] = useState(25);
  const [unitHpp, setUnitHpp] = useState(PRESETS[0].unitHpp);
  const [sellingPrice, setSellingPrice] = useState(PRESETS[0].sellingPrice);

  const preset = PRESETS[presetIdx];
  const scanning = progress < 100;
  const currentPhoto = customPhoto || preset.samplePhoto;

  const totalModal = stockQty * unitHpp;
  const totalOmzet = stockQty * sellingPrice;
  const totalUntung = Math.max(0, totalOmzet - totalModal);

  const triggerScan = (idx: number, photoUrl?: string) => {
    window.clearInterval(timer.current);
    setProgress(0);
    let p = 0;
    timer.current = window.setInterval(() => {
      p += 20;
      setProgress(p);
      if (p < 100) return;
      window.clearInterval(timer.current);
      const x = PRESETS[idx];
      setProductName(x.name);
      setCategory(x.category);
      setBatchCode(x.extractedBatch);
      setExpiryDate(isoDate(x.expiryOffset));
      setUnitHpp(x.unitHpp);
      setSellingPrice(x.sellingPrice);
      if (photoUrl) setCustomPhoto(photoUrl);
    }, 160);
  };

  useEffect(() => {
    return () => window.clearInterval(timer.current);
  }, []);

  const handleSelectPreset = (idx: number) => {
    setPresetIdx(idx);
    setCustomPhoto(null);
    triggerScan(idx);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setCustomPhoto(ev.target.result);
        triggerScan(presetIdx, ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBatchScanned({
      productName: productName.trim() || preset.name,
      category,
      batchCode: batchCode.trim() || preset.extractedBatch,
      entryDate: isoDate(0),
      expiryDate,
      stockQty,
      unit: preset.unit,
      unitHpp,
      sellingPrice,
      packagingType: preset.packagingType,
      location: 'Rak Utama',
      notes: `Dipindai otomatis oleh NolRugi AI OCR (Akurasi ${preset.confidence}%)`,
      imageUrl: currentPhoto,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kecerdasan Buatan"
        title="Scan Tanggal Kedaluwarsa (AI OCR)"
        description="Pindai stempel tanggal kedaluwarsa & kode batch kemasan otomatis menggunakan Computer Vision."
        actions={
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-[13px] font-semibold"
            >
              <Upload className="w-4 h-4 text-brand-600" />
              <span>Unggah Foto Sendiri</span>
            </button>
            <button
              type="button"
              onClick={() => triggerScan(presetIdx)}
              disabled={scanning}
              className="btn-secondary text-[13px] font-semibold"
            >
              <RefreshCw className={cn('w-4 h-4 text-slate-600', scanning && 'animate-spin')} />
              <span>Pindai Ulang</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Viewfinder & Preset Selection */}
        <div className="xl:col-span-7 space-y-4">
          {/* Preset Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[12px] font-semibold text-slate-500 whitespace-nowrap pl-1">
              Sampel Kemasan:
            </span>
            {PRESETS.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold whitespace-nowrap transition-all border',
                  presetIdx === idx && !customPhoto
                    ? 'bg-white text-ink shadow-sm border-white'
                    : 'bg-white/40 text-slate-600 hover:bg-white/80 border-white/60'
                )}
              >
                {p.short}
              </button>
            ))}
          </div>

          {/* Camera Viewfinder Box */}
          <div className="card overflow-hidden p-3.5 rise relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center">
              <img
                src={currentPhoto}
                alt="Kemasan Pangan"
                className="w-full h-full object-cover opacity-90 transition-opacity"
              />

              {/* Viewfinder Target Reticle */}
              <div className="absolute inset-4 sm:inset-8 border border-white/30 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-brand-400 rounded-tl-lg" />
                  <span className="chip bg-slate-950/70 backdrop-blur-md text-white border-white/20 text-[11px] font-mono">
                    <Camera className="w-3 h-3 text-brand-400" />
                    <span>OCR ACTIVE</span>
                  </span>
                  <div className="w-6 h-6 border-t-2 border-r-2 border-brand-400 rounded-tr-lg" />
                </div>

                {/* Laser Sweep Animation */}
                {scanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_15px_#8b6fe0] animate-pulse"
                    style={{
                      top: `${progress}%`,
                      transition: 'top 0.16s ease-out',
                    }}
                  />
                )}

                {/* Detected Bounding Box */}
                {!scanning && (
                  <div className="mx-auto my-auto p-3 rounded-xl bg-slate-950/75 backdrop-blur-md border border-emerald-400/80 shadow-[0_0_20px_rgb(52_211_153/0.4)] text-center animate-scale-in">
                    <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Teks Terdeteksi ({preset.confidence}%)</span>
                    </div>
                    <div className="mt-1 font-mono text-[14px] font-bold text-white tracking-wide">
                      {preset.detectedText.replace('{d}', ddmmyyyy(isoDate(preset.expiryOffset)))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-end">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-brand-400 rounded-bl-lg" />
                  <span className="text-[10.5px] font-mono text-white/70 bg-slate-950/60 px-2 py-0.5 rounded-md">
                    FOV 4.2mm · f/1.8 · ISO 200
                  </span>
                  <div className="w-6 h-6 border-b-2 border-r-2 border-brand-400 rounded-br-lg" />
                </div>
              </div>

              {/* Progress bar overlay during scan */}
              {scanning && (
                <div className="absolute bottom-4 inset-x-8 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/20 text-center space-y-2">
                  <div className="flex justify-between text-[11px] font-semibold text-white">
                    <span>Menganalisis teks kemasan...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-400 to-emerald-400 transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Verified Extracted Data Form */}
        <div className="xl:col-span-5">
          <form onSubmit={handleSubmit} className="card p-5 sm:p-6 rise space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/80">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <h2 className="text-[16px] font-bold text-ink">Hasil Ekstraksi AI</h2>
              </div>
              <span className="chip bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold">
                Akurasi {preset.confidence}%
              </span>
            </div>

            <div className="space-y-4">
              <Field label="Nama produk">
                <input
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="input font-semibold"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Kategori">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="input text-[13px]"
                  >
                    {['Roti & Kue', 'Keripik & Camilan', 'Frozen Food', 'Minuman', 'Sambal & Bumbu'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Kode batch">
                  <input
                    required
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    className="input font-mono text-[13px]"
                  />
                </Field>
              </div>

              <Field label="Tanggal kedaluwarsa terdeteksi">
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="input font-semibold text-brand-800"
                />
              </Field>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/80">
                <Field label="Stok">
                  <input
                    type="number"
                    min={1}
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(Math.max(1, Number(e.target.value)))}
                    className="input tabular font-semibold"
                  />
                </Field>

                <Field label="HPP / unit">
                  <input
                    type="number"
                    min={0}
                    step={500}
                    required
                    value={unitHpp}
                    onChange={(e) => setUnitHpp(Math.max(0, Number(e.target.value)))}
                    className="input tabular font-semibold text-[13px]"
                  />
                </Field>

                <Field label="Harga jual">
                  <input
                    type="number"
                    min={0}
                    step={500}
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
                    className="input tabular font-semibold text-[13px]"
                  />
                </Field>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 space-y-2 text-[12.5px]">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Modal Terlindungi:
                  </span>
                  <span className="font-bold text-ink tabular">{formatRupiah(totalModal)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-800">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Proyeksi Untung:
                  </span>
                  <span className="font-bold text-emerald-700 tabular">+{formatRupiah(totalUntung)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={scanning}
                className="btn-primary w-full h-11 text-[13.5px] font-semibold"
              >
                <Check className="w-4 h-4" />
                <span>Simpan ke Antrean Inventori FEFO</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
