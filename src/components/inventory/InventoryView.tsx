import React, { useMemo, useState } from 'react';
import {
  ScanLine,
  Plus,
  Search,
  Download,
  Trash2,
  Pencil,
  Tag,
  PackagePlus,
  Boxes,
  Minus,
  X,
} from 'lucide-react';
import { InventoryBatch, StockStatus } from '../../types';
import { formatRupiah, formatDateIndo, getBatchStatus } from '../../utils/formatters';
import { ProductThumbnail } from '../../utils/productImages';
import { PageHeader, Segmented, StatusChip, STATUS_STYLES, cn } from '../common/ui';

interface InventoryViewProps {
  batches: InventoryBatch[];
  onOpenOcrModal: () => void;
  onOpenManualModal: (batchToEdit?: InventoryBatch | null) => void;
  onDeleteBatch: (id: string) => void;
  onUpdateStock: (id: string, delta: number) => void;
  onTriggerDiscount: (batch: InventoryBatch) => void;
  onTriggerBundle: (batch: InventoryBatch) => void;
}

type StatusFilter = 'all' | StockStatus;

const CATEGORIES = ['Roti & Kue', 'Keripik & Camilan', 'Frozen Food', 'Minuman', 'Sambal & Bumbu'];

export const InventoryView: React.FC<InventoryViewProps> = ({
  batches,
  onOpenOcrModal,
  onOpenManualModal,
  onDeleteBatch,
  onUpdateStock,
  onTriggerDiscount,
  onTriggerBundle,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<'expiry' | 'dwell' | 'stock'>('expiry');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const rows = useMemo(
    () => batches.map((b) => ({ b, st: getBatchStatus(b.expiryDate, b.entryDate, b.packagingType) })),
    [batches]
  );

  const counts = rows.reduce(
    (acc, r) => ({ ...acc, [r.st.status]: acc[r.st.status] + 1 }),
    { kritis: 0, waspada: 0, 'dwell-alert': 0, aman: 0 } as Record<StockStatus, number>
  );

  const q = search.trim().toLowerCase();
  const visible = rows
    .filter(
      ({ b, st }) =>
        (!q ||
          b.productName.toLowerCase().includes(q) ||
          b.batchCode.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)) &&
        (category === 'all' || b.category === category) &&
        (status === 'all' || st.status === status)
    )
    .sort((x, y) => {
      if (sortBy === 'dwell') return y.st.dwellDays - x.st.dwellDays;
      if (sortBy === 'stock') return y.b.stockQty - x.b.stockQty;
      return new Date(x.b.expiryDate).getTime() - new Date(y.b.expiryDate).getTime();
    });

  const totalValue = visible.reduce((a, { b }) => a + b.unitHpp * b.stockQty, 0);
  const hasFilters = !!q || category !== 'all' || status !== 'all';

  const handleExportCSV = () => {
    const headers = [
      'Kode Batch', 'Nama Produk', 'Kategori', 'Tgl Masuk', 'Tgl Kedaluwarsa', 'Sisa Hari',
      'Stok Sisa', 'Satuan', 'HPP Satuan (Rp)', 'Harga Jual (Rp)', 'Status FEFO', 'Lokasi',
    ];
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = visible.map(({ b, st }) =>
      [
        b.batchCode, b.productName, b.category, b.entryDate, b.expiryDate, st.daysLeft,
        b.stockQty, b.unit, b.unitHpp, b.discountPrice || b.sellingPrice, st.label, b.location,
      ].map(esc).join(',')
    );
    const blob = new Blob(['\uFEFF' + [headers.map(esc).join(','), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NolRugi_Inventori_FEFO_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventori"
        title="Batch & FEFO"
        description="Urut berdasarkan kedaluwarsa terdekat (FEFO) dan lama mengendap di rak."
        actions={
          <>
            <button onClick={() => onOpenManualModal(null)} className="btn-primary order-first sm:order-last w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Tambah batch
            </button>
            <button onClick={onOpenOcrModal} className="btn-secondary flex-1 sm:flex-none">
              <ScanLine className="w-4 h-4" />
              Scan tanggal
            </button>
            <button onClick={handleExportCSV} className="btn-secondary flex-1 sm:flex-none">
              <Download className="w-4 h-4" />
              Ekspor CSV
            </button>
          </>
        }
      />

      <div className="card rise overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 flex flex-col gap-3 border-b border-white/80">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 lg:max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input
                type="search"
                placeholder="Cari produk atau kode batch…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
                aria-label="Cari batch"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input sm:w-auto pr-8"
                aria-label="Filter kategori"
              >
                <option value="all">Semua kategori</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="input sm:w-auto pr-8"
                aria-label="Urutkan"
              >
                <option value="expiry">Exp. terdekat</option>
                <option value="dwell">Terlama di rak</option>
                <option value="stock">Stok terbanyak</option>
              </select>
              {hasFilters && (
                <button
                  onClick={() => {
                    setSearch('');
                    setCategory('all');
                    setStatus('all');
                  }}
                  className="btn-ghost h-9"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:[mask-image:none]">
              <div className="inline-flex pr-8 sm:pr-0">
              <Segmented<StatusFilter>
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'all', label: 'Semua', count: batches.length },
                  { value: 'kritis', label: 'Kritis', count: counts.kritis },
                  { value: 'waspada', label: 'Waspada', count: counts.waspada },
                  { value: 'dwell-alert', label: 'Dwell', count: counts['dwell-alert'] },
                  { value: 'aman', label: 'Aman', count: counts.aman },
                ]}
              />
              </div>
            </div>
            <p className="text-[12px] text-slate-500 tabular">
              {visible.length} batch · nilai modal <span className="font-semibold text-slate-700">{formatRupiah(totalValue)}</span>
            </p>
          </div>
        </div>

        {/* Desktop table */}
        <div className="relative hidden md:block overflow-x-auto">
          <table className="glass-table w-full text-left text-[13px]">
            <thead>
              <tr className="bg-white/55 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-white/80">
                <th className="py-3 pl-9 pr-3 font-semibold">Produk</th>
                <th className="py-3 px-3 font-semibold">Kedaluwarsa</th>
                <th className="hidden lg:table-cell py-3 px-3 font-semibold">Masuk</th>
                <th className="py-3 px-3 font-semibold text-center">Stok</th>
                <th className="py-3 px-3 font-semibold text-right">HPP</th>
                <th className="py-3 px-3 font-semibold text-right">Harga jual</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 pl-3 pr-5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/70">
              {visible.map(({ b, st }) => (
                <tr key={b.id} className="group hover:bg-white/55 transition-colors">
                  <td className="py-3 pl-5 pr-3 min-w-[260px] max-w-[360px]">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <ProductThumbnail batch={b} size="md" className="rounded-xl shadow-xs" />
                        <span
                          className={cn('absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white', STATUS_STYLES[st.status].dot)}
                          title={st.label}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-ink line-clamp-2 leading-snug" title={b.productName}>{b.productName}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-[12px] text-slate-500">
                          <span className="font-mono text-[11px] text-slate-600 font-semibold">{b.batchCode}</span>
                          <span className="text-slate-300">·</span>
                          <span className="truncate">{b.category}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-medium text-ink">{formatDateIndo(b.expiryDate)}</div>
                    <div className={cn('text-[12px] font-medium', STATUS_STYLES[st.status].text)}>
                      {st.daysLeft <= 0 ? 'Hari ini' : `${st.daysLeft} hari lagi`}
                    </div>
                  </td>
                  <td className="hidden lg:table-cell py-3 px-3 whitespace-nowrap">
                    <div className="text-slate-700">{formatDateIndo(b.entryDate)}</div>
                    <div className="text-[12px] text-slate-500">{st.dwellDays} hari di rak</div>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center rounded-2xl border border-white/80 bg-white">
                      <button
                        onClick={() => onUpdateStock(b.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-ink hover:bg-white/55 rounded-l-lg"
                        aria-label={`Kurangi stok ${b.productName}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="tabular min-w-[64px] px-1 text-[13px] font-semibold text-ink">
                        {b.stockQty} <span className="text-slate-500 font-normal">{b.unit}</span>
                      </span>
                      <button
                        onClick={() => onUpdateStock(b.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-ink hover:bg-white/55 rounded-r-lg"
                        aria-label={`Tambah stok ${b.productName}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap tabular text-slate-700">
                    {formatRupiah(b.unitHpp)}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap tabular">
                    {b.discountPrice ? (
                      <>
                        <div className="font-semibold text-brand-700">{formatRupiah(b.discountPrice)}</div>
                        <div className="text-[11px] text-slate-400 line-through">{formatRupiah(b.sellingPrice)}</div>
                      </>
                    ) : (
                      <span className="font-semibold text-ink">{formatRupiah(b.sellingPrice)}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusChip status={st.status} />
                  </td>
                  <td className="py-3 pl-3 pr-5 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-0.5 xl:opacity-70 xl:group-hover:opacity-100 xl:focus-within:opacity-100 transition-opacity">
                      <button onClick={() => onTriggerDiscount(b)} className="btn-icon w-8 h-8 text-slate-600" title="Diskon aman" aria-label="Diskon aman">
                        <Tag className="w-4 h-4" />
                      </button>
                      <button onClick={() => onTriggerBundle(b)} className="btn-icon w-8 h-8 text-slate-600" title="Bundling" aria-label="Bundling">
                        <PackagePlus className="w-4 h-4" />
                      </button>
                      <button onClick={() => onOpenManualModal(b)} className="btn-icon w-8 h-8 text-slate-600" title="Edit" aria-label="Edit batch">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <span className="w-px h-5 bg-slate-200 mx-1" aria-hidden />
                      {confirmDelete === b.id ? (
                        <button
                          onClick={() => {
                            onDeleteBatch(b.id);
                            setConfirmDelete(null);
                          }}
                          onBlur={() => setConfirmDelete(null)}
                          autoFocus
                          className="btn h-8 px-2.5 bg-rose-600 text-white hover:bg-rose-700 text-[12px]"
                        >
                          Hapus?
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(b.id)}
                          className="btn-icon w-8 h-8 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus"
                          aria-label="Hapus batch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="md:hidden divide-y divide-white/70">
          {visible.map(({ b, st }) => (
            <li key={b.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <ProductThumbnail batch={b} size="md" className="rounded-xl shadow-xs" />
                    <span
                      className={cn('absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white', STATUS_STYLES[st.status].dot)}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-ink text-[14px] line-clamp-2 leading-snug">{b.productName}</div>
                    <div className="mt-0.5 text-[12px] text-slate-500">
                      <span className="font-mono text-[11px] font-semibold">{b.batchCode}</span> · {b.category}
                    </div>
                  </div>
                </div>
                <StatusChip status={st.status} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
                <div>
                  <div className="text-slate-500">Kedaluwarsa</div>
                  <div className={cn('font-semibold', STATUS_STYLES[st.status].text)}>
                    {st.daysLeft <= 0 ? 'Hari ini' : `${st.daysLeft} hari`}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Stok</div>
                  <div className="font-semibold text-ink tabular">
                    {b.stockQty} {b.unit}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Harga</div>
                  <div className="font-semibold text-ink tabular">{formatRupiah(b.discountPrice || b.sellingPrice)}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => onTriggerDiscount(b)} className="btn-secondary flex-1">
                  <Tag className="w-3.5 h-3.5" /> Diskon
                </button>
                <button onClick={() => onTriggerBundle(b)} className="btn-secondary flex-1">
                  <PackagePlus className="w-3.5 h-3.5" /> Bundling
                </button>
                <button onClick={() => onOpenManualModal(b)} className="btn-icon w-9 h-9 border border-white/80" aria-label="Edit batch">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {visible.length === 0 && (
          <div className="py-16 flex flex-col items-center text-center px-4">
            <div className="w-12 h-12 rounded-[20px] bg-white/70 flex items-center justify-center mb-3">
              <Boxes className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-ink">Tidak ada batch yang cocok</p>
            <p className="text-[13px] text-slate-500 mt-1">Coba ubah kata kunci atau filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
