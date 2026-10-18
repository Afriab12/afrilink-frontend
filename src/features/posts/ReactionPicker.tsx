'use client';

import React, { useState } from 'react';
import { ReactionType } from '@/types';
import { cn } from '@/lib/utils';
import { ReactionBurst } from '@/components/ui/ReactionBurst';
import { BUTTON_PRESS_CLASS } from '@/lib/animations';

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
  const [burstingType, setBurstingType] = useState<ReactionType | null>(null);

  const handleReactionClick = (type: ReactionType) => {
    setBurstingType(type);
    onSelectReaction(type);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 p-1.5 bg-white dark:bg-surface-4 rounded-full shadow-xl border border-neutral-200 dark:border-white/[0.08] backdrop-blur-md animate-in fade-in zoom-in-95 duration-150',
        className
      )}
    >
      {reactions.map((type) => {
        const item = REACTION_CONFIG[type];
        const isSelected = currentReaction === type;
        const isBursting = burstingType === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => handleReactionClick(type)}
            className={cn(
              'group relative p-2 rounded-full transition-transform hover:scale-125 focus:outline-none select-none',
              BUTTON_PRESS_CLASS,
              isSelected && 'bg-neutral-100 dark:bg-white/[0.06] scale-110'
            )}
            title={item.label}
            aria-label={item.label}
          >
            <ReactionBurst
              active={isBursting}
              onAnimationEnd={() => setBurstingType(null)}
            >
              <span className="text-xl select-none leading-none">{item.emoji}</span>
            </ReactionBurst>

            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] font-bold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
