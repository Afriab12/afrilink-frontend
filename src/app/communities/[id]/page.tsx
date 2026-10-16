'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, AlertCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CommunityHeader } from '@/features/communities/CommunityHeader';
import { CommunityFeed } from '@/features/communities/CommunityFeed';
import { CommunityRulesCard } from '@/features/communities/CommunityRulesCard';
import { CommunityMembersList } from '@/features/communities/CommunityMembersList';
import { useSocial } from '@/stores/socialContext';

interface CommunityDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CommunityDetailPage({ params }: CommunityDetailPageProps) {
  const resolvedParams = use(params);
  const communityId = resolvedParams.id;
  const { communities, posts } = useSocial();
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'members'>('posts');

  const community = communities.find(
    (c) => c.id === communityId || c.slug === communityId
  );

  if (!community) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 text-center border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white font-sora">
          African Community Not Found
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          The requested community hub does not exist or may have been relocated.
        </p>
        <div className="pt-2">
          <Link href="/communities">
            <Button size="sm" variant="primary" className="font-bold">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Communities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const communityPosts = posts.filter((p) => p.communityId === community.id);

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/communities"
          className="inline-flex items-center text-xs font-bold text-neutral-500 hover:text-[#087443] transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to All Communities
        </Link>
      </div>

      {/* Hero Header */}
      <CommunityHeader community={community} />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200/80 dark:border-neutral-800 pb-3 text-xs font-bold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'posts'
              ? 'bg-[#087443] text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Discussions ({communityPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'about'
              ? 'bg-[#087443] text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Rules & Guidelines</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'members'
              ? 'bg-[#087443] text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members Directory ({community.memberCount})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'posts' && (
        <CommunityFeed community={community} posts={communityPosts} />
      )}

      {activeTab === 'about' && (
        <CommunityRulesCard community={community} />
      )}

      {activeTab === 'members' && (
        <CommunityMembersList community={community} />
      )}
    </div>
  );
}
