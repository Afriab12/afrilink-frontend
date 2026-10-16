'use client';

import React from 'react';
import Link from 'next/link';
import { Community } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Lock, Globe, Users, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useSocial } from '@/stores/socialContext';

interface CommunityCardProps {
  community: Community;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
  const { joinCommunity } = useSocial();

  const isLeader = community.myRole === 'owner' || community.myRole === 'moderator';

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between group">
      {/* Cover Image */}
      <div className="relative h-28 sm:h-32 w-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <img
          src={community.coverImage}
          alt={community.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {isLeader && (
            <Badge variant="gold" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {community.myRole === 'owner' ? 'Owner' : 'Mod'}
            </Badge>
          )}

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
              className="border-2 border-white dark:border-neutral-900 shadow-md ring-1 ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/communities/${community.id}`}
              className="font-bold text-base text-neutral-900 dark:text-white hover:text-[#087443] transition font-sora line-clamp-1"
            >
              {community.name}
            </Link>
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="gold" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              {community.category}
            </Badge>
            <span className="text-xs text-neutral-500 font-medium">
              {community.country || 'Pan-African'}
            </span>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2.5 line-clamp-2 leading-relaxed">
            {community.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#087443]" />
            {community.memberCount.toLocaleString()} members
          </span>

          <Button
            size="sm"
            variant={community.isJoined ? 'outline' : 'primary'}
            onClick={() => joinCommunity(community.id)}
            className="text-xs px-3.5 py-1.5 font-bold"
          >
            {community.isJoined ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-[#087443]" /> Joined
              </>
            ) : community.isPrivate ? (
              'Request'
            ) : (
              'Join Hub'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
