'use client';

import React from 'react';
import { Sparkles, Users, Building2, Flame } from 'lucide-react';

export type FeedFilterType = 'all' | 'friends' | 'communities' | 'media';

interface FeedFiltersProps {
  currentFilter: FeedFilterType;
  onFilterChange: (filter: FeedFilterType) => void;
}

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2 overflow-x-auto scrollbar-hidden px-0">
      <button
        type="button"
        onClick={() => onFilterChange('all')}
        className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 flex items-center gap-1.5 ${
          currentFilter === 'all'
            ? 'bg-emerald-600 text-white border-transparent shadow-sm shadow-emerald-600/20'
            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10'
        }`}
      >
        <Sparkles className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span>For Africa</span>
      </button>

      <button
        type="button"
        onClick={() => onFilterChange('friends')}
        className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 flex items-center gap-1.5 ${
          currentFilter === 'friends'
            ? 'bg-emerald-600 text-white border-transparent shadow-sm shadow-emerald-600/20'
            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10'
        }`}
      >
        <Users className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span>Friends</span>
      </button>

      <button
        type="button"
        onClick={() => onFilterChange('communities')}
        className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 flex items-center gap-1.5 ${
          currentFilter === 'communities'
            ? 'bg-emerald-600 text-white border-transparent shadow-sm shadow-emerald-600/20'
            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10'
        }`}
      >
        <Building2 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span>Communities</span>
      </button>

      <button
        type="button"
        onClick={() => onFilterChange('media')}
        className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 flex items-center gap-1.5 ${
          currentFilter === 'media'
            ? 'bg-emerald-600 text-white border-transparent shadow-sm shadow-emerald-600/20'
            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10'
        }`}
      >
        <Flame className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span>Photos & Video</span>
      </button>
    </div>
  );
};

export default FeedFilters;
