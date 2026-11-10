import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Store, 
  RotateCcw, 
  Sparkles, 
  Menu
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { getBatchStatus } from '../../utils/formatters';

interface NavbarProps {
  batches: InventoryBatch[];
  onResetData: () => void;
  onToggleMobileMenu: () => void;
  pdpConsent: boolean;
  onNavigateToUUPDP: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  batches,
  onResetData,
  onToggleMobileMenu,
  pdpConsent,
  onNavigateToUUPDP,
}) => {
  // Count critical and warning items
  const alertStats = batches.reduce(
    (acc, b) => {
      const st = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType);
      if (st.status === 'kritis') acc.kritis += 1;
      if (st.status === 'waspada') acc.waspada += 1;
      if (st.status === 'dwell-alert') acc.dwell += 1;
      return acc;
    },
    { kritis: 0, waspada: 0, dwell: 0 }
  );

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Store Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  Dapur Berkah Nusantara
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">
                  UMKM Pangan Terverifikasi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Luminux 2.0 Business Canvas • Siap Audit SAK-EMKM
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Alert Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Radar Risiko Stok:
          </span>
          {alertStats.kritis > 0 && (
            <span className="px-2 py-0.5 rounded-md font-bold bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-900/40">
              {alertStats.kritis} Kritis (H-3)
            </span>
          )}
          {alertStats.waspada > 0 && (
            <span className="px-2 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-900/40">
              {alertStats.waspada} Waspada (H-7)
            </span>
          )}
          {alertStats.dwell > 0 && (
            <span className="px-2 py-0.5 rounded-md font-medium bg-orange-500/10 text-orange-600 border border-orange-200 dark:border-orange-900/40">
              {alertStats.dwell} Dwell &gt; 21h
            </span>
          )}
          {alertStats.kritis === 0 && alertStats.waspada === 0 && alertStats.dwell === 0 && (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Stok Aman Terkendali
            </span>
          )}
        </div>

        {/* Right: UU PDP badge, Reset Demo, and Actions */}
        <div className="flex items-center gap-2">
          {/* UU PDP Compliance Pill */}
          <button
            onClick={onNavigateToUUPDP}
            title="Kepatuhan UU Perlindungan Data Pribadi No. 27/2022"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60 hover:bg-teal-100"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">UU PDP:</span>
            <span className="font-semibold">{pdpConsent ? 'Enkripsi Aktif' : 'Lokal Saja'}</span>
          </button>

          {/* Reset Demo button */}
          <button
            onClick={onResetData}
            title="Reset data contoh ke pengaturan awal"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
