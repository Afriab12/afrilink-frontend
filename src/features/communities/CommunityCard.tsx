'use client';

import React from 'react';
import Link from 'next/link';
import { Community } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Lock, Globe, Users, ShieldCheck } from 'lucide-react';
import { useSocial } from '@/stores/socialContext';

interface CommunityCardProps {
  community: Community;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
  const { joinCommunity } = useSocial();

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      {/* Cover Image */}
      <div className="relative h-28 w-full bg-neutral-200 dark:bg-neutral-800">
        <img
          src={community.coverImage}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2.5 right-2.5">
          <Badge variant={community.isPrivate ? 'neutral' : 'emerald'} size="sm">
            {community.isPrivate ? (
              <>
                <Lock className="w-3 h-3 mr-1" /> Private
              </>
            ) : (
              <>
                <Globe className="w-3 h-3 mr-1" /> Public
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 pt-0 relative flex-1 flex flex-col justify-between">
        <div>
          {/* Avatar floating */}
          <div className="-mt-8 mb-3">
            <Avatar
              src={community.profileImage}
              alt={community.name}
              size="lg"
              className="border-2 border-white dark:border-neutral-900 shadow-md"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/communities/${community.id}`}
              className="font-bold text-base text-neutral-900 dark:text-white hover:text-[#087443] transition font-sora"
            >
              {community.name}
            </Link>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Badge variant="gold" size="sm">
              {community.category}
            </Badge>
            <span className="text-xs text-neutral-500 font-medium">
              {community.country}
            </span>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2.5 line-clamp-2 leading-relaxed">
            {community.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {community.memberCount.toLocaleString()} members
          </span>

          <Button
            size="sm"
            variant={community.isJoined ? 'outline' : 'primary'}
            onClick={() => joinCommunity(community.id)}
            className="text-xs px-3 py-1.5"
          >
            {community.isJoined ? 'Joined' : community.isPrivate ? 'Request' : 'Join'}
          </Button>
        </div>
      </div>
    </div>
  );
};
