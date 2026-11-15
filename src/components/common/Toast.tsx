import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ICONS = {
  success: <CheckCircle2 className="w-[18px] h-[18px] text-brand-400" />,
  warning: <AlertTriangle className="w-[18px] h-[18px] text-amber-400" />,
  danger: <AlertCircle className="w-[18px] h-[18px] text-rose-400" />,
  info: <Info className="w-[18px] h-[18px] text-slate-300" />,
};

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => (
  <div
    className="fixed z-[60] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px] flex flex-col gap-2 pointer-events-none"
    aria-live="polite"
  >
    {toasts.map((t) => (
      <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
    ))}
  </div>
);

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => onDismiss(toast.id), 160);
    return () => clearTimeout(t);
  }, [leaving, onDismiss, toast.id]);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 p-3.5 pr-2.5 rounded-[20px] bg-[rgb(28_22_48/0.82)] backdrop-blur-2xl text-white shadow-pop ring-1 ring-white/15 transition-all duration-150 animate-scale-in ${
        leaving ? 'opacity-0 translate-y-1' : ''
      }`}
    >
      <span className="mt-px shrink-0">{ICONS[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold">{toast.title}</p>
        <p className="text-[12px] text-slate-300 mt-0.5 leading-relaxed">{toast.description}</p>
      </div>
      <button
        onClick={() => setLeaving(true)}
        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
