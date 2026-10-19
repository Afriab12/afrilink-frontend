'use client';

import React, { useState } from 'react';
import { CountryCard } from './CountryCard';
import { AFRICAN_COUNTRIES, AFRICAN_REGIONS } from '@/utils/countryData';
import { AfricanRegion } from '@/types';
import { Compass } from 'lucide-react';
import { CountryCardSkeleton, useMinimumLoading } from '@/components/ui/skeleton';

import { RegionTrack } from './RegionTrack';

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
      <RegionTrack
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
      />

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
