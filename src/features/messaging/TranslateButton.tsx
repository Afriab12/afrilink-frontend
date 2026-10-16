'use client';

import React from 'react';
import { Languages, Loader2, Undo2 } from 'lucide-react';

interface TranslateButtonProps {
  isTranslated: boolean;
  isLoading?: boolean;
  targetLanguageName?: string;
  onClick: () => void;
  isMine?: boolean;
}

export const TranslateButton: React.FC<TranslateButtonProps> = ({
  isTranslated,
  isLoading = false,
  targetLanguageName = 'My Language',
  onClick,
  isMine = false,
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-medium transition active:scale-95 touch-manipulation focus:outline-none focus:ring-1 focus:ring-[#D9A441] ${
        isMine
          ? isTranslated
            ? 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-800'
            : 'bg-emerald-700/60 text-white/90 hover:bg-emerald-700'
          : isTranslated
          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
      }`}
      aria-label={isTranslated ? 'Show original text' : `Translate to ${targetLanguageName}`}
      title={isTranslated ? 'Show original text' : `Translate to ${targetLanguageName}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-current" />
          <span>Translating...</span>
        </>
      ) : isTranslated ? (
        <>
          <Undo2 className="w-3 h-3 text-current" />
          <span>Original</span>
        </>
      ) : (
        <>
          <Languages className="w-3 h-3 text-current" />
          <span>Translate</span>
        </>
      )}
    </button>
  );
};
