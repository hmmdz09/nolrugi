import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Zap,
  ScanLine,
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
  description: string;
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
  const [location, setLocation] = useState<string>('Etalase Depan');

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
      description: 'Stempel tanggal tinta inkjet hitam pada kemasan klip roti.',
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
      description: 'Laser emboss pada tutup botol kaca sambal kedap udara.',
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
      description: 'Heat sealer emboss di bagian atas aluminium foil foil pouch.',
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
      description: 'Stiker label beku thermo-transfer tahan air.',
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

  // Simulate OCR scanning progress
  const runScanSimulation = (preset: SamplePreset) => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          // Autofill form
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
    }, 180);
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
      colors: ['#10b981', '#14b8a6', '#06b6d4'],
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
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/30">
              <Camera className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Simulasi AI Smart Scan Tanggal (OCR Engine)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                  Vision AI v2
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pindai stempel tanggal kedaluwarsa & kode batch otomatis tanpa ketik manual.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Sample preset selector buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                Pilih Contoh Sampel Kemasan Produk UMKM:
              </span>
              <span className="text-[11px] text-slate-500">Klik untuk simulasi kamera</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetIndex(idx)}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs ${selectedPresetIndex === idx
                      ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 ring-1 ring-teal-500 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
                  </div>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                    {preset.category}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scanner Viewport Simulation */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 h-52 sm:h-56 flex flex-col justify-between p-4 shadow-inner">
            {/* Background texture imitating packaging */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${currentPreset.imageBg} opacity-80 mix-blend-multiply transition-colors duration-500`}
            />

            {/* Corner Reticles */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400 z-10" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400 z-10" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400 z-10" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400 z-10" />

            {/* Laser scanning beam */}
            {isScanning && (
              <div
                ref={laserRef}
                className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] z-20 pointer-events-none"
              />
            )}

            {/* Simulated Printed Expiry Stamp in Center */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <div className="bg-black/75 backdrop-blur-md px-4 py-2.5 rounded-xl border border-emerald-500/40 text-center shadow-lg">
                <span className="text-[10px] text-emerald-400 tracking-widest font-mono uppercase block">
                  {isScanning ? 'AI VISION: MENGANALISIS TEKS KEMASAN...' : 'OCR BERHASIL TERVERIFIKASI'}
                </span>
                <span className="font-mono text-base sm:text-lg font-black text-white tracking-widest block mt-0.5">
                  {currentPreset.detectedText}
                </span>
              </div>
            </div>

            {/* Viewport Bottom Overlay Status */}
            <div className="relative z-10 flex items-center justify-between text-xs text-white/90">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isScanning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                    }`}
                />
                <span className="font-medium text-[11px]">
                  {isScanning ? `Memindai ${scanProgress}%` : `Tingkat Akurasi: ${currentPreset.confidence}%`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => runScanSimulation(currentPreset)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] backdrop-blur-sm transition-colors text-white"
              >
                <RefreshCw className="w-3 h-3" /> Pindai Ulang
              </button>
            </div>
          </div>

          {/* Extracted Data Auto-Fill Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Data Hasil Ekstraksi AI (Dapat Diedit):
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Auto-fill Siap
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Kategori Pangan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Roti & Kue">Roti & Kue</option>
                  <option value="Keripik & Camilan">Keripik & Camilan</option>
                  <option value="Frozen Food">Frozen Food</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Sambal & Bumbu">Sambal & Bumbu</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Kode Batch (Terdeteksi)
                </label>
                <input
                  type="text"
                  required
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tanggal Kedaluwarsa (EXP)
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-emerald-400 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-800 dark:text-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Jumlah Masuk
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    HPP Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    required
                    value={unitHpp}
                    onChange={(e) => setUnitHpp(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Harga Jual Normal (Rp)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isScanning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-md shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
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

