'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Users,
  Repeat,
  CheckCircle2,
  Check,
  Building2,
} from 'lucide-react';
import { Notification, NotificationType } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSocial } from '@/stores/socialContext';
import { formatDate } from '@/lib/utils';
import { REACTION_CONFIG } from '@/features/posts/ReactionPicker';

export const NotificationListView: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    acceptFriendRequest,
    declineFriendRequest,
  } = useSocial();

  const [filter, setFilter] = useState<'all' | 'requests' | 'mentions'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'requests') return n.type === 'friend_request';
    if (filter === 'mentions') return n.type === 'mention' || n.type === 'comment';
    return true;
  });

  const getNotifIcon = (notif: Notification) => {
    switch (notif.type) {
      case 'reaction':
        return notif.reactionType ? (
          <span className="text-sm">{REACTION_CONFIG[notif.reactionType].emoji}</span>
        ) : (
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
        );
      case 'comment':
      case 'comment_reply':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case 'friend_request':
      case 'friend_request_accepted':
        return <UserPlus className="w-3.5 h-3.5 text-[#087443]" />;
      case 'follow':
        return <Users className="w-3.5 h-3.5 text-[#D9A441]" />;
      case 'share':
        return <Repeat className="w-3.5 h-3.5 text-purple-500" />;
      case 'community_invitation':
      case 'community_announcement':
        return <Building2 className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-neutral-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm border border-neutral-200/80 dark:border-neutral-800">
      {/* Header */}
      <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white font-sora">
            Notifications
          </h2>
          <p className="text-xs text-neutral-500">Live activity and network updates across Africa</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={markAllNotificationsRead}
            className="text-xs font-semibold"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-3 bg-neutral-50/60 dark:bg-neutral-800/40 border-b border-neutral-100 dark:border-neutral-800">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
            filter === 'all'
              ? 'bg-[#087443] text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          All Activity
        </button>

        <button
          onClick={() => setFilter('requests')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
            filter === 'requests'
              ? 'bg-[#087443] text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Friend Requests
        </button>

        <button
          onClick={() => setFilter('mentions')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
            filter === 'mentions'
              ? 'bg-[#087443] text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Comments & Mentions
        </button>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                !notif.isRead
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
              }`}
            >
              {/* Actor Avatar with event badge */}
              <div className="relative">
                <Avatar
                  src={notif.actor.avatarUrl}
                  alt={notif.actor.fullName}
                  size="md"
                  countryFlag={notif.actor.countryCode === 'NG' ? '🇳🇬' : notif.actor.countryCode === 'ZW' ? '🇿🇼' : '🇬🇭'}
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-neutral-800 rounded-full shadow-sm border border-neutral-200 dark:border-neutral-700">
                  {getNotifIcon(notif)}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-normal">
                  <Link
                    href={`/profile/${notif.actor.username}`}
                    className="font-bold text-neutral-900 dark:text-white hover:text-[#087443]"
                  >
                    {notif.actor.fullName}
                  </Link>{' '}
                  {notif.type === 'reaction' && 'reacted to your post.'}
                  {notif.type === 'comment' && 'commented on your post.'}
                  {notif.type === 'comment_reply' && 'replied to your comment.'}
                  {notif.type === 'friend_request' && 'sent you a friend request.'}
                  {notif.type === 'friend_request_accepted' && 'accepted your friend request.'}
                  {notif.type === 'follow' && 'started following you.'}
                  {notif.type === 'community_invitation' && 'invited you to join a community.'}
                </p>

                {notif.targetSnippet && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1 italic bg-neutral-100/60 dark:bg-neutral-800/40 p-1.5 rounded-lg">
                    &ldquo;{notif.targetSnippet}&rdquo;
                  </p>
                )}

                <span className="text-[10px] text-neutral-400 mt-1.5 inline-block">
                  {formatDate(notif.createdAt)}
                </span>

                {/* Direct Action: Friend Request Accept/Decline */}
                {notif.type === 'friend_request' && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptFriendRequest(notif.actor.id);
                        markNotificationRead(notif.id);
                      }}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        declineFriendRequest(notif.actor.id);
                        markNotificationRead(notif.id);
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>

              {!notif.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#087443] flex-shrink-0 mt-2" />
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-neutral-400">
            <Bell className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
            <p className="text-sm font-semibold">No notifications in this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
