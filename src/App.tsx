import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkillalleySidebar } from './components/layout/SkillalleySidebar';
import { RightInspector } from './components/layout/RightInspector';
import { SkillalleyDashboardView } from './components/dashboard/SkillalleyDashboardView';
import { InventoryView } from './components/inventory/InventoryView';
import { HppCalculatorView } from './components/calculator/HppCalculatorView';
import { ReportsView } from './components/reports/ReportsView';
import { ToastContainer } from './components/common/Toast';
import { DiscountModal } from './components/modals/DiscountModal';
import { BundleModal } from './components/modals/BundleModal';
import { OcrScannerModal } from './components/inventory/OcrScannerModal';
import { ManualBatchModal } from './components/inventory/ManualBatchModal';
import { ActiveTab } from './components/layout/Sidebar';
import { InventoryBatch, ToastMessage } from './types';
import { 
  loadBatches, 
  saveBatches, 
  resetToDefaults, 
  loadConsent, 
  saveConsent 
} from './utils/storage';
import { formatRupiah } from './utils/formatters';
import { Menu, Sparkles, Store, ShieldCheck } from 'lucide-react';

export function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Batches State (Loaded & persisted in localStorage)
  const [batches, setBatches] = useState<InventoryBatch[]>(() => loadBatches());

  // Currently Selected Batch for Right Inspector
  const [selectedBatchId, setSelectedBatchId] = useState<string>(() => {
    const list = loadBatches();
    return list[0]?.id || '';
  });

  // UU PDP Consent State
  const [pdpConsent, setPdpConsent] = useState<boolean>(() => loadConsent());

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals State
  const [discountModalBatch, setDiscountModalBatch] = useState<InventoryBatch | null>(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState<boolean>(false);

  const [bundleModalBatch, setBundleModalBatch] = useState<InventoryBatch | null>(null);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState<boolean>(false);

  const [isOcrModalOpen, setIsOcrModalOpen] = useState<boolean>(false);

  const [manualModalBatch, setManualModalBatch] = useState<InventoryBatch | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  // Sync batches to localStorage whenever changed
  useEffect(() => {
    saveBatches(batches);
  }, [batches]);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0] || null;

  // Toast Helper
  const addToast = (
    title: string,
    description: string,
    type: 'success' | 'warning' | 'danger' | 'info' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reset Demo Data
  const handleResetData = () => {
    const defaults = resetToDefaults();
    setBatches(defaults);
    setSelectedBatchId(defaults[0]?.id || '');
    addToast(
      'Demo Berhasil Direset',
      'Data inventori UMKM telah dikembalikan ke kondisi awal.',
      'info'
    );
  };

  // Actions
  const handleApplyDiscount = (batchId: string, newDiscountPrice: number, strategy: string) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? { ...b, discountPrice: newDiscountPrice, isRescued: true }
          : b
      )
    );
    setIsDiscountModalOpen(false);
    addToast(
      'Diskon Bertahap Aktif!',
      `Harga jual disesuaikan menjadi ${formatRupiah(newDiscountPrice)} (${strategy}). Kas modal terlindungi.`,
      'success'
    );
  };

  const handleCreateBundle = (
    bundleName: string,
    partnerBatchName: string,
    bundlePrice: number,
    marginPct: number
  ) => {
    if (bundleModalBatch) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === bundleModalBatch.id ? { ...b, isRescued: true } : b
        )
      );
    }
    setIsBundleModalOpen(false);
    addToast(
      'Paket Bundling Berhasil Dibuat!',
      `${bundleName} (${formatRupiah(bundlePrice)}) aktif di etalase dengan margin ${marginPct.toFixed(1)}%.`,
      'success'
    );
  };

  const handleSaveManualBatch = (batchData: Omit<InventoryBatch, 'id'> | InventoryBatch) => {
    if ('id' in batchData && batchData.id) {
      setBatches((prev) =>
        prev.map((b) => (b.id === batchData.id ? (batchData as InventoryBatch) : b))
      );
      addToast('Batch Diperbarui', `Perubahan data ${batchData.batchCode} tersimpan.`, 'success');
    } else {
      const newBatch: InventoryBatch = {
        ...batchData,
        id: `batch-${Date.now()}`,
      };
      setBatches((prev) => [newBatch, ...prev]);
      setSelectedBatchId(newBatch.id);
      addToast(
        'Batch Baru Ditambahkan!',
        `Produk ${newBatch.productName} (${newBatch.batchCode}) telah masuk radar FEFO.`,
        'success'
      );
    }
    setIsManualModalOpen(false);
  };

  const handleBatchScanned = (scannedBatch: Omit<InventoryBatch, 'id'>) => {
    const newBatch: InventoryBatch = {
      ...scannedBatch,
      id: `batch-${Date.now()}`,
    };
    setBatches((prev) => [newBatch, ...prev]);
    setSelectedBatchId(newBatch.id);
    setIsOcrModalOpen(false);
    addToast(
      'AI Scan Sukses & Tersimpan!',
      `Batch ${newBatch.batchCode} berhasil diekstrak dan masuk antrean FEFO otomatis.`,
      'success'
    );
  };

  const handleDeleteBatch = (id: string) => {
    const target = batches.find((b) => b.id === id);
    setBatches((prev) => prev.filter((b) => b.id !== id));
    if (selectedBatchId === id) {
      setSelectedBatchId(batches.find((b) => b.id !== id)?.id || '');
    }
    addToast(
      'Batch Dihapus',
      `Batch ${target?.batchCode || id} telah dihapus dari inventori.`,
      'warning'
    );
  };

  const handleUpdateStock = (id: string, delta: number) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newQty = Math.max(0, b.stockQty + delta);
          return { ...b, stockQty: newQty };
        }
        return b;
      })
    );
  };

  const handleApplyClearancePrice = (batchId: string, newPrice: number) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId ? { ...b, discountPrice: newPrice, isRescued: true } : b
      )
    );
    addToast(
      'Harga Clearance Diterapkan!',
      `Harga jual batch diubah menjadi ${formatRupiah(newPrice)}. Siap dipromosikan cuci stok.`,
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-[#edf0f5] text-slate-800 antialiased p-3 sm:p-5 lg:p-6 font-sans">
      {/* Mobile Top Header */}
      <header className="lg:hidden mb-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5b58eb] text-white flex items-center justify-center font-bold text-xs">
              NR
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              nol<span className="text-[#5b58eb]">rugi</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-indigo-50 text-[#5b58eb]"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>UU PDP</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Container matching Skillalley Reference Image */}
      <div className="max-w-[1560px] mx-auto flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column: Skillalley Sidebar */}
        <SkillalleySidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          batches={batches}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onResetData={handleResetData}
          pdpConsent={pdpConsent}
          onOpenUUPDP={() => setActiveTab('reports')}
        />

        {/* Center Column: Active View with Framer Motion Animation */}
        <main className="flex-1 min-w-0 w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <SkillalleyDashboardView
                key="dashboard"
                batches={batches}
                selectedBatchId={selectedBatchId}
                onSelectBatchId={setSelectedBatchId}
                onTriggerDiscount={(batch) => {
                  setDiscountModalBatch(batch);
                  setIsDiscountModalOpen(true);
                }}
                onTriggerBundle={(batch) => {
                  setBundleModalBatch(batch);
                  setIsBundleModalOpen(true);
                }}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <InventoryView
                  batches={batches}
                  onOpenOcrModal={() => setIsOcrModalOpen(true)}
                  onOpenManualModal={(batch) => {
                    setManualModalBatch(batch || null);
                    setIsManualModalOpen(true);
                  }}
                  onDeleteBatch={handleDeleteBatch}
                  onUpdateStock={handleUpdateStock}
                  onTriggerDiscount={(batch) => {
                    setDiscountModalBatch(batch);
                    setIsDiscountModalOpen(true);
                  }}
                  onTriggerBundle={(batch) => {
                    setBundleModalBatch(batch);
                    setIsBundleModalOpen(true);
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'calculator' && (
              <motion.div
                key="calculator"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <HppCalculatorView
                  batches={batches}
                  onApplyClearancePrice={handleApplyClearancePrice}
                />
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <ReportsView
                  batches={batches}
                  pdpConsent={pdpConsent}
                  onToggleConsent={(val) => {
                    setPdpConsent(val);
                    saveConsent(val);
                  }}
                  onShowToast={addToast}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Right Column: Skillalley Right Inspector / Selected Batch Detail */}
        <RightInspector
          selectedBatch={selectedBatch}
          onTriggerDiscount={(batch) => {
            setDiscountModalBatch(batch);
            setIsDiscountModalOpen(true);
          }}
          onTriggerBundle={(batch) => {
            setBundleModalBatch(batch);
            setIsBundleModalOpen(true);
          }}
        />
      </div>

      {/* Interactive Modals */}
      <DiscountModal
        batch={discountModalBatch}
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        onApplyDiscount={handleApplyDiscount}
      />

      <BundleModal
        expiringBatch={bundleModalBatch}
        allBatches={batches}
        isOpen={isBundleModalOpen}
        onClose={() => setIsBundleModalOpen(false)}
        onCreateBundle={handleCreateBundle}
      />

      <OcrScannerModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        onBatchScanned={handleBatchScanned}
      />

      <ManualBatchModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSaveBatch={handleSaveManualBatch}
        initialBatch={manualModalBatch}
      />

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
