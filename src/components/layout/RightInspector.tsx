import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  PackagePlus, 
  ArrowRight
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { formatRupiah, formatDateIndo, getBatchStatus, getDaysRemaining } from '../../utils/formatters';

interface RightInspectorProps {
  selectedBatch: InventoryBatch | null;
  onTriggerDiscount: (batch: InventoryBatch) => void;
  onTriggerBundle: (batch: InventoryBatch) => void;
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
    { name: 'Budi S.', role: 'QC', bg: 'bg-pink-100 text-pink-700' },
    { name: 'Dewi L.', role: 'Kasir', bg: 'bg-amber-100 text-amber-700' },
  ];

  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-4 z-10">
      <div className="flex flex-col justify-between p-5 bg-white rounded-[28px] shadow-[0_4px_25px_-5px_rgba(0,0,0,0.06)] border border-slate-100 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="space-y-4">
          {/* Top Search & Profile Avatar */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari batch..."
                className="w-full pl-8 pr-2.5 py-1.5 rounded-full text-xs bg-slate-50 border border-slate-200/80 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#5b58eb]/20 focus:border-[#5b58eb]"
              />
            </div>

            <div className="w-8 h-8 rounded-full bg-[#5b58eb] p-0.5 shadow-sm shadow-[#5b58eb]/25 flex items-center justify-center shrink-0 cursor-pointer">
              <span className="text-[10px] font-black text-white">DB</span>
            </div>
          </div>

          {/* Selected Batch Header */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#5b58eb] uppercase tracking-wider">
                Batch Terpilih
              </span>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mt-1 leading-snug">
              {selectedBatch.productName}
            </h3>

            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {selectedBatch.batchCode} • {selectedBatch.category}
            </p>
          </div>

          {/* Operational PIC Team */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Penanggung Jawab
            </div>
            <div className="flex items-center -space-x-1.5">
              {participants.map((p, i) => (
                <div
                  key={i}
                  title={`${p.name} (${p.role})`}
                  className={`h-7 w-7 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] font-bold ${p.bg}`}
                >
                  {p.name.split(' ').map((n) => n[0]).join('')}
                </div>
              ))}
              <div className="h-7 w-7 rounded-full ring-2 ring-white bg-slate-800 text-white flex items-center justify-center text-[9px] font-bold">
                +2
              </div>
            </div>
          </div>

          {/* 3 Detail Info Pills */}
          <div className="space-y-2">
            {/* Pill 1: Expiry Date */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100/80">
              <div className="w-7 h-7 rounded-lg bg-[#5b58eb]/10 text-[#5b58eb] flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                  {formatDateIndo(selectedBatch.expiryDate)}
                </div>
                <div className="text-xs font-bold text-slate-900 whitespace-nowrap">
                  {daysLeft <= 0 ? 'Kedaluwarsa Hari Ini' : `Sisa ${daysLeft} Hari Lagi`}
                </div>
              </div>
            </div>

            {/* Pill 2: Stock & Capital */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                  Stok: {selectedBatch.stockQty} {selectedBatch.unit}
                </div>
                <div className="text-xs font-bold text-slate-900 whitespace-nowrap">
                  Modal: {formatRupiah(tiedCapital)}
                </div>
              </div>
            </div>

            {/* Pill 3: Urgency Level */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-orange-50/70 border border-orange-100/80">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                  Tingkat Urgensi
                </div>
                <div className="text-xs font-bold text-orange-700 whitespace-nowrap">
                  {statusInfo.label}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTriggerDiscount(selectedBatch)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#5b58eb] hover:bg-[#4a47d4] text-white text-xs font-bold shadow-md shadow-[#5b58eb]/25 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Terapkan Diskon</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTriggerBundle(selectedBatch)}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <PackagePlus className="w-3.5 h-3.5 text-[#5b58eb]" />
            <span>Paket Bundling</span>
          </motion.button>
        </div>
      </div>
    </aside>
  );
};
