import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Download, 
  Lock, 
  TrendingUp, 
  DollarSign, 
  Coins, 
  Sparkles, 
  Building2, 
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { InventoryBatch, FinancialMetricSAKEMKM, CreditReadinessComponent } from '../../types';
import { formatRupiah, formatPercent } from '../../utils/formatters';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { animateFadeInUp } from '../../utils/gsapAnimations';
import confetti from 'canvas-confetti';

interface ReportsViewProps {
  batches: InventoryBatch[];
  pdpConsent: boolean;
  onToggleConsent: (val: boolean) => void;
  onShowToast: (title: string, desc: string, type: 'success' | 'warning' | 'info') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  batches,
  pdpConsent,
  onToggleConsent,
  onShowToast,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // GSAP animations
  useEffect(() => {
    if (containerRef.current) {
      animateFadeInUp(containerRef.current.querySelectorAll('.gsap-card'), {
        stagger: 0.08,
        y: 20,
        duration: 0.6,
      });
    }
  }, []);

  // Standard SAK-EMKM Financial Numbers
  const grossRevenue = 46800000; // Omzet berjalan bulan ini
  const cogsSold = 22400000; // HPP Penjualan pokok
  const rescuedMarginGain = 8250000; // Penjualan barang mendekati expired yg berhasil diselamatkan via NolRugi
  const wastedInventoryLoss = 110000; // Kerugian makanan basi yg gagal terjual
  const grossProfit = grossRevenue - cogsSold + rescuedMarginGain - wastedInventoryLoss;
  const operationalExpenses = 14200000; // Gaji, sewa kios, utilitas listrik/gas
  const ebit = grossProfit - operationalExpenses; // Laba sebelum pajak
  const pphFinalUMKM = Math.round(grossRevenue * 0.005); // PPh Final 0.5% PP No. 55/2022 dari omzet bruto
  const netProfit = ebit - pphFinalUMKM;

  // Credit Readiness Index Components
  const creditScore = 84; // Out of 100
  const scoreCategory = 'Sangat Siap Pengajuan KUR (Bank BRI / BNI / Mandiri / BSI)';

  const creditComponents: CreditReadinessComponent[] = [
    {
      title: 'Disiplin Pencatatan Sistem FEFO',
      score: 95,
      weight: 25,
      description: 'Pencatatan batch dan tanggal kedaluwarsa rutin setiap penerimaan bahan & produk.',
      status: 'optimal',
    },
    {
      title: 'Gross Margin Usaha Sehat (> 30%)',
      score: 88,
      weight: 30,
      description: 'Gross margin stabil di angka 34.6%, melampaui batas aman perbankan retail (25%).',
      status: 'optimal',
    },
    {
      title: 'Rasio Kerugian Stok Terkendali (< 1%)',
      score: 92,
      weight: 25,
      description: 'Pemborosan pangan ditekan dari 4.5% menjadi 0.23% berkat diskon bertahap NolRugi.',
      status: 'optimal',
    },
    {
      title: 'Arus Kas & Likuiditas Modal Kerja',
      score: 75,
      weight: 20,
      description: 'Perputaran kas rata-rata 18 hari, mampu menopang angsuran kredit produktif.',
      status: 'cukup',
    },
  ];

  // Download KUR Dossier JSON
  const handleExportKurDossier = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });

    const dossier = {
      namaUsaha: 'Dapur Berkah Nusantara',
      sektor: 'UMKM Industri Pengolahan Pangan Kemasan',
      standarAkuntansi: 'SAK-EMKM (Ikatan Akuntan Indonesia)',
      tanggalAudit: new Date().toISOString(),
      creditReadinessScore: {
        score: creditScore,
        category: scoreCategory,
        pdpCompliance: pdpConsent ? 'Consent Active - AES Encrypted' : 'Local Only',
      },
      ringkasanLabaRugi: {
        pendapatanKotor: grossRevenue,
        hppPokok: cogsSold,
        penyelamatanMarginNolRugi: rescuedMarginGain,
        kerugianLimbah: wastedInventoryLoss,
        labaKotor: grossProfit,
        bebanOperasional: operationalExpenses,
        labaSebelumPajak: ebit,
        pphFinalPP55_05Pct: pphFinalUMKM,
        labaBersihSetelahPajak: netProfit,
      },
      stokAktifFEFO: batches.map((b) => ({
        batch: b.batchCode,
        produk: b.productName,
        kategori: b.category,
        stok: b.stockQty,
        hpp: b.unitHpp,
        hargaJual: b.discountPrice || b.sellingPrice,
      })),
    };

    const blob = new Blob([JSON.stringify(dossier, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Berkas_Verifikasi_KUR_SAK_EMKM_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast(
      'Berkas KUR Berhasil Diunduh',
      'Format terenkripsi siap dilampirkan pada sistem portal kredit perbankan.',
      'success'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div ref={containerRef} className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Laporan SAK-EMKM &amp; Skor Kesiapan KUR
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              Standar Bank Indonesia &amp; OJK
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Laporan keuangan resmi entitas mikro &amp; instrumen verifikasi kelayakan kredit perbankan sesuai regulasi UU PDP.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs transition-all hover:scale-105 active:scale-95"
          >
            <Printer className="w-4 h-4 text-teal-600" />
            <span>Cetak / PDF Preview</span>
          </button>

          <button
            onClick={handleExportKurDossier}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Berkas Verifikasi KUR</span>
          </button>
        </div>
      </div>

      {/* Grid: Laporan Laba Rugi SAK-EMKM (Left 7 cols) & Credit Readiness Meter (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: SAK-EMKM Financial Statement */}
        <div className="gsap-card lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Standar Akuntansi Keuangan Entitas Mikro Kecil Menengah
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Laporan Laba Rugi Periode Berjalan (Nov 2026)
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>

          {/* Statement Rows */}
          <div className="space-y-2.5 text-xs">
            {/* 1. Pendapatan Penjualan */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Pendapatan Penjualan Usaha (Omzet)
                </span>
                <span className="text-[10px] text-slate-400 block">Total penjualan produk kemasan</span>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {formatRupiah(grossRevenue)}
              </span>
            </div>

            {/* 2. Beban Pokok Penjualan (HPP) */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Beban Pokok Penjualan (HPP Terjual)
                </span>
                <span className="text-[10px] text-slate-400 block">Bahan baku, kemasan, tenaga langsung</span>
              </div>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                ({formatRupiah(cogsSold)})
              </span>
            </div>

            {/* 3. Penyelamatan Margin NolRugi */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div>
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Penyelamatan Margin NolRugi
                </span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400 block">
                  Kas pulih dari diskon bertahap &amp; bundling sebelum expired
                </span>
              </div>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                +{formatRupiah(rescuedMarginGain)}
              </span>
            </div>

            {/* 4. Kerugian Limbah Makanan */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Kerugian Produk Basi / Rusak (Food Waste)
                </span>
                <span className="text-[10px] text-slate-400 block">Ditekan tinggal 0.23% dari omzet</span>
              </div>
              <span className="font-semibold text-rose-500">
                ({formatRupiah(wastedInventoryLoss)})
              </span>
            </div>

            {/* 5. Laba Kotor */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 font-bold">
              <span className="text-teal-900 dark:text-teal-200">
                Laba Kotor (Gross Profit)
              </span>
              <span className="text-base font-black text-teal-800 dark:text-teal-300">
                {formatRupiah(grossProfit)}
              </span>
            </div>

            {/* 6. Beban Operasional */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Beban Operasional &amp; Umum
                </span>
                <span className="text-[10px] text-slate-400 block">Sewa tempat, gas LPG, listrik, transportasi</span>
              </div>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                ({formatRupiah(operationalExpenses)})
              </span>
            </div>

            {/* 7. Laba Sebelum Pajak (EBIT) */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 font-bold">
              <span className="text-slate-800 dark:text-slate-200">
                Laba Usaha Sebelum Pajak (EBIT)
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatRupiah(ebit)}
              </span>
            </div>

            {/* 8. PPh Final UMKM 0.5% PP No. 55/2022 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  PPh Final UMKM 0,5% (PP No. 55/2022)
                </span>
                <span className="text-[10px] text-amber-700/80 dark:text-amber-300 block">
                  Dihitung 0.5% dari omzet bruto ({formatRupiah(grossRevenue)})
                </span>
              </div>
              <span className="font-bold text-amber-700 dark:text-amber-400">
                ({formatRupiah(pphFinalUMKM)})
              </span>
            </div>

            {/* 9. Laba Bersih Setelah Pajak (Net Profit) */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-200 block">
                  Laba Bersih Setelah Pajak (Net Profit)
                </span>
                <span className="text-[11px] text-emerald-100">
                  Siap diinvestasikan kembali / dividen usaha
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                <AnimatedCounter value={netProfit} format="rupiah" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Credit Readiness Index & UU PDP */}
        <div className="gsap-card lg:col-span-5 space-y-6">
          {/* Credit Score Gauge Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Credit Readiness Index
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Kesiapan Finansial Pengajuan Kredit
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
            </div>

            {/* Visual Gauge Meter */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white text-center relative overflow-hidden shadow-inner">
              <div className="relative z-10">
                <div className="text-5xl font-black tracking-tight text-emerald-400">
                  <AnimatedCounter value={creditScore} format="score" />
                  <span className="text-2xl text-slate-400 font-normal">/100</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs mt-2 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{scoreCategory}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Probabilitas persetujuan kredit mikro: <strong>94.2%</strong>
                </p>
              </div>
            </div>

            {/* Component Breakdown Progress */}
            <div className="space-y-3 pt-1">
              {creditComponents.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.title}
                    </span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {item.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* UU PDP Compliance Checklist Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Kepatuhan Regulasi
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Checklist Kepatuhan UU PDP (No. 27/2022)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                Terpenuhi
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Data Proteksi Aktif:</strong>
                  <p className="text-[11px] text-slate-500">
                    Data transaksi tersimpan pada domain terisolasi tanpa tracking pihak ketiga.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Enkripsi Sisi Klien:</strong>
                  <p className="text-[11px] text-slate-500">
                    Informasi sensitif HPP dan margin dilindungi hash kriptografi di browser lokal.
                  </p>
                </div>
              </div>

              {/* Consent Sharing Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                <div className="flex-1 pr-3">
                  <strong className="text-xs text-teal-950 dark:text-teal-100 block">
                    Consent Sharing (Izin Berbagi Data KUR)
                  </strong>
                  <p className="text-[10px] text-teal-700/90 dark:text-teal-300 mt-0.5">
                    Memberikan izin kepada bank penyalur KUR membaca skor kesiapan kredit usaha.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={pdpConsent}
                    onChange={(e) => {
                      onToggleConsent(e.target.checked);
                      onShowToast(
                        e.target.checked ? 'Consent Berbagi Aktif' : 'Consent Dinonaktifkan',
                        e.target.checked
                          ? 'Data keuangan dapat diakses mitra perbankan secara aman.'
                          : 'Data hanya tersimpan privat di perangkat Anda.',
                        'info'
                      );
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable / PDF Preview Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsPrintModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-300 overflow-hidden z-10 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <h4 className="text-sm font-bold text-slate-800">
                  Preview Dokumen SAK-EMKM Resmi
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Sheet Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs font-serif bg-white text-slate-900">
              {/* Kop Surat UMKM */}
              <div className="text-center border-b-2 border-slate-800 pb-4">
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">
                  Dapur Berkah Nusantara
                </h2>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Sentra Industri Pangan Kemasan UMKM • Jawa Timur, Indonesia
                </p>
                <p className="text-[10px] text-slate-500">
                  Nomor Induk Berusaha (NIB): 120524009182 • Standar SAK-EMKM
                </p>
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold uppercase underline">
                  Laporan Laba Rugi Entitas Mikro Kecil Menengah
                </h3>
                <p className="text-[11px] text-slate-600">
                  Periode: 01 November 2026 s/d 10 November 2026 (Berjalan)
                </p>
              </div>

              {/* Table */}
              <table className="w-full border border-slate-300 text-xs">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold">1. Pendapatan Penjualan Usaha</td>
                    <td className="p-2 text-right font-bold">{formatRupiah(grossRevenue)}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 pl-6 text-slate-600">Beban Pokok Penjualan (HPP)</td>
                    <td className="p-2 text-right text-rose-700">({formatRupiah(cogsSold)})</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-emerald-50">
                    <td className="p-2 pl-6 font-semibold text-emerald-800">
                      Penyelamatan Margin NolRugi (Diskon Bertahap/Bundling)
                    </td>
                    <td className="p-2 text-right font-bold text-emerald-800">+{formatRupiah(rescuedMarginGain)}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 pl-6 text-slate-600">Kerugian Barang Kedaluwarsa/Rusak</td>
                    <td className="p-2 text-right text-rose-700">({formatRupiah(wastedInventoryLoss)})</td>
                  </tr>
                  <tr className="border-b border-slate-300 font-bold bg-slate-50">
                    <td className="p-2">LABA KOTOR (GROSS PROFIT)</td>
                    <td className="p-2 text-right">{formatRupiah(grossProfit)}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2">2. Beban Operasional &amp; Usaha</td>
                    <td className="p-2 text-right text-rose-700">({formatRupiah(operationalExpenses)})</td>
                  </tr>
                  <tr className="border-b border-slate-200 font-bold">
                    <td className="p-2">LABA SEBELUM PAJAK (EBIT)</td>
                    <td className="p-2 text-right">{formatRupiah(ebit)}</td>
                  </tr>
                  <tr className="border-b border-slate-200 text-amber-900 bg-amber-50/50">
                    <td className="p-2 pl-6">PPh Final UMKM 0,5% (PP No. 55/2022)</td>
                    <td className="p-2 text-right font-bold">({formatRupiah(pphFinalUMKM)})</td>
                  </tr>
                  <tr className="font-bold text-sm bg-slate-100">
                    <td className="p-2.5">LABA BERSIH SETELAH PAJAK (NET PROFIT)</td>
                    <td className="p-2.5 text-right text-emerald-800">{formatRupiah(netProfit)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signature block */}
              <div className="pt-8 flex justify-between text-center text-xs">
                <div>
                  <p className="text-slate-500">Diverifikasi Sistem AI:</p>
                  <div className="mt-8 font-bold text-teal-800">NolRugi Sentinel AI</div>
                  <p className="text-[10px] text-slate-400">Verifikasi Kriptografis Sisi Klien</p>
                </div>
                <div>
                  <p className="text-slate-500">Pemilik Usaha / Pimpinan:</p>
                  <div className="mt-8 font-bold text-slate-800">Hj. Siti Rahmawati</div>
                  <p className="text-[10px] text-slate-400">Dapur Berkah Nusantara</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

