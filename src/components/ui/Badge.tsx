'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'gold' | 'neutral' | 'outline' | 'danger' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  className,
  icon,
}) => {
  const variants = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-[#087443] border border-emerald-200 dark:border-emerald-800',
    gold: 'bg-amber-50 dark:bg-amber-950/40 text-[#b8872b] dark:text-[#D9A441] border border-amber-200 dark:border-amber-800',
    neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700',
    outline: 'bg-transparent border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300',
    danger: 'bg-red-50 dark:bg-red-950/40 text-red-600 border border-red-200 dark:border-red-800',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 border border-purple-200 dark:border-purple-800',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full select-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
