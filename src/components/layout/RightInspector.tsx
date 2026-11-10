import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  PackagePlus, 
  TrendingUp, 
  Boxes,
  ArrowRight
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah, formatDateIndo, getBatchStatus, getDaysRemaining } from '../../utils/formatters';

interface RightInspectorProps {
  selectedBatch: InventoryBatch | null;
  onTriggerDiscount: (batch: InventoryBatch) => void;
  onTriggerBundle: (batch: InventoryBatch) => void;
  onSearchChange?: (val: string) => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  selectedBatch,
  onTriggerDiscount,
  onTriggerBundle,
}) => {
  if (!selectedBatch) return null;

  const daysLeft = getDaysRemaining(selectedBatch.expiryDate);
  const statusInfo = getBatchStatus(
    selectedBatch.expiryDate,
    selectedBatch.entryDate,
    selectedBatch.packagingType
  );
  const tiedCapital = selectedBatch.unitHpp * selectedBatch.stockQty;

  const participants = [
    { name: 'Siti Rahma', role: 'Dapur', bg: 'bg-indigo-100 text-indigo-700' },
    { name: 'Budi Santoso', role: 'QC', bg: 'bg-pink-100 text-pink-700' },
    { name: 'Dewi Lestari', role: 'Kasir', bg: 'bg-amber-100 text-amber-700' },
    { name: 'Rian Pratama', role: 'Gudang', bg: 'bg-teal-100 text-teal-700' },
  ];

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 h-[calc(100vh-2rem)] sticky top-4 z-20">
      <div className="flex flex-col h-full justify-between p-6 bg-white rounded-[32px] shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-white overflow-y-auto">
        <div className="space-y-6">
          {/* Top Search & Avatar Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-2 rounded-full text-xs bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#5b58eb]"
              />
            </div>

            {/* Profile Avatar Pill matching image */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5b58eb] to-[#9390ff] p-0.5 shadow-md shadow-[#5b58eb]/20 flex items-center justify-center shrink-0 cursor-pointer">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[11px] font-black text-[#5b58eb]">
                DB
              </div>
            </div>
          </div>

          {/* Selected Batch Details */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5b58eb] uppercase tracking-wider">
                Batch Terpilih
              </span>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mt-2 leading-tight">
              {selectedBatch.productName}
            </h3>

            <p className="text-xs text-slate-400 mt-1 font-medium">
              {selectedBatch.batchCode} • {selectedBatch.category}
            </p>
          </div>

          {/* Participants / Operational Team */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Tim Penanggung Jawab
            </div>
            <div className="flex items-center -space-x-2 overflow-hidden">
              {participants.map((p, i) => (
                <div
                  key={i}
                  title={`${p.name} (${p.role})`}
                  className={`inline-block h-8 w-8 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] font-bold ${p.bg}`}
                >
                  {p.name.split(' ').map((n) => n[0]).join('')}
                </div>
              ))}
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                +3
              </div>
            </div>
          </div>

          {/* 3 Detail Info Pills matching image */}
          <div className="space-y-3">
            {/* Pill 1: Expiry Date */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f0f4ff] border border-indigo-100/60">
              <div className="w-9 h-9 rounded-xl bg-[#5b58eb]/10 text-[#5b58eb] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-medium">
                  {formatDateIndo(selectedBatch.expiryDate)}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {daysLeft <= 0 ? 'Kedaluwarsa Hari Ini' : `Sisa ${daysLeft} Hari Lagi`}
                </div>
              </div>
            </div>

            {/* Pill 2: Duration / Dwell */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#fdf2f8] border border-pink-100/60">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-medium">
                  Stok: {selectedBatch.stockQty} {selectedBatch.unit}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Modal: {formatRupiah(tiedCapital)}
                </div>
              </div>
            </div>

            {/* Pill 3: Level & Status */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#fff7ed] border border-orange-100/60">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-medium">
                  Tingkat Urgensi
                </div>
                <div className="text-xs font-bold text-orange-700">
                  {statusInfo.label}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 space-y-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTriggerDiscount(selectedBatch)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#5b58eb] hover:bg-[#4a47d4] text-white text-xs font-bold shadow-lg shadow-[#5b58eb]/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Terapkan Diskon Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTriggerBundle(selectedBatch)}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <PackagePlus className="w-3.5 h-3.5 text-[#5b58eb]" />
            <span>Buat Paket Bundling</span>
          </motion.button>
        </div>
      </div>
    </aside>
  );
};
