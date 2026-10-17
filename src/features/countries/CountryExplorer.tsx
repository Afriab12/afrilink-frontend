'use client';

import React, { useState } from 'react';
import { CountryCard } from './CountryCard';
import { AFRICAN_COUNTRIES, AFRICAN_REGIONS } from '@/utils/countryData';
import { AfricanRegion } from '@/types';
import { Globe, Compass, Sparkles } from 'lucide-react';

export const CountryExplorer: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<AfricanRegion | 'All'>('All');

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
            <Compass className="w-3.5 h-3.5 text-[#D9A441]" />
            <span>Pan-African Country Discovery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-sora tracking-tight">
            Explore Africa Country by Country
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-2 leading-relaxed">
            Discover verified creators, localized discussions, and grassroots communities across West, East, Southern, North, and Central Africa.
          </p>
        </div>
        <div className="absolute right-4 bottom-2 text-7xl opacity-20 pointer-events-none select-none">
          🌍
        </div>
      </div>

      {/* Region Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedRegion('All')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            selectedRegion === 'All'
              ? 'bg-[#087443] text-white shadow-sm ring-2 ring-[#D9A441]/80'
              : 'bg-white dark:bg-surface-2 text-neutral-600 dark:text-white/60 border border-neutral-200 dark:border-white/[0.06] hover:border-[#087443] dark:hover:bg-surface-3'
          }`}
        >
          All 5 Regions ({AFRICAN_COUNTRIES.length})
        </button>

        {AFRICAN_REGIONS.map((region) => {
          const regionCount = AFRICAN_COUNTRIES.filter((c) => c.region === region).length;
          return (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                selectedRegion === region
                  ? 'bg-[#087443] text-white shadow-sm ring-2 ring-[#D9A441]/80'
                  : 'bg-white dark:bg-surface-2 text-neutral-600 dark:text-white/60 border border-neutral-200 dark:border-white/[0.06] hover:border-[#087443] dark:hover:bg-surface-3'
              }`}
            >
              {region} ({regionCount})
            </button>
          );
        })}
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCountries.map((country) => (
          <CountryCard key={country.code} country={country} />
        ))}
      </div>
    </div>
  );
};
