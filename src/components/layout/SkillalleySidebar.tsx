import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Boxes, 
  Calculator, 
  FileSpreadsheet, 
  ArrowRight,
  Sparkles,
  AlertOctagon,
  ShieldCheck,
  RotateCcw,
  X
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { InventoryBatch } from '../../types';
import { getBatchStatus } from '../../utils/formatters';
import { IsometricIllustration } from '../common/IsometricIllustration';

interface SkillalleySidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  batches: InventoryBatch[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onResetData: () => void;
  pdpConsent: boolean;
  onOpenUUPDP: () => void;
}

export const SkillalleySidebar: React.FC<SkillalleySidebarProps> = ({
  activeTab,
  onSelectTab,
  batches,
  isMobileOpen,
  onCloseMobile,
  onResetData,
  pdpConsent,
  onOpenUUPDP,
}) => {
  const alertStats = batches.reduce(
    (acc, b) => {
      const st = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType);
      if (st.status === 'kritis') acc.kritis += 1;
      if (st.status === 'waspada') acc.waspada += 1;
      return acc;
    },
    { kritis: 0, waspada: 0 }
  );

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory' as ActiveTab, label: 'Batch & FEFO', icon: Boxes },
    { id: 'calculator' as ActiveTab, label: 'Kalkulator HPP', icon: Calculator },
    { id: 'reports' as ActiveTab, label: 'Laporan SAK-EMKM', icon: FileSpreadsheet },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-6 bg-white rounded-[32px] shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-white">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {/* 4 Petals Geometric Logo matching Skillalley */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5b58eb] to-[#7c79f2] flex items-center justify-center text-white shadow-md shadow-[#5b58eb]/30">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <circle cx="8" cy="8" r="3" />
                <circle cx="16" cy="8" r="3" />
                <circle cx="8" cy="16" r="3" />
                <circle cx="16" cy="16" r="3" />
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
              nol<span className="text-[#5b58eb]">rugi</span>
            </span>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="mt-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#5b58eb] text-white shadow-lg shadow-[#5b58eb]/25'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Insights Section */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="px-2 mb-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">
            Insights &amp; Sentinel
          </div>
          <div className="space-y-2">
            <button
              onClick={() => onSelectTab('inventory')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <AlertOctagon className="w-4 h-4 text-orange-500" />
                <span>Peringatan Risiko</span>
              </div>
              {alertStats.kritis + alertStats.waspada > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                  {alertStats.kritis + alertStats.waspada}
                </span>
              )}
            </button>

            <button
              onClick={onOpenUUPDP}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#5b58eb]" />
                <span>UU PDP No. 27/2022</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-[#5b58eb]">
                {pdpConsent ? 'Aktif' : 'Lokal'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini 3D Bottom Card matching Skillalley "Go Pro Now" */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#f8f9fc] to-[#eef0f8] border border-slate-100/80 relative overflow-hidden flex flex-col items-start gap-2">
          {/* Isometric stepped mini icon */}
          <div className="flex items-center justify-between w-full">
            <IsometricIllustration variant="cube" className="w-10 h-10" />
            <button
              onClick={onResetData}
              title="Reset data contoh"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <div className="text-left">
            <div className="text-xs font-bold text-slate-800">NolRugi AI Rescue</div>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
              Proteksi margin pangan &amp; perputaran kas UMKM.
            </p>
          </div>

          <button
            onClick={() => onSelectTab('calculator')}
            className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#5b58eb] hover:text-[#4744cc] transition-colors"
          >
            <span>Kalkulator Impas</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-[calc(100vh-2rem)] sticky top-4 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full p-3 z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
