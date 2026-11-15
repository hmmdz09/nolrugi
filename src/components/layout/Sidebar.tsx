import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Calculator,
  ShieldCheck,
  RotateCcw,
  X,
  Store,
  PlusCircle,
  ScanLine,
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { getBatchStatus } from '../../utils/formatters';
import { cn } from '../common/ui';

export type ActiveTab = 'dashboard' | 'inventory' | 'calculator' | 'add-batch' | 'scan-date';

export const NAV_ITEMS: Array<{ id: ActiveTab; label: string; short: string; icon: React.ElementType }> = [
  { id: 'dashboard', label: 'Ringkasan', short: 'Ringkasan', icon: LayoutDashboard },
  { id: 'inventory', label: 'Batch & FEFO', short: 'Batch', icon: Boxes },
  { id: 'calculator', label: 'Kalkulator HPP', short: 'HPP', icon: Calculator },
  { id: 'add-batch', label: 'Tambah Batch', short: 'Tambah', icon: PlusCircle },
  { id: 'scan-date', label: 'Scan Tanggal', short: 'Scan', icon: ScanLine },
];

export const BrandMark: React.FC<{ className?: string; onClick?: () => void }> = ({ className, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'group flex items-center gap-2.5 text-left transition-transform duration-300 active:scale-95 focus:outline-none',
      onClick && 'cursor-pointer',
      className
    )}
    title={onClick ? 'Putar ulang animasi intro NolRugi' : undefined}
  >
    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 flex items-center justify-center shadow-[0_6px_16px_-6px_rgb(139_111_224/0.9)] transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_10px_24px_-4px_rgba(139,111,224,0.8)]">
      <svg viewBox="0 0 32 32" className="w-6 h-6 transition-transform duration-300 group-hover:scale-105" aria-hidden>
        <circle cx="16" cy="16" r="9" fill="none" stroke="white" strokeWidth="2.6" />
        <circle cx="16" cy="16" r="3.2" fill="white" />
        <path d="M4 22C10 19 22 13 28 9" stroke="#8b6fe0" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M4 22C10 19 22 13 28 9" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
      </svg>
      <div className="absolute inset-0 rounded-2xl bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
    <div className="hidden sm:flex flex-col">
      <span className="text-[17px] font-bold tracking-[-0.02em] text-ink transition-colors duration-200 group-hover:text-brand-700">
        Nol<span className="text-brand-600 group-hover:text-brand-500 underline decoration-amber-400 decoration-2 underline-offset-2 transition-all">Rugi</span>
      </span>
    </div>
  </button>
);

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  batches: InventoryBatch[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onResetData: () => void;
  pdpConsent: boolean;
  onOpenOcrModal: () => void;
  onOpenManualModal: () => void;
  onReplayIntro?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  batches,
  isMobileOpen,
  onCloseMobile,
  onResetData,
  pdpConsent,
  onOpenOcrModal,
  onOpenManualModal,
  onReplayIntro,
}) => {
  const atRisk = batches.filter((b) => {
    const s = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType).status;
    return s === 'kritis' || s === 'waspada';
  }).length;

  const content = (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-2xl backdrop-saturate-[1.8] border-r border-white/70">
      <div className="h-14 px-4 flex items-center justify-between">
        <BrandMark onClick={onReplayIntro} />
        <button onClick={onCloseMobile} className="btn-icon lg:hidden" aria-label="Tutup menu">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Workspace */}
      <div className="px-3 pt-1">
        <div className="flex items-center gap-2.5 p-2 rounded-xl border border-white/70 bg-white/50 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 shadow-xs">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink truncate">Dapur Berkah Nusantara</div>
            <div className="text-[11px] text-slate-500">UMKM Pangan Kemasan</div>
          </div>
        </div>
      </div>

      <nav className="px-3 pt-3 flex-1" aria-label="Navigasi utama">
        <div className="eyebrow px-2.5 mb-2">Menu Utama</div>
        <ul className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative w-full flex items-center gap-2.5 h-10 px-3 rounded-full text-[13px] font-semibold transition-all duration-200 border',
                    active
                      ? 'bg-white text-ink shadow-[0_4px_14px_-6px_rgb(70_50_140/0.35)] border-white'
                      : 'bg-white/30 text-slate-700 hover:text-ink hover:bg-white/80 border-white/50 shadow-xs'
                  )}
                >
                  <Icon
                    className={cn('w-4 h-4', active ? 'text-ink' : 'text-slate-400 group-hover:text-slate-600')}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === 'inventory' && atRisk > 0 && (
                    <span className="num min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10.5px] font-bold inline-flex items-center justify-center">
                      {atRisk}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-2">
        <div className="w-full flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px] font-medium text-slate-600">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span className="flex-1 text-left">UU PDP 27/2022</span>
          <span
            className={cn(
              'chip h-5',
              pdpConsent ? 'bg-white text-brand-700 border-slate-200' : 'bg-white text-slate-500 border-slate-200'
            )}
          >
            {pdpConsent ? 'Aktif' : 'Lokal'}
          </span>
        </div>
      </div>

      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center">
            DB
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-ink truncate">Dewi Berkah</div>
            <div className="text-[11px] text-slate-500 truncate">Pemilik usaha</div>
          </div>
          <button onClick={onResetData} className="btn-icon w-8 h-8" title="Reset data demo" aria-label="Reset data demo">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40 animate-fade-in" onClick={onCloseMobile} />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-pop animate-scale-in">{content}</div>
        </div>
      )}
    </>
  );
};
