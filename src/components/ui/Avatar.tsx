'use client';

import React from 'react';
import { UserAvatar, UserAvatarSize } from './user-avatar';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: UserAvatarSize;
  className?: string;
  countryFlag?: string;
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className,
  countryFlag,
  isOnline,
}) => {
  return (
    <div className={cn('relative inline-block flex-shrink-0', className)}>
      <UserAvatar
        src={src}
        alt={alt}
        size={size}
        isOnline={isOnline}
      />

      {countryFlag && (
        <span
          className="absolute -bottom-1 -right-1 text-xs bg-white dark:bg-surface-0 rounded-full px-0.5 shadow-sm border border-neutral-200 dark:border-white/[0.04]"
          title="Country"
        >
          {countryFlag}
        </span>
      )}
    </div>
  );
};

export default Avatar;
