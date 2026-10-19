'use client';

import React, { useState, useRef } from 'react';
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
  Camera,
  Loader2,
} from 'lucide-react';
import { User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EditProfileModal } from './EditProfileModal';
import { ReportModal } from '@/features/moderation/ReportModal';
import { BlockUserModal } from '@/features/moderation/BlockUserModal';
import { useAuth } from '@/stores/authContext';
import { useSocial } from '@/stores/socialContext';
import { useChat } from '@/stores/chatContext';
import { getCountryByCode } from '@/utils/countryData';
import { mediaService } from '@/services/mediaService';
import { ProfileHeaderSkeleton, useMinimumLoading } from '@/components/ui/skeleton';

interface ProfileHeaderProps {
  user: User;
  isLoading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isLoading = false }) => {
  const router = useRouter();
  const { currentUser, updateProfile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const isMinimumLoading = useMinimumLoading(isLoading, 300);

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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const isMe = currentUser?.id === user.id;
  const friendship = getFriendshipStatus(user.id);
  const following = isFollowing(user.id);
  const countryObj = getCountryByCode(user.countryCode);

  const handleStartMessage = () => {
    startConversationWithUser(user);
    router.push('/messages');
  };

  const handleDirectAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const newAvatarUrl = await mediaService.uploadAvatar(file, file.name);
      updateProfile({ avatarUrl: newAvatarUrl });
    } catch (err: any) {
      alert(err?.message || 'Failed to update profile photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isMinimumLoading) {
    return <ProfileHeaderSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-[#0F1A13] rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/10 mb-6">
      {/* Cover Image Banner */}
      <div className="relative">
        <div className="relative w-full h-48 md:h-56 rounded-2xl overflow-hidden bg-slate-200 dark:bg-[#131F17]">
          <img
            src={user.coverImageUrl || 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80'}
            alt="Cover banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        {/* Avatar placement (pins avatar so half overlaps cover bottom edge, left-padded) */}
        <div className="absolute left-6 md:left-8 bottom-0 translate-y-1/2 z-10">
          <div className="relative">
            {isMe && (
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleDirectAvatarUpload}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
              />
            )}

            <div
              onClick={() => isMe && !isUploadingAvatar && avatarInputRef.current?.click()}
              className={`relative ${isMe ? 'group cursor-pointer' : ''}`}
            >
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-full ring-[4px] ring-white dark:ring-[#0B130E] bg-slate-100 dark:bg-[#131F17] overflow-hidden shadow-lg relative flex items-center justify-center">
                <UserAvatar
                  src={user.avatarUrl}
                  alt={user.fullName}
                  username={user.username}
                  userId={user.id}
                  size="2xl"
                  className="w-full h-full object-cover object-center"
                />
                {isMe && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploadingAvatar ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <Camera className="w-7 h-7 text-white" />
                    )}
                  </div>
                )}
              </div>

              {/* Country badge (e.g. GH) */}
              <span className="absolute bottom-1 right-1 h-6 min-w-[24px] px-1.5 rounded-full bg-white dark:bg-[#0F1A13] border border-slate-200 dark:border-white/15 text-[10px] font-bold text-slate-700 dark:text-white/80 flex items-center justify-center shadow-xs">
                {user.countryCode || 'GH'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Info with clearance for the half-overlapping avatar */}
      <div className="pt-16 md:pt-20 px-6 pb-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

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
                    className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
                    aria-label="More options"
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
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sora">
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
          <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">@{user.username}</p>

          <p className="text-sm text-slate-700 dark:text-white/80 mt-3 max-w-2xl leading-relaxed">
            {user.bio}
          </p>

          {/* Details Bar: Country, City, Joined */}
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 dark:text-white/50 flex-wrap">
            <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-white/80">
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
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-200 dark:border-white/10 text-sm">
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {user.friendsCount.toLocaleString()}
              </span>{' '}
              <span className="text-slate-500 dark:text-white/40 text-xs">Friends</span>
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {user.followersCount.toLocaleString()}
              </span>{' '}
              <span className="text-slate-500 dark:text-white/40 text-xs">Followers</span>
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {user.followingCount.toLocaleString()}
              </span>{' '}
              <span className="text-slate-500 dark:text-white/40 text-xs">Following</span>
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
