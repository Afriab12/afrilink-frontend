'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { INITIAL_USERS } from '@/services/mockBackend';
import { useSocial } from '@/stores/socialContext';
import { AFRICAN_COUNTRIES } from '@/utils/countryData';

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
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'communities' | 'posts' | 'countries'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'AfroTech',
    'Nairobi',
    'Amapiano',
    'Ghana',
  ]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Search Results
  const matchingUsers = trimmed
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
          c.region.toLowerCase().includes(trimmed)
      )
    : [];

  const hasAnyResults =
    matchingUsers.length > 0 ||
    matchingCommunities.length > 0 ||
    matchingPosts.length > 0 ||
    matchingCountries.length > 0;

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
    >
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search African founders, #Afrobeats, Lagos, FinTech..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 border border-transparent focus:border-[#087443] focus:bg-white dark:focus:bg-neutral-900 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Tab Bar */}
        {query && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full font-bold transition ${
                activeTab === 'all'
                  ? 'bg-[#087443] text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`px-3 py-1.5 rounded-full font-bold transition ${
                activeTab === 'people'
                  ? 'bg-[#087443] text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
              }`}
            >
              People ({matchingUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('communities')}
              className={`px-3 py-1.5 rounded-full font-bold transition ${
                activeTab === 'communities'
                  ? 'bg-[#087443] text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
              }`}
            >
              Communities ({matchingCommunities.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-3 py-1.5 rounded-full font-bold transition ${
                activeTab === 'posts'
                  ? 'bg-[#087443] text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
              }`}
            >
              Posts ({matchingPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('countries')}
              className={`px-3 py-1.5 rounded-full font-bold transition ${
                activeTab === 'countries'
                  ? 'bg-[#087443] text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
              }`}
            >
              Countries ({matchingCountries.length})
            </button>
          </div>
        )}

        {/* Results Area */}
        {query ? (
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
                      className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#087443] flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatarUrl} alt={user.fullName} size="sm" />
                        <div>
                          <p className="font-bold text-xs text-neutral-900 dark:text-white">
                            {user.fullName}
                          </p>
                          <p className="text-[10px] text-neutral-500">
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
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#087443] flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar src={comm.profileImage} alt={comm.name} size="sm" />
                          <div>
                            <p className="font-bold text-xs text-neutral-900 dark:text-white">
                              {comm.name}
                            </p>
                            <p className="text-[10px] text-neutral-500">
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

            {/* Countries Results */}
            {(activeTab === 'all' || activeTab === 'countries') &&
              matchingCountries.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> African Countries
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {matchingCountries.map((c) => (
                      <Link
                        key={c.code}
                        href={`/discover/${c.code.toLowerCase()}`}
                        onClick={onClose}
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#087443] flex items-center gap-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
                      >
                        <span className="text-xl">{c.flag}</span>
                        <div>
                          <p className="font-bold text-xs text-neutral-900 dark:text-white">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-neutral-500">{c.region}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            {/* Posts Results */}
            {(activeTab === 'all' || activeTab === 'posts') && matchingPosts.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Posts & Discussions
                </h4>
                <div className="space-y-1.5">
                  {matchingPosts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar src={p.author.avatarUrl} alt={p.author.fullName} size="xs" />
                        <span className="font-bold text-xs text-neutral-900 dark:text-white">
                          {p.author.fullName}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2">
                        {p.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasAnyResults && (
              <div className="py-8 text-center text-neutral-400">
                <p className="text-sm font-semibold">No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Try searching for another country, topic, or creator name.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Recent Searches & Suggested African Topics */
          <div className="space-y-4 py-2">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Recent Searches
                  </h4>
                  <button
                    onClick={clearRecent}
                    className="text-[11px] text-neutral-400 hover:text-neutral-600"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSelectRecent(term)}
                      className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Popular Across Africa
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['#Afrobeats', '#SiliconSavannah', '#AfCFTA', '#Nollywood'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-left font-semibold text-[#087443] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition"
                  >
                    {tag}
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
