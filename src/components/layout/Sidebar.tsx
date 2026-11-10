import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  Calculator, 
  FileSpreadsheet, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles,
  Percent,
  X
} from 'lucide-react';
import { InventoryBatch } from '../../types';
import { getBatchStatus } from '../../utils/formatters';

export type ActiveTab = 'dashboard' | 'inventory' | 'calculator' | 'reports';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  batches: InventoryBatch[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  batches,
  isMobileOpen,
  onCloseMobile,
}) => {
  // Count items needing attention
  const urgentCount = batches.filter((b) => {
    const s = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType).status;
    return s === 'kritis' || s === 'waspada';
  }).length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard Margin & Risiko',
      icon: LayoutDashboard,
      badge: urgentCount > 0 ? `${urgentCount} Alert` : undefined,
      badgeColor: 'bg-rose-500 text-white',
      description: 'Metrik kerugian & radar FEFO',
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Batch & Stok FEFO',
      icon: Boxes,
      badge: `${batches.length} Batch`,
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
      description: 'Sistem FEFO & AI Scan OCR',
    },
    {
      id: 'calculator' as ActiveTab,
      label: 'Kalkulator HPP & Markdown',
      icon: Calculator,
      badge: 'Clearance AI',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      description: 'Simulasi HPP, BEP & Cuci Stok',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Laporan SAK-EMKM & KUR',
      icon: FileSpreadsheet,
      badge: 'Skor 84',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      description: 'Laba Rugi & Indeks Kredit',
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-teal-500/25 ring-2 ring-emerald-400/30">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  NolRugi
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-300/60 dark:border-emerald-800">
                  AI MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Penyelamat Margin & Stok UMKM
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left flex items-start gap-3.5 p-3 rounded-xl transition-all relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-50 to-emerald-50/60 dark:from-teal-950/40 dark:to-emerald-950/20 text-teal-800 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800/80 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
                }`}
              >
                <div
                  className={`p-2 rounded-lg mt-0.5 transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs tracking-tight truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mini AI Advisor Card */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-md shadow-teal-900/20">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
              AI Sentinel NolRugi
            </span>
          </div>
          <p className="text-[11px] text-teal-50/90 leading-relaxed">
            {urgentCount > 0
              ? `${urgentCount} batch butuh tindakan penyelamatan harga hari ini sebelum kadaluarsa!`
              : 'Stok dalam batas aman FEFO. Terus pantau dwell-time kemasan polos.'}
          </p>
          <div className="mt-2.5 pt-2 border-t border-teal-500/30 flex items-center justify-between text-[11px] text-teal-100">
            <span className="flex items-center gap-1 font-medium">
              <Percent className="w-3 h-3" /> Margin Target
            </span>
            <span className="font-bold text-white">35%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shrink-0 h-screen sticky top-0 z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full shadow-2xl z-10 flex flex-col">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

