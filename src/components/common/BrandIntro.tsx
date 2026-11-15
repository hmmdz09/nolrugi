import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface BrandIntroProps {
  onComplete: () => void;
  durationMs?: number;
}

export const BrandIntro: React.FC<BrandIntroProps> = ({ onComplete, durationMs = 2400 }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, durationMs - 400);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onComplete]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(onComplete, 300);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="brand-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#f4f1ef]"
        >
          {/* Ambient Dreamy Background Gradients */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.15, 1], opacity: 0.85 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-rose-200/80 to-purple-200/80 blur-3xl"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.2, 1], opacity: 0.8 }}
              transition={{ duration: 2.2, delay: 0.2, ease: 'easeOut' }}
              className="absolute -bottom-24 -right-24 w-[550px] h-[550px] rounded-full bg-gradient-to-tl from-indigo-200/80 via-purple-200/80 to-pink-200/80 blur-3xl"
            />
          </div>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-slate-500 hover:text-ink bg-white/50 hover:bg-white/90 border border-white/70 shadow-xs backdrop-blur-md transition-all z-10"
          >
            Lewati
          </button>

          {/* Central Motion Graphic Card */}
          <motion.div
            initial={{ scale: 0.92, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -10, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-8 py-10 rounded-[36px] bg-white/45 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_-15px_rgb(70_50_140/0.18)] max-w-md mx-4"
          >
            {/* Logo Mark with Radiant Ring */}
            <div className="relative mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 120, delay: 0.1 }}
                className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center shadow-[0_12px_28px_-6px_rgb(139_111_224/0.75)] relative z-10"
              >
                <svg viewBox="0 0 32 32" className="w-12 h-12" aria-hidden>
                  <circle cx="16" cy="16" r="9" fill="none" stroke="white" strokeWidth="2.6" />
                  <circle cx="16" cy="16" r="3.2" fill="white" />
                  <path d="M4 22C10 19 22 13 28 9" stroke="#8b6fe0" strokeWidth="3.4" strokeLinecap="round" />
                  <path d="M4 22C10 19 22 13 28 9" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />
                </svg>
              </motion.div>

              {/* Glowing Pulse Wave */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.5, 1.9], opacity: [0.8, 0.4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                className="absolute inset-0 rounded-[28px] bg-brand-400/40 blur-md pointer-events-none"
              />
            </div>

            {/* Brand Title with Highlighting Effect */}
            <div className="relative overflow-hidden px-4 py-1">
              <div className="flex items-center justify-center text-4xl sm:text-5xl font-black tracking-tight select-none">
                <motion.span
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.45, delay: 0.35, ease: 'easeOut' }}
                  className="text-slate-900"
                >
                  Nol
                </motion.span>

                <div className="relative inline-block ml-0.5">
                  <motion.span
                    initial={{ y: 25, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.45, delay: 0.45, ease: 'easeOut' }}
                    className="text-brand-600 relative z-10"
                  >
                    Rugi
                  </motion.span>

                  {/* Luminous Highlight Underline / Strike Bar */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.55, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -bottom-1 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-400 via-rose-400 to-brand-500 rounded-full origin-left shadow-[0_0_12px_rgba(139,111,224,0.8)]"
                  />
                </div>
              </div>

              {/* Shimmer Light Sweep across Brand Name */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.1, delay: 0.7, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] pointer-events-none"
              />
            </div>

            {/* Tagline Reveal */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.95 }}
              className="mt-3 text-[14px] font-semibold text-slate-600"
            >
              AI Margin &amp; Batch Expiry Rescue
            </motion.p>

            {/* Micro Badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.15 }}
              className="mt-4 flex items-center gap-2"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-white text-[11px] font-semibold text-brand-700 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Margin Loss</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-white text-[11px] font-semibold text-slate-600 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>FEFO Radar</span>
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
