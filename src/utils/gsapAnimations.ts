import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Animate elements into view with a smooth staggered reveal
 */
export const animateFadeInUp = (
  target: string | Element | Element[] | NodeListOf<Element> | null,
  options?: {
    stagger?: number;
    delay?: number;
    y?: number;
    duration?: number;
    scrollTrigger?: boolean | string | Element;
  }
) => {
  if (!target) return;
  const {
    stagger = 0.08,
    delay = 0,
    y = 25,
    duration = 0.65,
    scrollTrigger = false,
  } = options || {};

  const config: gsap.TweenVars = {
    opacity: 0,
    y,
    duration,
    delay,
    stagger,
    ease: 'power3.out',
    clearProps: 'transform',
  };

  if (scrollTrigger) {
    config.scrollTrigger = {
      trigger: typeof scrollTrigger === 'boolean' ? (target as any) : scrollTrigger,
      start: 'top 88%',
      toggleActions: 'play none none none',
    };
  }

  return gsap.from(target, config);
};

/**
 * Smooth scale pop-in for modals or badges
 */
export const animatePopIn = (target: string | Element | null, delay: number = 0) => {
  if (!target) return;
  return gsap.fromTo(
    target,
    { opacity: 0, scale: 0.94, y: 15 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.4,
      delay,
      ease: 'back.out(1.4)',
    }
  );
};

/**
 * Pulse indicator for warning/critical items
 */
export const animatePulse = (target: string | Element | null) => {
  if (!target) return;
  return gsap.to(target, {
    scale: 1.05,
    duration: 0.8,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
};

/**
 * Laser scanner sweep animation for AI OCR camera simulation
 */
export const animateLaserScan = (target: string | Element | null) => {
  if (!target) return;
  return gsap.fromTo(
    target,
    { top: '5%', opacity: 0.9 },
    {
      top: '90%',
      opacity: 0.9,
      duration: 1.6,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    }
  );
};
