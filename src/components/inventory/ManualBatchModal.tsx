import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, PlusCircle, RefreshCw } from 'lucide-react';
import { InventoryBatch, ProductCategory } from '../../types';

interface ManualBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBatch: (batch: Omit<InventoryBatch, 'id'> | InventoryBatch) => void;
  initialBatch?: InventoryBatch | null;
}

export const ManualBatchModal: React.FC<ManualBatchModalProps> = ({
  isOpen,
  onClose,
  onSaveBatch,
  initialBatch,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultExpStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [productName, setProductName] = useState(initialBatch?.productName || '');
  const [category, setCategory] = useState<ProductCategory>(
    initialBatch?.category || 'Roti & Kue'
  );
  const [batchCode, setBatchCode] = useState(
    initialBatch?.batchCode || `BATCH-${Date.now().toString().slice(-6)}`
  );
  const [entryDate, setEntryDate] = useState(initialBatch?.entryDate || todayStr);
  const [expiryDate, setExpiryDate] = useState(initialBatch?.expiryDate || defaultExpStr);
  const [stockQty, setStockQty] = useState(initialBatch?.stockQty || 30);
  const [unit, setUnit] = useState(initialBatch?.unit || 'pcs');
  const [unitHpp, setUnitHpp] = useState(initialBatch?.unitHpp || 10000);
  const [sellingPrice, setSellingPrice] = useState(initialBatch?.sellingPrice || 18000);
  const [packagingType, setPackagingType] = useState<'kemasan-berlabel' | 'kemasan-polos'>(
    initialBatch?.packagingType || 'kemasan-berlabel'
  );
  const [location, setLocation] = useState(initialBatch?.location || 'Rak A');
  const [notes, setNotes] = useState(initialBatch?.notes || '');

  useEffect(() => {
    if (initialBatch) {
      setProductName(initialBatch.productName);
      setCategory(initialBatch.category);
      setBatchCode(initialBatch.batchCode);
      setEntryDate(initialBatch.entryDate);
      setExpiryDate(initialBatch.expiryDate);
      setStockQty(initialBatch.stockQty);
      setUnit(initialBatch.unit);
      setUnitHpp(initialBatch.unitHpp);
      setSellingPrice(initialBatch.sellingPrice);
      setPackagingType(initialBatch.packagingType);
      setLocation(initialBatch.location);
      setNotes(initialBatch.notes || '');
    }
  }, [initialBatch]);

  const generateBatchCode = () => {
    const prefix = category.substring(0, 2).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setBatchCode(`${prefix}-${new Date().getFullYear()}-${rand}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialBatch) {
      onSaveBatch({
        ...initialBatch,
        productName,
        category,
        batchCode,
        entryDate,
        expiryDate,
        stockQty,
        unit,
        unitHpp,
        sellingPrice,
        packagingType,
        location,
        notes,
      });
    } else {
      onSaveBatch({
        productName,
        category,
        batchCode,
        entryDate,
        expiryDate,
        stockQty,
        initialQty: stockQty,
        unit,
        unitHpp,
        sellingPrice,
        packagingType,
        location,
        notes,
        isRescued: false,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-[#5b58eb]">
              <PlusCircle className="w-5 h-5 text-[#5b58eb]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {initialBatch ? 'Edit Batch Inventori' : 'Tambah Batch Baru (FEFO)'}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-medium flex-wrap">
                <span>• Kode batch otomatis</span>
                <span>• Tanggal kedaluwarsa</span>
                <span>• HPP modal pokok</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[76vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nama Produk Kemasan
              </label>
              <input
                type="text"
                required
                placeholder="misal: Keripik Singkong Balado 200g"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 outline-none focus:border-[#5b58eb]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Kategori Pangan
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Kode Batch
                </label>
                <button
                  type="button"
                  onClick={generateBatchCode}
                  className="text-[10px] text-[#5b58eb] font-bold flex items-center gap-0.5 hover:underline"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Acak Kode
                </button>
              </div>
              <input
                type="text"
                required
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-[#5b58eb] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Tanggal Masuk / Masak
              </label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-600 mb-1">
                Tanggal Kedaluwarsa (EXP)
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 font-bold text-rose-700 outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Stok (Kuantitas)
                </label>
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
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Jenis Kemasan
              </label>
              <select
                value={packagingType}
                onChange={(e) =>
                  setPackagingType(e.target.value as 'kemasan-berlabel' | 'kemasan-polos')
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold outline-none"
              >
                <option value="kemasan-berlabel">Kemasan Berlabel (EXP Cetak)</option>
                <option value="kemasan-polos">Kemasan Polos (Pantau Dwell &gt;21 Hari)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                HPP Satuan (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={unitHpp}
                onChange={(e) => setUnitHpp(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Harga Jual Normal (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Lokasi Rak / Penyimpanan
              </label>
              <input
                type="text"
                placeholder="misal: Rak Showcase Depan A2, Freezer 1"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5b58eb] hover:bg-[#4a47d4] shadow-md shadow-[#5b58eb]/25 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{initialBatch ? 'Perbarui Batch' : 'Simpan Batch FEFO'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
