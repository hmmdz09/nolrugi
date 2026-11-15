import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Sparkles,
  Package,
  TrendingUp,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { ActiveTab, BrandMark, NAV_ITEMS } from './Sidebar';
import { cn } from '../common/ui';
import { InventoryBatch } from '../../types';
import { getBatchStatus } from '../../utils/formatters';

interface TopbarProps {
  activeTab: ActiveTab;
  onOpenMenu: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onQuickAdd: () => void;
  onOpenOcrModal: () => void;
  alertCount: number;
  onResetData?: () => void;
  pdpConsent?: boolean;
  batches?: InventoryBatch[];
  onSelectBatchId?: (id: string) => void;
  onTriggerDiscount?: (batch: InventoryBatch) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  onOpenMenu,
  onSelectTab,
  onQuickAdd,
  onOpenOcrModal,
  alertCount,
  onResetData,
  pdpConsent,
  batches = [],
  onSelectBatchId,
  onTriggerDiscount,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Generate dynamic notifications from real inventory batches
  const notifications = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      timeAgo: string;
      batch?: InventoryBatch;
      iconBg: string;
      iconColor: string;
      icon: React.ElementType;
      actionType?: 'discount' | 'inventory';
    }> = [];

    // 1. Critical batches (H <= 3)
    const critical = batches.filter((b) => {
      const s = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType);
      return s.status === 'kritis';
    });

    critical.slice(0, 2).forEach((b, idx) => {
      const s = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType);
      list.push({
        id: `notif-crit-${b.id}`,
        title: `Batch ${b.productName}`,
        subtitle: `${s.daysLeft <= 0 ? 'kedaluwarsa hari ini' : `kedaluwarsa H-${s.daysLeft}`}, butuh diskon bertahap`,
        timeAgo: idx === 0 ? '24 Menit lalu' : '1 Jam lalu',
        batch: b,
        iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/80',
        iconColor: 'text-rose-600',
        icon: AlertTriangle,
        actionType: 'discount',
      });
    });

    // 2. Warning batches (H-4 s/d H-7)
    const warning = batches.filter((b) => {
      const s = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType);
      return s.status === 'waspada';
    });

    warning.slice(0, 1).forEach((b) => {
      const s = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType);
      list.push({
        id: `notif-warn-${b.id}`,
        title: `Batch ${b.productName}`,
        subtitle: `waspada H-${s.daysLeft}, prioritaskan di rak terdepan FEFO`,
        timeAgo: '2 Jam lalu',
        batch: b,
        iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/80',
        iconColor: 'text-amber-600',
        icon: Clock,
        actionType: 'inventory',
      });
    });

    // 3. Stagnant / Dwell alert
    const dwell = batches.filter((b) => {
      const s = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType);
      return s.status === 'dwell-alert';
    });

    dwell.slice(0, 1).forEach((b) => {
      const s = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType);
      list.push({
        id: `notif-dwell-${b.id}`,
        title: 'Stok Mengendap',
        subtitle: `${b.productName} di ${b.location} (${s.dwellDays} hari)`,
        timeAgo: '4 Jam lalu',
        batch: b,
        iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/80',
        iconColor: 'text-purple-600',
        icon: Package,
        actionType: 'inventory',
      });
    });

    // 4. AI Rescue Recommendation
    if (critical.length > 0) {
      list.push({
        id: 'notif-ai-rescue',
        title: 'Rekomendasi AI',
        subtitle: 'Diskon Penyelamat Kas siap selamatkan modal 100% tanpa rugi',
        timeAgo: '5 Jam lalu',
        batch: critical[0],
        iconBg: 'bg-sky-50 text-sky-600 border border-sky-200/80',
        iconColor: 'text-sky-600',
        icon: Sparkles,
        actionType: 'discount',
      });
    }

    // Default safe fallback if inventory has no urgent alerts
    if (list.length === 0) {
      list.push({
        id: 'notif-safe',
        title: 'Sistem NolRugi',
        subtitle: 'Seluruh batch inventori dalam kondisi aman di radar FEFO',
        timeAgo: '10 Menit lalu',
        iconBg: 'bg-sky-50 text-sky-600 border border-sky-200/80',
        iconColor: 'text-sky-600',
        icon: ShieldCheck,
        actionType: 'inventory',
      });
    }

    return list;
  }, [batches]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readIds.includes(n.id)).length;
  }, [notifications, readIds]);

  const handleItemClick = (item: (typeof notifications)[0]) => {
    if (!readIds.includes(item.id)) {
      setReadIds((prev) => [...prev, item.id]);
    }
    setNotifOpen(false);

    if (item.batch) {
      onSelectBatchId?.(item.batch.id);
      if (item.actionType === 'discount' && onTriggerDiscount) {
        onTriggerDiscount(item.batch);
        return;
      }
    }
    onSelectTab('inventory');
  };

  const handleMarkAllRead = () => {
    setReadIds(notifications.map((n) => n.id));
  };

  useEffect(() => {
    if (!menuOpen && !notifOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen, notifOpen]);

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 h-16 px-2 sm:px-3 rounded-full bg-white/40 backdrop-blur-2xl backdrop-saturate-[1.8] border border-white/70 sheen">
          <button onClick={onOpenMenu} className="btn-icon lg:hidden" aria-label="Buka menu">
            <Menu className="w-[18px] h-[18px]" />
          </button>
          <BrandMark className="pl-1 sm:pl-2" />

          {/* Nav pill: Ringkasan, Batch & FEFO, Kalkulator HPP, Tambah Batch, Scan Tanggal */}
          <nav
            className="hidden lg:flex items-center gap-1.5 p-1.5 mx-auto rounded-full bg-white/40 backdrop-blur-2xl border border-white/70 shadow-sm"
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
                    'relative h-10 px-4.5 rounded-full text-[13.5px] font-semibold transition-all duration-200 border',
                    active
                      ? 'bg-white text-ink shadow-[0_4px_14px_-6px_rgb(70_50_140/0.35)] border-white'
                      : 'bg-white/40 text-slate-700 hover:text-ink hover:bg-white/80 border-white/60 shadow-xs hover:shadow-[0_4px_14px_-6px_rgb(70_50_140/0.25)]'
                  )}
                >
                  {item.label}
                  {item.id === 'inventory' && alertCount > 0 && (
                    <span className="ml-1.5 num inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10.5px] font-bold align-[1px]">
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

            {/* Notification Bell with Floating Reference Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setMenuOpen(false);
                }}
                className={cn(
                  'btn-icon relative transition-colors',
                  notifOpen && 'bg-white text-ink shadow-sm'
                )}
                aria-label={`${unreadCount} notifikasi`}
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
                title={`${unreadCount} notifikasi stok`}
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {/* Floating Dropdown Card matching Reference Screenshot */}
              {notifOpen && (
                <div
                  role="region"
                  aria-label="Panel Notifikasi"
                  className="absolute right-0 mt-3 w-[350px] sm:w-[380px] p-5 rounded-[24px] bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_-12px_rgba(20,15,45,0.18)] z-50 animate-scale-in"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-[17px] font-bold text-slate-800 tracking-tight">Notification</h3>
                      <p className="text-[12.5px] text-slate-500 mt-0.5">
                        You have {unreadCount} unread message{unreadCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-600 hover:text-brand-700 hover:underline pt-0.5"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Tandai dibaca
                      </button>
                    )}
                  </div>

                  {/* Section Label */}
                  <div className="pt-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    New
                  </div>

                  {/* Notification List Items */}
                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                    {notifications.map((item) => {
                      const isRead = readIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={cn(
                            'group flex items-start gap-3.5 p-2.5 rounded-2xl transition-all cursor-pointer border',
                            isRead
                              ? 'border-transparent hover:bg-slate-50/80 opacity-75'
                              : 'border-slate-100/70 bg-white/60 hover:bg-slate-50 shadow-xs'
                          )}
                        >
                          {/* Circular Orb Icon */}
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs',
                              item.iconBg
                            )}
                          >
                            <item.icon className={cn('w-4.5 h-4.5', item.iconColor)} />
                          </div>

                          {/* Content: Bold prefix + lighter description */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] leading-snug text-slate-600">
                              <span className="font-bold text-slate-900 mr-1">{item.title}</span>
                              <span className="text-slate-500">{item.subtitle}</span>
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-slate-400 font-medium">
                              <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              <span>{item.timeAgo}</span>
                            </div>
                          </div>

                          {/* Unread indicator */}
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 mt-2 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        onSelectTab('inventory');
                      }}
                      className="text-[12.5px] font-semibold text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      Buka Semua di Batch & FEFO
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setNotifOpen(false);
                }}
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
