'use client';

import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Video,
  Globe,
  Users,
  Building2,
  X,
  Send,
  Loader2,
  UploadCloud,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PostVisibility } from '@/types';
import { useAuth } from '@/stores/authContext';
import { useSocial } from '@/stores/socialContext';
import { postService } from '@/services/postService';
import { mediaService } from '@/services/mediaService';
import { EmojiPickerPopover } from '@/components/ui/EmojiPickerPopover';

interface PostComposerProps {
  communityId?: string;
  placeholder?: string;
  onPostCreated?: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  communityId,
  placeholder,
  onPostCreated,
}) => {
  const { currentUser } = useAuth();
  const { createPost, communities } = useSocial();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>(
    communityId ? 'community' : 'public'
  );
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(communityId || '');
  const [mediaList, setMediaList] = useState<
    Array<{ type: 'image' | 'video'; url: string; caption?: string; assetId?: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sampleImages = [
    {
      title: 'Lagos Tech Hub',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Serengeti Sunrise',
      url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'African Fashion & Textiles',
      url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Accra Art Festival',
      url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1000&q=80',
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    try {
      setIsUploading(true);
      setUploadProgress(15);

      const isVideo = file.type.startsWith('video');
      const { uploadUrl, fileUrl, assetId } = await mediaService.getPreSignedUploadUrl({
        fileName: file.name,
        fileType: file.type,
        sizeBytes: file.size,
        purpose: 'post',
      });

      setUploadProgress(45);

      await mediaService.uploadBinaryToS3(uploadUrl, file, {
        onProgress: (p) => setUploadProgress(p),
      });

      setMediaList((prev) => [
        ...prev,
        { type: isVideo ? 'video' : 'image', url: fileUrl, assetId },
      ]);
      setUploadProgress(100);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Media upload failed. Please try a different file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddSampleImage = (url: string, title: string) => {
    setMediaList((prev) => [...prev, { type: 'image', url, caption: title }]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = content.trim();
    if (!trimmed && mediaList.length === 0) return;

    if (trimmed.length > 5000) {
      setErrorMessage('Post content cannot exceed 5000 characters.');
      return;
    }

    setIsSubmitting(true);
    const mediaAssetIds = mediaList.map((m) => m.assetId).filter(Boolean) as string[];

    try {
      await postService.createPost({
        content: trimmed,
        visibility,
        communityId: visibility === 'community' ? selectedCommunityId || communities[0]?.id : undefined,
        mediaAssetIds: mediaAssetIds.length > 0 ? mediaAssetIds : undefined,
        media: mediaList,
      });

      createPost({
        content: trimmed,
        visibility,
        communityId: visibility === 'community' ? selectedCommunityId || communities[0]?.id : undefined,
        media: mediaList,
      });

      setContent('');
      setMediaList([]);
      if (onPostCreated) onPostCreated();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to publish post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-0 rounded-3xl p-4 sm:p-5 shadow-sm border border-neutral-200/80 dark:border-white/[0.04] transition-all">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="space-y-3">
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Top: Avatar + Visibility Selector */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={currentUser?.avatarUrl}
              alt={currentUser?.fullName || 'User'}
              size="sm"
              countryFlag={
                currentUser?.countryCode === 'GH'
                  ? '🇬🇭'
                  : currentUser?.countryCode === 'NG'
                  ? '🇳🇬'
                  : '🌍'
              }
            />
            <div>
              <span className="font-bold text-xs text-neutral-900 dark:text-white/90">
                {currentUser?.fullName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                  className="bg-neutral-100 dark:bg-surface-2 text-[11px] font-semibold text-neutral-700 dark:text-white/90 rounded-full px-2.5 py-0.5 border border-transparent dark:border-white/[0.06] focus:ring-1 focus:ring-[#087443] cursor-pointer"
                >
                  <option value="public">🌍 Public (All Africa)</option>
                  <option value="friends">👥 Friends Only</option>
                  <option value="community">🏢 Community</option>
                </select>

                {visibility === 'community' && (
                  <select
                    value={selectedCommunityId}
                    onChange={(e) => setSelectedCommunityId(e.target.value)}
                    className="bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-semibold text-[#087443] rounded-full px-2.5 py-0.5 border border-emerald-200 dark:border-emerald-800 cursor-pointer max-w-[130px] truncate"
                  >
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* 5000 Characters Live Counter */}
          <span
            className={`text-[11px] font-medium hidden sm:inline-block ${
              content.length > 4800 ? 'text-amber-500 font-bold' : 'text-neutral-400 dark:text-white/35'
            }`}
          >
            {content.length} / 5000
          </span>
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={5000}
          placeholder={
            placeholder ||
            `What is happening in your corner of Africa, ${
              currentUser?.fullName?.split(' ')[0] || ''
            }? Share ideas, updates or discoveries...`
          }
          rows={3}
          className="w-full bg-transparent text-sm text-neutral-900 dark:text-white/90 placeholder-neutral-400 dark:placeholder-white/35 focus:outline-none resize-none leading-relaxed"
        />

        {/* S3 Media Upload Progress Bar */}
        {isUploading && (
          <div className="p-3 bg-neutral-50 dark:bg-surface-2 rounded-2xl space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-neutral-600 dark:text-white/60">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#087443]" strokeWidth={1.75} />
                Uploading attachment to S3...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-surface-3 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#087443] h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Media Attachments Preview Gallery */}
        {mediaList.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {mediaList.map((m, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden group border border-neutral-200 dark:border-white/[0.06] max-h-48 bg-neutral-100 dark:bg-surface-2"
              >
                {m.type === 'image' ? (
                  <img
                    src={m.url}
                    alt={m.caption || 'Upload'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video src={m.url} controls className="w-full h-full object-cover" />
                )}
                {m.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1.5 truncate">
                    {m.caption}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-white rounded-full transition"
                  aria-label="Remove media"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Toolbar: S3 Upload Trigger + Sample African Photos + Publish Button */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-white/[0.04]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 rounded-xl text-neutral-500 dark:text-white/60 hover:text-[#087443] hover:bg-emerald-50 dark:hover:bg-surface-3 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Upload Photo or Video to S3"
            >
              <UploadCloud className="w-4 h-4 text-[#087443]" strokeWidth={1.75} />
              <span className="hidden sm:inline">Attach Media</span>
            </button>

            <EmojiPickerPopover
              onSelectEmoji={(emoji) => setContent((prev) => prev + emoji)}
              placement="top"
            />

            {/* Quick Sample African Photos Trigger */}
            <div className="hidden md:flex items-center gap-1 pl-2">
              <span className="text-[10px] text-neutral-400 dark:text-white/35 font-bold uppercase">Quick Samples:</span>
              {sampleImages.slice(0, 2).map((sample) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => handleAddSampleImage(sample.url, sample.title)}
                  className="px-2 py-0.5 rounded-lg text-[10px] bg-neutral-100 dark:bg-surface-2 text-neutral-600 dark:text-white/60 border border-transparent dark:border-white/[0.06] hover:bg-neutral-200 dark:hover:bg-surface-3 transition"
                >
                  {sample.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={(!content.trim() && mediaList.length === 0) || isUploading}
            className="px-5 font-bold"
          >
            Publish <Send className="w-3.5 h-3.5 ml-1.5" strokeWidth={1.75} />
          </Button>
        </div>
      </form>
    </div>
  );
};
