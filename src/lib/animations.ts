/**
 * AfriLink Budget-Device Animation Safeguard Utilities
 * Phase 0 & Phase 3A: Micro-Interactions Library & Animation Guards
 * 
 * Enforces compositor-only animations (transform, opacity), OS Reduced Motion compliance,
 * capped spring physics, and lightweight transitions for low-spec African Android/iOS devices.
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
 * 1. Reaction burst spring configuration:
 * on reaction tap scale 1 -> 1.5 -> 1 spring (stiffness <= 400, damping >= 20)
 */
export const REACTION_SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 22,
  mass: 0.8,
};

/**
 * Reaction particle burst constraints:
 * Pure CSS pseudo/DOM elements <= 6 dots, transform + opacity only, 400ms, no canvas lib
 */
export const REACTION_BURST_CONSTRAINTS = {
  maxDots: 6,
  durationMs: 400,
  properties: ['transform', 'opacity'] as const,
  scaleRange: [1, 1.5, 1] as const,
  spring: {
    stiffness: 350, // <= 400
    damping: 22,    // >= 20
  },
};

/**
 * 2. Button press micro-interaction:
 * active:scale-[0.97] duration-100
 */
export const BUTTON_PRESS_CLASS =
  'active:scale-[0.97] duration-100 transition-transform motion-reduce:active:scale-100';

export const BUTTON_PRESS_CONFIG = {
  scale: 0.97,
  durationMs: 100,
  property: 'transform' as const,
};

export function getButtonPressClass(prefersReduced = false): string {
  return prefersReduced
    ? 'active:scale-100'
    : 'active:scale-[0.97] duration-100 transition-transform';
}

/**
 * 3. Card hover lift micro-interaction:
 * hover:translate-y-[-2px] only (compositor-safe transform)
 */
export const CARD_HOVER_LIFT_CLASS =
  'hover:translate-y-[-2px] transition-transform duration-200 motion-reduce:hover:translate-y-0';

export const CARD_HOVER_LIFT_CONFIG = {
  translateY: '-2px',
  durationMs: 200,
  property: 'transform' as const,
};

export function getCardHoverClass(prefersReduced = false): string {
  return prefersReduced
    ? 'hover:translate-y-0'
    : 'hover:translate-y-[-2px] transition-transform duration-200';
}

/**
 * 4. Toggle knobs micro-interaction:
 * translateX spring cubic-bezier(0.34, 1.56, 0.64, 1) <= 200ms
 */
export const TOGGLE_KNOB_TRANSITION =
  'transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none';

export const TOGGLE_KNOB_CONFIG = {
  durationMs: 200, // <= 200ms
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  property: 'translateX' as const,
};

export function getToggleKnobClass(prefersReduced = false): string {
  return prefersReduced
    ? 'transition-none'
    : 'transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]';
}

/**
 * 5. Page enter transitions:
 * opacity + translateY(8px) <= 250ms (200ms) with AnimatePresence/layout
 */
export const PAGE_ENTER_CONFIG = {
  durationMs: 200, // <= 250ms
  maxDurationMs: 250,
  properties: ['opacity', 'translateY'] as const,
  offsetY: '8px',
};

export const PAGE_ENTER_CLASS = 'animate-page-enter motion-reduce:animate-none';

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
 * 6. Hook wrapping useReducedMotion() with helper utilities to apply safe animations.
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
    getButtonPress: () => getButtonPressClass(prefersReduced),
    getCardHover: () => getCardHoverClass(prefersReduced),
    getToggleTransition: () => getToggleKnobClass(prefersReduced),
    getPageEnter: () => (prefersReduced ? 'opacity-100 transform-none' : PAGE_ENTER_CLASS),
  };
}
