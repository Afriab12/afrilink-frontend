/**
 * AfriLink Connect Across Borders Utilities
 * Phase 2C: Connect Sidebar Unified Follow States & Social Proof
 */

import type { User } from '../types/index.ts';

export const SOCIAL_PROOF_VARIANTS = [
  '8 mutual connections',
  'Popular in Lagos',
  'Active in Tech Community',
  'From your region',
] as const;

export type SocialProofVariant = (typeof SOCIAL_PROOF_VARIANTS)[number];

/**
 * Derives contextual social-proof string for recommended users.
 */
export function getSocialProofContext(user: Partial<User>, index: number = 0): string {
  if (user.city && user.city.toLowerCase() === 'lagos') {
    return 'Popular in Lagos';
  }
  if (user.city) {
    return `Popular in ${user.city}`;
  }
  if (user.interests && user.interests.some((i) => i.toLowerCase().includes('tech') || i.toLowerCase().includes('startup'))) {
    return 'Active in Tech Community';
  }
  if (user.friendsCount && user.friendsCount > 0) {
    return `${Math.min(user.friendsCount, 8)} mutual connections`;
  }
  return SOCIAL_PROOF_VARIANTS[index % SOCIAL_PROOF_VARIANTS.length];
}

export interface FollowButtonConfig {
  label: string;
  className: string;
  variant: 'follow' | 'following' | 'pending';
}

/**
 * Returns unified button styling and label for Follow/Following/Pending states.
 */
export function getFollowButtonConfig(
  isFollowing: boolean,
  isPending: boolean = false,
  isHovered: boolean = false
): FollowButtonConfig {
  const base =
    'h-8 px-4 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center flex-shrink-0 select-none';

  if (isPending) {
    return {
      label: 'Pending',
      className: `${base} border border-amber-500/30 text-amber-400/60 cursor-default bg-transparent`,
      variant: 'pending',
    };
  }

  if (isFollowing) {
    return {
      label: isHovered ? 'Unfollow' : 'Following',
      className: `${base} bg-transparent border border-white/15 text-white/50 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5`,
      variant: 'following',
    };
  }

  return {
    label: 'Follow',
    className: `${base} bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-[0_0_12px_rgba(8,116,67,0.3)]`,
    variant: 'follow',
  };
}
