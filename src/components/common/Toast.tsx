import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';
import gsap from 'gsap';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (itemRef.current) {
      gsap.fromTo(
        itemRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.2)' }
      );
    }
  }, []);

  const handleClose = () => {
    if (itemRef.current) {
      gsap.to(itemRef.current, {
        opacity: 0,
        x: 40,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => onDismiss(toast.id),
      });
    } else {
      onDismiss(toast.id);
    }
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />,
  };

  const borders = {
    success: 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/95 dark:bg-emerald-950/80',
    warning: 'border-amber-200 dark:border-amber-800/60 bg-amber-50/95 dark:bg-amber-950/80',
    danger: 'border-rose-200 dark:border-rose-800/60 bg-rose-50/95 dark:bg-rose-950/80',
    info: 'border-teal-200 dark:border-teal-800/60 bg-teal-50/95 dark:bg-teal-950/80',
  };

  return (
    <div
      ref={itemRef}
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all ${borders[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{toast.title}</h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
          {toast.description}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 -mr-1 -mt-1 rounded-md"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
