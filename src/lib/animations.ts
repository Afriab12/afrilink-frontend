/**
 * AfriLink Budget-Device Animation Safeguard Utilities
 * Phase 0: Non-Negotiable Engineering Constraints
 * 
 * Enforces compositor-only animations (transform, opacity), OS Reduced Motion compliance,
 * capped spring physics, and lightweight page transitions for low-spec African Android/iOS devices.
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Spring configurations capped according to Phase 0 constraints:
 * stiffness <= 400, damping >= 20, mass <= 1
 */
export const SAFE_SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 25,
  mass: 0.8,
};

/**
 * Page transitions: opacity + translateY(8px) only, <= 250ms (200ms)
 */
export const pageTransitionVariants = {
  initial: { opacity: 0, transform: 'translateY(8px)' },
  animate: {
    opacity: 1,
    transform: 'translateY(0px)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transform: 'translateY(-8px)',
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/**
 * Compositor-friendly fade variants (opacity only)
 */
export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * Compositor-friendly scale variants (transform scale + opacity only)
 */
export const scaleVariants = {
  initial: { opacity: 0, transform: 'scale(0.96)' },
  animate: {
    opacity: 1,
    transform: 'scale(1)',
    transition: SAFE_SPRING_CONFIG,
  },
  exit: {
    opacity: 0,
    transform: 'scale(0.96)',
    transition: { duration: 0.15 },
  },
};

/**
 * Compositor-friendly slide-up variants (translateY(8px) + opacity only)
 */
export const slideUpVariants = {
  initial: { opacity: 0, transform: 'translateY(8px)' },
  animate: {
    opacity: 1,
    transform: 'translateY(0px)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transform: 'translateY(8px)',
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/**
 * Reaction particle burst constraints:
 * Pure CSS pseudo-elements <= 6 dots, transform + opacity only, 400ms, no JS RAF loops
 */
export const REACTION_BURST_CONSTRAINTS = {
  maxDots: 6,
  durationMs: 400,
  properties: ['transform', 'opacity'] as const,
};

/**
 * Hook to detect user's operating system preferences for reduced motion.
 * Safely defaults to false in SSR/Node testing environments.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if ((mediaQuery as any).removeListener) {
        (mediaQuery as any).removeListener(handleChange);
      }
    };
  }, []);

  return prefersReduced;
}

/**
 * Hook wrapping useReducedMotion() with helper utilities to apply safe animations.
 */
export function useSafeMotion() {
  const prefersReduced = useReducedMotion();

  return {
    prefersReduced,
    /**
     * Returns animation configuration when motion is safe, or fallback/null if reduced motion is requested.
     */
    safeAnimate: <T>(animation: T, fallback: T | null = null): T | null => {
      return prefersReduced ? fallback : animation;
    },
    /**
     * Strips active transitions from variant objects when reduced motion is preferred.
     */
    safeVariants: <T extends Record<string, any>>(variants: T): T => {
      if (!prefersReduced) return variants;
      const stripped: Record<string, any> = {};
      for (const [key, value] of Object.entries(variants)) {
        stripped[key] = {
          ...value,
          transition: { duration: 0 },
        };
      }
      return stripped as T;
    },
  };
}
