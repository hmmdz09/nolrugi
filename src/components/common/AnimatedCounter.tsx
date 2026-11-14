import React, { useEffect, useRef } from 'react';
import { formatRupiah } from '../../utils/formatters';

interface AnimatedCounterProps {
  value: number;
  format?: 'rupiah' | 'percent' | 'number' | 'score';
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const render = (v: number, format: AnimatedCounterProps['format']) => {
  if (format === 'rupiah') return formatRupiah(v);
  if (format === 'percent') return `${v.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  if (format === 'score') return `${Math.round(v)}`;
  return Math.round(v).toLocaleString('id-ID');
};

/** Lightweight count-up (rAF, ease-out). Respects prefers-reduced-motion. */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  format = 'number',
  duration = 0.9,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = reduce ? 1 : Math.min(1, (now - t0) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = start + (value - start) * eased;
      el.textContent = `${prefix}${render(cur, format)}${suffix}`;
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = value;
    };
  }, [value, format, duration, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}${render(value, format)}${suffix}`}
    </span>
  );
};
