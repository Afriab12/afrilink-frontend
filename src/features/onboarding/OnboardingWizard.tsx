'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Sparkles,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Camera,
  Check,
  Upload,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/stores/authContext';
import { useSocial } from '@/stores/socialContext';
import {
  AFRICAN_COUNTRIES,
  AFRICAN_INTERESTS,
  AFRICAN_REGIONS,
  getCountryByCode,
} from '@/utils/countryData';
import { AfricanRegion, Country } from '@/types';
import { INITIAL_USERS } from '@/services/mockBackend';
import { mediaService } from '@/services/mediaService';
import { taxonomyService } from '@/services/taxonomyService';
import { apiClient } from '@/services/apiClient';

export const OnboardingWizard: React.FC = () => {
  const router = useRouter();
  const { currentUser, completeOnboarding } = useAuth();
  const { toggleFollow } = useSocial();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState<AfricanRegion | 'All'>('All');
  const [searchCountry, setSearchCountry] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState(currentUser?.countryCode || 'GH');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Technology & Startups',
    'Afrobeats & Amapiano Music',
    'Pan-African Business & Trade',
  ]);
  const [followedUserIds, setFollowedUserIds] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string>(currentUser?.avatarUrl || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser?.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [city, setCity] = useState(currentUser?.city || '');
  const [bio, setBio] = useState(
    currentUser?.bio || 'Proud African builder connecting across borders.'
  );
  const [stepError, setStepError] = useState<string | null>(null);

  const selectedCountry = AFRICAN_COUNTRIES.find((c) => c.code === selectedCountryCode) || AFRICAN_COUNTRIES[0];

  // Filter countries by region and search query
  const filteredCountries = AFRICAN_COUNTRIES.filter((c) => {
    const matchesRegion = selectedRegion === 'All' || c.region === selectedRegion;
    const matchesSearch =
      c.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
      c.code.toLowerCase().includes(searchCountry.toLowerCase()) ||
      c.capital.toLowerCase().includes(searchCountry.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const toggleInterest = (label: string) => {
    setStepError(null);
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleFollowUser = (userId: string) => {
    toggleFollow(userId);
    setFollowedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Avatar Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);

    // Immediate preview
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);

    try {
      setIsUploadingAvatar(true);
      setUploadProgress(10);

      const uploadedUrl = await mediaService.uploadAvatar(file, file.name, {
        onProgress: (p) => setUploadProgress(p),
      });

      setAvatarUrl(uploadedUrl);
      setUploadProgress(100);
    } catch (err: any) {
      setAvatarError(err?.message || 'Failed to upload profile photo. Please try a different image.');
      setAvatarPreview(currentUser?.avatarUrl || '');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleNextStep = async () => {
    setStepError(null);

    if (step === 2) {
      if (selectedInterests.length < 3) {
        setStepError('Please select at least 3 interests to customize your personal feed.');
        return;
      }
      // Sync interests to backend
      try {
        await taxonomyService.updateUserInterests(selectedInterests);
      } catch {
        // Fallback continues
      }
    }

    setStep((s) => Math.min(s + 1, 5));
  };

  const handleComplete = async () => {
    const resolvedCountry = selectedCountry?.name || 'Ghana';
    const resolvedCode = selectedCountryCode || 'GH';

    // Persist to backend API if online
    try {
      await apiClient.patch('/profiles/me', {
        country: resolvedCountry,
        countryCode: resolvedCode,
        interests: selectedInterests,
        bio: bio.trim(),
        city: city.trim(),
        avatarUrl: avatarUrl || avatarPreview,
      });
    } catch {
      // Local fallback
    }

    completeOnboarding({
      country: resolvedCountry,
      countryCode: resolvedCode,
      interests: selectedInterests,
      bio: bio.trim(),
      city: city.trim(),
      avatarUrl: avatarUrl || avatarPreview,
    });

    router.push('/');
  };

  const stepLabels = ['Country', 'Interests', 'People', 'Photo', 'Review'];

  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-10 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800">
      {/* Progress Bar & Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-500 mb-2">
          <span>STEP {step} OF 5</span>
          <span className="text-[#087443] dark:text-[#0e9357] uppercase tracking-wider font-sora">
            {stepLabels[step - 1]}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={5}
          className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden flex"
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-full flex-1 transition-all duration-300 ${
                s <= step ? 'bg-[#087443]' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {stepError && (
        <div
          role="alert"
          className="mb-6 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{stepError}</span>
        </div>
      )}

      {/* STEP 1: Regional Country Selector */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
              Where in Africa is your heritage or home? 🌍
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Connect to local communities, regional trending topics, and diaspora circles.
            </p>
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
            {(['All', ...AFRICAN_REGIONS] as const).map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  selectedRegion === region
                    ? 'bg-[#087443] text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Country Search Bar */}
          <Input
            placeholder="Search country by name, capital, or code..."
            value={searchCountry}
            onChange={(e) => setSearchCountry(e.target.value)}
          />

          {/* Country Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
            {filteredCountries.map((c) => {
              const isSelected = selectedCountryCode === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCountryCode(c.code)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#087443] bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-[#087443]/30'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl">{c.flag}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#087443]" />}
                  </div>
                  <div className="mt-2">
                    <p className="font-bold text-sm text-neutral-900 dark:text-white truncate">{c.name}</p>
                    <p className="text-[11px] text-neutral-500">{c.region}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Pan-African Interest Selection */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
              What inspires you across Africa? ✨
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Select at least 3 interests to tailor your personalized Home Feed and recommendations.
            </p>
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  selectedInterests.length >= 3
                    ? 'bg-emerald-100 text-[#087443] dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                }`}
              >
                {selectedInterests.length >= 3
                  ? `✓ ${selectedInterests.length} Selected (Ready to proceed)`
                  : `Select at least 3 (${selectedInterests.length}/3 selected)`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {AFRICAN_INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.label);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.label)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-[#087443] bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-[#087443]/30'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{interest.icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                        {interest.label}
                      </p>
                      <p className="text-[11px] text-neutral-500">{interest.count} active members</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#087443]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Suggested Connections & People */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
              Connect with African Changemakers 🤝
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Follow fellow builders, researchers, and creators across the continent.
            </p>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {INITIAL_USERS.filter((u) => u.id !== currentUser?.id).map((user) => {
              const isFollowingUser = followedUserIds.includes(user.id);
              const userCountry = getCountryByCode(user.countryCode);
              return (
                <div
                  key={user.id}
                  className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatarUrl} alt={user.fullName} size="md" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white">
                          {user.fullName}
                        </span>
                        <span className="text-xs">{userCountry?.flag || '🌍'}</span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate max-w-xs">{user.bio}</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isFollowingUser ? 'outline' : 'primary'}
                    onClick={() => handleFollowUser(user.id)}
                  >
                    {isFollowingUser ? 'Following' : 'Follow'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: S3 Avatar Direct Upload */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
              Add Your Profile Photo 📸
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Profiles with photos receive 4x more connections and community invites.
            </p>
          </div>

          {avatarError && (
            <div
              role="alert"
              className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{avatarError}</span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center py-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />

            <div
              onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <Avatar
                src={avatarPreview || currentUser?.avatarUrl}
                alt={currentUser?.fullName || 'User'}
                size="2xl"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingAvatar ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <>
                    <Camera className="w-7 h-7 text-white mb-1" />
                    <span className="text-[11px] text-white font-bold">Upload</span>
                  </>
                )}
              </div>
            </div>

            {isUploadingAvatar ? (
              <div className="w-full max-w-xs mt-4 space-y-1.5 text-center">
                <div className="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  <span>Uploading to S3...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#087443] h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose Image File
                </Button>
                <p className="text-[11px] text-neutral-500 mt-2">
                  JPG, PNG, WEBP or GIF. Max 5MB.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 5: Final Profile Review & Finish */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
              You’re All Set for AfriLink! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Review your customized Pan-African identity card before entering the platform.
            </p>
          </div>

          {/* Identity Card Summary */}
          <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar src={avatarPreview || currentUser?.avatarUrl} alt={currentUser?.fullName || 'User'} size="xl" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-neutral-900 dark:text-white font-sora">
                    {currentUser?.fullName}
                  </h3>
                  <span className="text-lg">{selectedCountry.flag}</span>
                </div>
                <p className="text-xs text-neutral-500">@{currentUser?.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="emerald" size="sm">
                    {selectedCountry.name} ({selectedCountry.region})
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-neutral-200/80 dark:border-neutral-700">
              <Input
                label="City / Region"
                placeholder="e.g. Accra, Lagos, Nairobi, Johannesburg..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <span className="uppercase tracking-wider">Bio</span>
                  <span className={`${bio.length > 500 ? 'text-red-500 font-bold' : 'text-neutral-400'}`}>
                    {bio.length}/500
                  </span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a few words about what you do, what you are building, or what connects you to Africa..."
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/20 transition-all resize-none"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                  Selected Interests ({selectedInterests.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInterests.map((interest) => (
                    <Badge key={interest} variant="gold" size="sm">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStepError(null);
              setStep((s) => s - 1);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <Button
            type="button"
            variant="primary"
            onClick={handleNextStep}
          >
            {step === 4 ? 'Continue' : 'Next Step'} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="px-6 font-bold"
            onClick={handleComplete}
          >
            Finish & Enter AfriLink <Sparkles className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
