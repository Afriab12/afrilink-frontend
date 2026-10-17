'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Languages } from 'lucide-react';
import { Country } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface CountryCardProps {
  country: Country;
}

export const CountryCard: React.FC<CountryCardProps> = ({ country }) => {
  const flagDisplay = country.flagEmoji || country.flag;

  return (
    <Link
      href={`/discover/${country.code.toLowerCase()}`}
      className="group bg-white dark:bg-surface-0 rounded-3xl p-5 border border-neutral-200/80 dark:border-white/[0.04] shadow-sm hover:shadow-md hover:border-[#087443] dark:hover:border-white/[0.06] hover:dark:bg-surface-2 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl select-none" role="img" aria-label={country.name}>
            {flagDisplay}
          </span>
          <Badge variant="emerald" size="sm">
            {country.region}
          </Badge>
        </div>

        <h3 className="font-bold text-base text-neutral-900 dark:text-white/90 group-hover:text-[#087443] dark:group-hover:text-[#D9A441] transition font-sora">
          {country.name}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-white/60 mt-0.5">
          Capital: {country.capital} • Pop: {country.population}
        </p>

        {/* 3 Major Local Languages */}
        {country.majorLanguages && country.majorLanguages.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-neutral-600 dark:text-white/60">
            <Languages className="w-3.5 h-3.5 text-[#D9A441] flex-shrink-0" strokeWidth={1.75} />
            <span className="truncate">{country.majorLanguages.join(' • ')}</span>
          </div>
        )}

        <p className="text-xs text-neutral-600 dark:text-white/60 mt-2.5 line-clamp-2 leading-relaxed">
          {country.description}
        </p>

        {country.popularInterests && country.popularInterests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {country.popularInterests.slice(0, 3).map((item) => (
              <span
                key={item}
                className="text-[10px] px-2 py-0.5 bg-neutral-100 dark:bg-surface-3 text-neutral-600 dark:text-white/60 border border-transparent dark:border-white/[0.06] rounded-full font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/[0.04] flex items-center justify-between text-xs font-bold text-[#087443] dark:text-[#0e9357]">
        <span>Explore Country</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={1.75} />
      </div>
    </Link>
  );
};
