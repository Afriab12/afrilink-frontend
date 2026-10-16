'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Building2 } from 'lucide-react';
import { Country } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface CountryCardProps {
  country: Country;
}

export const CountryCard: React.FC<CountryCardProps> = ({ country }) => {
  return (
    <Link
      href={`/discover/${country.code.toLowerCase()}`}
      className="group bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-[#087443]/50 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl select-none" role="img" aria-label={country.name}>
            {country.flag}
          </span>
          <Badge variant="emerald" size="sm">
            {country.region}
          </Badge>
        </div>

        <h3 className="font-bold text-base text-neutral-900 dark:text-white group-hover:text-[#087443] transition font-sora">
          {country.name}
        </h3>
        <p className="text-xs text-neutral-500 mt-0.5">Capital: {country.capital} • Pop: {country.population}</p>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2.5 line-clamp-2 leading-relaxed">
          {country.description}
        </p>

        {country.popularInterests && country.popularInterests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {country.popularInterests.slice(0, 3).map((item) => (
              <span
                key={item}
                className="text-[10px] px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-bold text-[#087443] dark:text-[#0e9357]">
        <span>Explore Country</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
