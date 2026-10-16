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

  // Find user by username or fallback to current user if matches
  const targetUser =
    currentUser?.username.toLowerCase() === username.toLowerCase()
      ? currentUser
      : mockBackend.getUserById(username);

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
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
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
