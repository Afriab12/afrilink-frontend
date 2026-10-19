'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { User } from '@/types';
import { UserAvatar } from '@/components/ui/user-avatar';
import { getFollowButtonConfig, getSocialProofContext } from '@/lib/connect-utils';

export interface ConnectRowProps {
  user: User;
  isFollowing: boolean;
  isPending?: boolean;
  onToggleFollow: (user: User) => void;
  index?: number;
}

export const ConnectRow: React.FC<ConnectRowProps> = ({
  user,
  isFollowing,
  isPending = false,
  onToggleFollow,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const socialProof = getSocialProofContext(user, index);
  const buttonConfig = getFollowButtonConfig(isFollowing, isPending, isHovered);

  return (
    <div
      data-testid={`connect-row-${user.id}`}
      className="flex items-center justify-between gap-3 py-2.5 px-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:-translate-y-[1px] transition-all duration-200 group"
    >
      {/* User Avatar + Metadata Link */}
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center gap-3 min-w-0 flex-1"
      >
        {/* UserAvatar 40px (Phase 0 component) + ring-2 ring-white/[0.06]; group-hover ring-emerald-500/30 */}
        <UserAvatar
          src={user.avatarUrl}
          alt={user.fullName}
          username={user.username}
          userId={user.id}
          size="md"
          isOnline={user.status === 'active' || Boolean(user.isOnline)}
          className="rounded-full ring-2 ring-slate-200 dark:ring-white/[0.06] group-hover:ring-emerald-500/30 transition-all duration-200"
        />

        <div className="min-w-0 flex-1">
          {/* Name Row: display name + inline BadgeCheck */}
          <div className="flex items-center gap-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {user.fullName}
            </p>
            {user.isVerified && (
              <BadgeCheck
                data-testid="inline-badge-check"
                className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 inline-block"
                strokeWidth={1.75}
              />
            )}
          </div>

          {/* Handle */}
          <p className="text-xs text-slate-500 dark:text-white/40 truncate">
            @{user.username}
          </p>

          {/* Context Line (Social proof): "8 mutual connections" | "Popular in Lagos" etc. */}
          <p className="text-[10px] text-slate-400 dark:text-white/30 truncate mt-0.5">
            {socialProof}
          </p>
        </div>
      </Link>

      {/* Unified Follow/Following/Pending Button */}
      <button
        type="button"
        data-testid={`follow-button-${user.id}`}
        disabled={isPending}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onToggleFollow(user)}
        aria-label={`${buttonConfig.label} ${user.fullName}`}
        className={buttonConfig.className}
      >
        {buttonConfig.label}
      </button>
    </div>
  );
};
