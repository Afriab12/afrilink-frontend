/**
 * AfriLink Empty States & Zero-Data Illustrations Configuration
 * Phase 3B: Consistent empty/error states across Feed, Messages, Notifications, Communities, Search, Network
 */

export type EmptyStatePreset =
  | 'feed'
  | 'messages'
  | 'notifications'
  | 'community-members'
  | 'search'
  | 'network-error';

export const EMPTY_STATE_PRESET_NAMES: readonly EmptyStatePreset[] = [
  'feed',
  'messages',
  'notifications',
  'community-members',
  'search',
  'network-error',
] as const;

export interface EmptyStatePresetConfig {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export const EMPTY_STATE_PRESETS: Record<EmptyStatePreset, EmptyStatePresetConfig> = {
  feed: {
    title: 'No posts in your feed',
    description: 'Connect with African creators and communities to see updates.',
    actionLabel: 'Discover People',
    actionHref: '/discover',
  },
  messages: {
    title: 'No conversations yet',
    description: 'Start a dialogue with innovators and creators across borders.',
    actionLabel: 'Find People',
    actionHref: '/discover',
  },
  notifications: {
    title: 'All caught up',
    description: 'No new activity or alerts at this moment.',
  },
  'community-members': {
    title: 'No members found',
    description: 'Be the first to join this community and connect with peers.',
    actionLabel: 'Join',
  },
  search: {
    title: 'No results found',
    description: 'Try searching for a person, community, or Pan-African topic.',
  },
  'network-error': {
    title: 'Network connection lost',
    description: 'Unable to connect to the AfriLink network. Please verify your connection.',
    actionLabel: 'Retry',
  },
};

/**
 * Standard visual layout tokens according to Phase 3B design specifications:
 * - Centered max-w-xs mx-auto py-16
 * - 120x120 abstract geometric SVG (emerald-500/10 stroke, Africa-inspired geometry)
 * - Title text-base font-semibold text-white/90 mt-6
 * - Description text-sm text-white/35 mt-2
 * - Optional CTA primary button mt-6
 */
export const EMPTY_STATE_LAYOUT = {
  container: 'flex flex-col items-center justify-center text-center max-w-xs mx-auto py-16',
  svgDimensions: {
    width: 120,
    height: 120,
    viewBox: '0 0 120 120',
  },
  svgClasses: 'w-[120px] h-[120px] text-emerald-500/10 stroke-emerald-500/10',
  strokeToken: 'emerald-500/10',
  title: 'text-base font-semibold text-white/90 mt-6 font-sora',
  description: 'text-sm text-white/35 mt-2 leading-relaxed',
  ctaWrapper: 'mt-6',
  ctaButton:
    'inline-flex items-center justify-center h-10 px-5 rounded-xl font-medium text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-150 shadow-sm active:scale-[0.97] duration-100 transition-transform motion-reduce:active:scale-100',
} as const;

/**
 * Helper to resolve merged empty state configuration
 */
export function resolveEmptyStateConfig(
  preset: EmptyStatePreset = 'feed',
  overrides?: {
    title?: string;
    description?: string;
    actionLabel?: string | null;
    actionHref?: string;
  }
): {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
} {
  const base = EMPTY_STATE_PRESETS[preset] || EMPTY_STATE_PRESETS.feed;
  return {
    title: overrides?.title ?? base.title,
    description: overrides?.description ?? base.description,
    actionLabel:
      overrides?.actionLabel !== undefined
        ? overrides.actionLabel === null
          ? undefined
          : overrides.actionLabel
        : base.actionLabel,
    actionHref: overrides?.actionHref ?? base.actionHref,
  };
}
