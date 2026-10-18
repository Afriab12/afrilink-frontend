'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BUTTON_PRESS_CLASS } from '@/lib/animations';

import {
  EmptyStatePreset,
  EmptyStatePresetConfig,
  EMPTY_STATE_PRESETS,
  EMPTY_STATE_LAYOUT,
  resolveEmptyStateConfig,
} from '@/lib/empty-state';

export type { EmptyStatePreset, EmptyStatePresetConfig };
export { EMPTY_STATE_PRESETS, EMPTY_STATE_LAYOUT, resolveEmptyStateConfig };

interface EmptyStateGeometryProps {
  preset: EmptyStatePreset;
  className?: string;
}

/**
 * 120×120 abstract geometric SVG illustrations inspired by Pan-African geometry
 * (Adinkra, Kuba geometric lozenges, and African radial star patterns).
 * Uses pure inline SVG and lightweight emerald-500/10 stroke — zero canvas, zero photos.
 */
export const EmptyStateGeometry: React.FC<EmptyStateGeometryProps> = ({
  preset,
  className,
}) => {
  return (
    <svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-[120px] h-[120px] text-emerald-500/10 stroke-emerald-500/10', className)}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      role="img"
      data-testid="empty-state-svg"
    >
      {/* Base Africa-inspired geometric shield boundary */}
      <rect
        x="8"
        y="8"
        width="104"
        height="104"
        rx="24"
        strokeDasharray="4 6"
        className="opacity-40"
      />

      {preset === 'feed' && (
        <g data-testid="geometry-feed">
          {/* African sunrise / radiant communal hearth geometry */}
          <circle cx="60" cy="60" r="46" strokeDasharray="3 6" />
          <circle cx="60" cy="60" r="32" />
          <circle cx="60" cy="60" r="18" strokeDasharray="2 4" />
          {/* Central diamond lozenge */}
          <path d="M60 44 L76 60 L60 76 L44 60 Z" />
          <path d="M60 52 L68 60 L60 68 L52 60 Z" />
          {/* 4 Cardinal ray chevrons */}
          <path d="M52 24 L60 16 L68 24" />
          <line x1="60" y1="16" x2="60" y2="28" />
          <path d="M52 96 L60 104 L68 96" />
          <line x1="60" y1="104" x2="60" y2="92" />
          <path d="M24 52 L16 60 L24 68" />
          <line x1="16" y1="60" x2="28" y2="60" />
          <path d="M96 52 L104 60 L96 68" />
          <line x1="104" y1="60" x2="92" y2="60" />
          {/* Diagonal geometric accents */}
          <line x1="38" y1="38" x2="44" y2="44" />
          <line x1="82" y1="38" x2="76" y2="44" />
          <line x1="38" y1="82" x2="44" y2="76" />
          <line x1="82" y1="82" x2="76" y2="76" />
        </g>
      )}

      {preset === 'messages' && (
        <g data-testid="geometry-messages">
          {/* African dialogue / interlocking communication lozenges */}
          <circle cx="60" cy="60" r="46" strokeDasharray="3 5" className="opacity-30" />
          {/* Interlocking dialogue diamonds */}
          <path d="M44 32 L72 60 L44 88 L16 60 Z" />
          <path d="M76 32 L104 60 L76 88 L48 60 Z" />
          <path d="M60 46 L74 60 L60 74 L46 60 Z" />
          {/* Internal speech rhythm chevrons */}
          <path d="M30 46 L38 54 L30 62" />
          <path d="M90 46 L82 54 L90 62" />
          {/* Communicative focal nodes */}
          <circle cx="60" cy="60" r="3" />
          <circle cx="44" cy="60" r="2" />
          <circle cx="76" cy="60" r="2" />
        </g>
      )}

      {preset === 'notifications' && (
        <g data-testid="geometry-notifications">
          {/* African gong / bell with concentric resonance ripples */}
          <path d="M22 66 A42 42 0 0 1 98 66" strokeDasharray="3 6" />
          <path d="M30 68 A32 32 0 0 1 90 68" />
          {/* Sacred bell triangular dome */}
          <path d="M60 26 L86 72 L34 72 Z" />
          {/* Base chevron ridge */}
          <path d="M28 78 L60 86 L92 78" />
          {/* Suspended resonance droplet */}
          <path d="M60 90 L66 98 L60 106 L54 98 Z" />
          {/* Crown finial */}
          <path d="M54 20 L60 14 L66 20" />
          <circle cx="60" cy="26" r="3" />
        </g>
      )}

      {preset === 'community-members' && (
        <g data-testid="geometry-community-members">
          {/* African Ubuntu council star & communal web of unity */}
          <circle cx="60" cy="60" r="46" strokeDasharray="4 6" />
          {/* 6-node geometric unity star chords */}
          <polygon points="60,18 96,39 96,81 60,102 24,81 24,39" />
          <polygon points="60,18 96,81 24,81" className="opacity-50" />
          <polygon points="60,102 96,39 24,39" className="opacity-50" />
          {/* Central council circle & diamond node */}
          <circle cx="60" cy="60" r="18" />
          <path d="M60 52 L68 60 L60 68 L52 60 Z" />
          {/* 6 Member vertices */}
          <circle cx="60" cy="18" r="3" />
          <circle cx="96" cy="39" r="3" />
          <circle cx="96" cy="81" r="3" />
          <circle cx="60" cy="102" r="3" />
          <circle cx="24" cy="81" r="3" />
          <circle cx="24" cy="39" r="3" />
        </g>
      )}

      {preset === 'search' && (
        <g data-testid="geometry-search">
          {/* African navigation compass & geometric viewfinder reticle */}
          <circle cx="60" cy="60" r="46" />
          <circle cx="60" cy="60" r="28" strokeDasharray="2 4" />
          {/* Viewfinder brackets */}
          <path d="M28 40 L28 28 L40 28" />
          <path d="M92 40 L92 28 L80 28" />
          <path d="M28 80 L28 92 L40 92" />
          <path d="M92 80 L92 92 L80 92" />
          {/* 4-point cardinal diamond star */}
          <path d="M60 14 L64 48 L60 52 L56 48 Z" />
          <path d="M60 106 L64 72 L60 68 L56 72 Z" />
          <path d="M106 60 L72 64 L68 60 L72 56 Z" />
          <path d="M14 60 L48 64 L52 60 L48 56 Z" />
          {/* Central iris */}
          <circle cx="60" cy="60" r="4" />
        </g>
      )}

      {preset === 'network-error' && (
        <g data-testid="geometry-network-error">
          {/* African fractured network pulse & disconnected lattice */}
          <path d="M60 14 L106 60 L60 106 L14 60 Z" strokeDasharray="4 6" />
          <path d="M60 26 L94 60 L60 94 L26 60 Z" />
          {/* Fractured dynamic lightning chevron */}
          <path d="M65 24 L50 56 L70 56 L55 96" />
          {/* Disconnected wave pulses */}
          <path d="M22 50 A14 14 0 0 1 22 70" />
          <path d="M98 50 A14 14 0 0 0 98 70" />
          {/* Broken chord markers */}
          <line x1="34" y1="42" x2="48" y2="42" />
          <line x1="86" y1="42" x2="72" y2="42" />
          <line x1="34" y1="78" x2="48" y2="78" />
          <line x1="86" y1="78" x2="72" y2="78" />
          <circle cx="65" cy="24" r="2.5" />
          <circle cx="55" cy="96" r="2.5" />
        </g>
      )}
    </svg>
  );
};

export interface EmptyStateProps {
  preset?: EmptyStatePreset;
  title?: string;
  description?: string;
  actionLabel?: string | null;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
  illustrationClassName?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  preset = 'feed',
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
  illustrationClassName,
  children,
}) => {
  const config = EMPTY_STATE_PRESETS[preset] || EMPTY_STATE_PRESETS.feed;

  const resolvedTitle = title ?? config.title;
  const resolvedDescription = description ?? config.description;
  const resolvedActionLabel = actionLabel !== undefined ? actionLabel : config.actionLabel;
  const resolvedActionHref = actionHref ?? config.actionHref;

  const showAction = Boolean(resolvedActionLabel && (onAction || resolvedActionHref));

  return (
    <div
      data-testid="empty-state"
      data-preset={preset}
      className={cn(
        'flex flex-col items-center justify-center text-center max-w-xs mx-auto py-16',
        className
      )}
    >
      {/* 120×120 abstract geometric SVG (emerald-500/10 stroke, Africa-inspired simple geometry) */}
      <div className="w-[120px] h-[120px] flex items-center justify-center shrink-0">
        <EmptyStateGeometry preset={preset} className={illustrationClassName} />
      </div>

      {/* Title */}
      <h3
        data-testid="empty-state-title"
        className="text-base font-semibold text-white/90 mt-6 font-sora"
      >
        {resolvedTitle}
      </h3>

      {/* Description */}
      <p
        data-testid="empty-state-description"
        className="text-sm text-white/35 mt-2 leading-relaxed"
      >
        {resolvedDescription}
      </p>

      {/* Optional CTA primary button mt-6 */}
      {showAction && (
        <div className="mt-6">
          {onAction ? (
            <button
              type="button"
              onClick={onAction}
              data-testid="empty-state-cta"
              className={cn(
                'inline-flex items-center justify-center h-10 px-5 rounded-xl font-medium text-sm',
                'bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-150 shadow-sm',
                BUTTON_PRESS_CLASS
              )}
            >
              {resolvedActionLabel}
            </button>
          ) : resolvedActionHref ? (
            <Link
              href={resolvedActionHref}
              data-testid="empty-state-cta"
              className={cn(
                'inline-flex items-center justify-center h-10 px-5 rounded-xl font-medium text-sm',
                'bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-150 shadow-sm',
                BUTTON_PRESS_CLASS
              )}
            >
              {resolvedActionLabel}
            </Link>
          ) : null}
        </div>
      )}

      {/* Optional supplementary content (e.g. search suggestion chips) */}
      {children}
    </div>
  );
};
