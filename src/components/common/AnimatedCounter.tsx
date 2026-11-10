import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { formatRupiah } from '../../utils/formatters';

interface AnimatedCounterProps {
  value: number;
  format?: 'rupiah' | 'percent' | 'number' | 'score';
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  format = 'number',
  duration = 1.2,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const valRef = useRef<{ current: number }>({ current: 0 });

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    gsap.to(valRef.current, {
      current: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        const current = valRef.current.current;
        if (format === 'rupiah') {
          el.innerText = `${prefix}${formatRupiah(current)}${suffix}`;
        } else if (format === 'percent') {
          el.innerText = `${prefix}${current.toFixed(1)}%${suffix}`;
        } else if (format === 'score') {
          el.innerText = `${prefix}${Math.round(current)}${suffix}`;
        } else {
          el.innerText = `${prefix}${Math.round(current).toLocaleString('id-ID')}${suffix}`;
        }
      },
    });
  }, [value, format, duration, prefix, suffix]);

  return <span ref={spanRef} className={className}>0</span>;
};
