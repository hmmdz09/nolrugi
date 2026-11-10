import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Image as ImageIcon
} from 'lucide-react';
import { InventoryBatch, ProductCategory } from '../../types';
import { animateLaserScan } from '../../utils/gsapAnimations';
import confetti from 'canvas-confetti';

interface OcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchScanned: (newBatch: Omit<InventoryBatch, 'id'>) => void;
}

interface SamplePreset {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string;
  unitHpp: number;
  sellingPrice: number;
  packagingType: 'kemasan-berlabel' | 'kemasan-polos';
  detectedText: string;
  extractedExpiry: string;
  extractedBatch: string;
  confidence: number;
  imageBg: string;
}

export const OcrScannerModal: React.FC<OcrScannerModalProps> = ({
  isOpen,
  onClose,
  onBatchScanned,
}) => {
  if (!isOpen) return null;

  const laserRef = useRef<HTMLDivElement>(null);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanProgress, setScanProgress] = useState<number>(0);

  // Form states editable after OCR auto-fill
  const [productName, setProductName] = useState<string>('');
  const [category, setCategory] = useState<ProductCategory>('Roti & Kue');
  const [batchCode, setBatchCode] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [stockQty, setStockQty] = useState<number>(25);
  const [unit, setUnit] = useState<string>('pcs');
  const [unitHpp, setUnitHpp] = useState<number>(9000);
  const [sellingPrice, setSellingPrice] = useState<number>(16000);
  const [packagingType, setPackagingType] = useState<'kemasan-berlabel' | 'kemasan-polos'>('kemasan-berlabel');
  const [location] = useState<string>('Etalase Depan');

  const todayStr = new Date().toISOString().split('T')[0];

  const presets: SamplePreset[] = [
    {
      id: 'p1',
      name: 'Roti Gandum Kismis Lembut',
      category: 'Roti & Kue',
      unit: 'pcs',
      unitHpp: 8500,
      sellingPrice: 15000,
      packagingType: 'kemasan-berlabel',
      detectedText: 'EXP: 16/11/2026 BATCH: RG-2026-X1 MD 235610012',
      extractedExpiry: '2026-11-16',
      extractedBatch: 'RG-2026-X1',
      confidence: 98.7,
      imageBg: 'from-amber-700 via-orange-800 to-amber-900',
    },
    {
      id: 'p2',
      name: 'Sambal Cumi Asin Cabe Ijo Jar 180g',
      category: 'Sambal & Bumbu',
      unit: 'jar',
      unitHpp: 21000,
      sellingPrice: 36000,
      packagingType: 'kemasan-berlabel',
      detectedText: 'BEST BEFORE: 22/11/2026 LOT: SC-26-9A DINKES P-IRT',
      extractedExpiry: '2026-11-22',
      extractedBatch: 'SC-2026-9A',
      confidence: 97.4,
      imageBg: 'from-emerald-800 via-teal-900 to-slate-900',
    },
    {
      id: 'p3',
      name: 'Keripik Tempe Sagu Renyah 250g',
      category: 'Keripik & Camilan',
      unit: 'pouch',
      unitHpp: 11000,
      sellingPrice: 20000,
      packagingType: 'kemasan-berlabel',
      detectedText: 'EXP 18/11/2026 BATCH: KT-114 HALAL ID3211',
      extractedExpiry: '2026-11-18',
      extractedBatch: 'KT-2026-114',
      confidence: 99.1,
      imageBg: 'from-yellow-700 via-amber-800 to-stone-900',
    },
    {
      id: 'p4',
      name: 'Dimsum Ayam Jamur Frozen (Isi 12)',
      category: 'Frozen Food',
      unit: 'pack',
      unitHpp: 22000,
      sellingPrice: 38000,
      packagingType: 'kemasan-berlabel',
      detectedText: 'EXP DATE: 15/11/2026 SIMPAN BEKU -18C BATCH: DJ-202',
      extractedExpiry: '2026-11-15',
      extractedBatch: 'DJ-2026-202',
      confidence: 96.8,
      imageBg: 'from-cyan-900 via-blue-950 to-slate-900',
    },
  ];

  const currentPreset = presets[selectedPresetIndex];

  // Laser scanner animation
  useEffect(() => {
    let tween: gsap.core.Tween | undefined;
    if (laserRef.current && isScanning) {
      tween = animateLaserScan(laserRef.current);
    }
    return () => {
      tween?.kill();
    };
  }, [isScanning]);

  const runScanSimulation = (preset: SamplePreset) => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setProductName(preset.name);
          setCategory(preset.category);
          setBatchCode(preset.extractedBatch);
          setExpiryDate(preset.extractedExpiry);
          setUnit(preset.unit);
          setUnitHpp(preset.unitHpp);
          setSellingPrice(preset.sellingPrice);
          setPackagingType(preset.packagingType);
          return 100;
        }
        return prev + 25;
      });
    }, 160);
  };

  useEffect(() => {
    runScanSimulation(currentPreset);
  }, [selectedPresetIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#5b58eb', '#38bdf8', '#10b981'],
    });

    onBatchScanned({
      productName,
      category,
      batchCode,
      entryDate: todayStr,
      expiryDate,
      stockQty,
      initialQty: stockQty,
      unit,
      unitHpp,
      sellingPrice,
      packagingType,
      location,
      notes: `Diinput via AI Smart Scan OCR (Akurasi ${currentPreset.confidence}%).`,
      isRescued: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-[#5b58eb]">
              <Camera className="w-5 h-5 text-[#5b58eb]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Simulasi AI Scan Tanggal (OCR)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#5b58eb] border border-indigo-100">
                  Vision Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Pindai stempel tanggal kedaluwarsa &amp; batch otomatis tanpa ketik manual.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Preset buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#5b58eb]" />
                Pilih Contoh Sampel Kemasan:
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Simulasi foto produk</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetIndex(idx)}
                  className={`p-2.5 rounded-2xl text-left border transition-all text-xs ${
                    selectedPresetIndex === idx
                      ? 'border-[#5b58eb] bg-[#f8f9fe] shadow-2xs ring-1 ring-[#5b58eb]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold text-slate-900 truncate">
                    {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
                  </div>
                  <div className="text-[10px] text-[#5b58eb] font-semibold mt-0.5">
                    {preset.category}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scanner Viewport */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 h-44 flex flex-col justify-between p-3.5 shadow-inner">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${currentPreset.imageBg} opacity-75 mix-blend-multiply transition-colors duration-500`}
            />

            {/* Corner Reticles */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400 z-10" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-400 z-10" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-400 z-10" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400 z-10" />

            {/* Laser Line */}
            {isScanning && (
              <div
                ref={laserRef}
                className="absolute left-3 right-3 h-0.5 bg-cyan-400 shadow-[0_0_12px_#38bdf8] z-20 pointer-events-none"
              />
            )}

            {/* Scanned Text Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <div className="bg-black/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20 text-center shadow-lg">
                <span className="text-[9px] text-cyan-300 tracking-widest font-mono uppercase block">
                  {isScanning ? 'AI VISION SCANNING...' : 'OCR TERVERIFIKASI'}
                </span>
                <span className="font-mono text-xs sm:text-sm font-black text-white tracking-wider block mt-0.5">
                  {currentPreset.detectedText}
                </span>
              </div>
            </div>

            {/* Scanner status footer */}
            <div className="relative z-10 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                <span className="text-[11px] font-medium">
                  {isScanning ? `Menganalisis ${scanProgress}%` : `Akurasi OCR: ${currentPreset.confidence}%`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => runScanSimulation(currentPreset)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] text-white"
              >
                <RefreshCw className="w-3 h-3" /> Pindai Ulang
              </button>
            </div>
          </div>

          {/* Editable auto-fill form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 outline-none focus:border-[#5b58eb]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 outline-none focus:border-[#5b58eb]"
                >
                  <option value="Roti & Kue">Roti & Kue</option>
                  <option value="Keripik & Camilan">Keripik & Camilan</option>
                  <option value="Frozen Food">Frozen Food</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Sambal & Bumbu">Sambal & Bumbu</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Kode Batch
                </label>
                <input
                  type="text"
                  required
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-[#5b58eb] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Tanggal Kedaluwarsa
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 font-bold text-[#5b58eb] outline-none focus:border-[#5b58eb]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">HPP Satuan (Rp)</label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    required
                    value={unitHpp}
                    onChange={(e) => setUnitHpp(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isScanning}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5b58eb] hover:bg-[#4a47d4] shadow-md shadow-[#5b58eb]/25 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Simpan Batch ke FEFO Tracker</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
