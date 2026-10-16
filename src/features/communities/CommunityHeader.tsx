'use client';

import React, { useState } from 'react';
import { Community } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Lock,
  Globe,
  Users,
  ShieldCheck,
  Check,
  Share2,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useSocial } from '@/stores/socialContext';
import { useAuth } from '@/stores/authContext';

interface CommunityHeaderProps {
  community: Community;
  onOpenSettings?: () => void;
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  community,
  onOpenSettings,
}) => {
  const { joinCommunity } = useSocial();
  const { currentUser } = useAuth();
  const [isHoveringJoined, setIsHoveringJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = community.creatorId === currentUser?.id || community.myRole === 'owner';
  const isModerator = community.myRole === 'moderator';

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm border border-neutral-200/80 dark:border-neutral-800">
      {/* Cover Banner */}
      <div className="relative h-44 sm:h-60 w-full bg-neutral-200 dark:bg-neutral-800">
        <img
          src={community.coverImage}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Share Button Floating */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition shadow-sm"
          title="Share community link"
          aria-label="Share community"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Profile Bar */}
      <div className="px-5 sm:px-8 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 sm:-mt-16 mb-4 gap-4">
          <div className="relative">
            <Avatar
              src={community.profileImage}
              alt={community.name}
              size="2xl"
              className="border-4 border-white dark:border-neutral-900 shadow-xl ring-2 ring-emerald-500/20"
            />
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isOwner && onOpenSettings && (
              <Button
                variant="outline"
                size="md"
                onClick={onOpenSettings}
                className="font-bold border-neutral-300 dark:border-neutral-700"
              >
                <Settings className="w-4 h-4 mr-1.5" /> Manage Hub
              </Button>
            )}

            <Button
              variant={community.isJoined ? (isHoveringJoined ? 'outline' : 'outline') : 'primary'}
              size="md"
              onClick={() => joinCommunity(community.id)}
              onMouseEnter={() => setIsHoveringJoined(true)}
              onMouseLeave={() => setIsHoveringJoined(false)}
              className={`font-bold px-6 transition ${
                community.isJoined && isHoveringJoined
                  ? 'border-red-500/80 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                  : ''
              }`}
            >
              {community.isJoined ? (
                isHoveringJoined ? (
                  'Leave Community'
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-[#087443]" /> Joined
                  </>
                )
              ) : community.isPrivate ? (
                'Request Membership'
              ) : (
                'Join Community'
              )}
            </Button>
          </div>
        </div>

        {/* Title, Badges, Metrics */}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 dark:text-white font-sora tracking-tight">
              {community.name}
            </h1>

            <Badge variant={community.isPrivate ? 'neutral' : 'emerald'} size="sm">
              {community.isPrivate ? (
                <>
                  <Lock className="w-3 h-3 mr-1" /> Private Hub
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 mr-1" /> Public Hub
                </>
              )}
            </Badge>

            <Badge variant="gold" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              {community.category}
            </Badge>

            {(isOwner || isModerator) && (
              <Badge variant="emerald" size="sm">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {isOwner ? 'Hub Creator' : 'Moderator'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-500 mt-2 font-medium">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              Focus: {community.country || 'Pan-African'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
              <Users className="w-3.5 h-3.5 text-[#087443]" />
              {community.memberCount.toLocaleString()} African members
            </span>
          </div>

          <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-3.5 max-w-3xl leading-relaxed">
            {community.description}
          </p>
        </div>
      </div>
    </div>
  );
};
