'use client';

import React from 'react';
import { AFRICAN_COUNTRIES, AFRICAN_REGIONS } from '@/utils/countryData';
import { AfricanRegion } from '@/types';

export interface RegionTrackProps {
  selectedRegion: AfricanRegion | 'All';
  onSelectRegion: (region: AfricanRegion | 'All') => void;
  className?: string;
}

export const RegionTrack: React.FC<RegionTrackProps> = ({
  selectedRegion,
  onSelectRegion,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <div
        data-testid="region-track"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth [scroll-snap-type:x_mandatory] pb-1 pr-8"
      >
        {/* All 5 Regions Tab */}
        <button
          type="button"
          data-testid="region-tab-all"
          onClick={() => onSelectRegion('All')}
          className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 [scroll-snap-align:start] transition-all duration-200 ${
            selectedRegion === 'All'
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 text-slate-700 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/10'
          }`}
        >
          All 5 Regions <span className="opacity-60 ml-1 font-normal">({AFRICAN_COUNTRIES.length})</span>
        </button>

        {/* Regional Tabs in strict geographical order */}
        {AFRICAN_REGIONS.map((region) => {
          const regionCount = AFRICAN_COUNTRIES.filter((c) => c.region === region).length;
          const isActive = selectedRegion === region;

          return (
            <button
              key={region}
              type="button"
              data-testid={`region-tab-${region.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectRegion(region)}
              className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 [scroll-snap-align:start] transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 text-slate-700 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {region} <span className="opacity-60 ml-1 font-normal">({regionCount})</span>
            </button>
          );
        })}
      </div>

      {/* Trailing 24px gradient mask signalling overflow (w-6 = 24px) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-slate-50 dark:from-[#0B130E] to-transparent"
      />
    </div>
  );
};

export default RegionTrack;
