'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Video,
  Globe,
  Users,
  Building2,
  X,
  Smile,
  Send,
  Sparkles,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PostVisibility } from '@/types';
import { useAuth } from '@/stores/authContext';
import { useSocial } from '@/stores/socialContext';

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

  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>(
    communityId ? 'community' : 'public'
  );
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(communityId || '');
  const [mediaList, setMediaList] = useState<Array<{ type: 'image' | 'video'; url: string; caption?: string }>>([]);
  const [isAddingMedia, setIsAddingMedia] = useState<'image' | 'video' | null>(null);
  const [mediaInputUrl, setMediaInputUrl] = useState('');
  const [mediaInputCaption, setMediaInputCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddSampleImage = (url: string, title: string) => {
    setMediaList((prev) => [...prev, { type: 'image', url, caption: title }]);
    setIsAddingMedia(null);
  };

  const handleConfirmMediaInput = () => {
    if (!mediaInputUrl.trim()) return;
    setMediaList((prev) => [
      ...prev,
      {
        type: isAddingMedia || 'image',
        url: mediaInputUrl.trim(),
        caption: mediaInputCaption.trim() || undefined,
      },
    ]);
    setMediaInputUrl('');
    setMediaInputCaption('');
    setIsAddingMedia(null);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaList.length === 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      createPost({
        content: content.trim(),
        visibility,
        communityId: visibility === 'community' ? selectedCommunityId || communities[0]?.id : undefined,
        media: mediaList,
      });

      setContent('');
      setMediaList([]);
      setIsSubmitting(false);
      if (onPostCreated) onPostCreated();
    }, 350);
  };

  const visibilityOptions = [
    { value: 'public', label: 'Public (All Africa)', icon: Globe },
    { value: 'friends', label: 'Friends Only', icon: Users },
    { value: 'community', label: 'Community', icon: Building2 },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-neutral-200/80 dark:border-neutral-800 transition-all">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Top: Avatar + Visibility Selector */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={currentUser?.avatarUrl}
              alt={currentUser?.fullName || 'User'}
              size="sm"
              countryFlag={currentUser?.countryCode === 'GH' ? '🇬🇭' : currentUser?.countryCode === 'NG' ? '🇳🇬' : '🌍'}
            />
            <div>
              <span className="font-bold text-xs text-neutral-900 dark:text-white">
                {currentUser?.fullName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                  className="bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 rounded-full px-2.5 py-0.5 border-0 focus:ring-1 focus:ring-[#087443] cursor-pointer"
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

          <span className="text-[11px] font-medium text-neutral-400 hidden sm:inline-block">
            {content.length} chars
          </span>
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            placeholder ||
            `What is happening in your corner of Africa, ${currentUser?.fullName?.split(' ')[0] || ''}? Share ideas, updates or discoveries...`
          }
          rows={3}
          className="w-full bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none resize-none leading-relaxed"
        />

        {/* Media Attachments Preview Gallery */}
        {mediaList.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {mediaList.map((m, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden group border border-neutral-200 dark:border-neutral-700 max-h-48 bg-neutral-100 dark:bg-neutral-800"
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
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Media Ingestion Popover */}
        {isAddingMedia && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Attach {isAddingMedia === 'image' ? 'Photo' : 'Video'}
              </span>
              <button
                type="button"
                onClick={() => setIsAddingMedia(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="url"
              placeholder={`Enter direct ${isAddingMedia} URL (e.g. https://...)...`}
              value={mediaInputUrl}
              onChange={(e) => setMediaInputUrl(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#087443]"
            />

            <input
              type="text"
              placeholder="Caption (optional)..."
              value={mediaInputCaption}
              onChange={(e) => setMediaInputCaption(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#087443]"
            />

            {isAddingMedia === 'image' && (
              <div className="pt-1">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Or pick from curated African photography:
                </p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {sampleImages.map((img) => (
                    <button
                      key={img.title}
                      type="button"
                      onClick={() => handleAddSampleImage(img.url, img.title)}
                      className="flex-shrink-0 text-left border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden hover:border-[#087443] transition w-24"
                    >
                      <img src={img.url} alt={img.title} className="w-full h-14 object-cover" />
                      <p className="p-1 text-[9px] font-semibold text-neutral-700 dark:text-neutral-300 truncate">
                        {img.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingMedia(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmMediaInput}
                disabled={!mediaInputUrl.trim()}
              >
                Add {isAddingMedia === 'image' ? 'Photo' : 'Video'}
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsAddingMedia(isAddingMedia === 'image' ? null : 'image')}
              className={`p-2 rounded-xl text-neutral-500 hover:text-[#087443] hover:bg-emerald-50 dark:hover:bg-neutral-800 transition flex items-center gap-1.5 text-xs font-semibold ${
                isAddingMedia === 'image' ? 'text-[#087443] bg-emerald-50 dark:bg-neutral-800' : ''
              }`}
            >
              <ImageIcon className="w-4 h-4 text-[#087443]" />
              <span className="hidden sm:inline">Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingMedia(isAddingMedia === 'video' ? null : 'video')}
              className={`p-2 rounded-xl text-neutral-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-neutral-800 transition flex items-center gap-1.5 text-xs font-semibold ${
                isAddingMedia === 'video' ? 'text-amber-600 bg-amber-50 dark:bg-neutral-800' : ''
              }`}
            >
              <Video className="w-4 h-4 text-[#D9A441]" />
              <span className="hidden sm:inline">Video</span>
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="px-5 py-2 font-bold"
            disabled={(!content.trim() && mediaList.length === 0) || isSubmitting}
            isLoading={isSubmitting}
          >
            Post to Africa <Send className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </form>
    </div>
  );
};
