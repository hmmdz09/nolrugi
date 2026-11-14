import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { StockStatus } from '../../types';

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

/* ───────────── Status system (single source of truth for colors) ───────────── */

export const STATUS_STYLES: Record<
  StockStatus,
  { label: string; chip: string; dot: string; bar: string; text: string }
> = {
  kritis: {
    label: 'Kritis',
    chip: 'bg-rose-50 text-rose-700 border-transparent',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
    text: 'text-rose-700',
  },
  waspada: {
    label: 'Waspada',
    chip: 'bg-amber-50 text-amber-800 border-transparent',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    text: 'text-amber-700',
  },
  'dwell-alert': {
    label: 'Dwell',
    chip: 'bg-slate-100 text-slate-700 border-transparent',
    dot: 'bg-slate-400',
    bar: 'bg-slate-400',
    text: 'text-slate-600',
  },
  aman: {
    label: 'Aman',
    chip: 'bg-brand-50 text-brand-700 border-transparent',
    dot: 'bg-brand-500',
    bar: 'bg-brand-500',
    text: 'text-brand-600',
  },
};

export const StatusChip: React.FC<{ status: StockStatus; label?: string; className?: string }> = ({
  status,
  label,
  className,
}) => {
  const s = STATUS_STYLES[status];
  return (
    <span className={cn('chip', s.chip, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      {label ?? s.label}
    </span>
  );
};

/* ───────────── Layout primitives ───────────── */

export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}> = ({ title, description, actions, eyebrow }) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div className="min-w-0">
      {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
      <h1 className="text-[22px] sm:text-[26px] font-semibold text-ink">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-slate-500 max-w-3xl leading-relaxed text-pretty">{description}</p>
      )}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export const CardHeader: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, description, icon, actions, className }) => (
  <div className={cn('flex items-start justify-between gap-3 px-5 pt-5 pb-4', className)}>
    <div className="flex items-start gap-3 min-w-0">
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h2 className="text-[14.5px] font-semibold text-ink leading-tight">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export const Segmented = <T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: React.ReactNode; count?: number }>;
  className?: string;
}) => (
  <div
    role="tablist"
    className={cn('inline-flex items-center gap-0.5 p-[3px] rounded-lg bg-slate-100 shrink-0', className)}
  >
    {options.map((o) => {
      const active = o.value === value;
      return (
        <button
          key={o.value}
          role="tab"
          aria-selected={active}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12.5px] font-medium transition-all',
            active ? 'bg-white text-ink shadow-[0_1px_2px_rgb(18_18_16/0.08)]' : 'text-slate-500 hover:text-ink'
          )}
        >
          {o.label}
          {o.count !== undefined && (
            <span
              className={cn(
                'num text-[11.5px]',
                active ? 'text-slate-500' : 'text-slate-400'
              )}
            >
              {o.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

/* ───────────── Modal shell (Esc to close, scroll-lock, a11y) ───────────── */

export const Modal: React.FC<{
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  children: React.ReactNode;
}> = ({ onClose, title, description, icon, size = 'md', footer, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const width = size === 'xl' ? 'max-w-3xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full bg-white sm:rounded-xl rounded-t-2xl shadow-pop border border-slate-200 flex flex-col max-h-[92dvh] sm:max-h-[88dvh] animate-scale-in',
          width
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-start gap-3 min-w-0">
            {icon && (
              <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-ink leading-tight">{title}</h3>
              {description && <p className="text-[13px] text-slate-500 mt-0.5">{description}</p>}
            </div>
          </div>
          <button onClick={onClose} className="btn-icon -mr-1.5 -mt-1" aria-label="Tutup">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 sm:rounded-b-xl flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode; className?: string }> = ({
  label,
  hint,
  children,
  className,
}) => (
  <label className={cn('block', className)}>
    <span className="block text-[12.5px] font-medium text-slate-700 mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-500 mt-1">{hint}</span>}
  </label>
);
