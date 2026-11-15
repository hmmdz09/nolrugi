import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sparkles, ShieldCheck, ArrowRight, Play } from 'lucide-react';

interface BrandIntroProps {
  onComplete: () => void;
  durationMs?: number;
}

export const BrandIntro: React.FC<BrandIntroProps> = ({ onComplete, durationMs = 3000 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const logoEmblemRef = useRef<HTMLDivElement>(null);
  const pulseRingRef = useRef<HTMLDivElement>(null);
  const nolTextRef = useRef<HTMLSpanElement>(null);
  const rugiTextRef = useRef<HTMLSpanElement>(null);
  const highlightBarRef = useRef<HTMLDivElement>(null);
  const highlightGlowRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const badge1Ref = useRef<HTMLSpanElement>(null);
  const badge2Ref = useRef<HTMLSpanElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  const isExitingRef = useRef(false);

  const handleFinish = () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    if (containerRef.current && cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.96,
        y: -15,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 0.45,
        ease: 'power3.inOut',
      });
      gsap.to(containerRef.current, {
        opacity: 0,
        filter: 'blur(14px)',
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: onComplete,
      });
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial setups to guarantee clean starting states
      gsap.set(cardRef.current, {
        scale: 0.88,
        opacity: 0,
        y: 40,
        filter: 'blur(16px)',
        transformPerspective: 1200,
      });
      gsap.set(logoEmblemRef.current, {
        scale: 0,
        rotationY: 70,
        rotation: -30,
        transformOrigin: '50% 50%',
      });
      gsap.set([nolTextRef.current, rugiTextRef.current], {
        yPercent: 120,
        opacity: 0,
      });
      gsap.set(highlightBarRef.current, {
        scaleX: 0,
        transformOrigin: 'left center',
      });
      gsap.set(highlightGlowRef.current, {
        opacity: 0,
        scaleX: 0,
        transformOrigin: 'left center',
      });
      gsap.set(shimmerRef.current, {
        xPercent: -180,
      });
      gsap.set(taglineRef.current, {
        opacity: 0,
        y: 16,
      });
      gsap.set([badge1Ref.current, badge2Ref.current], {
        opacity: 0,
        scale: 0.75,
        y: 10,
      });

      // Ambient Orbs Floating (Infinite Smooth Sine Wave)
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          x: 25,
          y: -25,
          scale: 1.12,
          duration: 4.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          x: -30,
          y: 20,
          scale: 1.15,
          duration: 5.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.5,
        });
      }
      if (orb3Ref.current) {
        gsap.to(orb3Ref.current, {
          x: 20,
          y: 35,
          scale: 1.08,
          duration: 4.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1,
        });
      }

      // Master Timeline for Modern Cinematic Intro
      const tl = gsap.timeline();

      // Step A: Floating Glass Card Entrance
      tl.to(cardRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.85,
        ease: 'expo.out',
      });

      // Step B: 3D Kinetic Logo Flip & Spring
      tl.to(
        logoEmblemRef.current,
        {
          scale: 1,
          rotationY: 0,
          rotation: 0,
          duration: 0.9,
          ease: 'back.out(2.2)',
        },
        '-=0.55'
      );

      // Pulse Ring shockwave trigger
      tl.fromTo(
        pulseRingRef.current,
        { scale: 0.8, opacity: 0.9 },
        { scale: 2.1, opacity: 0, duration: 1.4, ease: 'power2.out' },
        '-=0.6'
      );

      // Step C: Typography Reveal ("Nol" followed by "Rugi")
      tl.to(
        nolTextRef.current,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power4.out',
        },
        '-=0.7'
      );

      tl.to(
        rugiTextRef.current,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power4.out',
        },
        '-=0.45'
      );

      // Step D: Glowing Highlight Bar across "Rugi" (The signature highlight effect)
      tl.to(
        highlightBarRef.current,
        {
          scaleX: 1,
          duration: 0.65,
          ease: 'expo.out',
        },
        '-=0.25'
      );

      tl.to(
        highlightGlowRef.current,
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        },
        '-=0.65'
      );

      // Step E: Specular Shimmer Sweep
      tl.to(
        shimmerRef.current,
        {
          xPercent: 240,
          duration: 0.9,
          ease: 'power2.inOut',
        },
        '-=0.45'
      );

      // Step F: Tagline Reveal
      tl.to(
        taglineRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
        },
        '-=0.55'
      );

      // Step G: Micro Badges Spring Pop
      tl.to(
        [badge1Ref.current, badge2Ref.current],
        {
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.55,
          ease: 'back.out(2)',
        },
        '-=0.35'
      );
    }, containerRef);

    // Auto-complete timer
    const autoTimer = setTimeout(() => {
      handleFinish();
    }, durationMs);

    return () => {
      clearTimeout(autoTimer);
      ctx.revert();
    };
  }, [durationMs]);

  // Smooth Interactive 3D Card Hover / Mousemove Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isExitingRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const tiltX = (mouseY / (rect.height / 2)) * -8;
    const tiltY = (mouseX / (rect.width / 2)) * 8;

    gsap.to(cardRef.current, {
      rotationX: tiltX,
      rotationY: tiltY,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || isExitingRef.current) return;
    gsap.to(cardRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.4)',
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#f4f1ef]/95 backdrop-blur-md cursor-default select-none"
    >
      {/* Ambient Dreamy Floating Light Spheres */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          ref={orb1Ref}
          className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-purple-300/60 via-pink-200/50 to-rose-200/40 blur-3xl"
        />
        <div
          ref={orb2Ref}
          className="absolute -bottom-36 -right-36 w-[580px] h-[580px] rounded-full bg-gradient-to-tl from-indigo-300/60 via-purple-300/50 to-pink-200/40 blur-3xl"
        />
        <div
          ref={orb3Ref}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-brand-200/40 blur-3xl pointer-events-none"
        />
      </div>

      {/* Skip Button (Top Right) */}
      <button
        onClick={handleFinish}
        className="absolute top-6 right-6 px-4 py-2 rounded-full text-[12.5px] font-semibold text-slate-600 hover:text-slate-900 bg-white/70 hover:bg-white border border-white/90 shadow-[0_4px_16px_-4px_rgba(40,30,80,0.12)] backdrop-blur-xl transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] z-20 flex items-center gap-1.5"
      >
        <span>Lewati</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
      </button>

      {/* Central Modern GSAP Animated Card */}
      <div
        ref={cardRef}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative z-10 flex flex-col items-center text-center px-9 py-11 rounded-[40px] bg-white/55 backdrop-blur-3xl border border-white/90 shadow-[0_25px_65px_-15px_rgba(70,45,130,0.22)] max-w-md mx-4 transition-shadow hover:shadow-[0_30px_75px_-15px_rgba(70,45,130,0.28)]"
      >
        {/* Logo Mark Emblem with 3D Spring & Radial Pulse */}
        <div className="relative mb-7">
          <div
            ref={logoEmblemRef}
            className="w-22 h-22 rounded-[30px] bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center shadow-[0_16px_36px_-8px_rgba(139,111,224,0.85)] relative z-10 border border-white/30"
          >
            <svg viewBox="0 0 32 32" className="w-13 h-13" aria-hidden>
              <circle cx="16" cy="16" r="9" fill="none" stroke="white" strokeWidth="2.6" />
              <circle cx="16" cy="16" r="3.2" fill="white" />
              <path d="M4 22C10 19 22 13 28 9" stroke="#8b6fe0" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M4 22C10 19 22 13 28 9" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />
            </svg>
          </div>

          {/* Glowing Pulse Ring Shockwave */}
          <div
            ref={pulseRingRef}
            className="absolute inset-0 rounded-[30px] bg-brand-400/40 blur-md pointer-events-none"
          />
        </div>

        {/* Brand Title with Highlighting Effect */}
        <div className="relative overflow-hidden px-4 py-1.5">
          <div className="flex items-center justify-center text-5xl sm:text-6xl font-black tracking-tight select-none overflow-hidden pb-1">
            <span
              ref={nolTextRef}
              className="inline-block text-slate-900 pr-1"
            >
              Nol
            </span>

            <div className="relative inline-block">
              <span
                ref={rugiTextRef}
                className="inline-block text-brand-600 relative z-10"
              >
                Rugi
              </span>

              {/* Luminous Neon Liquid Highlight Underline / Strike Bar */}
              <div
                ref={highlightBarRef}
                className="absolute -bottom-1.5 left-0 right-0 h-2 bg-gradient-to-r from-brand-400 via-rose-400 to-amber-400 rounded-full shadow-[0_0_16px_rgba(236,72,153,0.7)]"
              />

              {/* Highlight Aura Glow */}
              <div
                ref={highlightGlowRef}
                className="absolute -bottom-3 left-0 right-0 h-4 bg-brand-400/50 blur-sm pointer-events-none"
              />
            </div>
          </div>

          {/* Shimmer Specular Sweep across Title */}
          <div
            ref={shimmerRef}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-25deg] pointer-events-none"
          />
        </div>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="mt-3.5 text-[14.5px] font-semibold text-slate-600 tracking-[-0.01em]"
        >
          AI Margin &amp; Batch Expiry Rescue
        </p>

        {/* Micro Badges with Pop Bounce */}
        <div className="mt-5 flex items-center gap-2.5">
          <span
            ref={badge1Ref}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-white text-[11.5px] font-bold text-brand-700 shadow-[0_2px_8px_-2px_rgba(139,111,224,0.3)] transition-transform hover:scale-105"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Margin Loss</span>
          </span>
          <span
            ref={badge2Ref}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-white text-[11.5px] font-bold text-slate-700 shadow-[0_2px_8px_-2px_rgba(40,30,80,0.1)] transition-transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>FEFO Radar</span>
          </span>
        </div>

        {/* Action button to continue immediately */}
        <div className="mt-7">
          <button
            onClick={handleFinish}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 shadow-[0_10px_24px_-6px_rgba(118,86,209,0.65)] hover:shadow-[0_14px_30px_-6px_rgba(118,86,209,0.8)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            <span>Mulai Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
