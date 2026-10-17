'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProfileHeader } from '@/features/profile/ProfileHeader';
import { ProfileTabsView } from '@/features/profile/ProfileTabsView';
import { Button } from '@/components/ui/Button';
import { mockBackend } from '@/services/mockBackend';
import { useSocial } from '@/stores/socialContext';
import { useAuth } from '@/stores/authContext';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams.username);
  const { posts, communities } = useSocial();
  const { currentUser } = useAuth();

  // Find user by username or fallback to current user if matches or if 'me'
  const isMe = username.toLowerCase() === 'me';
  const targetUser =
    currentUser && (currentUser.username.toLowerCase() === username.toLowerCase() || isMe)
      ? currentUser
      : isMe
        ? null
        : mockBackend.getUserById(username);

  if (isMe && !currentUser) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 text-center border border-neutral-200 dark:border-neutral-800 space-y-3">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white font-sora">
          Sign In Required
        </h2>
        <p className="text-xs text-neutral-500">
          Please sign in to view your personal profile.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button size="sm" variant="primary">
              Sign In to AfriLink
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 text-center border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white font-sora">
          User Not Found
        </h2>
        <p className="text-xs text-neutral-500 mt-2">
          The user @{username} does not exist on AfriLink.
        </p>
        <div className="mt-4">
          <Link href="/">
            <Button size="sm" variant="primary">
              <ArrowLeft className="h-4 w-4 mr-1" strokeWidth={1.75} /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const userPosts = posts.filter(
    (p) =>
      p.author.id === targetUser.id ||
      p.author.username.toLowerCase() === targetUser.username.toLowerCase()
  );

  const userCommunities = communities.filter(
    (c) => c.creatorId === targetUser.id || c.isJoined
  );

  return (
    <div className="space-y-6">
      <ProfileHeader user={targetUser} />
      <ProfileTabsView
        user={targetUser}
        userPosts={userPosts}
        userCommunities={userCommunities}
      />
    </div>
  );
}
