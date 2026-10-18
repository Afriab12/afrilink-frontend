import React from 'react';
import { cn } from '@/lib/utils';
export { useMinimumLoading } from '@/hooks/useMinimumLoading';

/* ══════════════════════════════════════════════════════════════════
   PHASE 1B — SMART SKELETON PRIMITIVES
   ══════════════════════════════════════════════════════════════════ */

export interface SkeletonLineProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'w-full' | 'w-3/4' | 'w-1/2' | 'w-1/4' | 'w-1/3' | 'full' | '3/4' | '1/2' | '1/4' | '1/3';
  className?: string;
}

const LINE_VARIANTS: Record<string, string> = {
  'w-full': 'w-full',
  'w-3/4': 'w-3/4',
  'w-1/2': 'w-1/2',
  'w-1/4': 'w-1/4',
  'w-1/3': 'w-1/3',
  full: 'w-full',
  '3/4': 'w-3/4',
  '1/2': 'w-1/2',
  '1/4': 'w-1/4',
  '1/3': 'w-1/3',
};

/**
 * SkeletonLine Primitive
 * h-3 rounded-full bg-white/[0.06]; variants w-full | w-3/4 | w-1/2
 */
export const SkeletonLine: React.FC<SkeletonLineProps> = ({
  variant = 'w-full',
  className = '',
  ...props
}) => {
  const widthClass = LINE_VARIANTS[variant] || 'w-full';
  return (
    <div
      role="status"
      aria-label="Loading..."
      data-testid="skeleton-line"
      className={cn(
        'h-3 rounded-full bg-neutral-200 dark:bg-white/[0.06] animate-skeleton-pulse motion-reduce:animate-none',
        widthClass,
        className
      )}
      {...props}
    />
  );
};

export interface SkeletonCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'h-10 w-10' | 'h-8 w-8' | '10' | '8' | '12' | '16' | '20' | '24';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const CIRCLE_VARIANTS: Record<string, string> = {
  'h-10 w-10': 'h-10 w-10',
  'h-8 w-8': 'h-8 w-8',
  '8': 'h-8 w-8',
  '10': 'h-10 w-10',
  '12': 'h-12 w-12',
  '16': 'h-16 w-16',
  '20': 'h-20 w-20',
  '24': 'h-24 w-24',
};

/**
 * SkeletonCircle Primitive
 * rounded-full bg-white/[0.06]; variants h-10 w-10 | h-8 w-8
 */
export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  variant = 'h-10 w-10',
  size,
  className = '',
  ...props
}) => {
  const sizeClass = size
    ? size === 'sm'
      ? 'h-8 w-8'
      : size === 'md'
      ? 'h-10 w-10'
      : size === 'lg'
      ? 'h-12 w-12'
      : size === 'xl'
      ? 'h-16 w-16'
      : 'h-24 w-24'
    : CIRCLE_VARIANTS[variant] || 'h-10 w-10';

  return (
    <div
      role="status"
      aria-label="Loading..."
      data-testid="skeleton-circle"
      className={cn(
        'rounded-full bg-neutral-200 dark:bg-white/[0.06] flex-shrink-0 animate-skeleton-pulse motion-reduce:animate-none',
        sizeClass,
        className
      )}
      {...props}
    />
  );
};

export interface SkeletonRectProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'h-48 w-full'
    | 'h-20 w-full'
    | 'image'
    | 'card'
    | 'button'
    | 'badge'
    | 'tag'
    | 'input';
  className?: string;
}

const RECT_VARIANTS: Record<string, string> = {
  'h-48 w-full': 'h-48 w-full',
  'h-20 w-full': 'h-20 w-full',
  image: 'h-48 w-full',
  card: 'h-20 w-full',
  button: 'h-9 w-24',
  badge: 'h-5 w-16',
  tag: 'h-5 w-14',
  input: 'h-10 w-full',
};

/**
 * SkeletonRect Primitive
 * rounded-xl bg-white/[0.06]; variants h-48 w-full (image) | h-20 w-full (card)
 */
export const SkeletonRect: React.FC<SkeletonRectProps> = ({
  variant = 'card',
  className = '',
  ...props
}) => {
  const sizeClass = RECT_VARIANTS[variant] || 'h-20 w-full';
  return (
    <div
      role="status"
      aria-label="Loading..."
      data-testid="skeleton-rect"
      className={cn(
        'rounded-xl bg-neutral-200 dark:bg-white/[0.06] animate-skeleton-pulse motion-reduce:animate-none',
        sizeClass,
        className
      )}
      {...props}
    />
  );
};

/* ══════════════════════════════════════════════════════════════════
   PHASE 1B — SMART SKELETON COMPOSITES
   ══════════════════════════════════════════════════════════════════ */

/**
 * FeedPostSkeleton Composite
 * avatar circle + 2 lines + image rect + reaction bar line
 */
export const FeedPostSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <article
    data-testid="feed-post-skeleton"
    className={cn(
      'bg-white dark:bg-surface-0 rounded-3xl p-5 sm:p-6 shadow-sm border border-neutral-200/80 dark:border-white/[0.04] space-y-4',
      className
    )}
  >
    {/* Author Header: avatar circle + 2 lines */}
    <div className="flex items-center gap-3">
      <SkeletonCircle variant="h-10 w-10" />
      <div className="space-y-1.5 flex-1 min-w-0">
        <SkeletonLine variant="w-1/2" className="max-w-[180px]" />
        <SkeletonLine variant="w-1/4" className="max-w-[100px] h-2.5" />
      </div>
    </div>

    {/* Post Content Lines: 2 lines */}
    <div className="space-y-2 pt-1">
      <SkeletonLine variant="w-full" />
      <SkeletonLine variant="w-3/4" />
    </div>

    {/* Image Rect: h-48 w-full */}
    <SkeletonRect variant="h-48 w-full" className="rounded-2xl" />

    {/* Reaction Bar Line */}
    <div className="pt-2 border-t border-neutral-100 dark:border-white/[0.04] flex items-center justify-between">
      <SkeletonLine variant="w-1/4" className="max-w-[120px]" />
      <div className="flex items-center gap-2">
        <SkeletonCircle variant="h-8 w-8" className="h-6 w-6" />
        <SkeletonCircle variant="h-8 w-8" className="h-6 w-6" />
      </div>
    </div>
  </article>
);

/**
 * ConversationRowSkeleton Composite
 * avatar circle + name line + preview line
 */
export const ConversationRowSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    data-testid="conversation-row-skeleton"
    className={cn(
      'p-3.5 flex items-center gap-3 border-b border-neutral-100 dark:border-white/[0.04]',
      className
    )}
  >
    {/* Avatar Circle */}
    <SkeletonCircle variant="h-10 w-10" />

    {/* Name Line + Preview Line */}
    <div className="space-y-2 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <SkeletonLine variant="w-1/2" className="max-w-[140px]" />
        <SkeletonLine variant="w-1/4" className="max-w-[40px] h-2.5" />
      </div>
      <SkeletonLine variant="w-3/4" className="max-w-[220px]" />
    </div>
  </div>
);

/**
 * ProfileHeaderSkeleton Composite
 * large circle + 3 lines + 2 button rects
 */
export const ProfileHeaderSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    data-testid="profile-header-skeleton"
    className={cn(
      'bg-white dark:bg-surface-0 rounded-3xl overflow-hidden shadow-sm border border-neutral-200/80 dark:border-white/[0.04] mb-6',
      className
    )}
  >
    {/* Cover Rect */}
    <SkeletonRect className="h-44 sm:h-64 w-full rounded-none" />

    {/* Profile Content */}
    <div className="px-5 sm:px-8 pb-6 pt-0 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
        {/* Large Avatar Circle */}
        <SkeletonCircle
          variant="24"
          className="h-24 w-24 border-4 border-white dark:border-surface-0 shadow-xl"
        />

        {/* 2 Button Rects */}
        <div className="flex items-center gap-2">
          <SkeletonRect variant="button" className="h-9 w-28 rounded-xl" />
          <SkeletonRect variant="button" className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* 3 Lines: Name, Handle, Bio */}
      <div className="space-y-2.5 pt-2">
        <SkeletonLine variant="w-1/2" className="h-4 max-w-[200px]" />
        <SkeletonLine variant="w-1/4" className="max-w-[120px]" />
        <SkeletonLine variant="w-3/4" className="max-w-[450px]" />
      </div>
    </div>
  </div>
);

/**
 * CountryCardSkeleton Composite
 * badge rect + 2 lines + 3 small tag rects
 */
export const CountryCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    data-testid="country-card-skeleton"
    className={cn(
      'bg-white dark:bg-surface-0 rounded-3xl p-5 border border-neutral-200/80 dark:border-white/[0.04] shadow-sm flex flex-col justify-between space-y-4 min-h-[220px]',
      className
    )}
  >
    <div>
      {/* Top row: Flag + Badge Rect */}
      <div className="flex items-center justify-between mb-3">
        <SkeletonCircle variant="h-10 w-10" className="rounded-xl h-9 w-9" />
        <SkeletonRect variant="badge" className="h-5 w-16 rounded-full" />
      </div>

      {/* 2 Text Lines */}
      <div className="space-y-2">
        <SkeletonLine variant="w-1/2" className="h-4 max-w-[160px]" />
        <SkeletonLine variant="w-3/4" className="max-w-[200px]" />
      </div>

      {/* 3 Small Tag Rects */}
      <div className="flex flex-wrap gap-1.5 mt-4 pt-1">
        <SkeletonRect variant="tag" className="h-5 w-14 rounded-full" />
        <SkeletonRect variant="tag" className="h-5 w-16 rounded-full" />
        <SkeletonRect variant="tag" className="h-5 w-12 rounded-full" />
      </div>
    </div>

    {/* Bottom explore footer */}
    <div className="pt-3 border-t border-neutral-100 dark:border-white/[0.04] flex items-center justify-between">
      <SkeletonLine variant="w-1/4" className="max-w-[90px]" />
      <SkeletonCircle variant="h-8 w-8" className="h-4 w-4" />
    </div>
  </div>
);

/**
 * SettingsFormSkeleton Composite
 * 4 label+input pairs
 */
export const SettingsFormSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    data-testid="settings-form-skeleton"
    className={cn(
      'bg-white dark:bg-surface-0 rounded-3xl p-6 border border-neutral-200/80 dark:border-white/[0.04] shadow-sm space-y-6',
      className
    )}
  >
    {/* 4 Label + Input Pairs */}
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="space-y-2">
        <SkeletonLine variant="w-1/4" className="max-w-[120px] h-3" />
        <SkeletonRect variant="input" className="h-11 w-full rounded-2xl" />
      </div>
    ))}

    {/* Submit button rect */}
    <div className="pt-2">
      <SkeletonRect variant="button" className="h-10 w-32 rounded-xl" />
    </div>
  </div>
);

/**
 * ConnectRowSkeleton Composite
 * avatar + 2 lines + button rect
 */
export const ConnectRowSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    data-testid="connect-row-skeleton"
    className={cn('flex items-center justify-between gap-2 py-1', className)}
  >
    <div className="flex items-center gap-2.5 min-w-0 flex-1">
      {/* Avatar Circle */}
      <SkeletonCircle variant="h-8 w-8" />

      {/* 2 Lines */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <SkeletonLine variant="w-1/2" className="max-w-[110px]" />
        <SkeletonLine variant="w-1/4" className="max-w-[70px] h-2.5" />
      </div>
    </div>

    {/* Button Rect */}
    <SkeletonRect variant="button" className="h-7 w-20 rounded-xl flex-shrink-0" />
  </div>
);
