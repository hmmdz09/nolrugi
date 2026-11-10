import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { InventoryView } from './components/inventory/InventoryView';
import { HppCalculatorView } from './components/calculator/HppCalculatorView';
import { ReportsView } from './components/reports/ReportsView';
import { ToastContainer } from './components/common/Toast';
import { DiscountModal } from './components/modals/DiscountModal';
import { BundleModal } from './components/modals/BundleModal';
import { OcrScannerModal } from './components/inventory/OcrScannerModal';
import { ManualBatchModal } from './components/inventory/ManualBatchModal';
import { InventoryBatch, ToastMessage } from './types';
import { 
  loadBatches, 
  saveBatches, 
  resetToDefaults, 
  loadConsent, 
  saveConsent 
} from './utils/storage';
import { formatRupiah } from './utils/formatters';
import gsap from 'gsap';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Batches State (Loaded and persisted in localStorage)
  const [batches, setBatches] = useState<InventoryBatch[]>(() => loadBatches());

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

  // Content ref for GSAP tab transitions
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Sync batches to localStorage whenever changed
  useEffect(() => {
    saveBatches(batches);
  }, [batches]);

  // Sync PDP consent
  const handleToggleConsent = (val: boolean) => {
    setPdpConsent(val);
    saveConsent(val);
  };

  // Toast Helper
  const addToast = (
    title: string,
    description: string,
    type: 'success' | 'warning' | 'danger' | 'info' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // GSAP Tab Switch Animation
  const handleSelectTab = (newTab: ActiveTab) => {
    if (newTab === activeTab) return;
    if (contentAreaRef.current) {
      gsap.fromTo(
        contentAreaRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
    setActiveTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Reset Demo Data
  const handleResetData = () => {
    const defaults = resetToDefaults();
    setBatches(defaults);
    addToast(
      'Demo Berhasil Direset',
      'Data persediaan UMKM telah dikembalikan ke kondisi contoh awal.',
      'info'
    );
  };

  // 2. Action: Apply Discount from Modal
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

  // 3. Action: Create Bundle from Modal
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
      `${bundleName} (${formatRupiah(bundlePrice)}) telah aktif di etalase dengan margin ${marginPct.toFixed(1)}%.`,
      'success'
    );
  };

  // 4. Action: Save Batch from Manual Modal (Add or Edit)
  const handleSaveManualBatch = (batchData: Omit<InventoryBatch, 'id'> | InventoryBatch) => {
    if ('id' in batchData && batchData.id) {
      // Edit
      setBatches((prev) =>
        prev.map((b) => (b.id === batchData.id ? (batchData as InventoryBatch) : b))
      );
      addToast(
        'Batch Diperbarui',
        `Perubahan data batch ${batchData.batchCode} berhasil disimpan.`,
        'success'
      );
    } else {
      // Add new
      const newBatch: InventoryBatch = {
        ...batchData,
        id: `batch-${Date.now()}`,
      };
      setBatches((prev) => [newBatch, ...prev]);
      addToast(
        'Batch Baru Ditambahkan!',
        `Produk ${newBatch.productName} (${newBatch.batchCode}) telah masuk radar FEFO.`,
        'success'
      );
    }
    setIsManualModalOpen(false);
  };

  // 5. Action: Batch Scanned from AI OCR
  const handleBatchScanned = (scannedBatch: Omit<InventoryBatch, 'id'>) => {
    const newBatch: InventoryBatch = {
      ...scannedBatch,
      id: `batch-${Date.now()}`,
    };
    setBatches((prev) => [newBatch, ...prev]);
    setIsOcrModalOpen(false);
    addToast(
      'AI Scan Sukses & Tersimpan!',
      `Batch ${newBatch.batchCode} berhasil diekstrak dan masuk antrean FEFO otomatis.`,
      'success'
    );
  };

  // 6. Action: Delete Batch
  const handleDeleteBatch = (id: string) => {
    const target = batches.find((b) => b.id === id);
    setBatches((prev) => prev.filter((b) => b.id !== id));
    addToast(
      'Batch Dihapus',
      `Batch ${target?.batchCode || id} telah dihapus dari inventori.`,
      'warning'
    );
  };

  // 7. Action: Update Stock (+ / -)
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

  // 8. Action: Apply Clearance Price from Calculator tab
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation Bar */}
      <Navbar
        batches={batches}
        onResetData={handleResetData}
        onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        pdpConsent={pdpConsent}
        onNavigateToUUPDP={() => handleSelectTab('reports')}
      />

      {/* Main Body Shell */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          batches={batches}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <div ref={contentAreaRef}>
            {activeTab === 'dashboard' && (
              <DashboardView
                batches={batches}
                onTriggerDiscount={(batch) => {
                  setDiscountModalBatch(batch);
                  setIsDiscountModalOpen(true);
                }}
                onTriggerBundle={(batch) => {
                  setBundleModalBatch(batch);
                  setIsBundleModalOpen(true);
                }}
                onNavigateToTab={handleSelectTab}
              />
            )}

            {activeTab === 'inventory' && (
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
            )}

            {activeTab === 'calculator' && (
              <HppCalculatorView
                batches={batches}
                onApplyClearancePrice={handleApplyClearancePrice}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                batches={batches}
                pdpConsent={pdpConsent}
                onToggleConsent={handleToggleConsent}
                onShowToast={addToast}
              />
            )}
          </div>
        </main>
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
