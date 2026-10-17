'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAvatarGradientStyle, getInitials } from '@/lib/avatar-gradient';
import { cn } from '@/lib/utils';

export type UserAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface UserAvatarProps {
  src?: string | null;
  alt: string;
  username?: string;
  userId?: string;
  size?: UserAvatarSize;
  className?: string;
  isOnline?: boolean;
}

const SIZE_MAP: Record<UserAvatarSize, { container: string; text: string; dimension: number }> = {
  xs: { container: 'h-6 w-6', text: 'text-[10px]', dimension: 24 },
  sm: { container: 'h-8 w-8', text: 'text-xs', dimension: 32 },
  md: { container: 'h-10 w-10', text: 'text-sm', dimension: 40 },
  lg: { container: 'h-12 w-12', text: 'text-base', dimension: 48 },
  xl: { container: 'h-16 w-16', text: 'text-xl', dimension: 64 },
  '2xl': { container: 'h-24 w-24', text: 'text-2xl', dimension: 96 },
};

/**
 * UserAvatar Component
 * 
 * Complies with Phase 0 Network-First Image Strategy:
 * - Default zero-network CSS placeholder before user image loads
 * - Two-letter initials from display name
 * - Deterministic HSL gradient from username/id hash
 * - text-white/90 font-semibold
 * - next/image with loading="lazy", decoding="async", placeholder="empty"
 * - Image rendered ONLY after structural shell has painted (client mount)
 * - Silently falls back to CSS initials gradient on error
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  username,
  userId,
  size = 'md',
  className,
  isOnline,
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Render image only after structural shell has painted on client
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const identifier = username || userId || alt || 'user';
  const gradientStyle = getAvatarGradientStyle(identifier);
  const initials = getInitials(alt || username || 'U');

  const showImage = Boolean(src && hasMounted && !hasError);

  return (
    <div className={cn('relative inline-block flex-shrink-0', className)}>
      <div
        style={gradientStyle}
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-semibold text-white/90 select-none relative shadow-sm border border-black/10 dark:border-white/10',
          sizeConfig.container,
          sizeConfig.text
        )}
        aria-label={alt || 'User avatar'}
      >
        {/* CSS Initials Placeholder (Zero-network fallback) */}
        <span className="leading-none tracking-wider pointer-events-none">{initials}</span>

        {/* Lazy User-Uploaded Image (Overlaid once painted, silent fallback on error) */}
        {showImage && src && (
          <Image
            src={src}
            alt={alt || 'User avatar'}
            width={sizeConfig.dimension}
            height={sizeConfig.dimension}
            loading="lazy"
            decoding="async"
            placeholder="empty"
            className="absolute inset-0 w-full h-full object-cover rounded-full"
            onError={() => setHasError(true)}
            unoptimized={src.startsWith('data:') || src.startsWith('blob:')}
          />
        )}
      </div>

      {/* Online Presence Status Dot */}
      {isOnline && (
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-surface-0 rounded-full"
          aria-label="Online"
        />
      )}
    </div>
  );
};

export default UserAvatar;
