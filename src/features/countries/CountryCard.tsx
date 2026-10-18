'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Country } from '@/types';

export interface CountryCardProps {
  country: Country;
}

export const CountryCard: React.FC<CountryCardProps> = ({ country }) => {
  const isoCode = (country.code || '').toUpperCase().slice(0, 2);

  return (
    <Link
      href={`/discover/${country.code.toLowerCase()}`}
      className="group rounded-2xl p-4 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.10] hover:-translate-y-[2px] transition duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Top Header: 40x40 Typographic Badge + Active Count Indicator */}
        <div className="flex items-center justify-between gap-2">
          {/* Badge 40x40: Typography only per Phase 0 (h-10 w-10 rounded-xl bg-emerald-500/10 text-sm font-bold tracking-wide text-emerald-400) */}
          <div
            data-testid={`country-badge-${isoCode}`}
            className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 select-none border border-emerald-500/20"
          >
            <span className="text-sm font-bold tracking-wide text-emerald-400 font-mono">
              {isoCode}
            </span>
          </div>

          {/* Active indicator with pulse dot */}
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/60 font-medium select-none">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="truncate max-w-[80px] sm:max-w-none">{country.region}</span>
          </div>
        </div>

        {/* Country Name (text-sm font-semibold text-white mt-3) */}
        <h3 className="text-sm font-semibold text-white mt-3 truncate group-hover:text-emerald-400 transition-colors font-sora">
          {country.name}
        </h3>

        <p className="text-[11px] text-white/40 mt-0.5 truncate">
          {country.capital} • {country.population}
        </p>

        {/* Language tags (text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/40 border border-white/[0.06]) */}
        {country.majorLanguages && country.majorLanguages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {country.majorLanguages.slice(0, 3).map((lang) => (
              <span
                key={lang}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/40 border border-white/[0.06] font-medium truncate max-w-[100px]"
              >
                {lang}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Explore Affordance */}
      <div className="mt-4 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-emerald-400/70 font-medium">
        <span>Explore hub</span>
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
      </div>
    </Link>
  );
};
