'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Lock,
  Globe,
  PlusCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PostCard } from '@/features/posts/PostCard';
import { PostComposer } from '@/features/posts/PostComposer';
import { useSocial } from '@/stores/socialContext';
import { useAuth } from '@/stores/authContext';
import { INITIAL_USERS } from '@/services/mockBackend';

interface CommunityDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CommunityDetailPage({ params }: CommunityDetailPageProps) {
  const resolvedParams = use(params);
  const communityId = resolvedParams.id;
  const { communities, posts, joinCommunity } = useSocial();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'members'>('posts');

  const community = communities.find((c) => c.id === communityId || c.slug === communityId);

  if (!community) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 text-center border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white font-sora">
          Community Not Found
        </h2>
        <p className="text-xs text-neutral-500 mt-2">
          This community does not exist or has been archived.
        </p>
        <div className="mt-4">
          <Link href="/communities">
            <Button size="sm" variant="primary">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Communities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const communityPosts = posts.filter((p) => p.communityId === community.id);

  return (
    <div className="space-y-6">
      <Link
        href="/communities"
        className="inline-flex items-center text-xs font-bold text-neutral-500 hover:text-[#087443] transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to All Communities
      </Link>

      {/* Community Banner & Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm border border-neutral-200/80 dark:border-neutral-800">
        <div className="relative h-40 sm:h-52 w-full bg-neutral-200 dark:bg-neutral-800">
          <img
            src={community.coverImage}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="px-5 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-16 mb-4 gap-4">
            <div className="relative">
              <Avatar
                src={community.profileImage}
                alt={community.name}
                size="2xl"
                className="border-4 border-white dark:border-neutral-900 shadow-xl"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={community.isJoined ? 'outline' : 'primary'}
                size="md"
                onClick={() => joinCommunity(community.id)}
                className="font-bold px-6"
              >
                {community.isJoined ? 'Joined Community' : community.isPrivate ? 'Request Membership' : 'Join Community'}
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-sora">
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
                {community.category}
              </Badge>
            </div>

            <p className="text-xs text-neutral-500 mt-1">
              Focus: {community.country} • {community.memberCount.toLocaleString()} members
            </p>

            <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-3 max-w-2xl leading-relaxed">
              {community.description}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-1.5 ${
            activeTab === 'posts'
              ? 'bg-[#087443] text-white'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Discussions ({communityPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-1.5 ${
            activeTab === 'about'
              ? 'bg-[#087443] text-white'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" /> Rules & About
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-1.5 ${
            activeTab === 'members'
              ? 'bg-[#087443] text-white'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Members ({community.memberCount})
        </button>
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <PostComposer
            communityId={community.id}
            placeholder={`Post an update or question in ${community.name}...`}
          />

          {communityPosts.length > 0 ? (
            communityPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 text-center border border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-500">
                No discussions posted in this hub yet. Be the first to spark an African dialogue!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Rules & About Tab */}
      {activeTab === 'about' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2 font-sora">
              About this Community
            </h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {community.description}
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-3 font-sora">
              Community Rules & Code of Conduct
            </h3>
            <div className="space-y-2">
              {community.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl text-xs"
                >
                  <span className="font-bold text-[#087443] flex-shrink-0">#{idx + 1}</span>
                  <span className="text-neutral-800 dark:text-neutral-200">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INITIAL_USERS.slice(0, 4).map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar src={member.avatarUrl} alt={member.fullName} size="md" />
                <div>
                  <Link
                    href={`/profile/${member.username}`}
                    className="font-bold text-sm text-neutral-900 dark:text-white hover:text-[#087443] transition"
                  >
                    {member.fullName}
                  </Link>
                  <p className="text-xs text-neutral-500">@{member.username} • {member.country}</p>
                </div>
              </div>
              <Badge variant={member.id === community.creatorId ? 'gold' : 'emerald'} size="sm">
                {member.id === community.creatorId ? 'Owner' : 'Member'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
