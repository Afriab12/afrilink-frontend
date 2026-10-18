'use client';

import React from 'react';
import { Community, Post } from '@/types';
import { PostComposer } from '@/features/posts/PostComposer';
import { PostCard } from '@/features/posts/PostCard';
import { Button } from '@/components/ui/Button';
import { Lock, Sparkles } from 'lucide-react';
import { useSocial } from '@/stores/socialContext';
import { EmptyState } from '@/components/ui/empty-state';

interface CommunityFeedProps {
  community: Community;
  posts: Post[];
  onPostCreated?: () => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  community,
  posts,
  onPostCreated,
}) => {
  const { joinCommunity } = useSocial();

  // Privacy gate for non-members of private hubs
  if (community.isPrivate && !community.isJoined) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-12 text-center border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8 text-[#D9A441]" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-sora">
            Private African Circle
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            The discussions, updates, and research shared within &ldquo;{community.name}&rdquo; are private to verified hub members.
          </p>
        </div>

        <div className="pt-2">
          <Button
            size="md"
            variant="primary"
            onClick={() => joinCommunity(community.id)}
            className="font-bold px-6 shadow-sm"
          >
            Request Membership to View Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Post Composer scoped to community */}
      <PostComposer
        communityId={community.id}
        placeholder={`Share an insight, opportunity or question in ${community.name}...`}
        onPostCreated={onPostCreated}
      />

      {/* Community Posts */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-0 rounded-3xl border border-neutral-200/80 dark:border-white/[0.04]">
          <EmptyState
            preset="feed"
            title="No Discussions Yet"
            description={`Be the first to spark a dialogue in "${community.name}". Share an initiative, ask a question, or introduce your work!`}
            actionLabel={null}
          />
        </div>
      )}
    </div>
  );
};
