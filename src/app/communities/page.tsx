'use client';

import React, { useState, useMemo } from 'react';
import { CommunityCard } from '@/features/communities/CommunityCard';
import { CreateCommunityModal, COMMUNITY_CATEGORIES } from '@/features/communities/CreateCommunityModal';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Search, Building2, Sparkles, Filter } from 'lucide-react';
import { useSocial } from '@/stores/socialContext';

export default function CommunitiesPage() {
  const { communities } = useSocial();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredCommunities = useMemo(() => {
    return communities.filter((comm) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        comm.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comm.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (comm.country && comm.country.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [communities, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#087443] text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Pan-African Spaces & Circles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-sora tracking-tight">
            African Communities
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl">
            Assemble around shared industries, agritech innovation, creative arts, regional trade, and diaspora initiatives.
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="font-bold flex-shrink-0 shadow-sm"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" /> Create Community
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search communities by name, topic, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 rounded-2xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 border border-neutral-200/80 dark:border-neutral-800 focus:outline-none focus:border-[#087443] shadow-sm transition"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap ${
              selectedCategory === 'All'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300'
            }`}
          >
            All Communities ({communities.length})
          </button>

          {COMMUNITY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#087443] text-white shadow-sm'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Community Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredCommunities.length > 0 ? (
          filteredCommunities.map((comm) => (
            <CommunityCard key={comm.id} community={comm} />
          ))
        ) : (
          <div className="col-span-1 sm:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-white font-sora">
                No communities found
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                No spaces match &ldquo;{searchQuery}&rdquo; in {selectedCategory}. Be the visionary to build this community!
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="font-bold"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" /> Start &ldquo;{searchQuery || selectedCategory}&rdquo; Hub
            </Button>
          </div>
        )}
      </div>

      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
