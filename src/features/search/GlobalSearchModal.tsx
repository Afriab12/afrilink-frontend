'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Users,
  Building2,
  FileText,
  Globe,
  Clock,
  ArrowRight,
  X,
  Loader2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { INITIAL_USERS } from '@/services/mockBackend';
import { useSocial } from '@/stores/socialContext';
import { AFRICAN_COUNTRIES } from '@/utils/countryData';
import { socialService } from '@/services/socialService';
import { User } from '@/types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { posts, communities } = useSocial();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'communities' | 'posts' | 'countries'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'AfroTech',
    'Nairobi',
    'Amapiano',
    'Ghana',
  ]);
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);

  // 300ms Debounce effect on query input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Execute backend/local search when debounced query changes
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

  if (!isOpen) return null;

  const trimmed = debouncedQuery.toLowerCase();

  // Matched entities
  const matchingUsers = searchedUsers.length > 0 ? searchedUsers : trimmed
    ? INITIAL_USERS.filter(
        (u) =>
          u.fullName.toLowerCase().includes(trimmed) ||
          u.username.toLowerCase().includes(trimmed) ||
          u.country.toLowerCase().includes(trimmed) ||
          u.city.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingCommunities = trimmed
    ? communities.filter(
        (c) =>
          c.name.toLowerCase().includes(trimmed) ||
          c.description.toLowerCase().includes(trimmed) ||
          c.category.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingPosts = trimmed
    ? posts.filter(
        (p) =>
          p.content.toLowerCase().includes(trimmed) ||
          p.author.fullName.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingCountries = trimmed
    ? AFRICAN_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(trimmed) ||
          c.capital.toLowerCase().includes(trimmed) ||
          c.region.toLowerCase().includes(trimmed) ||
          c.code.toLowerCase().includes(trimmed) ||
          (c.nativeName && c.nativeName.toLowerCase().includes(trimmed)) ||
          (c.majorLanguages && c.majorLanguages.some((lang) => lang.toLowerCase().includes(trimmed))) ||
          (c.popularInterests && c.popularInterests.some((p) => p.toLowerCase().includes(trimmed)))
      )
    : [];

  const totalResultsCount =
    matchingUsers.length +
    matchingCommunities.length +
    matchingPosts.length +
    matchingCountries.length;

  const handleSelectRecent = (term: string) => {
    setQuery(term);
  };

  const clearRecent = () => {
    setRecentSearches([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Search AfriLink"
      description="Find people, communities, conversations, and African nations"
      maxWidth="xl"
      className="dark:bg-[#111D16] dark:border-[#1F3327] shadow-2xl"
    >
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" />
          <input
            type="text"
            role="searchbox"
            aria-label="Search AfriLink"
            placeholder="Search African founders, #Afrobeats, Lagos, Swahili, FinTech..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-neutral-100 dark:bg-[#0B130E] rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-500 border border-neutral-200/80 dark:border-[#1F3327] focus:border-[#087443] focus:bg-white dark:focus:bg-[#0B130E] focus:outline-none focus:ring-2 focus:ring-[#087443]/30 transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Accessibility Feedback */}
        <div className="sr-only" aria-live="polite">
          {isSearching
            ? 'Searching...'
            : debouncedQuery
            ? `${totalResultsCount} results found for ${debouncedQuery}`
            : ''}
        </div>

        {/* Categories Tab Bar */}
        {debouncedQuery && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs border-b border-neutral-100 dark:border-[#1F3327] pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full font-bold transition ${
                activeTab === 'all'
                  ? 'bg-[#087443] text-white shadow-sm ring-2 ring-[#D9A441]/80'
                  : 'bg-neutral-100 dark:bg-[#16241C] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1F3327] border border-transparent dark:border-[#1F3327]'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`px-3 py-1.5 rounded-full font-bold transition ${
                activeTab === 'people'
                  ? 'bg-[#087443] text-white shadow-sm ring-2 ring-[#D9A441]/80'
                  : 'bg-neutral-100 dark:bg-[#16241C] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1F3327] border border-transparent dark:border-[#1F3327]'
              }`}
            >
              People ({matchingUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('communities')}
              className={`px-3 py-1.5 rounded-full font-bold transition ${
                activeTab === 'communities'
                  ? 'bg-[#087443] text-white shadow-sm ring-2 ring-[#D9A441]/80'
                  : 'bg-neutral-100 dark:bg-[#16241C] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1F3327] border border-transparent dark:border-[#1F3327]'
              }`}
            >
              Communities ({matchingCommunities.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-3 py-1.5 rounded-full font-bold transition ${
                activeTab === 'posts'
                  ? 'bg-[#087443] text-white shadow-sm ring-2 ring-[#D9A441]/80'
                  : 'bg-neutral-100 dark:bg-[#16241C] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1F3327] border border-transparent dark:border-[#1F3327]'
              }`}
            >
              Posts ({matchingPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('countries')}
              className={`px-3 py-1.5 rounded-full font-bold transition ${
                activeTab === 'countries'
                  ? 'bg-[#087443] text-white shadow-sm ring-2 ring-[#D9A441]/80'
                  : 'bg-neutral-100 dark:bg-[#16241C] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1F3327] border border-transparent dark:border-[#1F3327]'
              }`}
            >
              Countries ({matchingCountries.length})
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isSearching && (
          <div className="py-8 flex flex-col items-center justify-center text-neutral-500 text-xs gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#087443]" />
            <span>Discovering matches across Africa...</span>
          </div>
        )}

        {/* Results Area */}
        {!isSearching && debouncedQuery && (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {/* People Results */}
            {(activeTab === 'all' || activeTab === 'people') && matchingUsers.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> People
                </h4>
                <div className="space-y-1.5">
                  {matchingUsers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      onClick={onClose}
                      className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-[#1F3327] hover:border-[#087443] dark:hover:border-[#087443] flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#16241C] transition"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatarUrl} alt={user.fullName} size="sm" />
                        <div>
                          <p className="font-bold text-xs text-neutral-900 dark:text-white">
                            {user.fullName}
                          </p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            @{user.username} • {user.country}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Communities Results */}
            {(activeTab === 'all' || activeTab === 'communities') &&
              matchingCommunities.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Communities
                  </h4>
                  <div className="space-y-1.5">
                    {matchingCommunities.map((comm) => (
                      <Link
                        key={comm.id}
                        href={`/communities/${comm.id}`}
                        onClick={onClose}
                        className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-[#1F3327] hover:border-[#087443] dark:hover:border-[#087443] flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#16241C] transition"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar src={comm.profileImage} alt={comm.name} size="sm" />
                          <div>
                            <p className="font-bold text-xs text-neutral-900 dark:text-white">
                              {comm.name}
                            </p>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                              {comm.category} • {comm.memberCount} members
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            {/* Posts Results */}
            {(activeTab === 'all' || activeTab === 'posts') && matchingPosts.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Posts & Stories
                </h4>
                <div className="space-y-1.5">
                  {matchingPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-[#1F3327] hover:border-[#087443] dark:hover:border-[#087443] flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#16241C] transition cursor-pointer"
                      onClick={onClose}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={post.author.avatarUrl} alt={post.author.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                            {post.author.fullName}
                          </p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">{post.content}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Countries Results */}
            {(activeTab === 'all' || activeTab === 'countries') && matchingCountries.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> African Nations ({matchingCountries.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingCountries.map((c) => (
                    <Link
                      key={c.code}
                      href={`/discover/${c.code.toLowerCase()}`}
                      onClick={onClose}
                      className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-[#1F3327] hover:border-[#087443] dark:hover:border-[#087443] flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#16241C] transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl select-none">{c.flagEmoji || c.flag}</span>
                        <div className="truncate">
                          <p className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                            {c.capital} • {c.region}
                          </p>
                          {c.majorLanguages && c.majorLanguages.length > 0 && (
                            <p className="text-[9px] text-[#D9A441] font-semibold truncate">
                              {c.majorLanguages.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 ml-2" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty Results State */}
            {totalResultsCount === 0 && (
              <div className="py-8 text-center space-y-2">
                <Globe className="w-8 h-8 mx-auto text-neutral-400" />
                <p className="font-bold text-sm text-neutral-700 dark:text-neutral-300 font-sora">
                  No matching results found
                </p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try searching by African city (e.g. Lagos, Accra, Kigali), language (Swahili, Yoruba, Amharic), topic (#Afrobeats), or person name.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Default Recent Searches & Suggested African Discoveries */}
        {!debouncedQuery && (
          <div className="space-y-4 pt-1">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Recent Searches
                  </span>
                  <button
                    onClick={clearRecent}
                    className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSelectRecent(term)}
                      className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-[#16241C] text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1F3327] border border-transparent dark:border-[#1F3327] transition"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Pan-African Topics */}
            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Trending Across Africa
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { tag: '#AfroTechSummit', count: '45.2k posts', icon: '💻' },
                  { tag: '#AFCON2027', count: '120.4k posts', icon: '⚽' },
                  { tag: '#AmapianoVibes', count: '89.1k posts', icon: '🎵' },
                  { tag: '#AfCFTA_Trade', count: '14.8k posts', icon: '📈' },
                ].map((trend) => (
                  <button
                    key={trend.tag}
                    onClick={() => setQuery(trend.tag)}
                    className="p-2.5 rounded-xl border border-neutral-100 dark:border-[#1F3327] text-left hover:border-[#087443] transition flex items-center gap-2.5 bg-neutral-50/50 dark:bg-[#16241C]/60 hover:bg-gray-100 dark:hover:bg-[#16241C]"
                  >
                    <span className="text-base">{trend.icon}</span>
                    <div className="truncate">
                      <p className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                        {trend.tag}
                      </p>
                      <p className="text-[10px] text-neutral-400">{trend.count}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
