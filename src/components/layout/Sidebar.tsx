import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Calculator,
  FileSpreadsheet,
  ShieldCheck,
  RotateCcw,
  X,
  Store,
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { getBatchStatus } from '../../utils/formatters';
import { cn } from '../common/ui';

export type ActiveTab = 'dashboard' | 'inventory' | 'calculator' | 'reports';

export const NAV_ITEMS: Array<{ id: ActiveTab; label: string; short: string; icon: React.ElementType }> = [
  { id: 'dashboard', label: 'Ringkasan', short: 'Ringkasan', icon: LayoutDashboard },
  { id: 'inventory', label: 'Batch & FEFO', short: 'Batch', icon: Boxes },
  { id: 'calculator', label: 'Kalkulator HPP', short: 'HPP', icon: Calculator },
  { id: 'reports', label: 'Laporan SAK-EMKM', short: 'Laporan', icon: FileSpreadsheet },
];

export const BrandMark: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center gap-2.5', className)}>
    <div className="w-8 h-8 rounded-lg bg-brand-950 flex items-center justify-center shadow-sm">
      <svg viewBox="0 0 32 32" className="w-5 h-5" aria-hidden>
        <path
          d="M8 21 14 15l3.5 3.5L24 11"
          fill="none"
          stroke="#34d399"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <span className="text-[17px] font-extrabold tracking-tight text-ink">
      Nol<span className="text-brand-600">Rugi</span>
    </span>
  </div>
);

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  batches: InventoryBatch[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onResetData: () => void;
  pdpConsent: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  batches,
  isMobileOpen,
  onCloseMobile,
  onResetData,
  pdpConsent,
}) => {
  const atRisk = batches.filter((b) => {
    const s = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType).status;
    return s === 'kritis' || s === 'waspada';
  }).length;

  const content = (
    <div className="flex flex-col h-full bg-white">
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
        <BrandMark />
        <button onClick={onCloseMobile} className="btn-icon lg:hidden" aria-label="Tutup menu">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Workspace */}
      <div className="px-3 pt-4">
        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink truncate">Dapur Berkah Nusantara</div>
            <div className="text-[11px] text-slate-500">UMKM Pangan Kemasan</div>
          </div>
        </div>
      </div>

      <nav className="px-3 pt-5 flex-1" aria-label="Navigasi utama">
        <div className="eyebrow px-2.5 mb-2">Menu</div>
        <ul className="space-y-0.5">
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
                    'group relative w-full flex items-center gap-3 h-9 px-2.5 rounded-lg text-[13px] font-medium transition-colors',
                    active
                      ? 'bg-brand-50 text-brand-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
                  )}
                >
                  {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-brand-600" />}
                  <Icon
                    className={cn('w-[18px] h-[18px]', active ? 'text-brand-700' : 'text-slate-400 group-hover:text-slate-600')}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === 'inventory' && atRisk > 0 && (
                    <span className="tabular min-w-5 h-5 px-1.5 rounded-md bg-rose-500 text-white text-[11px] font-bold inline-flex items-center justify-center">
                      {atRisk}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="eyebrow px-2.5 mt-7 mb-2">Kepatuhan</div>
        <button
          onClick={() => {
            onSelectTab('reports');
            onCloseMobile();
          }}
          className="w-full flex items-center gap-3 h-9 px-2.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-ink transition-colors"
        >
          <ShieldCheck className="w-[18px] h-[18px] text-slate-500" />
          <span className="flex-1 text-left">UU PDP 27/2022</span>
          <span
            className={cn(
              'chip h-5',
              pdpConsent ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
            )}
          >
            {pdpConsent ? 'Aktif' : 'Lokal'}
          </span>
        </button>
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-[11px] font-bold flex items-center justify-center">
            DB
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-ink truncate">Dewi Berkah</div>
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
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-[248px] border-r border-slate-200/80 z-30">
        {content}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40 animate-fade-in" onClick={onCloseMobile} />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-pop animate-scale-in">{content}</div>
        </div>
      )}
    </>
  );
};
