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
    <div className="w-7 h-7 rounded-md bg-ink flex items-center justify-center">
      <svg viewBox="0 0 32 32" className="w-5 h-5" aria-hidden>
        <path
          d="M8 21 14 15l3.5 3.5L24 11"
          fill="none"
          stroke="#93b9a0"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <span className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
      NolRugi
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
    <div className="flex flex-col h-full bg-canvas">
      <div className="h-14 px-4 flex items-center justify-between">
        <BrandMark />
        <button onClick={onCloseMobile} className="btn-icon lg:hidden" aria-label="Tutup menu">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Workspace */}
      <div className="px-3 pt-1">
        <div className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 bg-white">
          <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-ink truncate">Dapur Berkah Nusantara</div>
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
                    'group relative w-full flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px] font-medium transition-colors',
                    active
                      ? 'bg-white text-ink shadow-[0_0_0_1px_var(--color-slate-200)]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
                  )}
                >
                  <Icon
                    className={cn('w-4 h-4', active ? 'text-ink' : 'text-slate-400 group-hover:text-slate-600')}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === 'inventory' && atRisk > 0 && (
                    <span className="num min-w-5 h-5 px-1.5 rounded bg-rose-50 text-rose-700 text-[11px] font-medium inline-flex items-center justify-center">
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
                <button
          onClick={() => {
            onSelectTab('reports');
            onCloseMobile();
          }}
          className="w-full flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px] font-medium text-slate-600 hover:bg-slate-100 hover:text-ink transition-colors"
        >
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
        </button>
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
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-[232px] border-r border-slate-200 z-30">
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
