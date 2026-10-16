'use client';

import React, { useState } from 'react';
import { Comment } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Heart, Reply, Send, CornerDownRight, MessageSquare, AlertCircle } from 'lucide-react';
import { useSocial } from '@/stores/socialContext';
import { useAuth } from '@/stores/authContext';
import { postService } from '@/services/postService';
import { formatDate } from '@/lib/utils';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { getCommentsForPost, addComment, likeComment } = useSocial();
  const { currentUser } = useAuth();

  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const comments = getCommentsForPost(postId);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCommentText.trim();
    if (!trimmed) return;

    setCommentError(null);
    setIsSubmitting(true);

    try {
      await postService.createComment(postId, trimmed);
      addComment(postId, trimmed);
      setNewCommentText('');
    } catch (err: any) {
      setCommentError(err?.message || 'Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (parentComment: Comment) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    // Strict 1-Level Depth Guard: Replies cannot have replies
    if (parentComment.parentId) {
      setCommentError('Replies are limited to 1 level only. You cannot reply to a reply.');
      return;
    }

    setCommentError(null);
    setIsSubmitting(true);

    try {
      await postService.createReply(parentComment.id, trimmed, parentComment);
      addComment(postId, trimmed, parentComment.id);
      setReplyText('');
      setReplyingToCommentId(null);
    } catch (err: any) {
      setCommentError(err?.message || 'Failed to post reply.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
      {commentError && (
        <div
          role="alert"
          className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{commentError}</span>
        </div>
      )}

      {/* New Top-Level Comment Input Box */}
      <form onSubmit={handlePostComment} className="flex gap-2.5 items-start">
        <Avatar
          src={currentUser?.avatarUrl}
          alt={currentUser?.fullName || 'User'}
          size="sm"
        />
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Write an African perspective or response..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#087443]/30 pr-10"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim() || isSubmitting}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#087443] hover:text-[#065833] disabled:opacity-30 disabled:cursor-not-allowed transition"
            aria-label="Send comment"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              {/* Top-Level Comment */}
              <div className="flex gap-2.5 items-start">
                <Avatar
                  src={comment.author.avatarUrl}
                  alt={comment.author.fullName}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3 border border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">
                        {comment.author.fullName}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                      {comment.content}
                    </p>
                  </div>

                  {/* Comment Action Bar */}
                  <div className="flex items-center gap-3 px-2 pt-1 text-[11px] text-neutral-500">
                    <button
                      onClick={() => likeComment(comment.id)}
                      className={`flex items-center gap-1 hover:text-rose-500 transition ${
                        comment.isLikedByMe ? 'text-rose-500 font-bold' : ''
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          comment.isLikedByMe ? 'fill-current' : ''
                        }`}
                      />
                      <span>{comment.likesCount > 0 ? comment.likesCount : 'Like'}</span>
                    </button>

                    {/* Top-level comments can be replied to */}
                    <button
                      onClick={() => {
                        setReplyingToCommentId(
                          replyingToCommentId === comment.id ? null : comment.id
                        );
                        setReplyText(`@${comment.author.username} `);
                      }}
                      className="flex items-center gap-1 hover:text-[#087443] transition"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>

                  {/* 1-Tier Reply Input Box */}
                  {replyingToCommentId === comment.id && (
                    <div className="flex gap-2 items-center mt-2 pl-4">
                      <CornerDownRight className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your 1-level reply..."
                        className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#087443]"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handlePostReply(comment)}
                        isLoading={isSubmitting}
                      >
                        Reply
                      </Button>
                    </div>
                  )}

                  {/* 1-Tier Replies List (Strictly NO further nesting or reply buttons) */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2.5 space-y-2 pl-4 sm:pl-6 border-l-2 border-neutral-100 dark:border-neutral-800">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2 items-start">
                          <Avatar
                            src={reply.author.avatarUrl}
                            alt={reply.author.fullName}
                            size="xs"
                          />
                          <div className="flex-1 bg-neutral-100/60 dark:bg-neutral-800/40 rounded-xl p-2.5">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-[11px] text-neutral-900 dark:text-white">
                                {reply.author.fullName}
                              </span>
                              <span className="text-[9px] text-neutral-400">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-700 dark:text-neutral-300">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-neutral-400 space-y-1">
            <MessageSquare className="w-6 h-6 mx-auto text-neutral-300 dark:text-neutral-700" />
            <p className="text-xs font-semibold">No comments yet. Share your African perspective!</p>
          </div>
        )}
      </div>
    </div>
  );
};
