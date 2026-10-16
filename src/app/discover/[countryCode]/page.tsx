'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Building2, Globe, FileText, Sparkles } from 'lucide-react';
import { getCountryByCode } from '@/utils/countryData';
import { PostCard } from '@/features/posts/PostCard';
import { CommunityCard } from '@/features/communities/CommunityCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSocial } from '@/stores/socialContext';
import { INITIAL_USERS } from '@/services/mockBackend';

interface CountryPageProps {
  params: Promise<{ countryCode: string }>;
}

export default function CountryDetailPage({ params }: CountryPageProps) {
  const resolvedParams = use(params);
  const countryCode = resolvedParams.countryCode.toUpperCase();
  const country = getCountryByCode(countryCode);

  const { posts, communities, toggleFollow, isFollowing } = useSocial();
  const [activeTab, setActiveTab] = useState<'posts' | 'communities' | 'people'>('posts');

  if (!country) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 text-center border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white font-sora">
          Country Not Found
        </h2>
        <p className="text-xs text-neutral-500 mt-2">
          The requested country code &ldquo;{countryCode}&rdquo; is not currently in the AfriLink registry.
        </p>
        <div className="mt-4">
          <Link href="/discover">
            <Button size="sm" variant="primary">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Discover
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const countryPosts = posts.filter(
    (p) => p.countryCode?.toUpperCase() === countryCode || p.author.countryCode?.toUpperCase() === countryCode
  );

  const countryCommunities = communities.filter(
    (c) => c.countryCode?.toUpperCase() === countryCode || c.country === country.name
  );

  const countryUsers = INITIAL_USERS.filter((u) => u.countryCode?.toUpperCase() === countryCode);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/discover"
        className="inline-flex items-center text-xs font-bold text-neutral-500 hover:text-[#087443] transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to All African Countries
      </Link>

      {/* Country Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="text-5xl select-none">{country.flag}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-sora">
                  {country.name}
                </h1>
                <Badge variant="emerald" size="sm">
                  {country.region}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Capital: {country.capital} • Population: {country.population}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-4 leading-relaxed max-w-2xl">
          {country.description}
        </p>

        {country.popularInterests && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            {country.popularInterests.map((interest) => (
              <Badge key={interest} variant="neutral" size="sm">
                {interest}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-1.5 ${
            activeTab === 'posts'
              ? 'bg-[#087443] text-white'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Public Posts ({countryPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('communities')}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-1.5 ${
            activeTab === 'communities'
              ? 'bg-[#087443] text-white'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Communities ({countryCommunities.length})
        </button>

        <button
          onClick={() => setActiveTab('people')}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-1.5 ${
            activeTab === 'people'
              ? 'bg-[#087443] text-white'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> People & Creators ({countryUsers.length})
        </button>
      </div>

      {/* Posts from this country */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {countryPosts.length > 0 ? (
            countryPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 text-center border border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-500">
                No public posts currently geotagged in {country.name}. Be the first to share an update from {country.name}!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Communities in this country */}
      {activeTab === 'communities' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {countryCommunities.length > 0 ? (
            countryCommunities.map((comm) => (
              <CommunityCard key={comm.id} community={comm} />
            ))
          ) : (
            <div className="col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-8 text-center border border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-500">
                No dedicated communities formed in {country.name} yet. Anyone can launch an open community!
              </p>
            </div>
          )}
        </div>
      )}

      {/* People from this country */}
      {activeTab === 'people' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {countryUsers.length > 0 ? (
            countryUsers.map((user) => {
              const following = isFollowing(user.id);
              return (
                <div
                  key={user.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatarUrl} alt={user.fullName} size="md" />
                    <div>
                      <Link
                        href={`/profile/${user.username}`}
                        className="font-bold text-sm text-neutral-900 dark:text-white hover:text-[#087443] transition"
                      >
                        {user.fullName}
                      </Link>
                      <p className="text-xs text-neutral-500">
                        @{user.username} {user.city ? `• ${user.city}` : ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={following ? 'outline' : 'secondary'}
                    onClick={() => toggleFollow(user.id)}
                  >
                    {following ? 'Following' : 'Follow'}
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-8 text-center border border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-500">
                Be the pioneer to invite creators from {country.name} to AfriLink!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
