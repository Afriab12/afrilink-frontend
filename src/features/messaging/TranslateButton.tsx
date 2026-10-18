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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors active:scale-95 pointer-events-auto cursor-pointer ${
        isTranslated
          ? 'bg-amber-500/10 text-amber-400/80 border border-amber-500/20'
          : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
      }`}
      aria-label={isTranslated ? 'Show original text' : `Translate to ${targetLanguageName}`}
      title={isTranslated ? 'Show original text' : `Translate to ${targetLanguageName}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-current" strokeWidth={1.75} />
          <span>Translating...</span>
        </>
      ) : isTranslated ? (
        <>
          <Undo2 className="h-3 w-3 text-current" strokeWidth={1.75} />
          <span>Original</span>
        </>
      ) : (
        <>
          <Languages className="h-3 w-3 text-current" strokeWidth={1.75} />
          <span>Translate</span>
        </>
      )}
    </button>
  );
};
