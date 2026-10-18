/**
 * AfriLink Search Overlay Utilities & Pure Helpers
 * Phase 2A: Search Entry & Modal Search Overlay System
 */

export const SEARCH_DEBOUNCE_MS = 300;

export type SearchCategory =
  | 'trending'
  | 'people'
  | 'communities'
  | 'posts'
  | 'countries'
  | 'events'
  | 'music'
  | 'sports'
  | 'tech';

export type SearchIconType =
  | 'TrendingUp'
  | 'User'
  | 'Users'
  | 'Calendar'
  | 'Music'
  | 'Trophy'
  | 'Newspaper'
  | 'Cpu';

/**
 * Maps categories and tags to Phase 2A required Lucide icons:
 * TrendingUp, User, Users, Calendar, Music, Trophy, Newspaper, Cpu
 */
export function mapCategoryToIcon(category: string): SearchIconType {
  const normalized = category.toLowerCase().trim();

  if (normalized.includes('tech') || normalized.includes('cpu') || normalized.includes('software') || normalized.includes('code')) {
    return 'Cpu';
  }
  if (normalized.includes('music') || normalized.includes('amapiano') || normalized.includes('afrobeats') || normalized.includes('sound')) {
    return 'Music';
  }
  if (normalized.includes('trophy') || normalized.includes('afcon') || normalized.includes('sport') || normalized.includes('cup')) {
    return 'Trophy';
  }
  if (normalized.includes('calendar') || normalized.includes('event') || normalized.includes('summit')) {
    return 'Calendar';
  }
  if (normalized.includes('people') || normalized.includes('user') || normalized.includes('founder')) {
    return 'User';
  }
  if (normalized.includes('communit') || normalized.includes('hub') || normalized.includes('group') || normalized.includes('nation') || normalized.includes('country')) {
    return 'Users';
  }
  if (normalized.includes('post') || normalized.includes('news') || normalized.includes('article') || normalized.includes('story')) {
    return 'Newspaper';
  }
  return 'TrendingUp';
}

/**
 * Calculates the next active index when navigating with ArrowUp or ArrowDown keys.
 * Supports cyclic wrapping around the result list.
 */
export function getNextActiveIndex(
  currentIndex: number,
  totalCount: number,
  direction: 'up' | 'down'
): number {
  if (totalCount <= 0) return -1;

  if (direction === 'down') {
    if (currentIndex < 0 || currentIndex >= totalCount - 1) {
      return 0;
    }
    return currentIndex + 1;
  }

  // direction === 'up'
  if (currentIndex <= 0) {
    return totalCount - 1;
  }
  return currentIndex - 1;
}

/**
 * Pure helper to determine focus trapping action on Tab and Shift+Tab keydown.
 * Returns 'wrap-to-first' | 'wrap-to-last' | 'continue'.
 */
export function getFocusTrapAction(
  isShift: boolean,
  isFirstElement: boolean,
  isLastElement: boolean
): 'wrap-to-first' | 'wrap-to-last' | 'continue' {
  if (isShift && isFirstElement) {
    return 'wrap-to-last';
  }
  if (!isShift && isLastElement) {
    return 'wrap-to-first';
  }
  return 'continue';
}

export const TRENDING_SUGGESTIONS = [
  { tag: '#AfroTechSummit', count: '45.2k posts', category: 'tech' },
  { tag: '#AFCON2027', count: '120.4k posts', category: 'sports' },
  { tag: '#AmapianoVibes', count: '89.1k posts', category: 'music' },
  { tag: '#AfCFTA_Trade', count: '14.8k posts', category: 'trending' },
  { tag: '#LagosTechFest', count: '28.3k posts', category: 'events' },
  { tag: '#AfricanStories', count: '31.0k posts', category: 'posts' },
] as const;

export const SEARCH_SUGGESTION_CHIPS = [
  'AfroTech',
  'Nairobi',
  'Amapiano',
  'Fintech',
  'Lagos',
  'Swahili',
  'Ghana',
  'Rwanda',
] as const;
