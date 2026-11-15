import React, { useEffect, useRef, useState } from 'react';
import { Menu, Search, Bell, Plus, ChevronDown, RotateCcw, ShieldCheck } from 'lucide-react';
import { ActiveTab, BrandMark, NAV_ITEMS } from './Sidebar';
import { cn } from '../common/ui';

interface TopbarProps {
  activeTab: ActiveTab;
  onOpenMenu: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onQuickAdd: () => void;
  alertCount: number;
  onResetData?: () => void;
  pdpConsent?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  onOpenMenu,
  onSelectTab,
  onQuickAdd,
  alertCount,
  onResetData,
  pdpConsent,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 h-16 px-2 sm:px-3 rounded-full bg-white/40 backdrop-blur-2xl backdrop-saturate-[1.8] border border-white/70 sheen">
          <button onClick={onOpenMenu} className="btn-icon lg:hidden" aria-label="Buka menu">
            <Menu className="w-[18px] h-[18px]" />
          </button>
          <BrandMark className="pl-1 sm:pl-2" />

          {/* Nav pill */}
          <nav
            className="hidden lg:flex items-center gap-1 p-1 mx-auto rounded-full bg-white/40 border border-white/70"
            aria-label="Navigasi utama"
          >
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative h-10 px-5 rounded-full text-[13.5px] font-semibold transition-all duration-300',
                    active
                      ? 'bg-white text-ink shadow-[0_4px_14px_-6px_rgb(70_50_140/0.35)]'
                      : 'text-slate-600 hover:text-ink hover:bg-white/60'
                  )}
                >
                  {item.label}
                  {item.id === 'inventory' && alertCount > 0 && (
                    <span className="ml-1.5 num inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-500/90 text-white text-[10.5px] font-bold align-[1px]">
                      {alertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex-1 lg:hidden" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onSelectTab('inventory')}
              className="btn-icon hidden sm:inline-flex"
              aria-label="Cari produk atau batch"
              title="Cari produk atau batch"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={onQuickAdd}
              className="btn-icon hidden sm:inline-flex"
              aria-label="Tambah batch baru"
              title="Batch baru"
            >
              <Plus className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => onSelectTab('inventory')}
              className="btn-icon relative"
              aria-label={`${alertCount} batch butuh tindakan`}
              title={`${alertCount} batch butuh tindakan`}
            >
              <Bell className="w-[18px] h-[18px]" />
              {alertCount > 0 && (
                <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 h-10 pl-1 pr-2 rounded-full hover:bg-white/60 transition-colors"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Menu akun"
              >
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-300 via-brand-400 to-rose-300 text-white text-[12px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
                  DB
                </span>
                <ChevronDown
                  className={cn('w-4 h-4 text-slate-500 transition-transform duration-200 hidden sm:block', menuOpen && 'rotate-180')}
                />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 p-2 rounded-3xl bg-white/80 backdrop-blur-2xl border border-white shadow-pop animate-scale-in"
                >
                  <div className="px-3 py-2.5">
                    <div className="text-[13.5px] font-semibold text-ink">Dewi Berkah</div>
                    <div className="text-[12px] text-slate-500">Dapur Berkah Nusantara</div>
                  </div>
                  <div
                    className="w-full flex items-center gap-2.5 h-10 px-3 rounded-2xl text-[13px] text-slate-700"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span className="flex-1 text-left">UU PDP 27/2022</span>
                    <span className="text-[11.5px] font-semibold text-brand-600">{pdpConsent ? 'Aktif' : 'Lokal'}</span>
                  </div>
                  {onResetData && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        onResetData();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 h-10 px-3 rounded-2xl text-[13px] text-slate-700 hover:bg-white transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      Reset data demo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav pill */}
        <nav
          className="lg:hidden mt-2 flex gap-1 p-1 rounded-full bg-white/45 backdrop-blur-2xl border border-white/80 shadow-card overflow-x-auto no-scrollbar"
          aria-label="Navigasi"
        >
          {NAV_ITEMS.map((n) => {
            const active = n.id === activeTab;
            return (
              <button
                key={n.id}
                onClick={() => onSelectTab(n.id)}
                className={cn(
                  'flex-1 h-9 px-3 rounded-full text-[12.5px] font-semibold whitespace-nowrap transition-all duration-300',
                  active ? 'bg-white text-ink shadow-[0_4px_14px_-6px_rgb(70_50_140/0.35)]' : 'text-slate-600'
                )}
              >
                {n.short}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
