import React from 'react';
import { cn } from '@/lib/utils';

export interface CountryShorthandCardProps {
  code: string;
  name?: string;
  className?: string;
}

/**
 * Country Shorthand Card (40x40)
 * 
 * Complies with Phase 0 Network-First Image Strategy:
 * - Exclusively typographic ISO codes ("NG", "GH", "KE", "ZA"...)
 * - text-sm font-bold tracking-wide text-emerald-400
 * - Container: h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center
 * - NO background-image, NO <img>, NO inline SVG flags
 */
export const CountryShorthandCard: React.FC<CountryShorthandCardProps> = ({
  code,
  name,
  className,
}) => {
  const isoCode = (code || '').toUpperCase().slice(0, 2);

  return (
    <div
      className={cn(
        'h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 select-none border border-emerald-500/20',
        className
      )}
      title={name || isoCode}
      aria-label={name ? `${name} (${isoCode})` : isoCode}
    >
      <span className="text-sm font-bold tracking-wide text-emerald-400 font-mono">
        {isoCode}
      </span>
    </div>
  );
};

export default CountryShorthandCard;
