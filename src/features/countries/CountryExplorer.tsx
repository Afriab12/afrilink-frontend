'use client';

import React, { useState } from 'react';
import { CountryCard } from './CountryCard';
import { AFRICAN_COUNTRIES, AFRICAN_REGIONS } from '@/utils/countryData';
import { AfricanRegion } from '@/types';
import { Compass } from 'lucide-react';
import { CountryCardSkeleton, useMinimumLoading } from '@/components/ui/skeleton';

interface CountryExplorerProps {
  isLoading?: boolean;
}

export const CountryExplorer: React.FC<CountryExplorerProps> = ({ isLoading = false }) => {
  const [selectedRegion, setSelectedRegion] = useState<AfricanRegion | 'All'>('All');
  const isMinimumLoading = useMinimumLoading(isLoading, 300);

  const filteredCountries =
    selectedRegion === 'All'
      ? AFRICAN_COUNTRIES
      : AFRICAN_COUNTRIES.filter((c) => c.region === selectedRegion);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#087443] to-[#065833] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold mb-3 backdrop-blur-sm">
            <Compass className="w-3.5 h-3.5 text-white/90" strokeWidth={1.75} />
            <span>Pan-African Country Discovery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-sora tracking-tight">
            Explore Africa Country by Country
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-2 leading-relaxed">
            Discover verified creators, localized discussions, and grassroots communities across West, East, Southern, North, and Central Africa.
          </p>
        </div>
      </div>

      {/* Regional Navigation Track */}
      <div className="relative">
        <div
          data-testid="region-track"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth [scroll-snap-type:x_mandatory] pb-1 pr-8"
        >
          {/* All 5 Regions Tab */}
          <button
            type="button"
            data-testid="region-tab-all"
            onClick={() => setSelectedRegion('All')}
            className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 [scroll-snap-align:start] transition-all duration-200 ${
              selectedRegion === 'All'
                ? 'bg-emerald-600 text-white font-semibold shadow-[0_0_12px_rgba(8,116,67,0.3)]'
                : 'bg-white/5 border border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white/70'
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
                onClick={() => setSelectedRegion(region)}
                className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 [scroll-snap-align:start] transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-[0_0_12px_rgba(8,116,67,0.3)]'
                    : 'bg-white/5 border border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white/70'
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
          className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-[#0B130E] dark:from-surface-0 to-transparent"
        />
      </div>

      {/* Country Cards Grid: 2 cols mobile | 3 cols tablet | 4 cols desktop; gap-3 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {isMinimumLoading ? (
          <>
            <CountryCardSkeleton />
            <CountryCardSkeleton />
            <CountryCardSkeleton />
            <CountryCardSkeleton />
            <CountryCardSkeleton />
            <CountryCardSkeleton />
            <CountryCardSkeleton />
            <CountryCardSkeleton />
          </>
        ) : (
          filteredCountries.map((country) => (
            <CountryCard key={country.code} country={country} />
          ))
        )}
      </div>
    </div>
  );
};
