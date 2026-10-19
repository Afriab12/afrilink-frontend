'use client';

import React, { useState } from 'react';
import { PostCard } from '@/features/posts/PostCard';
import { PostComposer } from '@/features/posts/PostComposer';
import { Button } from '@/components/ui/Button';
import { useSocial } from '@/stores/socialContext';
import { Sparkles, Users, Building2, Flame, Loader2 } from 'lucide-react';
import { FeedPostSkeleton, useMinimumLoading } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { FeedFilters, FeedFilterType } from './FeedFilters';

export const FeedList: React.FC = () => {
  const { posts, isLoadingPosts, hasMorePosts, loadMorePosts } = useSocial();
  const [feedFilter, setFeedFilter] = useState<FeedFilterType>('all');
  const isMinimumLoading = useMinimumLoading(isLoadingPosts, 300);

  const filteredPosts = posts.filter((post) => {
    if (feedFilter === 'friends') return post.visibility === 'friends';
    if (feedFilter === 'communities') return !!post.communityId;
    if (feedFilter === 'media') return post.media && post.media.length > 0;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Post Composer */}
      <PostComposer />

      {/* Feed Category Tabs / Filter Chips */}
      <FeedFilters currentFilter={feedFilter} onFilterChange={setFeedFilter} />

      {/* Posts Stream */}
      {isMinimumLoading && posts.length === 0 ? (
        <div className="space-y-4">
          <FeedPostSkeleton />
          <FeedPostSkeleton />
          <FeedPostSkeleton />
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Loading More Skeleton */}
          {isLoadingPosts && (
            <div className="pt-2">
              <FeedPostSkeleton />
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          <div className="text-center pt-4 pb-8">
            {hasMorePosts ? (
              <Button
                variant="outline"
                size="md"
                onClick={loadMorePosts}
                isLoading={isLoadingPosts}
                className="w-full sm:w-auto px-8 rounded-full border-neutral-300 dark:border-neutral-700 font-bold"
              >
                Load More African Posts
              </Button>
            ) : (
              <p className="text-xs text-neutral-400 font-medium">
                You have reached the end of the current feed • Connect with more creators across Africa!
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-0 rounded-3xl border border-neutral-200/80 dark:border-white/[0.04]">
          <EmptyState
            preset="feed"
            title={feedFilter === 'all' ? undefined : 'No posts found in this filter'}
            description={
              feedFilter === 'all'
                ? undefined
                : 'Switch back to "For Africa" or create the first post in this channel!'
            }
            actionLabel={feedFilter === 'all' ? 'Discover People' : 'Show All Posts'}
            actionHref={feedFilter === 'all' ? '/discover' : undefined}
            onAction={feedFilter === 'all' ? undefined : () => setFeedFilter('all')}
          />
        </div>
      )}
    </div>
  );
};
