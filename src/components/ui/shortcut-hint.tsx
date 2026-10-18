'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ShortcutHintProps {
  /** Single shortcut string e.g. "⌘K", "?", "Esc" */
  shortcut?: string;
  /** Array of shortcut tokens e.g. ["G", "H"] or ["⌘", "K"] */
  keys?: string[];
  /** Separator between tokens e.g. "then", "+", or none */
  separator?: string;
  /** Additional custom classes */
  className?: string;
  /** Custom class for individual kbd elements */
  kbdClassName?: string;
}

/**
 * Clean, accessible keyboard shortcut badge component.
 * Renders semantic <kbd> elements with distinct tonal elevation and monospace styling.
 */
export const ShortcutHint: React.FC<ShortcutHintProps> = ({
  shortcut,
  keys,
  separator,
  className,
  kbdClassName,
}) => {
  const resolvedKeys = keys && keys.length > 0 ? keys : shortcut ? [shortcut] : [];

  if (resolvedKeys.length === 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] select-none pointer-events-none',
        className
      )}
      aria-label={`Keyboard shortcut: ${resolvedKeys.join(separator ? ` ${separator} ` : ' ')}`}
    >
      {resolvedKeys.map((keyToken, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && separator && (
            <span className="text-[9px] text-neutral-400 dark:text-white/30 font-medium px-0.5 lowercase">
              {separator}
            </span>
          )}
          <kbd
            className={cn(
              'inline-flex items-center justify-center min-w-[18px] h-5 px-1.5',
              'rounded-md text-[10px] font-mono font-semibold',
              'bg-neutral-100 dark:bg-surface-3 text-neutral-600 dark:text-white/70',
              'border border-neutral-200 dark:border-white/[0.08] shadow-sm',
              kbdClassName
            )}
          >
            {keyToken}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  );
};
