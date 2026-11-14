import React, { useState, useEffect, useRef } from 'react';
import { ScanLine, RefreshCw, Check } from 'lucide-react';
import { InventoryBatch, ProductCategory } from '../../types';
import { Field, Modal, cn } from '../common/ui';

interface OcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchScanned: (newBatch: Omit<InventoryBatch, 'id'>) => void;
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
  tint: string;
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
    id: 'p1', name: 'Roti Gandum Kismis Lembut', short: 'Roti gandum', category: 'Roti & Kue', unit: 'pcs',
    unitHpp: 8500, sellingPrice: 15000, packagingType: 'kemasan-berlabel',
    detectedText: 'EXP: {d} BATCH: RG-2026-X1', expiryOffset: 4, extractedBatch: 'RG-2026-X1', confidence: 98.7,
    tint: 'from-amber-900/80 to-stone-950',
  },
  {
    id: 'p2', name: 'Sambal Cumi Asin Cabe Ijo Jar 180g', short: 'Sambal cumi', category: 'Sambal & Bumbu', unit: 'jar',
    unitHpp: 21000, sellingPrice: 36000, packagingType: 'kemasan-berlabel',
    detectedText: 'BEST BEFORE: {d} LOT: SC-26-9A', expiryOffset: 10, extractedBatch: 'SC-2026-9A', confidence: 97.4,
    tint: 'from-brand-900/80 to-slate-950',
  },
  {
    id: 'p3', name: 'Keripik Tempe Sagu Renyah 250g', short: 'Keripik tempe', category: 'Keripik & Camilan', unit: 'pouch',
    unitHpp: 11000, sellingPrice: 20000, packagingType: 'kemasan-berlabel',
    detectedText: 'EXP {d} BATCH: KT-114', expiryOffset: 6, extractedBatch: 'KT-2026-114', confidence: 99.1,
    tint: 'from-yellow-900/80 to-stone-950',
  },
  {
    id: 'p4', name: 'Dimsum Ayam Jamur Frozen (Isi 12)', short: 'Dimsum frozen', category: 'Frozen Food', unit: 'pack',
    unitHpp: 22000, sellingPrice: 38000, packagingType: 'kemasan-berlabel',
    detectedText: 'EXP DATE: {d} -18C BATCH: DJ-202', expiryOffset: 3, extractedBatch: 'DJ-2026-202', confidence: 96.8,
    tint: 'from-slate-800/80 to-slate-950',
  },
];

export const OcrScannerModal: React.FC<OcrScannerModalProps> = ({ isOpen, onClose, onBatchScanned }) => {
  const [presetIdx, setPresetIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Roti & Kue');
  const [batchCode, setBatchCode] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [stockQty, setStockQty] = useState(25);
  const [unitHpp, setUnitHpp] = useState(9000);
  const [sellingPrice, setSellingPrice] = useState(16000);

  const preset = PRESETS[presetIdx];
  const presetExpiry = isoDate(preset.expiryOffset);
  const scanning = progress < 100;

  /** Simulated OCR: ticks progress, then autofills the form from the preset. */
  const runScan = (idx: number) => {
    window.clearInterval(timer.current);
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
    }, 180);
  };

  const rescan = (idx: number) => {
    setPresetIdx(idx);
    setProgress(0);
    runScan(idx);
  };

  useEffect(() => {
    runScan(0);
    return () => window.clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBatchScanned({
      productName,
      category,
      batchCode,
      entryDate: isoDate(0),
      expiryDate,
      stockQty,
      initialQty: stockQty,
      unit: preset.unit,
      unitHpp,
      sellingPrice,
      packagingType: preset.packagingType,
      location: 'Etalase Depan',
      notes: `Diinput via scan OCR (akurasi ${preset.confidence}%).`,
      isRescued: false,
    });
  };

  return (
    <Modal
      onClose={onClose}
      size="lg"
      icon={<ScanLine className="w-4 h-4" />}
      title="Scan tanggal kedaluwarsa"
      description="Simulasi OCR: pilih contoh kemasan, periksa hasil, lalu simpan."
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
            Batal
          </button>
          <button type="submit" form="ocr-form" disabled={scanning} className="btn-primary disabled:opacity-50">
            <Check className="w-4 h-4" />
            Simpan batch
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => rescan(i)}
              className={cn(
                'rounded-lg border px-3 py-2 text-left transition-all',
                i === presetIdx ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="text-[12px] font-semibold text-ink truncate">{p.short}</div>
              <div className="text-[11px] text-slate-500 truncate">{p.category}</div>
            </button>
          ))}
        </div>

        {/* Viewport */}
        <div className={cn('relative h-44 rounded-xl overflow-hidden bg-gradient-to-br', preset.tint)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
          {['top-3 left-3 border-t-2 border-l-2', 'top-3 right-3 border-t-2 border-r-2', 'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2'].map(
            (c) => (
              <span key={c} className={cn('absolute w-5 h-5 border-brand-400 rounded-[3px]', c)} />
            )
          )}
          {scanning && (
            <span
              className="absolute left-4 right-4 h-0.5 bg-brand-400 shadow-[0_0_14px_2px_rgba(52,211,153,0.7)] motion-safe:animate-[scan_1.4s_ease-in-out_infinite_alternate]"
              style={{ top: '12%' }}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="rounded-lg bg-black/60 backdrop-blur px-4 py-2.5 text-center ring-1 ring-white/10">
              <div className="font-mono text-[10px] tracking-widest text-brand-300 uppercase">
                {scanning ? 'Membaca teks…' : 'Teks terdeteksi'}
              </div>
              <div className="font-mono text-[13px] font-semibold text-white mt-0.5">
                {preset.detectedText.replace('{d}', ddmmyyyy(presetExpiry))}
              </div>
            </div>
          </div>
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-white/90 px-5">
            <span className="flex items-center gap-2">
              <span className={cn('w-1.5 h-1.5 rounded-full', scanning ? 'bg-amber-400 animate-pulse' : 'bg-brand-400')} />
              {scanning ? `Menganalisis ${progress}%` : `Akurasi ${preset.confidence}%`}
            </span>
            <button
              type="button"
              onClick={() => rescan(presetIdx)}
              className="flex items-center gap-1 h-6 px-2 rounded-md bg-white/15 hover:bg-white/25"
            >
              <RefreshCw className="w-3 h-3" /> Ulang
            </button>
          </div>
        </div>

        <form id="ocr-form" onSubmit={handleSubmit} className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity', scanning && 'opacity-50 pointer-events-none')}>
          <Field label="Nama produk" className="sm:col-span-2">
            <input required value={productName} onChange={(e) => setProductName(e.target.value)} className="input" />
          </Field>
          <Field label="Kode batch">
            <input required value={batchCode} onChange={(e) => setBatchCode(e.target.value)} className="input font-mono" />
          </Field>
          <Field label="Tanggal kedaluwarsa">
            <input type="date" required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="input" />
          </Field>
          <div className="grid grid-cols-3 gap-3 sm:col-span-2">
            <Field label={`Jumlah (${preset.unit})`}>
              <input type="number" min={1} required value={stockQty} onChange={(e) => setStockQty(Number(e.target.value))} className="input" />
            </Field>
            <Field label="HPP / unit">
              <input type="number" min={0} step={500} required value={unitHpp} onChange={(e) => setUnitHpp(Number(e.target.value))} className="input" />
            </Field>
            <Field label="Harga jual">
              <input type="number" min={0} step={500} required value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} className="input" />
            </Field>
          </div>
        </form>
      </div>
    </Modal>
  );
};
