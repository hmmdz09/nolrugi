import React, { useState, useRef } from 'react';
import {
  PlusCircle,
  RefreshCw,
  Check,
  Upload,
  Trash2,
  ScanLine,
  TrendingUp,
  ShieldCheck,
  Coins,
  Package,
} from 'lucide-react';
import { InventoryBatch, ProductCategory } from '../../types';
import { formatRupiah, getDaysRemaining } from '../../utils/formatters';
import { Field, PageHeader, cn } from '../common/ui';

interface AddBatchViewProps {
  onSaveBatch: (batch: Omit<InventoryBatch, 'id' | 'initialQty' | 'isRescued'>) => void;
  onNavigateToScan: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Roti & Kue',
  'Keripik & Camilan',
  'Frozen Food',
  'Minuman',
  'Sambal & Bumbu',
];

const isoDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().split('T')[0];
};

export const AddBatchView: React.FC<AddBatchViewProps> = ({ onSaveBatch, onNavigateToScan }) => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Roti & Kue');
  const [batchCode, setBatchCode] = useState(() => `RO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [entryDate, setEntryDate] = useState(() => isoDate(0));
  const [expiryDate, setExpiryDate] = useState(() => isoDate(14));
  const [stockQty, setStockQty] = useState(30);
  const [unit, setUnit] = useState('pcs');
  const [unitHpp, setUnitHpp] = useState(10000);
  const [sellingPrice, setSellingPrice] = useState(18000);
  const [packagingType, setPackagingType] = useState<'kemasan-berlabel' | 'kemasan-polos'>('kemasan-berlabel');
  const [location, setLocation] = useState('Rak A');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const invalidDates = expiryDate < entryDate;
  const daysLeft = getDaysRemaining(expiryDate);
  const totalModal = stockQty * unitHpp;
  const totalOmzet = stockQty * sellingPrice;
  const totalUntung = Math.max(0, totalOmzet - totalModal);
  const marginPct = sellingPrice > 0 ? Math.max(0, ((sellingPrice - unitHpp) / sellingPrice) * 100) : 0;

  const generateBatchCode = () => {
    const prefix = category.substring(0, 2).toUpperCase();
    setBatchCode(`${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setImageUrl(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalidDates) return;
    onSaveBatch({
      productName: productName.trim() || 'Produk Baru',
      category,
      batchCode: batchCode.trim(),
      entryDate,
      expiryDate,
      stockQty,
      unit,
      unitHpp,
      sellingPrice,
      packagingType,
      location,
      notes,
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventori"
        title="Tambah Batch Baru"
        description="Input data batch produksi kemasan untuk pemantauan prioritas FEFO dan margin."
        actions={
          <button
            type="button"
            onClick={onNavigateToScan}
            className="btn-secondary text-[13px] font-semibold"
          >
            <ScanLine className="w-4 h-4 text-brand-600" />
            <span>Scan Tanggal (AI OCR)</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Form */}
        <div className="xl:col-span-8">
          <form onSubmit={handleSubmit} className="card p-6 sm:p-7 space-y-6 rise">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nama produk" className="sm:col-span-2">
                <input
                  required
                  autoFocus
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="mis. Keripik Singkong Balado 250g"
                  className="input text-[14px]"
                />
              </Field>

              {/* Upload Foto Produk */}
              <Field label="Foto produk (opsional)" className="sm:col-span-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {imageUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-slate-200">
                    <img
                      src={imageUrl}
                      alt={productName || 'Preview'}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-ink truncate">
                        {productName || 'Foto produk terpilih'}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Foto siap disimpan
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary h-8 px-3 text-[12px]"
                    >
                      Ganti
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="btn-ghost text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2.5 text-[12px]"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary h-9 px-3.5 inline-flex items-center gap-2 text-[13px] font-semibold bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm"
                      >
                        <Upload className="w-4 h-4 text-brand-600" />
                        <span>Upload Foto</span>
                      </button>
                      <span className="text-[11.5px] text-slate-400">atau</span>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Tempel link URL foto..."
                        className="input flex-1 min-w-[200px] text-[12px] h-9"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Format JPG, PNG, atau WebP (maks. 5MB). Otomatis memakai foto bawaan {category} jika kosong.
                    </p>
                  </div>
                )}
              </Field>

              <Field label="Kategori">
                <select
                  value={category}
                  onChange={(e) => {
                    const c = e.target.value as ProductCategory;
                    setCategory(c);
                    const prefix = c.substring(0, 2).toUpperCase();
                    setBatchCode(`${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
                  }}
                  className="input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Kode batch">
                <div className="flex gap-2">
                  <input
                    required
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    className="input font-mono"
                  />
                  <button
                    type="button"
                    onClick={generateBatchCode}
                    className="btn-secondary px-3"
                    title="Buat kode otomatis"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </Field>

              <Field label="Tanggal masuk">
                <input
                  type="date"
                  required
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Tanggal kedaluwarsa" hint={invalidDates ? undefined : 'Sesuai label kemasan'}>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={cn('input', invalidDates && 'border-rose-400 focus:border-rose-500')}
                />
                {invalidDates && (
                  <span className="block text-[11px] text-rose-600 mt-1">Harus setelah tanggal masuk</span>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-white/80">
              <Field label="Jumlah stok">
                <input
                  type="number"
                  min={1}
                  required
                  value={stockQty}
                  onChange={(e) => setStockQty(Math.max(1, Number(e.target.value)))}
                  className="input tabular font-semibold"
                />
              </Field>

              <Field label="Satuan">
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="pcs / pack"
                  className="input"
                />
              </Field>

              <Field label="HPP / unit (Rp)">
                <input
                  type="number"
                  min={0}
                  step={500}
                  required
                  value={unitHpp}
                  onChange={(e) => setUnitHpp(Math.max(0, Number(e.target.value)))}
                  className="input tabular font-semibold"
                />
              </Field>

              <Field label="Harga jual (Rp)">
                <input
                  type="number"
                  min={0}
                  step={500}
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
                  className="input tabular font-semibold"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-white/80">
              <Field label="Jenis kemasan" hint="Kemasan polos dipantau dwell-time > 21 hari">
                <div className="grid grid-cols-2 gap-1 p-0.5 rounded-2xl bg-white/70 border border-white/80">
                  {(['kemasan-berlabel', 'kemasan-polos'] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPackagingType(p)}
                      className={cn(
                        'h-8.5 rounded-xl text-[12.5px] font-semibold transition-all',
                        packagingType === p
                          ? 'bg-white text-ink shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      )}
                    >
                      {p === 'kemasan-berlabel' ? 'Berlabel' : 'Polos'}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Lokasi penyimpanan">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="mis. Rak Display A, Chiller 1"
                  className="input"
                />
              </Field>

              <Field label="Catatan batch" className="sm:col-span-2">
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan seputar batch (opsional)..."
                  className="input h-auto py-2.5 resize-none"
                />
              </Field>
            </div>

            <div className="pt-4 border-t border-white/80 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={invalidDates}
                className="btn-primary px-6"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Simpan Batch ke Inventori</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Projection Card */}
        <aside className="xl:col-span-4 space-y-5">
          <div className="card p-5 sm:p-6 rise space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-600" />
              <h2 className="text-[16px] font-bold text-ink">Ringkasan Batch</h2>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 space-y-2">
              <div className="text-[12px] text-slate-500 font-medium">Nama Produk Terdaftar:</div>
              <div className="text-[15px] font-bold text-ink">{productName || 'Nama produk kemasan'}</div>
              <div className="flex items-center gap-2 text-[12px] text-slate-600">
                <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {batchCode}
                </span>
                <span>·</span>
                <span>{category}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-white/80">
                <div className="text-[12px] text-slate-600 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Modal Terikat (HPP)
                </div>
                <div className="text-[14px] font-bold text-ink tabular">{formatRupiah(totalModal)}</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-white/80">
                <div className="text-[12px] text-slate-600 flex items-center gap-1.5 font-medium">
                  <Coins className="w-3.5 h-3.5 text-slate-500" /> Proyeksi Omzet
                </div>
                <div className="text-[14px] font-bold text-ink tabular">{formatRupiah(totalOmzet)}</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
                <div className="text-[12px] text-emerald-900 flex items-center gap-1.5 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Estimasi Untung
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-bold text-emerald-700 tabular">+{formatRupiah(totalUntung)}</div>
                  <div className="text-[11px] text-emerald-800 font-medium">Margin {marginPct.toFixed(1)}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-white/80">
                <div className="text-[12px] text-slate-600 font-medium">Masa Simpan FEFO</div>
                <div className="text-[13px] font-bold text-ink tabular">
                  {daysLeft <= 0 ? 'Hari ini' : `${daysLeft} hari lagi`}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 rise bg-gradient-to-br from-brand-500/10 via-brand-500/5 to-white/40 border border-brand-200/50">
            <div className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-brand-700" />
              <h3 className="text-[14px] font-bold text-ink">Ingin Input Lebih Cepat?</h3>
            </div>
            <p className="mt-1 text-[12px] text-slate-600 leading-relaxed">
              Gunakan fitur <strong>Scan Tanggal (AI OCR)</strong> untuk memindai otomatis stempel tanggal kedaluwarsa pada kemasan produk secara instan.
            </p>
            <button
              type="button"
              onClick={onNavigateToScan}
              className="btn-secondary w-full mt-3.5 text-[12.5px] font-semibold bg-white hover:bg-slate-50 border-brand-200 text-brand-800"
            >
              Buka Halaman Scan Tanggal
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
