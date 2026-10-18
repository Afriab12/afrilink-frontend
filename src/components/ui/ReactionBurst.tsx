'use client';

import React, { useState, useEffect } from 'react';
import { useReducedMotion } from '@/lib/animations';

export interface ReactionBurstProps {
  active: boolean;
  onAnimationEnd?: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * ReactionBurst Component
 * Phase 3A: GPU-Safe Micro-Interactions
 * 
 * - Scale 1 -> 1.5 -> 1 spring (stiffness <= 400, damping >= 20)
 * - Exactly 6 CSS dots with radial transform + opacity over 400ms
 * - Zero canvas libraries; compositor-only execution
 * - Motion-reduce safe: static/disabled when user prefers reduced motion
 */
export const ReactionBurst: React.FC<ReactionBurstProps> = ({
  active,
  onAnimationEnd,
  children,
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (active && !prefersReduced) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onAnimationEnd?.();
      }, 400); // 400ms duration per constraints
      return () => clearTimeout(timer);
    } else if (active && prefersReduced) {
      onAnimationEnd?.();
    }
  }, [active, prefersReduced, onAnimationEnd]);

  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Scaled Children (1 -> 1.5 -> 1 spring) */}
      <span
        className={`inline-flex items-center justify-center select-none ${
          isAnimating && !prefersReduced ? 'animate-reaction-scale' : ''
        }`}
      >
        {children}
      </span>

      {/* <= 6 CSS Pseudo/DOM Dots (transform + opacity 400ms, no canvas) */}
      {isAnimating && !prefersReduced && (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
          aria-hidden="true"
        >
          <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 animate-reaction-dot-1" />
          <span className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 animate-reaction-dot-2" />
          <span className="absolute w-1.5 h-1.5 rounded-full bg-rose-400 animate-reaction-dot-3" />
          <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 animate-reaction-dot-4" />
          <span className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 animate-reaction-dot-5" />
          <span className="absolute w-1.5 h-1.5 rounded-full bg-rose-400 animate-reaction-dot-6" />
        </span>
      )}
    </span>
  );
};
