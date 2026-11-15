import React, { useState, useRef } from 'react';
import { PlusCircle, Pencil, RefreshCw, Check, Upload, Trash2 } from 'lucide-react';
import { InventoryBatch, ProductCategory } from '../../types';
import { Field, Modal, cn } from '../common/ui';

interface ManualBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBatch: (batch: Omit<InventoryBatch, 'id'> | InventoryBatch) => void;
  initialBatch?: InventoryBatch | null;
}

const CATEGORIES: ProductCategory[] = ['Roti & Kue', 'Keripik & Camilan', 'Frozen Food', 'Minuman', 'Sambal & Bumbu'];

const isoDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().split('T')[0];
};

/** Parent mounts this with a `key`, so initial state always reflects the batch being edited. */
export const ManualBatchModal: React.FC<ManualBatchModalProps> = ({ isOpen, onClose, onSaveBatch, initialBatch }) => {
  const [productName, setProductName] = useState(initialBatch?.productName || '');
  const [category, setCategory] = useState<ProductCategory>(initialBatch?.category || 'Roti & Kue');
  const [batchCode, setBatchCode] = useState(initialBatch?.batchCode || `BATCH-${Date.now().toString().slice(-6)}`);
  const [entryDate, setEntryDate] = useState(initialBatch?.entryDate || isoDate(0));
  const [expiryDate, setExpiryDate] = useState(initialBatch?.expiryDate || isoDate(14));
  const [stockQty, setStockQty] = useState(initialBatch?.stockQty ?? 30);
  const [unit, setUnit] = useState(initialBatch?.unit || 'pcs');
  const [unitHpp, setUnitHpp] = useState(initialBatch?.unitHpp ?? 10000);
  const [sellingPrice, setSellingPrice] = useState(initialBatch?.sellingPrice ?? 18000);
  const [packagingType, setPackagingType] = useState<'kemasan-berlabel' | 'kemasan-polos'>(
    initialBatch?.packagingType || 'kemasan-berlabel'
  );
  const [location, setLocation] = useState(initialBatch?.location || 'Rak A');
  const [notes, setNotes] = useState(initialBatch?.notes || '');
  const [imageUrl, setImageUrl] = useState(initialBatch?.imageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const margin = sellingPrice > 0 ? ((sellingPrice - unitHpp) / sellingPrice) * 100 : 0;
  const invalidDates = expiryDate < entryDate;

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
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalidDates) return;
    const base = {
      productName: productName.trim(),
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
    };
    if (initialBatch) onSaveBatch({ ...initialBatch, ...base });
    else onSaveBatch({ ...base, initialQty: stockQty, isRescued: false });
  };

  return (
    <Modal
      onClose={onClose}
      size="lg"
      icon={initialBatch ? <Pencil className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
      title={initialBatch ? 'Edit batch' : 'Tambah batch baru'}
      description="Data batch digunakan untuk menghitung prioritas FEFO dan risiko kedaluwarsa."
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
            Batal
          </button>
          <button type="submit" form="batch-form" className="btn-primary" disabled={invalidDates}>
            <Check className="w-4 h-4" />
            {initialBatch ? 'Simpan perubahan' : 'Simpan batch'}
          </button>
        </>
      }
    >
      <form id="batch-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nama produk" className="sm:col-span-2">
            <input
              required
              autoFocus
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="mis. Keripik Singkong Balado 250g"
              className="input"
            />
          </Field>

          {/* Foto produk dengan tombol upload */}
          <Field label="Foto produk (opsional)" className="sm:col-span-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={handleFileUpload}
            />

            {imageUrl ? (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 border border-slate-200">
                <img
                  src={imageUrl}
                  alt={productName || 'Preview'}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold text-ink truncate">
                    {productName || 'Foto produk terpilih'}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Foto siap digunakan
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary h-8 px-2.5 text-[12px]"
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
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline ml-1">Hapus</span>
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
                  <span className="text-[11px] text-slate-400">atau</span>
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
            <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)} className="input">
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Kode batch">
            <div className="flex gap-2">
              <input required value={batchCode} onChange={(e) => setBatchCode(e.target.value)} className="input font-mono" />
              <button type="button" onClick={generateBatchCode} className="btn-secondary px-2.5" title="Buat kode otomatis" aria-label="Buat kode otomatis">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </Field>
          <Field label="Tanggal masuk">
            <input type="date" required value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="input" />
          </Field>
          <Field label="Tanggal kedaluwarsa" hint={invalidDates ? undefined : 'Sesuai label kemasan'}>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={cn('input', invalidDates && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10')}
            />
            {invalidDates && <span className="block text-[11px] text-rose-600 mt-1">Harus setelah tanggal masuk</span>}
          </Field>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-white/80">
          <Field label="Jumlah stok">
            <input type="number" min={0} required value={stockQty} onChange={(e) => setStockQty(Number(e.target.value))} className="input" />
          </Field>
          <Field label="Satuan">
            <input value={unit} onChange={(e) => setUnit(e.target.value)} className="input" />
          </Field>
          <Field label="HPP / unit (Rp)">
            <input type="number" min={0} step={500} required value={unitHpp} onChange={(e) => setUnitHpp(Number(e.target.value))} className="input" />
          </Field>
          <Field
            label="Harga jual (Rp)"
            hint={`Margin ${margin.toLocaleString('id-ID', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`}
          >
            <input type="number" min={0} step={500} required value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} className="input" />
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
                    'h-8 rounded-md text-[12px] font-semibold transition-all',
                    packagingType === p ? 'bg-white text-ink shadow-card' : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  {p === 'kemasan-berlabel' ? 'Berlabel' : 'Polos'}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Lokasi penyimpanan">
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="input" />
          </Field>
          <Field label="Catatan" className="sm:col-span-2">
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opsional"
              className="input h-auto py-2 resize-none"
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
};
