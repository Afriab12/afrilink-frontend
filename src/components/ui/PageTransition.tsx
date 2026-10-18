'use client';

import React from 'react';
import { useSafeMotion } from '@/lib/animations';

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition Component
 * Phase 3A: GPU-Safe Micro-Interactions
 * 
 * - Opacity + translateY(8px) in 200ms (<= 250ms)
 * - Motion-reduce safe: static/instant when user prefers reduced motion
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  const { getPageEnter } = useSafeMotion();

  return (
    <div className={`w-full max-w-full ${getPageEnter()} ${className}`}>
      {children}
    </div>
  );
};
