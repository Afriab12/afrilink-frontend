'use client';

import React, { useState } from 'react';
import { CommunityCard } from '@/features/communities/CommunityCard';
import { CreateCommunityModal } from '@/features/communities/CreateCommunityModal';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Search, Building2 } from 'lucide-react';
import { useSocial } from '@/stores/socialContext';
import { COMMUNITY_CATEGORIES } from '@/features/communities/CreateCommunityModal';

export default function CommunitiesPage() {
  const { communities } = useSocial();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filtered = communities.filter((comm) => {
    const matchesCategory =
      selectedCategory === 'All' || comm.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.country?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#087443] text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Pan-African Spaces</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-sora">
            African Communities
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Connect around shared industries, passions, cultural heritage, and regional projects.
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="font-bold flex-shrink-0"
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
            placeholder="Search communities by name, topic or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 rounded-2xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-[#087443]"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap ${
              selectedCategory === 'All'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
            }`}
          >
            All Categories
          </button>

          {COMMUNITY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#087443] text-white shadow-sm'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((comm) => <CommunityCard key={comm.id} community={comm} />)
        ) : (
          <div className="col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-neutral-800">
            <p className="text-sm font-semibold text-neutral-400">
              No communities found matching &ldquo;{searchQuery}&rdquo; in {selectedCategory}.
            </p>
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
