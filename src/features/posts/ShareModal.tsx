'use client';

import React, { useState } from 'react';
import { Post } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Copy, Check, Repeat, Send, Users, ExternalLink } from 'lucide-react';
import { useSocial } from '@/stores/socialContext';
import { useAuth } from '@/stores/authContext';

interface ShareModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ post, isOpen, onClose }) => {
  const { createPost, communities } = useSocial();
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [commentary, setCommentary] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<'feed' | 'community' | 'dm' | 'link'>('feed');
  const [selectedCommunityId, setSelectedCommunityId] = useState(communities[0]?.id || '');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!post) return null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    setIsSharing(true);
    setTimeout(() => {
      if (selectedDestination === 'feed') {
        createPost({
          content: commentary ? `${commentary}\n\n[Shared from @${post.author.username}]` : `Shared from @${post.author.username}`,
          visibility: 'public',
        });
      } else if (selectedDestination === 'community') {
        createPost({
          content: commentary ? `${commentary}\n\n[Shared from @${post.author.username}]` : `Shared from @${post.author.username}`,
          visibility: 'community',
          communityId: selectedCommunityId,
        });
      }
      setIsSharing(false);
      setShareSuccess(true);
      setTimeout(() => {
        setShareSuccess(false);
        setCommentary('');
        onClose();
      }, 1200);
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Post"
      description="Amplify African voices across your network"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Share Destination Tabs */}
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setSelectedDestination('feed')}
            className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition ${
              selectedDestination === 'feed'
                ? 'border-[#087443] bg-emerald-50 dark:bg-emerald-950/40 text-[#087443]'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span className="text-[11px] font-semibold">My Feed</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedDestination('community')}
            className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition ${
              selectedDestination === 'community'
                ? 'border-[#087443] bg-emerald-50 dark:bg-emerald-950/40 text-[#087443]'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[11px] font-semibold">Community</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedDestination('dm')}
            className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition ${
              selectedDestination === 'dm'
                ? 'border-[#087443] bg-emerald-50 dark:bg-emerald-950/40 text-[#087443]'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="text-[11px] font-semibold">Direct Msg</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 text-center flex flex-col items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="text-[11px] font-semibold">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {selectedDestination === 'community' && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              Select Community
            </label>
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-sm text-neutral-900 dark:text-white"
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Thought / Commentary Input */}
        <div>
          <textarea
            placeholder="Add your thoughts or commentary..."
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#087443]/30 resize-none"
          />
        </div>

        {/* Original Post Preview with attribution */}
        <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
          <div className="flex items-center gap-2 mb-2">
            <Avatar src={post.author.avatarUrl} alt={post.author.fullName} size="xs" />
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs text-neutral-900 dark:text-white">
                {post.author.fullName}
              </span>
              <span className="text-[11px] text-neutral-500">@{post.author.username}</span>
            </div>
          </div>
          <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-3">
            {post.content}
          </p>
        </div>

        {shareSuccess ? (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-[#087443] rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Shared successfully with attribution!
          </div>
        ) : (
          <Button
            onClick={handleShare}
            variant="primary"
            className="w-full py-2.5"
            isLoading={isSharing}
          >
            Share Now
          </Button>
        )}
      </div>
    </Modal>
  );
};
