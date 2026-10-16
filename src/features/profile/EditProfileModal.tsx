'use client';

import React, { useState, useRef } from 'react';
import { User } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { AFRICAN_COUNTRIES, AFRICAN_INTERESTS } from '@/utils/countryData';
import { useAuth } from '@/stores/authContext';
import { mediaService } from '@/services/mediaService';
import { apiClient } from '@/services/apiClient';
import { Camera, Upload, AlertCircle, Loader2, Check } from 'lucide-react';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, isOpen, onClose }) => {
  const { updateProfile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio || '');
  const [city, setCity] = useState(user.city || '');
  const [countryCode, setCountryCode] = useState(user.countryCode || 'GH');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [coverImageUrl, setCoverImageUrl] = useState(user.coverImageUrl);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests || []);
  
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    try {
      setIsUploadingAvatar(true);
      setUploadProgress(15);

      const uploadedUrl = await mediaService.uploadAvatar(file, file.name, {
        onProgress: (p) => setUploadProgress(p),
      });

      setAvatarUrl(uploadedUrl);
      setUploadProgress(100);
    } catch (err: any) {
      setAvatarError(err?.message || 'Failed to upload avatar image.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const countryObj = AFRICAN_COUNTRIES.find((c) => c.code === countryCode);
    const updatedData = {
      fullName: fullName.trim(),
      bio: bio.trim(),
      city: city.trim(),
      country: countryObj?.name || user.country,
      countryCode,
      avatarUrl,
      coverImageUrl,
      interests: selectedInterests,
    };

    try {
      await apiClient.patch('/profiles/me', updatedData);
    } catch {
      // Local mock fallback
    }

    updateProfile(updatedData);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
      <form onSubmit={handleSave} className="space-y-5">
        {avatarError && (
          <div
            role="alert"
            className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{avatarError}</span>
          </div>
        )}

        {/* Avatar Upload Preview */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />

          <div
            onClick={() => !isUploadingAvatar && avatarInputRef.current?.click()}
            className="relative group cursor-pointer"
          >
            <Avatar src={avatarUrl} alt={fullName} size="xl" />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isUploadingAvatar ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </div>
          </div>

          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Profile Photo
            </h4>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? `Uploading ${uploadProgress}%` : 'Change Photo'}
              </Button>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">JPEG, PNG, WEBP or GIF (Max 5MB)</p>
          </div>
        </div>

        {/* Full Name Input */}
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        {/* Bio Textarea with 500-char counter */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <span className="uppercase tracking-wider">Bio</span>
            <span className={bio.length > 500 ? 'text-red-500 font-bold' : 'text-neutral-400'}>
              {bio.length}/500
            </span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Tell your African network about yourself..."
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/20 transition-all resize-none"
          />
        </div>

        {/* Location & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="City"
            value={city}
            placeholder="e.g. Lagos, Accra, Nairobi"
            onChange={(e) => setCity(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Country
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/20 transition-all"
            >
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interests Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Pan-African Interests ({selectedInterests.length} selected)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {AFRICAN_INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.label);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'border-[#087443] bg-[#087443] text-white'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  <span>{interest.icon}</span>
                  <span>{interest.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
