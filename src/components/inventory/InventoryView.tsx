import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Trash2, 
  Edit3, 
  Sparkles, 
  PackagePlus, 
  Layers, 
  ArrowUpDown,
  Boxes,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { InventoryBatch, ProductCategory } from '../../types';
import { formatRupiah, formatDateIndo, getBatchStatus, getDaysRemaining, getDwellDays } from '../../utils/formatters';
import { animateFadeInUp } from '../../utils/gsapAnimations';

interface InventoryViewProps {
  batches: InventoryBatch[];
  onOpenOcrModal: () => void;
  onOpenManualModal: (batchToEdit?: InventoryBatch | null) => void;
  onDeleteBatch: (id: string) => void;
  onUpdateStock: (id: string, delta: number) => void;
  onTriggerDiscount: (batch: InventoryBatch) => void;
  onTriggerBundle: (batch: InventoryBatch) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  batches,
  onOpenOcrModal,
  onOpenManualModal,
  onDeleteBatch,
  onUpdateStock,
  onTriggerDiscount,
  onTriggerBundle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dwellFilterOnly, setDwellFilterOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'expiry' | 'dwell' | 'stock'>('expiry');

  // GSAP Entrance
  useEffect(() => {
    if (containerRef.current) {
      animateFadeInUp(containerRef.current.querySelectorAll('.gsap-row'), {
        stagger: 0.05,
        y: 15,
        duration: 0.5,
      });
    }
  }, [batches, searchTerm, categoryFilter, dwellFilterOnly, sortBy]);

  // Filtering Logic
  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || b.category === categoryFilter;

    const dwellDays = getDwellDays(b.entryDate);
    const matchesDwell = !dwellFilterOnly || (b.packagingType === 'kemasan-polos' && dwellDays > 21);

    return matchesSearch && matchesCategory && matchesDwell;
  });

  // Sorting Logic (FEFO by default: nearest expiry first)
  const sortedBatches = [...filteredBatches].sort((a, b) => {
    if (sortBy === 'expiry') {
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    }
    if (sortBy === 'dwell') {
      return getDwellDays(b.entryDate) - getDwellDays(a.entryDate);
    }
    if (sortBy === 'stock') {
      return b.stockQty - a.stockQty;
    }
    return 0;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Kode Batch',
      'Nama Produk',
      'Kategori',
      'Tgl Masuk',
      'Tgl Kedaluwarsa',
      'Sisa Hari',
      'Stok Sisa',
      'Satuan',
      'HPP Satuan (Rp)',
      'Harga Jual (Rp)',
      'Status FEFO',
      'Kemasan',
      'Lokasi',
    ];

    const rows = sortedBatches.map((b) => {
      const st = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType);
      return [
        b.batchCode,
        `"${b.productName}"`,
        b.category,
        b.entryDate,
        b.expiryDate,
        st.daysLeft,
        b.stockQty,
        b.unit,
        b.unitHpp,
        b.discountPrice || b.sellingPrice,
        `"${st.label}"`,
        b.packagingType,
        `"${b.location}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NolRugi_Inventori_FEFO_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div ref={containerRef} className="space-y-6 pb-12">
      {/* Header Bar with Dual-Input Simulation CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Sistem FEFO &amp; Dwell-Time Tracker
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
              First-Expired First-Out
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pantau perputaran barang kedaluwarsa dan kemasan polos mengendap (&gt;21 hari di rak).
          </p>
        </div>

        {/* Dual Input Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* AI Scan OCR Button */}
          <button
            onClick={onOpenOcrModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-500 shadow-md shadow-teal-600/25 transition-all hover:scale-105 active:scale-95"
            title="Pindai stempel tanggal kedaluwarsa dengan AI OCR"
          >
            <Camera className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Simulasi AI Scan Tanggal</span>
          </button>

          {/* Manual Input Modal */}
          <button
            onClick={() => onOpenManualModal(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Input Manual Batch</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Unduh data inventori dalam format CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline">Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama produk, batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="Roti & Kue">Roti &amp; Kue</option>
            <option value="Keripik & Camilan">Keripik &amp; Camilan</option>
            <option value="Frozen Food">Frozen Food</option>
            <option value="Minuman">Minuman</option>
            <option value="Sambal & Bumbu">Sambal &amp; Bumbu</option>
          </select>

          {/* Dwell-Time Filter Button */}
          <button
            onClick={() => setDwellFilterOnly(!dwellFilterOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              dwellFilterOnly
                ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
            title="Tampilkan khusus makanan kemasan polos yang telah mengendap lebih dari 21 hari di rak"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Filter Dwell-Time &gt; 21 Hari</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none font-medium"
            >
              <option value="expiry">Urutkan: FEFO (Expired Terdekat)</option>
              <option value="dwell">Urutkan: Dwell-Time Terlama</option>
              <option value="stock">Urutkan: Stok Terbanyak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main FEFO Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Produk &amp; Batch</th>
                <th className="py-3.5 px-3">Kategori</th>
                <th className="py-3.5 px-3">Tgl Masuk</th>
                <th className="py-3.5 px-3">Kedaluwarsa (EXP)</th>
                <th className="py-3.5 px-3 text-center">Stok Sisa</th>
                <th className="py-3.5 px-3">HPP Satuan</th>
                <th className="py-3.5 px-3">Harga Jual</th>
                <th className="py-3.5 px-3">Status FEFO</th>
                <th className="py-3.5 px-4 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="font-bold">Tidak ada batch yang sesuai dengan filter.</p>
                  </td>
                </tr>
              ) : (
                sortedBatches.map((batch) => {
                  const statusInfo = getBatchStatus(
                    batch.expiryDate,
                    batch.entryDate,
                    batch.packagingType
                  );
                  const isDiscounted = !!batch.discountPrice;

                  return (
                    <tr
                      key={batch.id}
                      className="gsap-row hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Product Name & Batch */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {batch.productName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.2 rounded">
                            {batch.batchCode}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Lokasi: {batch.location}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                        {batch.category}
                      </td>

                      {/* Entry Date & Dwell Time */}
                      <td className="py-3.5 px-3">
                        <div className="text-slate-700 dark:text-slate-300">
                          {formatDateIndo(batch.entryDate)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Mengendap {statusInfo.dwellDays} hari
                        </div>
                      </td>

                      {/* Expiration Date */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatDateIndo(batch.expiryDate)}
                        </div>
                        <div className="text-[10px] font-semibold text-rose-500 mt-0.5">
                          {statusInfo.daysLeft <= 0 ? 'Hari Ini!' : `H-${statusInfo.daysLeft} hari`}
                        </div>
                      </td>

                      {/* Remaining Stock with quick + / - */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                          <button
                            onClick={() => onUpdateStock(batch.id, -1)}
                            className="w-5 h-5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200 transition-colors shadow-2xs"
                            title="Kurang 1 unit (terjual/retur)"
                          >
                            -
                          </button>
                          <span className="font-bold px-1.5 text-slate-900 dark:text-white">
                            {batch.stockQty} {batch.unit}
                          </span>
                          <button
                            onClick={() => onUpdateStock(batch.id, 1)}
                            className="w-5 h-5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200 transition-colors shadow-2xs"
                            title="Tambah 1 unit"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Unit HPP */}
                      <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {formatRupiah(batch.unitHpp)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-3">
                        {isDiscounted ? (
                          <div>
                            <span className="line-through text-[10px] text-slate-400 block">
                              {formatRupiah(batch.sellingPrice)}
                            </span>
                            <span className="font-black text-rose-600 dark:text-rose-400">
                              {formatRupiah(batch.discountPrice!)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatRupiah(batch.sellingPrice)}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* AI Action Discount Trigger */}
                          <button
                            onClick={() => onTriggerDiscount(batch)}
                            title="Terapkan Diskon Bertahap (BEP Clearance)"
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          </button>

                          {/* AI Action Bundle Trigger */}
                          <button
                            onClick={() => onTriggerBundle(batch)}
                            title="Buat Paket Bundling"
                            className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors border border-teal-200 dark:border-teal-800"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Batch */}
                          <button
                            onClick={() => onOpenManualModal(batch)}
                            title="Edit data batch"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Batch */}
                          <button
                            onClick={() => onDeleteBatch(batch.id)}
                            title="Hapus batch"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
