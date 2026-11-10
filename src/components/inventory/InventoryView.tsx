import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Plus,
  Search,
  Download,
  Trash2,
  Edit3,
  Sparkles,
  PackagePlus,
  ArrowUpDown,
  Boxes,
  Clock
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah, formatDateIndo, getBatchStatus, getDwellDays } from '../../utils/formatters';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dwellFilterOnly, setDwellFilterOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'expiry' | 'dwell' | 'stock'>('expiry');

  // Filter
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

  // Sort
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

  // Export CSV
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
    <div className="space-y-5 pb-12 w-full">
      {/* 1. Header Card - Compact, Point-by-point, Zero Fluff */}
      <div className="bg-white rounded-[28px] p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Sistem FEFO &amp; Dwell-Time Tracker
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#5b58eb] border border-indigo-100 whitespace-nowrap">
              Rotasi Otomatis
            </span>
          </div>
          {/* Point-by-point concise description */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium flex-wrap">
            <span>• Rotasi stok FEFO</span>
            <span>• Prioritas kedaluwarsa terdekat</span>
            <span>• Monitoring dwell-time &gt; 21 hari</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenManualModal(null)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#5b58eb] hover:bg-[#4a47d4] text-white shadow-md shadow-[#5b58eb]/20 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Batch</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenOcrModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-[#5b58eb] border border-indigo-100 transition-colors whitespace-nowrap"
          >
            <Camera className="w-4 h-4 text-[#5b58eb]" />
            <span>AI Scan Tanggal</span>
          </motion.button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Unified Toolbar (Search, Filter, Sort) */}
      <div className="bg-white rounded-[24px] p-4 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari produk atau kode batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium outline-none focus:ring-2 focus:ring-[#5b58eb]/20 focus:border-[#5b58eb]"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Category Select */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium outline-none focus:border-[#5b58eb]"
          >
            <option value="all">Semua Kategori</option>
            <option value="Roti & Kue">Roti &amp; Kue</option>
            <option value="Keripik & Camilan">Keripik &amp; Camilan</option>
            <option value="Frozen Food">Frozen Food</option>
            <option value="Minuman">Minuman</option>
            <option value="Sambal & Bumbu">Sambal &amp; Bumbu</option>
          </select>

          {/* Dwell-Time Filter Toggle */}
          <button
            onClick={() => setDwellFilterOnly(!dwellFilterOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap ${dwellFilterOnly
                ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Dwell &gt; 21 Hari</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium outline-none"
            >
              <option value="expiry">Urut: FEFO Terdekat</option>
              <option value="dwell">Urut: Dwell Terlama</option>
              <option value="stock">Urut: Stok Terbanyak</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. FEFO Table Card */}
      <div className="bg-white rounded-[28px] shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#f8fafc] text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-4 px-4 min-w-[220px]">Produk &amp; Batch</th>
                <th className="py-4 px-3 min-w-[110px]">Kategori</th>
                <th className="py-4 px-3 min-w-[110px]">Tgl Masuk</th>
                <th className="py-4 px-3 min-w-[110px]">Kedaluwarsa</th>
                <th className="py-4 px-3 min-w-[110px] text-center">Stok</th>
                <th className="py-4 px-3 min-w-[95px]">HPP</th>
                <th className="py-4 px-3 min-w-[95px]">Harga Jual</th>
                <th className="py-4 px-3 min-w-[125px]">Status FEFO</th>
                <th className="py-4 px-4 min-w-[130px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-slate-600">Tidak ada batch yang cocok dengan filter.</p>
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
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Product Name & Batch */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {batch.productName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] text-[#5b58eb] font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 whitespace-nowrap inline-block">
                            {batch.batchCode}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                            {batch.location}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {batch.category}
                      </td>

                      {/* Entry Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-slate-800 font-medium whitespace-nowrap">
                          {formatDateIndo(batch.entryDate)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                          Dwell: {statusInfo.dwellDays} hari
                        </div>
                      </td>

                      {/* Expiration Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900 whitespace-nowrap">
                          {formatDateIndo(batch.expiryDate)}
                        </div>
                        <div className={`text-[10px] font-bold mt-0.5 whitespace-nowrap ${statusInfo.daysLeft <= 3 ? 'text-rose-600' : 'text-amber-600'
                          }`}>
                          {statusInfo.daysLeft <= 0 ? 'Hari Ini!' : `H-${statusInfo.daysLeft} hari`}
                        </div>
                      </td>

                      {/* Stock with quick +/- */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/60 whitespace-nowrap">
                          <button
                            onClick={() => onUpdateStock(batch.id, -1)}
                            className="w-5 h-5 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 shadow-2xs"
                          >
                            -
                          </button>
                          <span className="font-bold px-1.5 text-slate-900 whitespace-nowrap">
                            {batch.stockQty} {batch.unit}
                          </span>
                          <button
                            onClick={() => onUpdateStock(batch.id, 1)}
                            className="w-5 h-5 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* HPP */}
                      <td className="py-3.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                        {formatRupiah(batch.unitHpp)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isDiscounted ? (
                          <div>
                            <span className="line-through text-[10px] text-slate-400 block font-medium whitespace-nowrap">
                              {formatRupiah(batch.sellingPrice)}
                            </span>
                            <span className="font-extrabold text-[#5b58eb] whitespace-nowrap">
                              {formatRupiah(batch.discountPrice!)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-900 whitespace-nowrap">
                            {formatRupiah(batch.sellingPrice)}
                          </span>
                        )}
                      </td>

                      {/* FEFO Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border whitespace-nowrap ${statusInfo.status === 'kritis'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : statusInfo.status === 'waspada'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : statusInfo.status === 'dwell-alert'
                                  ? 'bg-orange-50 text-orange-800 border-orange-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions - Grouped in clean pill container */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 p-1 bg-slate-50 border border-slate-200/70 rounded-xl whitespace-nowrap">
                          <button
                            onClick={() => onTriggerDiscount(batch)}
                            title="Diskon BEP"
                            className="p-1.5 rounded-lg bg-white text-[#5b58eb] hover:bg-indigo-50 border border-indigo-100 shadow-2xs transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onTriggerBundle(batch)}
                            title="Bundling Promo"
                            className="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenManualModal(batch)}
                            title="Edit Batch"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteBatch(batch.id)}
                            title="Hapus Batch"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
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
