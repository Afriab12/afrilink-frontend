'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Globe,
  Users,
  Building2,
  Trash2,
  AlertTriangle,
  Ban,
  Check,
} from 'lucide-react';
import { Post, ReactionType } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ReactionPicker, REACTION_CONFIG } from './ReactionPicker';
import { CommentSection } from '@/features/comments/CommentSection';
import { ShareModal } from './ShareModal';
import { ReportModal } from '@/features/moderation/ReportModal';
import { BlockUserModal } from '@/features/moderation/BlockUserModal';
import { useSocial } from '@/stores/socialContext';
import { useAuth } from '@/stores/authContext';
import { formatDate } from '@/lib/utils';
import { getCountryByCode } from '@/utils/countryData';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { reactToPost, deletePost } = useSocial();
  const { currentUser } = useAuth();

  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);

  const isOwner = currentUser?.id === post.author.id;
  const authorCountry = post.countryCode ? getCountryByCode(post.countryCode) : undefined;

  // Calculate total reactions
  const totalReactions = Object.values(post.reactionsCount || {}).reduce((a, b) => a + b, 0);

  const handleSelectReaction = (reaction: ReactionType) => {
    reactToPost(post.id, reaction);
    setShowReactionPicker(false);
  };

  const handleQuickReactionClick = () => {
    if (post.myReaction) {
      reactToPost(post.id, post.myReaction); // Toggle off
    } else {
      reactToPost(post.id, 'like');
    }
  };

  return (
    <article className="bg-white dark:bg-surface-0 rounded-3xl p-5 sm:p-6 shadow-sm border border-neutral-200/80 dark:border-white/[0.04] transition-all hover:shadow-card hover:dark:bg-surface-2 hover:dark:border-white/[0.06]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar
              src={post.author.avatarUrl}
              alt={post.author.fullName}
              size="md"
              countryFlag={authorCountry?.flag || (post.author.countryCode === 'GH' ? '🇬🇭' : '🇳🇬')}
            />
          </Link>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-bold text-sm text-neutral-900 dark:text-white/90 hover:text-[#087443] transition font-sora"
              >
                {post.author.fullName}
              </Link>
              {post.author.isVerified && (
                <span className="text-[#D9A441] text-xs" title="Verified African Creator">
                  ✓
                </span>
              )}
              <span className="text-xs text-neutral-400 dark:text-white/35">@{post.author.username}</span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400 dark:text-white/35">
              <span>{formatDate(post.createdAt)}</span>
              <span>•</span>
              <span className="flex items-center gap-1" title={post.visibility}>
                {post.visibility === 'public' && <Globe className="w-3 h-3" strokeWidth={1.75} />}
                {post.visibility === 'friends' && <Users className="w-3 h-3" strokeWidth={1.75} />}
                {post.visibility === 'community' && <Building2 className="w-3 h-3" strokeWidth={1.75} />}
                <span className="capitalize">{post.visibility}</span>
              </span>
              {post.communityName && (
                <>
                  <span>•</span>
                  <Link
                    href={`/communities/${post.communityId}`}
                    className="text-[#087443] dark:text-[#0e9357] font-semibold hover:underline truncate max-w-[140px]"
                  >
                    {post.communityName}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* More Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white/90 hover:bg-neutral-100 dark:hover:bg-surface-3 transition"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" strokeWidth={1.75} />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-surface-4 rounded-2xl shadow-xl border border-neutral-200 dark:border-white/[0.08] py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
              {isOwner ? (
                <button
                  onClick={() => {
                    deletePost(post.id);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} /> Delete Post
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowReportModal(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-neutral-700 dark:text-white/90 hover:bg-neutral-100 dark:hover:bg-surface-3 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.75} /> Report Post
                  </button>
                  <button
                    onClick={() => {
                      setShowBlockModal(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                  >
                    <Ban className="w-3.5 h-3.5" strokeWidth={1.75} /> Block @{post.author.username}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      <div className="text-sm text-neutral-800 dark:text-white/90 leading-relaxed whitespace-pre-line mb-3 font-sans">
        {post.content}
      </div>

      {/* Media Gallery */}
      {post.media && post.media.length > 0 && (
        <div className="rounded-2xl overflow-hidden mb-3 border border-neutral-100 dark:border-white/[0.06] bg-black/5">
          {post.media.map((item) => (
            <div key={item.id} className="relative max-h-[450px] overflow-hidden flex items-center justify-center bg-black/90">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.caption || 'Post image'}
                  className="w-full max-h-[450px] object-cover hover:scale-[1.01] transition-transform duration-300"
                />
              ) : (
                <video
                  src={item.url}
                  controls
                  poster={item.thumbnailUrl}
                  className="w-full max-h-[450px] object-contain"
                />
              )}
              {item.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-xs">
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reactions Summary Bar */}
      {totalReactions > 0 && (
        <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-white/[0.04] text-xs text-neutral-500 dark:text-white/60">
          <div className="flex items-center gap-1.5">
            <span className="flex -space-x-1 overflow-hidden">
              {post.reactionsCount.like > 0 && <span className="inline-block text-xs">👍</span>}
              {post.reactionsCount.love > 0 && <span className="inline-block text-xs">❤️</span>}
              {post.reactionsCount.support > 0 && <span className="inline-block text-xs">🤝</span>}
              {post.reactionsCount.funny > 0 && <span className="inline-block text-xs">😂</span>}
            </span>
            <span className="font-semibold text-neutral-700 dark:text-white/90">
              {totalReactions}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>{post.commentsCount} comments</span>
            <span>•</span>
            <span>{post.sharesCount} shares</span>
          </div>
        </div>
      )}

      {/* Actions Toolbar */}
      <div className="flex items-center justify-between pt-2 text-xs font-semibold relative">
        {/* Reaction Button with Popover */}
        <div
          className="relative"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          {showReactionPicker && (
            <div className="absolute -top-12 left-0 z-30 pb-2">
              <ReactionPicker
                currentReaction={post.myReaction}
                onSelectReaction={handleSelectReaction}
              />
            </div>
          )}

          <button
            onClick={handleQuickReactionClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
              post.myReaction
                ? `${REACTION_CONFIG[post.myReaction].color} bg-emerald-50/50 dark:bg-emerald-950/30`
                : 'text-neutral-600 dark:text-white/60 hover:bg-neutral-100 dark:hover:bg-surface-3'
            }`}
          >
            <span>{post.myReaction ? REACTION_CONFIG[post.myReaction].emoji : '👍'}</span>
            <span className="capitalize">{post.myReaction || 'Like'}</span>
          </button>
        </div>

        {/* Comment Toggle Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-neutral-600 dark:text-white/60 hover:bg-neutral-100 dark:hover:bg-surface-3 transition"
        >
          <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-neutral-600 dark:text-white/60 hover:bg-neutral-100 dark:hover:bg-surface-3 transition"
        >
          <Share2 className="w-4 h-4" strokeWidth={1.75} />
          <span>Share</span>
        </button>

        {/* Save Bookmark */}
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`p-2 rounded-xl transition ${
            isSaved
              ? 'text-[#D9A441] bg-amber-50 dark:bg-amber-950/30'
              : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white/90 hover:bg-neutral-100 dark:hover:bg-surface-3'
          }`}
          title="Save post"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} strokeWidth={1.75} />
        </button>
      </div>

      {/* Nested Comments Section */}
      {showComments && <CommentSection postId={post.id} />}

      {/* Modals */}
      <ShareModal
        post={post}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="post"
        targetId={post.id}
        targetPreview={post.content}
      />

      <BlockUserModal
        user={post.author}
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
      />
    </article>
  );
};
