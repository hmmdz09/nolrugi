import React, { useState } from 'react';
import { Printer, ShieldCheck, Download, FileText, Lock, Award } from 'lucide-react';
import { InventoryBatch, CreditReadinessComponent } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { CardHeader, Modal, PageHeader, cn } from '../common/ui';

interface ReportsViewProps {
  batches: InventoryBatch[];
  pdpConsent: boolean;
  onToggleConsent: (val: boolean) => void;
  onShowToast: (title: string, desc: string, type: 'success' | 'warning' | 'info') => void;
}

const BUSINESS = { name: 'Dapur Berkah Nusantara', nib: '0220268841901', period: 'November 2026' };

export const ReportsView: React.FC<ReportsViewProps> = ({ batches, pdpConsent, onToggleConsent, onShowToast }) => {
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const grossRevenue = 46800000;
  const cogsSold = 22400000;
  const rescuedMarginGain = 8250000;
  const wastedInventoryLoss = 110000;
  const grossProfit = grossRevenue - cogsSold + rescuedMarginGain - wastedInventoryLoss;
  const operationalExpenses = 14200000;
  const ebit = grossProfit - operationalExpenses;
  const pphFinal = Math.round(grossRevenue * 0.005);
  const netProfit = ebit - pphFinal;

  const salesMargin = ((grossRevenue - cogsSold) / grossRevenue) * 100;
  const wasteRatio = (wastedInventoryLoss / grossRevenue) * 100;
  const netMargin = (netProfit / grossRevenue) * 100;


  const components: CreditReadinessComponent[] = [
    { title: 'Disiplin pencatatan FEFO', score: 95, weight: 25, description: 'Batch dicatat setiap barang masuk.', status: 'optimal' },
    { title: 'Gross margin usaha', score: 88, weight: 30, description: `Margin penjualan ${salesMargin.toLocaleString('id-ID', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%, di atas ambang 25%.`, status: 'optimal' },
    { title: 'Rasio kerugian stok', score: 92, weight: 25, description: `Food waste ${wasteRatio.toLocaleString('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}% dari omzet.`, status: 'optimal' },
    { title: 'Arus kas & likuiditas', score: 75, weight: 20, description: 'Perputaran kas ±18 hari.', status: 'cukup' },
  ];

  const creditScore = Math.round(components.reduce((a, c) => a + (c.score * c.weight) / 100, 0));
  const scoreCategory = creditScore >= 80 ? 'Siap ajukan KUR' : creditScore >= 65 ? 'Hampir siap' : 'Perlu pembenahan';

  const lines: Array<{ label: string; sub?: string; value: number; kind: 'plus' | 'minus' | 'total' | 'gain' }> = [
    { label: 'Pendapatan penjualan', value: grossRevenue, kind: 'plus' },
    { label: 'Beban pokok penjualan (HPP)', sub: 'Bahan baku & kemasan terpakai', value: -cogsSold, kind: 'minus' },
    { label: 'Nilai stok terselamatkan', sub: 'Hasil diskon bertahap & bundling', value: rescuedMarginGain, kind: 'gain' },
    { label: 'Kerugian produk basi / rusak', sub: `${wasteRatio.toLocaleString('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}% dari omzet`, value: -wastedInventoryLoss, kind: 'minus' },
    { label: 'Laba kotor', value: grossProfit, kind: 'total' },
    { label: 'Beban operasional & umum', sub: 'Sewa, gas, listrik, operasional', value: -operationalExpenses, kind: 'minus' },
    { label: 'Laba sebelum pajak', value: ebit, kind: 'total' },
    { label: 'PPh final UMKM 0,5%', sub: 'PP No. 55/2022 · dari omzet bruto', value: -pphFinal, kind: 'minus' },
  ];

  const fmtSigned = (v: number) => (v < 0 ? `(${formatRupiah(-v)})` : formatRupiah(v));

  const handleExport = () => {
    const dossier = {
      namaUsaha: BUSINESS.name,
      nib: BUSINESS.nib,
      sektor: 'UMKM Industri Pengolahan Pangan Kemasan',
      standarAkuntansi: 'SAK-EMKM (IAI)',
      periode: BUSINESS.period,
      dibuatPada: new Date().toISOString(),
      skorKesiapanKredit: { skor: creditScore, kategori: scoreCategory, consentBerbagi: pdpConsent },
      ringkasanLabaRugi: {
        pendapatan: grossRevenue,
        hpp: cogsSold,
        nilaiStokTerselamatkan: rescuedMarginGain,
        kerugianLimbah: wastedInventoryLoss,
        labaKotor: grossProfit,
        bebanOperasional: operationalExpenses,
        labaSebelumPajak: ebit,
        pphFinal05: pphFinal,
        labaBersih: netProfit,
      },
      stokAktif: batches.map((b) => ({
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
    const a = document.createElement('a');
    a.href = url;
    a.download = `NolRugi_Berkas_KUR_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onShowToast('Berkas KUR diunduh', 'Ringkasan laporan & stok tersimpan sebagai file JSON.', 'success');
  };

  const circumference = 2 * Math.PI * 52;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Keuangan"
        title="Laporan SAK-EMKM"
        description={`Laporan laba rugi sederhana entitas mikro periode ${BUSINESS.period}, beserta skor kesiapan pengajuan kredit usaha.`}
        actions={
          <>
            <button onClick={() => setIsPrintOpen(true)} className="btn-secondary">
              <Printer className="w-4 h-4" />
              Pratinjau cetak
            </button>
            <button onClick={handleExport} className="btn-primary">
              <Download className="w-4 h-4" />
              Ekspor berkas KUR
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* P&L */}
        <div className="card xl:col-span-3 overflow-hidden xl:self-start">
          <CardHeader
            title="Laporan laba rugi"
            description={`${BUSINESS.name} · ${BUSINESS.period}`}
            icon={<FileText className="w-4 h-4" />}
          />
          <table className="w-full text-[13px] tabular">
            <tbody>
              {lines.map((l) => (
                <tr
                  key={l.label}
                  className={cn(
                    'border-t border-slate-100',
                    l.kind === 'total' && 'bg-slate-50/80',
                    l.kind === 'gain' && 'bg-brand-50/40'
                  )}
                >
                  <td className="py-3 pl-5 pr-3">
                    <div className={cn(l.kind === 'total' ? 'font-semibold text-ink' : 'text-slate-700')}>{l.label}</div>
                    {l.sub && <div className="text-[12px] text-slate-500">{l.sub}</div>}
                  </td>
                  <td
                    className={cn(
                      'py-3 pl-3 pr-5 text-right whitespace-nowrap',
                      l.kind === 'total' && 'font-semibold text-ink',
                      l.kind === 'minus' && 'text-slate-500',
                      l.kind === 'gain' && 'text-brand-700 font-medium',
                      l.kind === 'plus' && 'text-ink font-medium'
                    )}
                  >
                    {l.kind === 'gain' ? '+' : ''}
                    {fmtSigned(l.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between gap-4 px-5 py-4 bg-brand-950 text-white">
            <div>
              <div className="text-[13px] font-semibold">Laba bersih setelah pajak</div>
              <div className="text-[12px] text-brand-200">Margin bersih {netMargin.toLocaleString('id-ID', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%</div>
            </div>
            <div className="text-xl sm:text-2xl font-semibold tabular">
              <AnimatedCounter value={netProfit} format="rupiah" />
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          {/* Credit readiness */}
          <div className="card">
            <CardHeader title="Kesiapan kredit (KUR)" description="Estimasi internal, bukan keputusan bank." icon={<Award className="w-4 h-4" />} />
            <div className="px-5 pb-5">
              <div className="flex items-center gap-5">
                <div className="relative w-32 h-32 shrink-0 self-center">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - creditScore / 100)}
                      className="transition-[stroke-dashoffset] duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-semibold text-ink tabular">
                      <AnimatedCounter value={creditScore} format="score" />
                    </span>
                    <span className="text-[11px] text-slate-500">dari 100</span>
                  </div>
                </div>
                <div>
                  <span className="chip bg-brand-50 text-brand-700 border-brand-200">{scoreCategory}</span>
                  <p className="mt-2 text-[12px] text-slate-500 leading-relaxed">
                    Skor tertimbang dari 4 indikator pencatatan dan kinerja keuangan.
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-3.5">
                {components.map((c) => (
                  <li key={c.title}>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-slate-700">
                        {c.title} <span className="text-slate-500 text-[11px]">· bobot {c.weight}%</span>
                      </span>
                      <span className="font-semibold text-ink tabular">{c.score}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', c.status === 'optimal' ? 'bg-brand-500' : 'bg-amber-500')}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{c.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* PDP */}
          <div className="card p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-ink">Privasi data · UU PDP 27/2022</div>
                <p className="mt-1 text-[12px] text-slate-500 leading-relaxed flex items-start gap-1.5">
                  <Lock className="w-3.5 h-3.5 mt-px shrink-0" />
                  Data demo ini disimpan lokal di browser kamu (localStorage) dan tidak dikirim ke server.
                </p>
              </div>
            </div>
            <label className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3.5 cursor-pointer hover:bg-slate-50/60">
              <span>
                <span className="block text-[13px] font-semibold text-ink">Izinkan berbagi ke bank mitra</span>
                <span className="block text-[12px] text-slate-500">Untuk verifikasi skor saat pengajuan KUR.</span>
              </span>
              <span className="relative inline-flex shrink-0">
                <input
                  type="checkbox"
                  role="switch"
                  checked={pdpConsent}
                  onChange={(e) => {
                    onToggleConsent(e.target.checked);
                    onShowToast(
                      e.target.checked ? 'Izin berbagi aktif' : 'Izin berbagi dinonaktifkan',
                      e.target.checked ? 'Ringkasan dapat diverifikasi bank mitra.' : 'Data hanya tersimpan di perangkat ini.',
                      'info'
                    );
                  }}
                  className="peer sr-only"
                />
                <span className="w-10 h-6 rounded-full bg-slate-300 peer-checked:bg-brand-600 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/20" />
                <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </span>
            </label>
          </div>
        </div>
      </div>

      {isPrintOpen && (
        <Modal
          onClose={() => setIsPrintOpen(false)}
          size="lg"
          icon={<FileText className="w-4 h-4" />}
          title="Pratinjau laporan"
          description="Gunakan Cetak untuk menyimpan sebagai PDF."
          footer={
            <>
              <button onClick={() => setIsPrintOpen(false)} className="btn-ghost">
                Tutup
              </button>
              <button onClick={() => window.print()} className="btn-primary">
                <Printer className="w-4 h-4" />
                Cetak
              </button>
            </>
          }
        >
          <div className="rounded-xl border border-slate-200 p-6 sm:p-8 text-ink">
            <div className="text-center pb-5 border-b border-slate-200">
              <div className="eyebrow">Laporan Keuangan SAK-EMKM</div>
              <h2 className="mt-1 text-lg font-semibold">{BUSINESS.name}</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                NIB {BUSINESS.nib} · Periode {BUSINESS.period}
              </p>
            </div>
            <table className="w-full mt-5 text-[13px] tabular">
              <tbody>
                {lines.map((l) => (
                  <tr key={l.label} className={cn('border-b border-slate-100', l.kind === 'total' && 'font-semibold')}>
                    <td className="py-2">{l.label}</td>
                    <td className="py-2 text-right">
                      {l.kind === 'gain' ? '+' : ''}
                      {fmtSigned(l.value)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-ink font-semibold">
                  <td className="py-3">Laba bersih setelah pajak</td>
                  <td className="py-3 text-right">{formatRupiah(netProfit)}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-5 rounded-lg bg-slate-50 p-4 flex items-center justify-between text-[12px]">
              <span>
                Skor kesiapan kredit: <strong>{creditScore}/100</strong> ({scoreCategory})
              </span>
              <span className="text-slate-500">Izin berbagi: {pdpConsent ? 'aktif' : 'tidak aktif'}</span>
            </div>
            <p className="mt-6 text-center text-[11px] text-slate-500">
              Dibuat otomatis oleh NolRugi pada {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
