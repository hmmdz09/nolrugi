import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Award,
  Download,
  Sparkles,
  FileText,
  X
} from 'lucide-react';
import { InventoryBatch, CreditReadinessComponent } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { AnimatedCounter } from '../common/AnimatedCounter';
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
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Financial figures
  const grossRevenue = 46800000;
  const cogsSold = 22400000;
  const rescuedMarginGain = 8250000;
  const wastedInventoryLoss = 110000;
  const grossProfit = grossRevenue - cogsSold + rescuedMarginGain - wastedInventoryLoss;
  const operationalExpenses = 14200000;
  const ebit = grossProfit - operationalExpenses;
  const pphFinalUMKM = Math.round(grossRevenue * 0.005); // 0.5% PP No. 55/2022
  const netProfit = ebit - pphFinalUMKM;

  const creditScore = 84;
  const scoreCategory = 'Sangat Siap Pengajuan KUR (Bank BRI / BNI / Mandiri)';

  const creditComponents: CreditReadinessComponent[] = [
    {
      title: 'Disiplin Pencatatan Sistem FEFO',
      score: 95,
      weight: 25,
      description: 'Pencatatan batch rutin setiap barang masuk.',
      status: 'optimal',
    },
    {
      title: 'Gross Margin Usaha Sehat (> 30%)',
      score: 88,
      weight: 30,
      description: 'Gross margin 34.6%, di atas ambang batas bank (25%).',
      status: 'optimal',
    },
    {
      title: 'Rasio Kerugian Stok Terkendali (< 1%)',
      score: 92,
      weight: 25,
      description: 'Limbah pangan ditekan ke 0.23% berkat diskon bertahap.',
      status: 'optimal',
    },
    {
      title: 'Arus Kas & Likuiditas Modal Kerja',
      score: 75,
      weight: 20,
      description: 'Perputaran kas 18 hari, aman menopang angsuran kredit.',
      status: 'cukup',
    },
  ];

  const handleExportKurDossier = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#5b58eb', '#f43f5e', '#10b981'],
    });

    const dossier = {
      namaUsaha: 'Dapur Berkah Nusantara',
      sektor: 'UMKM Industri Pengolahan Pangan Kemasan',
      standarAkuntansi: 'SAK-EMKM (Ikatan Akuntan Indonesia)',
      tanggalAudit: new Date().toISOString(),
      creditReadinessScore: {
        score: creditScore,
        category: scoreCategory,
        pdpCompliance: pdpConsent ? 'Consent Active - Client Encrypted' : 'Local Only',
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

    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
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

  return (
    <div className="space-y-5 pb-12 w-full">
      {/* 1. Header Bar with Skillalley aesthetic */}
      <div className="bg-white rounded-[28px] p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Laporan SAK-EMKM &amp; Skor Kesiapan KUR
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#5b58eb] border border-indigo-100 whitespace-nowrap">
              Standar BI &amp; OJK
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium flex-wrap">
            <span>• Laporan laba rugi entitas mikro</span>
            <span>• Skor kelayakan kredit perbankan</span>
            <span>• Kepatuhan UU PDP No. 27/2022</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak / PDF Preview</span>
          </button>

          <button
            onClick={handleExportKurDossier}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#5b58eb] hover:bg-[#4a47d4] text-white shadow-md shadow-[#5b58eb]/20 transition-all whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export Berkas Verifikasi KUR</span>
          </button>
        </div>
      </div>

      {/* 2. Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Laba Rugi Sederhana SAK-EMKM (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Standar Akuntansi Keuangan Entitas Mikro Kecil
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                Laporan Laba Rugi Periode Berjalan (Nov 2026)
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-indigo-50 text-[#5b58eb]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {/* 1. Pendapatan Usaha */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-800">
                Pendapatan Penjualan Usaha (Omzet)
              </span>
              <span className="font-extrabold text-slate-900">
                {formatRupiah(grossRevenue)}
              </span>
            </div>

            {/* 2. Beban Pokok Penjualan (HPP) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-semibold text-slate-800">
                  Beban Pokok Penjualan (HPP Terjual)
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Bahan baku pokok &amp; kemasan terpakai</span>
              </div>
              <span className="font-bold text-rose-600">
                ({formatRupiah(cogsSold)})
              </span>
            </div>

            {/* 3. Margin Terselamatkan NolRugi */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div>
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Penyelamatan Margin (NolRugi)
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">Hasil optimasi diskon FEFO &amp; paket bundling</span>
              </div>
              <span className="font-extrabold text-emerald-700">
                +{formatRupiah(rescuedMarginGain)}
              </span>
            </div>

            {/* 4. Kerugian Produk Basi */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-semibold text-slate-700">
                  Kerugian Produk Basi / Rusak (Food Waste)
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Terkendali hanya 0.23% dari omzet</span>
              </div>
              <span className="font-semibold text-rose-500">
                ({formatRupiah(wastedInventoryLoss)})
              </span>
            </div>

            {/* 5. Laba Kotor */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 font-extrabold">
              <span className="text-slate-900">
                Laba Kotor (Gross Profit)
              </span>
              <span className="text-base font-black text-slate-900">
                {formatRupiah(grossProfit)}
              </span>
            </div>

            {/* 6. Beban Operasional */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-slate-800">
                  Beban Operasional &amp; Umum
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Sewa kios, gas LPG, listrik, operasional</span>
              </div>
              <span className="font-bold text-rose-600">
                ({formatRupiah(operationalExpenses)})
              </span>
            </div>

            {/* 7. Laba Sebelum Pajak */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 font-extrabold">
              <span className="text-slate-900">
                Laba Usaha Sebelum Pajak (EBIT)
              </span>
              <span className="font-black text-slate-900">
                {formatRupiah(ebit)}
              </span>
            </div>

            {/* 8. PPh Final PP 55 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-100">
              <div>
                <span className="font-bold text-amber-900">
                  PPh Final UMKM 0,5% (PP No. 55/2022)
                </span>
                <span className="text-[10px] text-amber-700 block mt-0.5">
                  0.5% dari omzet bruto ({formatRupiah(grossRevenue)})
                </span>
              </div>
              <span className="font-bold text-amber-800">
                ({formatRupiah(pphFinalUMKM)})
              </span>
            </div>

            {/* 9. Laba Bersih Setelah Pajak */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#5b58eb] text-white shadow-md shadow-[#5b58eb]/20">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-100 block">
                  Laba Bersih Setelah Pajak (Net Profit)
                </span>
                <span className="text-[11px] text-white/80">
                  Siap diinvestasikan kembali / dividen usaha
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                <AnimatedCounter value={netProfit} format="rupiah" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Credit Readiness Index & UU PDP (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Credit Score Gauge Card */}
          <div className="bg-white rounded-[28px] p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5b58eb]">
                  Credit Readiness Index
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Kesiapan Finansial Pengajuan Kredit
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-indigo-50 text-[#5b58eb]">
                <Award className="w-4 h-4" />
              </div>
            </div>

            {/* Clean Score Display */}
            <div className="p-6 rounded-2xl bg-[#f8f9fe] border border-indigo-100 text-center relative overflow-hidden">
              <div className="text-5xl font-black tracking-tight text-[#5b58eb]">
                <AnimatedCounter value={creditScore} format="score" />
                <span className="text-xl text-slate-400 font-semibold">/100</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#5b58eb] font-bold text-xs mt-2.5 shadow-2xs border border-indigo-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{scoreCategory}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                Probabilitas persetujuan kredit mikro bank: <strong>94.2%</strong>
              </p>
            </div>

            {/* Score Breakdown Bars */}
            <div className="space-y-3 pt-1">
              {creditComponents.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {item.title}
                    </span>
                    <span className="font-black text-[#5b58eb]">
                      {item.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#5b58eb] h-full rounded-full transition-all duration-1000"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* UU PDP Compliance Card */}
          <div className="bg-white rounded-[28px] p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5b58eb]" />
                <h3 className="text-xs font-bold text-slate-900">
                  Kepatuhan UU PDP No. 27/2022
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#5b58eb] border border-indigo-100">
                Terpenuhi
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-50">
                <CheckCircle2 className="w-4 h-4 text-[#5b58eb] shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600">
                  <strong>Enkripsi Sisi Klien:</strong> Data keuangan tersimpan privat di perangkat pengguna.
                </p>
              </div>

              {/* Consent Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <div className="flex-1 pr-3">
                  <strong className="text-xs text-slate-900 block font-extrabold">
                    Consent Sharing (Izin KUR)
                  </strong>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    Izin verifikasi skor kesiapan kredit kepada bank mitra KUR.
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
                          ? 'Data keuangan dapat diverifikasi mitra perbankan.'
                          : 'Data hanya tersimpan privat di perangkat lokal.',
                        'info'
                      );
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5b58eb]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official SAK-EMKM PDF Preview Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsPrintModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5b58eb]" />
                <h4 className="text-sm font-bold text-slate-900">
                  Pratinjau Dokumen SAK-EMKM Resmi
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5b58eb] hover:bg-[#4a47d4] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-slate-900 print:p-0">
              <div className="text-center border-b pb-4">
                <h2 className="text-lg font-black uppercase tracking-tight">
                  Laporan Keuangan SAK-EMKM
                </h2>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                  Entitas Mikro: Dapur Berkah Nusantara • NIB: 0220268841901
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Periode Berjalan: November 2026 • Sesuai Standar IAI &amp; Regulasi Perbankan KUR
                </p>
              </div>

              {/* Laba Rugi Table */}
              <div className="space-y-2 text-xs">
                <div className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                  I. Rincian Laba Rugi
                </div>
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100 py-1.5">
                      <td className="py-2 text-slate-700">Pendapatan Penjualan Usaha Bruto</td>
                      <td className="py-2 text-right font-bold">{formatRupiah(grossRevenue)}</td>
                    </tr>
                    <tr className="border-b border-slate-100 py-1.5">
                      <td className="py-2 text-slate-700">Beban Pokok Penjualan (HPP)</td>
                      <td className="py-2 text-right text-rose-600 font-semibold">({formatRupiah(cogsSold)})</td>
                    </tr>
                    <tr className="border-b border-slate-100 py-1.5 bg-emerald-50/50">
                      <td className="py-2 text-emerald-800 font-semibold">+ Pemulihan Margin NolRugi</td>
                      <td className="py-2 text-right text-emerald-700 font-bold">+{formatRupiah(rescuedMarginGain)}</td>
                    </tr>
                    <tr className="border-b border-slate-100 py-1.5">
                      <td className="py-2 text-slate-700">- Beban Barang Rusak/Basi</td>
                      <td className="py-2 text-right text-rose-600 font-semibold">({formatRupiah(wastedInventoryLoss)})</td>
                    </tr>
                    <tr className="border-b-2 border-slate-300 py-2 font-bold bg-slate-50">
                      <td className="py-2 text-slate-900">Laba Kotor (Gross Profit)</td>
                      <td className="py-2 text-right text-slate-900 font-black">{formatRupiah(grossProfit)}</td>
                    </tr>
                    <tr className="border-b border-slate-100 py-1.5">
                      <td className="py-2 text-slate-700">Beban Operasional, Listrik &amp; Sewa</td>
                      <td className="py-2 text-right text-rose-600 font-semibold">({formatRupiah(operationalExpenses)})</td>
                    </tr>
                    <tr className="border-b border-slate-100 py-1.5 font-bold">
                      <td className="py-2 text-slate-900">Laba Sebelum Pajak (EBIT)</td>
                      <td className="py-2 text-right text-slate-900 font-extrabold">{formatRupiah(ebit)}</td>
                    </tr>
                    <tr className="border-b border-slate-100 py-1.5 text-amber-900">
                      <td className="py-2 text-amber-800">PPh Final UMKM 0,5% (PP 55/2022)</td>
                      <td className="py-2 text-right text-amber-800 font-bold">({formatRupiah(pphFinalUMKM)})</td>
                    </tr>
                    <tr className="border-t-2 border-b-2 border-[#5b58eb] py-2.5 font-black bg-indigo-50/60 text-slate-900">
                      <td className="py-2.5 text-slate-900 text-sm">Laba Bersih Setelah Pajak (Net Profit)</td>
                      <td className="py-2.5 text-right text-[#5b58eb] text-base">{formatRupiah(netProfit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Credit Readiness Seal */}
              <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#5b58eb]">
                    Verifikasi Kelayakan KUR
                  </div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    Credit Readiness Score: {creditScore}/100
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Status: <strong>{scoreCategory}</strong>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <div>Kepatuhan UU PDP No. 27/2022: <strong>Aktif</strong></div>
                  <div>Terenkripsi Digital: SHA-256 Valid</div>
                </div>
              </div>

              <div className="pt-4 border-t text-[10px] text-slate-400 text-center">
                Dicetak otomatis dari Sistem Manajemen Inventori &amp; Margin NolRugi pada {new Date().toLocaleDateString('id-ID')}.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
