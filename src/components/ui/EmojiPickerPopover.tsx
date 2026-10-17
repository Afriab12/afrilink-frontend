'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Smile, Loader2, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Theme as EmojiTheme } from 'emoji-picker-react';

// Dynamically lazy-load the emoji picker to keep initial JS bundles ultralight
const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => (
    <div className="w-[300px] h-[350px] bg-white dark:bg-[#111D16] rounded-3xl flex flex-col items-center justify-center text-xs text-neutral-400 gap-2 border border-neutral-200 dark:border-[#1F3327] shadow-xl">
      <Loader2 className="w-6 h-6 animate-spin text-[#087443]" />
      <span>Loading Emojis...</span>
    </div>
  ),
});

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void;
  className?: string;
  placement?: 'top' | 'bottom';
  buttonClassName?: string;
}

export const EmojiPickerPopover: React.FC<EmojiPickerPopoverProps> = ({
  onSelectEmoji,
  className = '',
  placement = 'top',
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle emoji click
  const handleEmojiClick = (emojiData: { emoji: string }) => {
    onSelectEmoji(emojiData.emoji);
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition active:scale-95 pointer-events-auto cursor-pointer ${
          isOpen
            ? 'bg-amber-100 dark:bg-amber-950/60 text-[#D9A441]'
            : 'text-neutral-500 hover:text-[#D9A441] hover:bg-amber-50 dark:hover:bg-amber-950/30'
        } ${buttonClassName}`}
        aria-label="Add emoji"
        title="Add emoji"
      >
        <Smile className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } left-0 sm:left-auto right-auto sm:right-0 z-50 animate-in fade-in zoom-in-95 duration-150 shadow-2xl rounded-3xl overflow-hidden`}
        >
          <div className="relative">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={isDark ? EmojiTheme.DARK : EmojiTheme.LIGHT}
              lazyLoadEmojis={true}
              width={320}
              height={380}
              searchPlaceHolder="Search emojis..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
