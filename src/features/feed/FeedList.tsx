'use client';

import React, { useState } from 'react';
import { PostCard } from '@/features/posts/PostCard';
import { PostComposer } from '@/features/posts/PostComposer';
import { Button } from '@/components/ui/Button';
import { useSocial } from '@/stores/socialContext';
import { Sparkles, Users, Building2, Flame, Loader2 } from 'lucide-react';

export const FeedList: React.FC = () => {
  const { posts, isLoadingPosts, hasMorePosts, loadMorePosts } = useSocial();
  const [feedFilter, setFeedFilter] = useState<'all' | 'friends' | 'communities' | 'media'>('all');

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

      {/* Feed Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setFeedFilter('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            feedFilter === 'all'
              ? 'bg-[#087443] text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> For Africa
        </button>

        <button
          onClick={() => setFeedFilter('friends')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            feedFilter === 'friends'
              ? 'bg-[#087443] text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Friends
        </button>

        <button
          onClick={() => setFeedFilter('communities')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            feedFilter === 'communities'
              ? 'bg-[#087443] text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Communities
        </button>

        <button
          onClick={() => setFeedFilter('media')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            feedFilter === 'media'
              ? 'bg-[#087443] text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-[#D9A441]" /> Photos & Video
        </button>
      </div>

      {/* Posts Stream */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

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
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 text-center border border-neutral-200 dark:border-neutral-800">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#087443] flex items-center justify-center mx-auto mb-3 text-2xl">
            🌍
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white font-sora">
            No posts found in this filter
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Switch back to &ldquo;For Africa&rdquo; or create the first post in this channel!
          </p>
          <div className="mt-4">
            <Button size="sm" variant="primary" onClick={() => setFeedFilter('all')}>
              Show All Posts
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
