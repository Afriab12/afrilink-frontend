'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AFRICAN_COUNTRIES, AFRICAN_INTERESTS } from '@/utils/countryData';
import { useAuth } from '@/stores/authContext';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, isOpen, onClose }) => {
  const { updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio);
  const [city, setCity] = useState(user.city || '');
  const [countryCode, setCountryCode] = useState(user.countryCode || 'GH');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [coverImageUrl, setCoverImageUrl] = useState(user.coverImageUrl);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests || []);
  const [isSaving, setIsSaving] = useState(false);

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const countryObj = AFRICAN_COUNTRIES.find((c) => c.code === countryCode);

    setTimeout(() => {
      updateProfile({
        fullName,
        bio,
        city,
        country: countryObj?.name || user.country,
        countryCode,
        avatarUrl,
        coverImageUrl,
        interests: selectedInterests,
      });
      setIsSaving(false);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      description="Update your personal information and African identity"
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Country
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-[#087443] focus:outline-none"
            >
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="City"
            placeholder="e.g. Accra, Lagos, Nairobi..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Bio
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#087443] resize-none"
          />
        </div>

        <Input
          label="Avatar Image URL"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
        />

        <Input
          label="Cover Banner URL"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://..."
        />

        {/* Interests */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Interests & Passions
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-neutral-200 dark:border-neutral-800 rounded-xl">
            {AFRICAN_INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.label);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.label)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition ${
                    isSelected
                      ? 'bg-[#087443] text-white border-[#087443]'
                      : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {interest.icon} {interest.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
