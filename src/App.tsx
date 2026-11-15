import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ToastContainer } from './components/common/Toast';
import { DiscountModal } from './components/modals/DiscountModal';
import { BundleModal } from './components/modals/BundleModal';
import { OcrScannerModal } from './components/inventory/OcrScannerModal';
import { ManualBatchModal } from './components/inventory/ManualBatchModal';
import { InventoryBatch, ToastMessage } from './types';
import { loadBatches, saveBatches, resetToDefaults, loadConsent, saveConsent } from './utils/storage';
import { formatRupiah, getBatchStatus } from './utils/formatters';

const InventoryView = lazy(() =>
  import('./components/inventory/InventoryView').then((m) => ({ default: m.InventoryView }))
);
const HppCalculatorView = lazy(() =>
  import('./components/calculator/HppCalculatorView').then((m) => ({ default: m.HppCalculatorView }))
);
const ReportsView = lazy(() =>
  import('./components/reports/ReportsView').then((m) => ({ default: m.ReportsView }))
);

const ViewFallback = () => (
  <div className="space-y-4" aria-busy="true">
    <div className="h-8 w-64 rounded-full bg-white/50 animate-pulse" />
    <div className="h-40 rounded-[28px] bg-white/40 animate-pulse" />
    <div className="h-72 rounded-[28px] bg-white/30 animate-pulse" />
  </div>
);

const Page: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <motion.div
    key={id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [batches, setBatches] = useState<InventoryBatch[]>(() => loadBatches());
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [pdpConsent, setPdpConsent] = useState<boolean>(() => loadConsent());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals — mounted only while open so each opening starts from fresh state
  const [discountBatch, setDiscountBatch] = useState<InventoryBatch | null>(null);
  const [bundleBatch, setBundleBatch] = useState<InventoryBatch | null>(null);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [manualModal, setManualModal] = useState<{ open: boolean; batch: InventoryBatch | null }>({
    open: false,
    batch: null,
  });

  useEffect(() => saveBatches(batches), [batches]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeTab]);

  const alertCount = batches.filter((b) => {
    const s = getBatchStatus(b.expiryDate, b.entryDate, b.packagingType).status;
    return s === 'kritis' || s === 'waspada';
  }).length;

  const removeToast = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const addToast = useCallback(
    (title: string, description: string, type: ToastMessage['type'] = 'success') => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-2), { id, title, description, type }]);
      setTimeout(() => removeToast(id), 4500);
    },
    [removeToast]
  );

  const handleResetData = () => {
    const defaults = resetToDefaults();
    setBatches(defaults);
    setSelectedBatchId('');
    addToast('Data demo direset', 'Inventori dikembalikan ke kondisi awal.', 'info');
  };

  const handleApplyDiscount = (batchId: string, price: number, strategy: string) => {
    setBatches((prev) => prev.map((b) => (b.id === batchId ? { ...b, discountPrice: price, isRescued: true } : b)));
    setDiscountBatch(null);
    addToast('Diskon diterapkan', `Harga baru ${formatRupiah(price)} · ${strategy}`, 'success');
  };

  const handleCreateBundle = (bundleName: string, _partner: string, bundlePrice: number, marginPct: number) => {
    if (bundleBatch) {
      setBatches((prev) => prev.map((b) => (b.id === bundleBatch.id ? { ...b, isRescued: true } : b)));
    }
    setBundleBatch(null);
    addToast('Paket bundling dibuat', `${bundleName} · ${formatRupiah(bundlePrice)} · margin ${marginPct.toFixed(1)}%`);
  };

  const handleSaveManualBatch = (data: Omit<InventoryBatch, 'id'> | InventoryBatch) => {
    if ('id' in data && data.id) {
      setBatches((prev) => prev.map((b) => (b.id === data.id ? (data as InventoryBatch) : b)));
      addToast('Batch diperbarui', `Perubahan ${data.batchCode} tersimpan.`);
    } else {
      const nb: InventoryBatch = { ...data, id: `batch-${Date.now()}` };
      setBatches((prev) => [nb, ...prev]);
      setSelectedBatchId(nb.id);
      addToast('Batch ditambahkan', `${nb.productName} (${nb.batchCode}) masuk radar FEFO.`);
    }
    setManualModal({ open: false, batch: null });
  };

  const handleBatchScanned = (scanned: Omit<InventoryBatch, 'id'>) => {
    const nb: InventoryBatch = { ...scanned, id: `batch-${Date.now()}` };
    setBatches((prev) => [nb, ...prev]);
    setSelectedBatchId(nb.id);
    setIsOcrOpen(false);
    addToast('Hasil scan disimpan', `Batch ${nb.batchCode} masuk antrean FEFO.`);
  };

  const handleDeleteBatch = (id: string) => {
    const target = batches.find((b) => b.id === id);
    setBatches((prev) => prev.filter((b) => b.id !== id));
    if (selectedBatchId === id) setSelectedBatchId('');
    addToast('Batch dihapus', `${target?.batchCode ?? id} dihapus dari inventori.`, 'warning');
  };

  const handleUpdateStock = (id: string, delta: number) => {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, stockQty: Math.max(0, b.stockQty + delta) } : b)));
  };

  const handleApplyClearancePrice = (batchId: string, price: number) => {
    setBatches((prev) => prev.map((b) => (b.id === batchId ? { ...b, discountPrice: price, isRescued: true } : b)));
    addToast('Harga clearance diterapkan', `Harga jual batch kini ${formatRupiah(price)}.`);
  };

  return (
    <div className="min-h-screen relative isolate">
      <div className="app-bg" aria-hidden />
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        batches={batches}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onResetData={handleResetData}
        pdpConsent={pdpConsent}
      />

      <div className="min-w-0">
        <Topbar
          activeTab={activeTab}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          onSelectTab={setActiveTab}
          onQuickAdd={() => setManualModal({ open: true, batch: null })}
          alertCount={alertCount}
          onResetData={handleResetData}
          pdpConsent={pdpConsent}
        />

        <main className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px] mx-auto pb-20">
          <Suspense fallback={<ViewFallback />}>
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <DashboardView
                  key="dashboard"
                  batches={batches}
                  selectedBatchId={selectedBatchId}
                  onSelectBatchId={setSelectedBatchId}
                  onTriggerDiscount={setDiscountBatch}
                  onTriggerBundle={setBundleBatch}
                  onNavigateToTab={setActiveTab}
                />
              )}

              {activeTab === 'inventory' && (
                <Page id="inventory" key="inventory">
                  <InventoryView
                    batches={batches}
                    onOpenOcrModal={() => setIsOcrOpen(true)}
                    onOpenManualModal={(batch) => setManualModal({ open: true, batch: batch || null })}
                    onDeleteBatch={handleDeleteBatch}
                    onUpdateStock={handleUpdateStock}
                    onTriggerDiscount={setDiscountBatch}
                    onTriggerBundle={setBundleBatch}
                  />
                </Page>
              )}

              {activeTab === 'calculator' && (
                <Page id="calculator" key="calculator">
                  <HppCalculatorView batches={batches} onApplyClearancePrice={handleApplyClearancePrice} />
                </Page>
              )}

              {activeTab === 'reports' && (
                <Page id="reports" key="reports">
                  <ReportsView
                    batches={batches}
                    pdpConsent={pdpConsent}
                    onToggleConsent={(val) => {
                      setPdpConsent(val);
                      saveConsent(val);
                    }}
                    onShowToast={addToast}
                  />
                </Page>
              )}
            </AnimatePresence>
          </Suspense>
        </main>
      </div>

      {discountBatch && (
        <DiscountModal
          key={`d-${discountBatch.id}`}
          batch={discountBatch}
          isOpen
          onClose={() => setDiscountBatch(null)}
          onApplyDiscount={handleApplyDiscount}
        />
      )}
      {bundleBatch && (
        <BundleModal
          key={`b-${bundleBatch.id}`}
          expiringBatch={bundleBatch}
          allBatches={batches}
          isOpen
          onClose={() => setBundleBatch(null)}
          onCreateBundle={handleCreateBundle}
        />
      )}
      {isOcrOpen && (
        <OcrScannerModal isOpen onClose={() => setIsOcrOpen(false)} onBatchScanned={handleBatchScanned} />
      )}
      {manualModal.open && (
        <ManualBatchModal
          key={manualModal.batch?.id ?? 'new'}
          isOpen
          onClose={() => setManualModal({ open: false, batch: null })}
          onSaveBatch={handleSaveManualBatch}
          initialBatch={manualModal.batch}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
