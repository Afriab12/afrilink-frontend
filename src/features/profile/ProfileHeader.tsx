'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Globe,
  UserPlus,
  UserCheck,
  UserMinus,
  MessageSquare,
  Edit3,
  Shield,
  MoreVertical,
  Ban,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EditProfileModal } from './EditProfileModal';
import { ReportModal } from '@/features/moderation/ReportModal';
import { BlockUserModal } from '@/features/moderation/BlockUserModal';
import { useAuth } from '@/stores/authContext';
import { useSocial } from '@/stores/socialContext';
import { useChat } from '@/stores/chatContext';
import { getCountryByCode } from '@/utils/countryData';

interface ProfileHeaderProps {
  user: User;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const {
    getFriendshipStatus,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    removeFriend,
    isFollowing,
    toggleFollow,
  } = useSocial();
  const { startConversationWithUser } = useChat();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isMe = currentUser?.id === user.id;
  const friendship = getFriendshipStatus(user.id);
  const following = isFollowing(user.id);
  const countryObj = getCountryByCode(user.countryCode);

  const handleStartMessage = () => {
    startConversationWithUser(user);
    router.push('/messages');
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm border border-neutral-200/80 dark:border-neutral-800 mb-6">
      {/* Cover Image Banner */}
      <div className="relative h-44 sm:h-64 w-full bg-neutral-200 dark:bg-neutral-800">
        <img
          src={user.coverImageUrl || 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80'}
          alt="Cover banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Main Profile Info */}
      <div className="px-5 sm:px-8 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
          {/* Avatar with country flag */}
          <div className="relative">
            <Avatar
              src={user.avatarUrl}
              alt={user.fullName}
              size="2xl"
              className="border-4 border-white dark:border-neutral-900 shadow-xl"
              countryFlag={countryObj?.flag || (user.countryCode === 'GH' ? '🇬🇭' : '🇳🇬')}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {isMe ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="font-bold border-neutral-300 dark:border-neutral-700"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Profile
              </Button>
            ) : (
              <>
                {/* 2-Way Friendship States */}
                {friendship === 'none' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => sendFriendRequest(user.id)}
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Friend
                  </Button>
                )}

                {friendship === 'pending_sent' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelFriendRequest(user.id)}
                    className="text-neutral-500"
                  >
                    Request Sent (Cancel)
                  </Button>
                )}

                {friendship === 'pending_received' && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => acceptFriendRequest(user.id)}
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" /> Accept Friend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => declineFriendRequest(user.id)}
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {friendship === 'friends' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFriend(user.id)}
                    className="text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1" /> Friends
                  </Button>
                )}

                {/* 1-Way Follow */}
                <Button
                  variant={following ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => toggleFollow(user.id)}
                >
                  {following ? 'Following' : 'Follow'}
                </Button>

                {/* Send Direct Message */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartMessage}
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1" /> Message
                </Button>

                {/* More Options */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showMoreMenu && (
                    <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1.5 z-20">
                      <button
                        onClick={() => {
                          setIsReportModalOpen(true);
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Report User
                      </button>
                      <button
                        onClick={() => {
                          setIsBlockModalOpen(true);
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                      >
                        <Ban className="w-3.5 h-3.5" /> Block User
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Name & Bio */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-sora">
              {user.fullName}
            </h1>
            {user.isVerified && (
              <span className="text-[#D9A441] font-bold text-sm" title="Verified African Creator">
                ✓
              </span>
            )}
            <Badge variant="emerald" size="sm">
              {user.role === 'creator' ? 'African Creator' : user.role === 'admin' ? 'AfriLink Admin' : 'Community Member'}
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">@{user.username}</p>

          <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-3 max-w-2xl leading-relaxed">
            {user.bio}
          </p>

          {/* Details Bar: Country, City, Joined */}
          <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500 flex-wrap">
            <div className="flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
              <span>{countryObj?.flag || '🌍'}</span>
              <span>{user.country}</span>
              {user.city && <span>• {user.city}</span>}
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {user.joinedDate}</span>
            </div>
          </div>

          {/* Social Stats: Followers, Following, Friends */}
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-sm">
            <div>
              <span className="font-extrabold text-neutral-900 dark:text-white">
                {user.friendsCount.toLocaleString()}
              </span>{' '}
              <span className="text-neutral-500 text-xs">Friends</span>
            </div>
            <div>
              <span className="font-extrabold text-neutral-900 dark:text-white">
                {user.followersCount.toLocaleString()}
              </span>{' '}
              <span className="text-neutral-500 text-xs">Followers</span>
            </div>
            <div>
              <span className="font-extrabold text-neutral-900 dark:text-white">
                {user.followingCount.toLocaleString()}
              </span>{' '}
              <span className="text-neutral-500 text-xs">Following</span>
            </div>
          </div>

          {/* Interests Pills */}
          {user.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {user.interests.map((interest) => (
                <Badge key={interest} variant="neutral" size="sm">
                  {interest}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isMe && (
        <EditProfileModal
          user={user}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Report & Block Modals */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType="user"
        targetId={user.id}
        targetPreview={user.fullName}
      />

      <BlockUserModal
        user={user}
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
      />
    </div>
  );
};
