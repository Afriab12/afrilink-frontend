'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Sparkles,
  Users,
  Building2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Camera,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/stores/authContext';
import { useSocial } from '@/stores/socialContext';
import { AFRICAN_COUNTRIES, AFRICAN_INTERESTS } from '@/utils/countryData';
import { INITIAL_USERS } from '@/services/mockBackend';

export const OnboardingWizard: React.FC = () => {
  const router = useRouter();
  const { currentUser, completeOnboarding } = useAuth();
  const { communities, joinCommunity, toggleFollow, sendFriendRequest } = useSocial();

  const [step, setStep] = useState(1);
  const [selectedCountryCode, setSelectedCountryCode] = useState(currentUser?.countryCode || 'GH');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Technology & Startups']);
  const [followedUserIds, setFollowedUserIds] = useState<string[]>([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>([]);
  const [city, setCity] = useState(currentUser?.city || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  const selectedCountry = AFRICAN_COUNTRIES.find((c) => c.code === selectedCountryCode);

  const toggleInterest = (label: string) => {
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

  const handleToggleCommunity = (commId: string) => {
    joinCommunity(commId);
    setJoinedCommunityIds((prev) =>
      prev.includes(commId) ? prev.filter((id) => id !== commId) : [...prev, commId]
    );
  };

  const handleComplete = () => {
    completeOnboarding({
      country: selectedCountry?.name || 'Ghana',
      countryCode: selectedCountryCode,
      interests: selectedInterests,
      bio,
      city,
    });
    router.push('/');
  };

  const stepLabels = ['Country', 'Interests', 'People', 'Communities', 'Profile'];

  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-10 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800">
      {/* Step Header & Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-500 mb-2">
          <span>STEP {step} OF 5</span>
          <span className="text-[#087443] dark:text-[#0e9357] uppercase">{stepLabels[step - 1]}</span>
        </div>
        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden flex">
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

      {/* Step 1: Choose Country */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-sora">
              Where in Africa are you from? 🌍
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              AfriLink organizes discussions, creators, and communities by African country and diaspora.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
            {AFRICAN_COUNTRIES.map((c) => {
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
                    <p className="font-bold text-sm text-neutral-900 dark:text-white">{c.name}</p>
                    <p className="text-[11px] text-neutral-500">{c.region}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Select Interests */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-sora">
              What are your passions? ✨
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Select at least 3 topics to tailor your personalized Home Feed and recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
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
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{interest.icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                        {interest.label}
                      </p>
                      <p className="text-[11px] text-neutral-500">{interest.count} members active</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#087443]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Suggest People */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-sora">
              Connect with African Changemakers 🤝
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Follow fellow builders, creators and researchers across the continent to fill your feed.
            </p>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {INITIAL_USERS.filter((u) => u.id !== currentUser?.id).map((user) => {
              const isFollowingUser = followedUserIds.includes(user.id);
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
                        <span className="text-xs">{user.countryCode === 'NG' ? '🇳🇬' : user.countryCode === 'KE' ? '🇰🇪' : user.countryCode === 'ZA' ? '🇿🇦' : '🌍'}</span>
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

      {/* Step 4: Suggest Communities */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-sora">
              Join Vibrant Communities 🏢
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Engage in focused discussion hubs for technology, arts, music, and business.
            </p>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {communities.map((comm) => {
              const isMember = joinedCommunityIds.includes(comm.id) || comm.isJoined;
              return (
                <div
                  key={comm.id}
                  className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={comm.profileImage} alt={comm.name} size="md" />
                    <div>
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        {comm.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge size="sm" variant="emerald">
                          {comm.category}
                        </Badge>
                        <span className="text-[11px] text-neutral-500">
                          {comm.memberCount.toLocaleString()} members
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isMember ? 'outline' : 'secondary'}
                    onClick={() => handleToggleCommunity(comm.id)}
                  >
                    {isMember ? 'Joined' : 'Join'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 5: Profile Completion */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-sora">
              Complete Your AfriLink Profile 🎨
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Add a quick bio and your city so fellow Africans can discover your work.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative group cursor-pointer">
              <Avatar
                src={currentUser?.avatarUrl}
                alt={currentUser?.fullName || 'User'}
                size="2xl"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">Tap to change avatar</p>
          </div>

          <div className="space-y-4">
            <Input
              label="City"
              placeholder="e.g. Accra, Lagos, Nairobi, Johannesburg..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Short Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the continent about yourself, what you are building, or your interests..."
                rows={3}
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/20 transition-all resize-none"
              />
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
            onClick={() => setStep((s) => s - 1)}
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
            onClick={() => setStep((s) => s + 1)}
          >
            Next Step <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="px-6"
            onClick={handleComplete}
          >
            Finish & Enter AfriLink <Sparkles className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
