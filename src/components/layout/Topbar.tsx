import React from 'react';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import { ActiveTab, BrandMark, NAV_ITEMS } from './Sidebar';
import { cn } from '../common/ui';

interface TopbarProps {
  activeTab: ActiveTab;
  onOpenMenu: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onQuickAdd: () => void;
  alertCount: number;
}

const todayLabel = () =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const Topbar: React.FC<TopbarProps> = ({ activeTab, onOpenMenu, onSelectTab, onQuickAdd, alertCount }) => {
  const current = NAV_ITEMS.find((n) => n.id === activeTab);

  return (
    <header className="sticky top-0 z-20 bg-canvas/85 backdrop-blur-md border-b border-slate-200/70">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <button onClick={onOpenMenu} className="btn-icon lg:hidden -ml-1.5" aria-label="Buka menu">
          <Menu className="w-5 h-5" />
        </button>
        <BrandMark className="lg:hidden" />

        <div className="hidden lg:flex items-center gap-2 text-[13px]">
          <span className="text-slate-500">Dapur Berkah Nusantara</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-ink">{current?.label}</span>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => onSelectTab('inventory')}
          className="hidden md:flex items-center gap-2 h-9 w-64 px-3 rounded-lg bg-white border border-slate-200 text-[13px] text-slate-400 hover:border-slate-300 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Cari produk atau batch…</span>
        </button>

        <span className="hidden xl:block text-[12px] text-slate-500 capitalize">{todayLabel()}</span>

        <button
          onClick={() => onSelectTab('inventory')}
          className="btn-icon relative"
          aria-label={`${alertCount} batch butuh tindakan`}
        >
          <Bell className="w-[18px] h-[18px]" />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-canvas" />
          )}
        </button>

        <button onClick={onQuickAdd} className="btn-primary hidden sm:inline-flex">
          <Plus className="w-4 h-4" />
          Batch baru
        </button>
      </div>

      {/* Mobile tab bar */}
      <nav className="lg:hidden flex gap-1 px-4 sm:px-6 pb-2 overflow-x-auto no-scrollbar border-t border-transparent" aria-label="Navigasi">
        {NAV_ITEMS.map((n) => {
          const Icon = n.icon;
          const active = n.id === activeTab;
          return (
            <button
              key={n.id}
              onClick={() => onSelectTab(n.id)}
              className={cn(
                'flex flex-1 sm:flex-none justify-center items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors',
                active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {n.short}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
