'use client';

import React from 'react';
import { ReactionType } from '@/types';
import { cn } from '@/lib/utils';

interface ReactionPickerProps {
  currentReaction?: ReactionType | null;
  onSelectReaction: (type: ReactionType) => void;
  className?: string;
}

export const REACTION_CONFIG: Record<
  ReactionType,
  { emoji: string; label: string; color: string }
> = {
  like: { emoji: '👍', label: 'Like', color: 'text-blue-500' },
  love: { emoji: '❤️', label: 'Love', color: 'text-rose-500' },
  funny: { emoji: '😂', label: 'Funny', color: 'text-amber-500' },
  support: { emoji: '🤝', label: 'Support', color: 'text-[#087443]' },
  sad: { emoji: '😢', label: 'Sad', color: 'text-purple-500' },
  angry: { emoji: '😡', label: 'Angry', color: 'text-orange-600' },
};

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  currentReaction,
  onSelectReaction,
  className,
}) => {
  const reactions: ReactionType[] = ['like', 'love', 'funny', 'support', 'sad', 'angry'];

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 p-1.5 bg-white dark:bg-neutral-800 rounded-full shadow-xl border border-neutral-200 dark:border-neutral-700 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150',
        className
      )}
    >
      {reactions.map((type) => {
        const item = REACTION_CONFIG[type];
        const isSelected = currentReaction === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelectReaction(type)}
            className={cn(
              'group relative p-2 rounded-full transition-transform hover:scale-125 focus:outline-none',
              isSelected && 'bg-neutral-100 dark:bg-neutral-700 scale-110'
            )}
            title={item.label}
          >
            <span className="text-xl select-none leading-none">{item.emoji}</span>
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] font-bold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
