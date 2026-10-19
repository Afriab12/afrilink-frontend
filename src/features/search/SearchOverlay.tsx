'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  TrendingUp,
  User,
  Users,
  Calendar,
  Music,
  Trophy,
  Newspaper,
  Cpu,
  X,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useSocial } from '@/stores/socialContext';
import { INITIAL_USERS } from '@/services/mockBackend';
import { AFRICAN_COUNTRIES } from '@/utils/countryData';
import { socialService } from '@/services/socialService';
import { User as UserType } from '@/types';
import { useSafeMotion } from '@/lib/animations';
import {
  SEARCH_DEBOUNCE_MS,
  mapCategoryToIcon,
  getNextActiveIndex,
  TRENDING_SUGGESTIONS,
  SEARCH_SUGGESTION_CHIPS,
  SearchIconType,
} from '@/lib/search-utils';
import { EmptyState } from '@/components/ui/empty-state';

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface FlatResultItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: string;
  iconType: SearchIconType;
  avatarUrl?: string;
  flagEmoji?: string;
  badge?: string;
}

export const SearchCategoryIcon: React.FC<{ type: SearchIconType }> = ({ type }) => {
  const iconProps = { className: 'h-4 w-4', strokeWidth: 1.75 };
  switch (type) {
    case 'Cpu':
      return <Cpu {...iconProps} />;
    case 'Music':
      return <Music {...iconProps} />;
    case 'Trophy':
      return <Trophy {...iconProps} />;
    case 'Calendar':
      return <Calendar {...iconProps} />;
    case 'User':
      return <User {...iconProps} />;
    case 'Users':
      return <Users {...iconProps} />;
    case 'Newspaper':
      return <Newspaper {...iconProps} />;
    case 'TrendingUp':
    default:
      return <TrendingUp {...iconProps} />;
  }
};

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const router = useRouter();
  const { posts, communities } = useSocial();
  const { prefersReduced } = useSafeMotion();

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState<UserType[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Sync initial query if provided
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setDebouncedQuery(initialQuery);
    }
  }, [initialQuery]);

  // Trap and restore focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setIsExiting(false);
      setActiveIndex(-1);

      // Focus input on next tick
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
        if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  // 300ms Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setActiveIndex(-1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  // Query API for users
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchedUsers([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    socialService
      .searchUsers({ q: debouncedQuery })
      .then((users) => {
        if (isMounted) {
          setSearchedUsers(users);
          setIsSearching(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsSearching(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // Handle safe animated close
  const handleClose = useCallback(() => {
    if (prefersReduced) {
      onClose();
      return;
    }
    setIsExiting(true);
    const timer = setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, 150); // 150ms matches exit keyframe duration
    return () => clearTimeout(timer);
  }, [onClose, prefersReduced]);

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Keyboard trap and navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
      return;
    }

    // Focus trap handling for Tab / Shift+Tab
    if (e.key === 'Tab') {
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return;
    }

    // Arrow navigation
    if (flatResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => getNextActiveIndex(prev, flatResults.length, 'down'));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => getNextActiveIndex(prev, flatResults.length, 'up'));
        return;
      }
      if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < flatResults.length) {
        e.preventDefault();
        const selected = flatResults[activeIndex];
        router.push(selected.href);
        handleClose();
        return;
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0) {
      const activeEl = document.getElementById(`search-result-${activeIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const trimmed = debouncedQuery.toLowerCase();

  // Search results compilation
  const matchingUsers = useMemo(() => {
    if (!trimmed) return [];
    return searchedUsers.length > 0
      ? searchedUsers
      : INITIAL_USERS.filter(
          (u) =>
            u.fullName.toLowerCase().includes(trimmed) ||
            u.username.toLowerCase().includes(trimmed) ||
            u.country.toLowerCase().includes(trimmed) ||
            u.city.toLowerCase().includes(trimmed)
        );
  }, [searchedUsers, trimmed]);

  const matchingCommunities = useMemo(() => {
    if (!trimmed) return [];
    return communities.filter(
      (c) =>
        c.name.toLowerCase().includes(trimmed) ||
        c.description.toLowerCase().includes(trimmed) ||
        c.category.toLowerCase().includes(trimmed)
    );
  }, [communities, trimmed]);

  const matchingPosts = useMemo(() => {
    if (!trimmed) return [];
    return posts.filter(
      (p) =>
        p.content.toLowerCase().includes(trimmed) ||
        p.author.fullName.toLowerCase().includes(trimmed)
    );
  }, [posts, trimmed]);

  const matchingCountries = useMemo(() => {
    if (!trimmed) return [];
    return AFRICAN_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(trimmed) ||
        c.capital.toLowerCase().includes(trimmed) ||
        c.region.toLowerCase().includes(trimmed) ||
        c.code.toLowerCase().includes(trimmed) ||
        (c.nativeName && c.nativeName.toLowerCase().includes(trimmed)) ||
        (c.majorLanguages && c.majorLanguages.some((lang) => lang.toLowerCase().includes(trimmed)))
    );
  }, [trimmed]);

  // Flattened results for keyboard navigation
  const flatResults = useMemo<FlatResultItem[]>(() => {
    if (!trimmed) {
      // When query is empty, trending suggestions are navigable
      return TRENDING_SUGGESTIONS.map((item, idx) => ({
        id: `trending-${idx}`,
        title: item.tag,
        subtitle: `${item.count} • Trending in Africa`,
        href: `/discover?q=${encodeURIComponent(item.tag)}`,
        category: 'TRENDING ACROSS AFRICA',
        iconType: mapCategoryToIcon(item.category),
        badge: item.count,
      }));
    }

    const items: FlatResultItem[] = [];

    matchingUsers.forEach((u) => {
      items.push({
        id: `user-${u.id}`,
        title: u.fullName,
        subtitle: `@${u.username} • ${u.country}`,
        href: `/profile/${u.username}`,
        category: 'PEOPLE',
        iconType: 'User',
        avatarUrl: u.avatarUrl,
      });
    });

    matchingCommunities.forEach((c) => {
      items.push({
        id: `comm-${c.id}`,
        title: c.name,
        subtitle: `${c.category} • ${c.memberCount} members`,
        href: `/communities/${c.id}`,
        category: 'COMMUNITIES',
        iconType: 'Users',
        avatarUrl: c.profileImage,
      });
    });

    matchingPosts.forEach((p) => {
      items.push({
        id: `post-${p.id}`,
        title: p.author.fullName,
        subtitle: p.content,
        href: `/?post=${p.id}`,
        category: 'TOPICS & STORIES',
        iconType: 'Newspaper',
        avatarUrl: p.author.avatarUrl,
      });
    });

    matchingCountries.forEach((c) => {
      items.push({
        id: `country-${c.code}`,
        title: c.name,
        subtitle: `${c.capital} • ${c.region} ${c.majorLanguages ? `(${c.majorLanguages.join(', ')})` : ''}`,
        href: `/discover/${c.code.toLowerCase()}`,
        category: 'AFRICAN NATIONS',
        iconType: 'Users',
        flagEmoji: c.flagEmoji || c.flag,
      });
    });

    return items;
  }, [trimmed, matchingUsers, matchingCommunities, matchingPosts, matchingCountries]);

  if (!isOpen && !isExiting) {
    return null;
  }

  const backdropAnimation = prefersReduced
    ? ''
    : isExiting
    ? 'animate-backdrop-exit'
    : 'animate-backdrop-enter';

  const cardAnimation = prefersReduced
    ? ''
    : isExiting
    ? 'animate-search-exit'
    : 'animate-search-enter';

  return (
    <div
      role="presentation"
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 select-none ${backdropAnimation}`}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search AfriLink"
        onKeyDown={handleKeyDown}
        className={`w-full max-w-2xl bg-white dark:bg-[#0F1A13] dark:bg-surface-4 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-2xl overflow-hidden flex flex-col rounded-t-2xl sm:rounded-2xl max-h-[calc(100vh-env(safe-area-inset-bottom)-56px)] sm:max-h-[85vh] p-4 sm:p-6 ${cardAnimation}`}
      >
        {/* Search Input Bar (h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4) */}
        <div className="relative flex items-center h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 focus-within:border-emerald-600 dark:focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-600 dark:focus-within:ring-emerald-500 transition-all duration-200 shrink-0">
          <Search className="h-4 w-4 text-slate-400 dark:text-white/40 shrink-0 mr-3" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="search-results-list"
            aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
            placeholder="Search people, communities, topics…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none"
          />

          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-500 shrink-0 mr-2" strokeWidth={1.75} />
          )}

          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search input"
              className="p-1 rounded-md text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/80 transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close search"
              className="text-[10px] font-mono text-slate-500 dark:text-white/40 bg-slate-200/80 dark:bg-white/5 border border-slate-300 dark:border-white/10 px-1.5 py-0.5 rounded shadow-sm hover:text-slate-800 dark:hover:text-white/80 transition-colors"
            >
              ESC
            </button>
          )}
        </div>

        {/* Results Container with Roving Focus */}
        <div
          id="search-results-list"
          role="listbox"
          className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1 no-scrollbar"
        >
          {/* Query Empty State: Trending Across Africa */}
          {!debouncedQuery && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 dark:text-white/30 px-3 mb-2">
                  TRENDING ACROSS AFRICA
                </p>
                <div className="space-y-1">
                  {TRENDING_SUGGESTIONS.map((item, idx) => {
                    const isActive = activeIndex === idx;
                    const iconType = mapCategoryToIcon(item.category);
                    return (
                      <div
                        key={item.tag}
                        id={`search-result-${idx}`}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          setQuery(item.tag);
                        }}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                          isActive ? 'bg-slate-100 dark:bg-white/10 ring-1 ring-emerald-600/50 dark:ring-[#087443]/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* 32x32 Icon Box */}
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <SearchCategoryIcon type={iconType} />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white/90 truncate">{item.tag}</p>
                            <p className="text-[11px] text-slate-500 dark:text-white/40 truncate">{item.count} • Explore topic</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 dark:text-white/20 shrink-0" strokeWidth={1.75} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suggestion Chips */}
              <div className="pt-2 px-1">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 dark:text-white/30 mb-2">
                  POPULAR SEARCHES
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SEARCH_SUGGESTION_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setQuery(chip)}
                      className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white/90 transition-all duration-150"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Query Results */}
          {debouncedQuery && flatResults.length > 0 && (
            <div className="space-y-4">
              {/* Group results by category */}
              {['PEOPLE', 'COMMUNITIES', 'TOPICS & STORIES', 'AFRICAN NATIONS'].map((cat) => {
                const groupItems = flatResults.filter((r) => r.category === cat);
                if (groupItems.length === 0) return null;

                return (
                  <div key={cat}>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 dark:text-white/30 px-3 mb-2">
                      {cat}
                    </p>
                    <div className="space-y-1">
                      {groupItems.map((item) => {
                        const globalIndex = flatResults.findIndex((r) => r.id === item.id);
                        const isActive = activeIndex === globalIndex;

                        return (
                          <div
                            key={item.id}
                            id={`search-result-${globalIndex}`}
                            role="option"
                            aria-selected={isActive}
                            onClick={() => {
                              router.push(item.href);
                              handleClose();
                            }}
                            onMouseEnter={() => setActiveIndex(globalIndex)}
                            className={`flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                              isActive ? 'bg-slate-100 dark:bg-white/10 ring-1 ring-emerald-600/50 dark:ring-[#087443]/50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* 32x32 Icon Box or Avatar */}
                              {item.flagEmoji ? (
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-xl select-none">
                                  {item.flagEmoji}
                                </div>
                              ) : item.avatarUrl ? (
                                <Avatar src={item.avatarUrl} alt={item.title} size="sm" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                  <SearchCategoryIcon type={item.iconType} />
                                </div>
                              )}

                              <div className="truncate">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white/90 truncate">{item.title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-white/40 truncate">{item.subtitle}</p>
                              </div>
                            </div>

                            <ArrowRight className="h-4 w-4 text-slate-400 dark:text-white/20 shrink-0" strokeWidth={1.75} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty Search State */}
          {debouncedQuery && flatResults.length === 0 && !isSearching && (
            <EmptyState
              preset="search"
              title="No results found"
              description={`No results for "${debouncedQuery}". Try searching for a person, community, or Pan-African topic.`}
            >
              <div className="pt-2 flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
                {SEARCH_SUGGESTION_CHIPS.slice(0, 5).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setQuery(chip)}
                    className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white/90 transition-all duration-150"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </EmptyState>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="border-t border-slate-200 dark:border-white/[0.08] pt-3 mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-white/30 hidden sm:flex">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-[9px] text-slate-600 dark:text-white/50">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-[9px] text-slate-600 dark:text-white/50">↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-[9px] text-slate-600 dark:text-white/50">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-[9px] text-slate-600 dark:text-white/50">ESC</kbd> Close</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-white/20">AfriLink Fast Search</span>
        </div>
      </div>
    </div>
  );
};
