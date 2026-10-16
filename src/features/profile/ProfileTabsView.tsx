'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Post, Community } from '@/types';
import { Tabs } from '@/components/ui/Tabs';
import { PostCard } from '@/features/posts/PostCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSocial } from '@/stores/socialContext';
import { INITIAL_USERS } from '@/services/mockBackend';
import { getCountryByCode } from '@/utils/countryData';

interface ProfileTabsViewProps {
  user: User;
  userPosts: Post[];
  userCommunities: Community[];
}

export const ProfileTabsView: React.FC<ProfileTabsViewProps> = ({
  user,
  userPosts,
  userCommunities,
}) => {
  const [activeTab, setActiveTab] = useState('posts');
  const { getFriendshipStatus, isFollowing, toggleFollow } = useSocial();

  const otherUsers = INITIAL_USERS.filter((u) => u.id !== user.id);

  const tabs = [
    { id: 'posts', label: 'Posts', count: userPosts.length },
    { id: 'about', label: 'About' },
    { id: 'friends', label: 'Friends', count: user.friendsCount },
    { id: 'followers', label: 'Followers', count: user.followersCount },
    { id: 'following', label: 'Following', count: user.followingCount },
    { id: 'communities', label: 'Communities', count: userCommunities.length },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 px-2">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length > 0 ? (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 text-center border border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-500">No posts published yet by {user.fullName}.</p>
            </div>
          )}
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2 font-sora">
              Biography & Background
            </h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {user.bio}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
            <div>
              <p className="font-semibold text-neutral-500">Country of Origin</p>
              <p className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                {user.country}
              </p>
            </div>
            <div>
              <p className="font-semibold text-neutral-500">City / Location</p>
              <p className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                {user.city || 'Pan-African Resident'}
              </p>
            </div>
            <div>
              <p className="font-semibold text-neutral-500">Platform Joined</p>
              <p className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                {user.joinedDate}
              </p>
            </div>
            <div>
              <p className="font-semibold text-neutral-500">Account Type</p>
              <p className="text-sm font-bold text-[#087443] mt-0.5 capitalize">
                {user.role} Member
              </p>
            </div>
          </div>

          {user.interests && user.interests.length > 0 && (
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Pan-African Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((i) => (
                  <Badge key={i} variant="emerald" size="sm">
                    {i}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {otherUsers.slice(0, 4).map((friend) => (
            <div
              key={friend.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar src={friend.avatarUrl} alt={friend.fullName} size="md" />
                <div>
                  <Link
                    href={`/profile/${friend.username}`}
                    className="font-bold text-sm text-neutral-900 dark:text-white hover:text-[#087443] transition"
                  >
                    {friend.fullName}
                  </Link>
                  <p className="text-xs text-neutral-500">@{friend.username}</p>
                </div>
              </div>
              <Badge variant="emerald" size="sm">
                Friends
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Followers Tab */}
      {activeTab === 'followers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {otherUsers.map((follower) => {
            const isFollowingUser = isFollowing(follower.id);
            return (
              <div
                key={follower.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={follower.avatarUrl} alt={follower.fullName} size="md" />
                  <div>
                    <Link
                      href={`/profile/${follower.username}`}
                      className="font-bold text-sm text-neutral-900 dark:text-white hover:text-[#087443] transition"
                    >
                      {follower.fullName}
                    </Link>
                    <p className="text-xs text-neutral-500">@{follower.username}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isFollowingUser ? 'outline' : 'primary'}
                  onClick={() => toggleFollow(follower.id)}
                >
                  {isFollowingUser ? 'Following' : 'Follow'}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Following Tab */}
      {activeTab === 'following' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {otherUsers.slice(0, 3).map((f) => (
            <div
              key={f.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar src={f.avatarUrl} alt={f.fullName} size="md" />
                <div>
                  <Link
                    href={`/profile/${f.username}`}
                    className="font-bold text-sm text-neutral-900 dark:text-white hover:text-[#087443] transition"
                  >
                    {f.fullName}
                  </Link>
                  <p className="text-xs text-neutral-500">@{f.username}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => toggleFollow(f.id)}>
                Following
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Communities Tab */}
      {activeTab === 'communities' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userCommunities.map((comm) => (
            <div
              key={comm.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3"
            >
              <Avatar src={comm.profileImage} alt={comm.name} size="lg" />
              <div className="flex-1">
                <Link
                  href={`/communities/${comm.id}`}
                  className="font-bold text-sm text-neutral-900 dark:text-white hover:text-[#087443] transition"
                >
                  {comm.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="gold" size="sm">
                    {comm.category}
                  </Badge>
                  <span className="text-[11px] text-neutral-500">
                    {comm.memberCount.toLocaleString()} members
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
