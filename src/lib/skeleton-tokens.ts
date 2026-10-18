/**
 * Phase 1B: Smart Skeleton System Configuration & Tokens
 * Grounded in Obsidian Green (#0B130E) and Phase 0/1A constraints.
 */

export const SKELETON_BASE_CLASS = 'bg-neutral-200 dark:bg-white/[0.06] animate-skeleton-pulse motion-reduce:animate-none' as const;

export const SKELETON_PULSE_CONFIG = {
  keyframes: {
    '0%': { opacity: 0.06 },
    '50%': { opacity: 0.12 },
    '100%': { opacity: 0.06 },
  },
  duration: '1.5s',
  timingFunction: 'ease-in-out',
  iterationCount: 'infinite',
  reducedMotion: 'animate-none',
} as const;

export const SKELETON_LINE_VARIANTS: Record<string, string> = {
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

export const SKELETON_CIRCLE_VARIANTS: Record<string, string> = {
  'h-10 w-10': 'h-10 w-10',
  'h-8 w-8': 'h-8 w-8',
  '8': 'h-8 w-8',
  '10': 'h-10 w-10',
  '12': 'h-12 w-12',
  '16': 'h-16 w-16',
  '20': 'h-20 w-20',
  '24': 'h-24 w-24',
};

export const SKELETON_RECT_VARIANTS: Record<string, string> = {
  'h-48 w-full': 'h-48 w-full',
  'h-20 w-full': 'h-20 w-full',
  image: 'h-48 w-full',
  card: 'h-20 w-full',
  button: 'h-9 w-24',
  badge: 'h-5 w-16',
  tag: 'h-5 w-14',
  input: 'h-10 w-full',
};

export function getSkeletonLineClass(variant: string = 'w-full', className: string = ''): string {
  const width = SKELETON_LINE_VARIANTS[variant] || 'w-full';
  return `h-3 rounded-full ${SKELETON_BASE_CLASS} ${width} ${className}`.trim();
}

export function getSkeletonCircleClass(variant: string = 'h-10 w-10', size?: string, className: string = ''): string {
  const resolved = size
    ? size === 'sm'
      ? 'h-8 w-8'
      : size === 'md'
      ? 'h-10 w-10'
      : size === 'lg'
      ? 'h-12 w-12'
      : size === 'xl'
      ? 'h-16 w-16'
      : 'h-24 w-24'
    : SKELETON_CIRCLE_VARIANTS[variant] || 'h-10 w-10';
  return `rounded-full ${SKELETON_BASE_CLASS} flex-shrink-0 ${resolved} ${className}`.trim();
}

export function getSkeletonRectClass(variant: string = 'card', className: string = ''): string {
  const resolved = SKELETON_RECT_VARIANTS[variant] || 'h-20 w-full';
  return `rounded-xl ${SKELETON_BASE_CLASS} ${resolved} ${className}`.trim();
}
