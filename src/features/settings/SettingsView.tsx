'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  User,
  Shield,
  Bell,
  Globe,
  Palette,
  Lock,
  AlertCircle,
  Loader2,
  Check,
  Trash2,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useAuth } from '@/stores/authContext';
import { moderationService } from '@/services/moderationService';
import { languageService } from '@/services/languageService';
import { User as UserType } from '@/types';
import { SettingsFormSkeleton, useMinimumLoading } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/Modal';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import {
  validateAccountForm,
  validatePasswordForm,
  SETTINGS_TABS,
  SettingsTabId,
  AccountFormErrors,
  PasswordFormErrors,
} from '@/lib/settings-validation';

interface SettingsViewProps {
  isLoading?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isLoading = false }) => {
  const { currentUser, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTabId>('account');
  const isMinimumLoading = useMinimumLoading(isLoading, 300);

  // Account State & Errors
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [accountErrors, setAccountErrors] = useState<AccountFormErrors>({});
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountSuccessFlash, setAccountSuccessFlash] = useState(false);

  // Language & Voice State
  const initialLangPrefs = languageService.getUserLanguagePreferences();
  const [nativeLanguage, setNativeLanguage] = useState(initialLangPrefs.nativeLanguage || 'yo');
  const [preferredLanguage, setPreferredLanguage] = useState(initialLangPrefs.preferredLanguage || 'en');
  const [autoTranslate, setAutoTranslate] = useState(initialLangPrefs.autoTranslateIncoming || false);
  const [voiceSpeechRate, setVoiceSpeechRate] = useState(initialLangPrefs.voiceSpeechRate || 1.0);
  const [isSavingLang, setIsSavingLang] = useState(false);
  const [langSuccessFlash, setLangSuccessFlash] = useState(false);

  // Privacy State
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [allowFriendRequests, setAllowFriendRequests] = useState<'everyone' | 'friends_of_friends' | 'none'>('everyone');
  const [allowMessages, setAllowMessages] = useState<'everyone' | 'friends' | 'none'>('everyone');
  const [showFriendList, setShowFriendList] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<UserType[]>([]);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [privacySuccessFlash, setPrivacySuccessFlash] = useState(false);

  // Notification State
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [communityNotifs, setCommunityNotifs] = useState(true);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);
  const [notifsSuccessFlash, setNotifsSuccessFlash] = useState(false);

  // Security State & Errors
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccessFlash, setPasswordSuccessFlash] = useState(false);

  // Danger Zone / Account Deletion Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    moderationService.getUserSettings().then((settings) => {
      setProfileVisibility(settings.privacy.profileVisibility);
      setAllowFriendRequests(settings.privacy.allowFriendRequests);
      setAllowMessages(settings.privacy.allowMessages);
      setShowFriendList(settings.privacy.showFriendList);

      setPushNotifs(settings.notifications.pushNotifs);
      setEmailNotifs(settings.notifications.emailNotifs);
      setCommunityNotifs(settings.notifications.communityNotifs);
    });

    moderationService.getBlockedUsers().then(setBlockedUsers);
  }, []);

  // Sync current user fields
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Handle Account Form Submit with Validation & Success Flash
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateAccountForm({ username, email, phone });
    setAccountErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Validation Error', 'Please correct the highlighted fields before saving.');
      return;
    }

    setIsSavingAccount(true);
    try {
      updateProfile({ email, phone, username });
      setAccountSuccessFlash(true);
      toast.success('Account updated', 'Your account preferences have been saved.');
      setTimeout(() => setAccountSuccessFlash(false), 2000);
    } catch {
      toast.error('Save Failed', 'Unable to persist account changes.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  // Handle Privacy Save
  const handleSavePrivacy = async () => {
    setIsSavingPrivacy(true);
    try {
      await moderationService.updateUserSettings({
        privacy: {
          profileVisibility,
          allowFriendRequests,
          allowMessages,
          showFriendList,
        },
      });
      setPrivacySuccessFlash(true);
      toast.success('Privacy updated', 'Your privacy preferences have been saved.');
      setTimeout(() => setPrivacySuccessFlash(false), 2000);
    } catch {
      toast.error('Save Failed', 'Could not update privacy preferences.');
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  // Handle Notifications Save
  const handleSaveNotifications = async () => {
    setIsSavingNotifs(true);
    try {
      await moderationService.updateUserSettings({
        notifications: {
          pushNotifs,
          emailNotifs,
          communityNotifs,
        },
      });
      setNotifsSuccessFlash(true);
      toast.success('Notifications updated', 'Your notification preferences have been saved.');
      setTimeout(() => setNotifsSuccessFlash(false), 2000);
    } catch {
      toast.error('Save Failed', 'Could not update notification preferences.');
    } finally {
      setIsSavingNotifs(false);
    }
  };

  // Handle Language Save
  const handleSaveLanguagePreferences = async () => {
    setIsSavingLang(true);
    try {
      await languageService.saveUserLanguagePreferences({
        nativeLanguage,
        preferredLanguage,
        autoTranslateIncoming: autoTranslate,
        voiceSpeechRate,
      });
      setLangSuccessFlash(true);
      toast.success('Language preferences saved', 'Your translation settings are active.');
      setTimeout(() => setLangSuccessFlash(false), 2000);
    } catch {
      toast.error('Save Failed', 'Could not update language settings.');
    } finally {
      setIsSavingLang(false);
    }
  };

  // Handle Password Change with Validation
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validatePasswordForm({ currentPassword, newPassword, confirmPassword });
    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Security Error', 'Please check the password requirements.');
      return;
    }

    setIsSavingPassword(true);
    setTimeout(() => {
      setIsSavingPassword(false);
      setPasswordSuccessFlash(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated', 'Your account credentials have been updated.');
      setTimeout(() => setPasswordSuccessFlash(false), 2000);
    }, 400);
  };

  const handleUnblockUser = async (userId: string) => {
    await moderationService.unblockUser(userId);
    const updated = await moderationService.getBlockedUsers();
    setBlockedUsers(updated);
    toast.info('User unblocked', 'User has been removed from your blocked list.');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await moderationService.deleteAccount();
      setIsDeleteModalOpen(false);
      toast.info('Account deleted', 'Your profile and data have been removed.');
      logout();
    } catch {
      toast.error('Deletion Failed', 'Unable to delete account at this time.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isMinimumLoading) {
    return <SettingsFormSkeleton />;
  }

  const renderTabIcon = (iconName: string) => {
    const props = { className: 'h-4 w-4 shrink-0', strokeWidth: 1.75 };
    switch (iconName) {
      case 'Shield':
        return <Shield {...props} />;
      case 'Bell':
        return <Bell {...props} />;
      case 'Globe':
        return <Globe {...props} />;
      case 'Palette':
        return <Palette {...props} />;
      case 'Lock':
        return <Lock {...props} />;
      case 'User':
      default:
        return <User {...props} />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-0 py-4 sm:py-8">
      {/* Sub-Nav Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-white font-sora tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs text-white/40 mt-1">
          Manage your account credentials, regional preferences, and security settings.
        </p>
      </div>

      {/* Sub-Nav Horizontal Tab Strip */}
      <div className="relative mb-6">
        <div
          role="tablist"
          aria-label="Settings sections"
          className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-white/[0.06] pr-8"
        >
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 select-none ${
                  isActive
                    ? 'text-white border-b-2 border-emerald-500 -mb-px font-semibold'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {renderTabIcon(tab.iconName)}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Gradient Overflow Signal */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0B130E] to-transparent sm:hidden"
        />
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* TAB: ACCOUNT */}
        {activeTab === 'account' && (
          <div role="tabpanel" id="tabpanel-account" aria-labelledby="tab-account" className="space-y-6">
            <form onSubmit={handleSaveAccount} className="space-y-5">
              <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-white/25 mb-4 mt-8">
                ACCOUNT CREDENTIALS
              </h2>

              {/* Username Field */}
              <div>
                <label
                  htmlFor="settings-username"
                  className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-2 block"
                >
                  USERNAME
                </label>
                <input
                  id="settings-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (accountErrors.username) setAccountErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  placeholder="e.g. kwame_mensah"
                  className={`h-11 w-full px-4 rounded-xl bg-white/[0.03] border text-sm text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/[0.05] transition-all duration-200 outline-none ${
                    accountErrors.username
                      ? 'border-red-500/50'
                      : accountSuccessFlash
                      ? 'border-emerald-500/30'
                      : 'border-white/[0.06]'
                  }`}
                />
                {accountErrors.username ? (
                  <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                    <span>{accountErrors.username}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-white/20 mt-1.5">
                    Your unique AfriLink identity visible across hubs and direct messaging.
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="settings-email"
                  className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-2 block"
                >
                  EMAIL ADDRESS
                </label>
                <input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (accountErrors.email) setAccountErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="your.email@example.com"
                  className={`h-11 w-full px-4 rounded-xl bg-white/[0.03] border text-sm text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/[0.05] transition-all duration-200 outline-none ${
                    accountErrors.email
                      ? 'border-red-500/50'
                      : accountSuccessFlash
                      ? 'border-emerald-500/30'
                      : 'border-white/[0.06]'
                  }`}
                />
                {accountErrors.email ? (
                  <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                    <span>{accountErrors.email}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-white/20 mt-1.5">
                    Used for essential account recovery, security alerts, and system notices.
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="settings-phone"
                  className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-2 block"
                >
                  PHONE NUMBER
                </label>
                <input
                  id="settings-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (accountErrors.phone) setAccountErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="+234 80 1234 5678"
                  className={`h-11 w-full px-4 rounded-xl bg-white/[0.03] border text-sm text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/[0.05] transition-all duration-200 outline-none ${
                    accountErrors.phone
                      ? 'border-red-500/50'
                      : accountSuccessFlash
                      ? 'border-emerald-500/30'
                      : 'border-white/[0.06]'
                  }`}
                />
                {accountErrors.phone ? (
                  <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                    <span>{accountErrors.phone}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-white/20 mt-1.5">
                    Optional mobile number for SMS 2FA verification.
                  </p>
                )}
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSavingAccount}
                  className="h-10 px-6 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 active:scale-[0.98] transition-all duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none"
                >
                  {isSavingAccount ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" strokeWidth={1.75} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>

            {/* DANGER ZONE */}
            <div className="mt-12 border-t border-red-500/10 pt-6">
              <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-red-400/80 mb-2">
                DANGER ZONE
              </h2>
              <p className="text-xs text-white/30 mb-4">
                Permanently delete your profile, posts, communities, and message history. This action cannot be reversed.
              </p>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-150 flex items-center gap-2 select-none"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: PRIVACY & SAFETY */}
        {activeTab === 'privacy' && (
          <div role="tabpanel" id="tabpanel-privacy" aria-labelledby="tab-privacy" className="space-y-6">
            <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-white/25 mb-4 mt-8">
              PROFILE & VISIBILITY CONTROLS
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-2 block">
                  PROFILE VISIBILITY
                </label>
                <select
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value as any)}
                  className={`h-11 w-full px-4 rounded-xl bg-white/[0.03] border text-sm text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/[0.05] transition-all duration-200 outline-none ${
                    privacySuccessFlash ? 'border-emerald-500/30' : 'border-white/[0.06]'
                  }`}
                >
                  <option value="public" className="bg-[#0B130E] text-white">Public (Entire Pan-African Network)</option>
                  <option value="friends" className="bg-[#0B130E] text-white">Friends Only</option>
                  <option value="private" className="bg-[#0B130E] text-white">Private</option>
                </select>
                <p className="text-[11px] text-white/20 mt-1.5">
                  Controls who can discover and view your profile bio and activity.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-2 block">
                  DIRECT MESSAGES
                </label>
                <select
                  value={allowMessages}
                  onChange={(e) => setAllowMessages(e.target.value as any)}
                  className={`h-11 w-full px-4 rounded-xl bg-white/[0.03] border text-sm text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/[0.05] transition-all duration-200 outline-none ${
                    privacySuccessFlash ? 'border-emerald-500/30' : 'border-white/[0.06]'
                  }`}
                >
                  <option value="everyone" className="bg-[#0B130E] text-white">Everyone</option>
                  <option value="friends" className="bg-[#0B130E] text-white">Friends Only</option>
                  <option value="none" className="bg-[#0B130E] text-white">No One</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSavePrivacy}
                  disabled={isSavingPrivacy}
                  className="h-10 px-6 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 active:scale-[0.98] transition-all duration-150 flex items-center gap-2 select-none"
                >
                  {isSavingPrivacy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" strokeWidth={1.75} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Privacy Settings</span>
                  )}
                </button>
              </div>

              {/* Blocked Users */}
              {blockedUsers.length > 0 && (
                <div className="mt-8 border-t border-white/[0.06] pt-5">
                  <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-white/25 mb-3">
                    BLOCKED ACCOUNTS ({blockedUsers.length})
                  </h3>
                  <div className="space-y-2">
                    {blockedUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div>
                          <p className="text-xs font-semibold text-white/90">{u.fullName}</p>
                          <p className="text-[10px] text-white/30">@{u.username}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnblockUser(u.id)}
                          className="px-3 py-1 rounded-lg border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div role="tabpanel" id="tabpanel-notifications" aria-labelledby="tab-notifications" className="space-y-6">
            <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-white/25 mb-4 mt-8">
              NOTIFICATION CHANNELS
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-white/90">Push Notifications</p>
                  <p className="text-[11px] text-white/30">Receive instant alerts for chats, mentions, and community events.</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={(e) => setPushNotifs(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-white/90">Email Digest</p>
                  <p className="text-[11px] text-white/30">Weekly summary of trending discussions in your African country hub.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-white/90">Community Announcements</p>
                  <p className="text-[11px] text-white/30">Official updates from creators and hubs you follow.</p>
                </div>
                <input
                  type="checkbox"
                  checked={communityNotifs}
                  onChange={(e) => setCommunityNotifs(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveNotifications}
                  disabled={isSavingNotifs}
                  className="h-10 px-6 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 active:scale-[0.98] transition-all duration-150 flex items-center gap-2 select-none"
                >
                  {isSavingNotifs ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" strokeWidth={1.75} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Notifications</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: LANGUAGE & REGION */}
        {activeTab === 'language' && (
          <div role="tabpanel" id="tabpanel-language" aria-labelledby="tab-language" className="space-y-6">
            <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-white/25 mb-4 mt-8">
              LOCAL LANGUAGE & TRANSLATION ENGINE
            </h2>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-2 block">
                  NATIVE AFRICAN LANGUAGE
                </label>
                <LanguageSelector
                  value={nativeLanguage}
                  onChange={setNativeLanguage}
                  label=""
                />
                <p className="text-[11px] text-white/20 mt-1.5">
                  Your primary African dialect for voice transcription and audio messages.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-2 block">
                  DISPLAY & TRANSLATION TARGET
                </label>
                <LanguageSelector
                  value={preferredLanguage}
                  onChange={setPreferredLanguage}
                  label=""
                />
                <p className="text-[11px] text-white/20 mt-1.5">
                  Languages you wish to read posts and incoming messages in.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-2 block">
                  VOICE SPEECH RATE ({voiceSpeechRate}x)
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={voiceSpeechRate}
                  onChange={(e) => setVoiceSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveLanguagePreferences}
                  disabled={isSavingLang}
                  className="h-10 px-6 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 active:scale-[0.98] transition-all duration-150 flex items-center gap-2 select-none"
                >
                  {isSavingLang ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" strokeWidth={1.75} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Language Preferences</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: APPEARANCE */}
        {activeTab === 'appearance' && (
          <div role="tabpanel" id="tabpanel-appearance" aria-labelledby="tab-appearance" className="space-y-6">
            <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-white/25 mb-4 mt-8">
              THEME & DISPLAY MODE
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Obsidian Green Dark */}
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  toast.success('Dark Mode Active', 'Switched to Obsidian Green depth layers.');
                }}
                className={`p-4 rounded-xl border text-left transition-all duration-200 select-none ${
                  theme === 'dark'
                    ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#0B130E] border border-white/10 flex items-center justify-center text-emerald-400 mb-3">
                  <Moon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <p className="text-sm font-semibold text-white/90">Obsidian Green</p>
                <p className="text-[11px] text-white/40 mt-0.5">High-contrast 6-layer dark mode for AMOLED screens.</p>
              </button>

              {/* Soft Neutral Light */}
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  toast.success('Light Mode Active', 'Switched to Soft Neutral theme.');
                }}
                className={`p-4 rounded-xl border text-left transition-all duration-200 select-none ${
                  theme === 'light'
                    ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#F5F7F6] border border-black/10 flex items-center justify-center text-neutral-800 mb-3">
                  <Sun className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <p className="text-sm font-semibold text-white/90">Soft Neutral</p>
                <p className="text-[11px] text-white/40 mt-0.5">Clean light palette engineered for daytime clarity.</p>
              </button>

              {/* System Match */}
              <button
                type="button"
                onClick={() => {
                  setTheme('system');
                  toast.info('System Sync Active', 'AfriLink will follow your device theme settings.');
                }}
                className={`p-4 rounded-xl border text-left transition-all duration-200 select-none ${
                  theme === 'system'
                    ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 mb-3">
                  <Laptop className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <p className="text-sm font-semibold text-white/90">System Default</p>
                <p className="text-[11px] text-white/40 mt-0.5">Syncs dynamically with your device operating system.</p>
              </button>
            </div>
          </div>
        )}

        {/* TAB: SECURITY */}
        {activeTab === 'security' && (
          <div role="tabpanel" id="tabpanel-security" aria-labelledby="tab-security" className="space-y-6">
            <form onSubmit={handleSavePassword} className="space-y-4">
              <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-white/25 mb-4 mt-8">
                UPDATE PASSWORD
              </h2>

              <div>
                <label
                  htmlFor="security-curr-pw"
                  className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-2 block"
                >
                  CURRENT PASSWORD
                </label>
                <input
                  id="security-curr-pw"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordErrors.currentPassword) setPasswordErrors((prev) => ({ ...prev, currentPassword: undefined }));
                  }}
                  className={`h-11 w-full px-4 rounded-xl bg-white/[0.03] border text-sm text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/[0.05] transition-all duration-200 outline-none ${
                    passwordErrors.currentPassword
                      ? 'border-red-500/50'
                      : passwordSuccessFlash
                      ? 'border-emerald-500/30'
                      : 'border-white/[0.06]'
                  }`}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                    <span>{passwordErrors.currentPassword}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="security-new-pw"
                  className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-2 block"
                >
                  NEW PASSWORD
                </label>
                <input
                  id="security-new-pw"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.newPassword) setPasswordErrors((prev) => ({ ...prev, newPassword: undefined }));
                  }}
                  className={`h-11 w-full px-4 rounded-xl bg-white/[0.03] border text-sm text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/[0.05] transition-all duration-200 outline-none ${
                    passwordErrors.newPassword
                      ? 'border-red-500/50'
                      : passwordSuccessFlash
                      ? 'border-emerald-500/30'
                      : 'border-white/[0.06]'
                  }`}
                />
                {passwordErrors.newPassword ? (
                  <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                    <span>{passwordErrors.newPassword}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-white/20 mt-1.5">
                    Minimum 8 characters with a mix of letters and numbers.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="security-confirm-pw"
                  className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-2 block"
                >
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  id="security-confirm-pw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrors.confirmPassword) setPasswordErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className={`h-11 w-full px-4 rounded-xl bg-white/[0.03] border text-sm text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/[0.05] transition-all duration-200 outline-none ${
                    passwordErrors.confirmPassword
                      ? 'border-red-500/50'
                      : passwordSuccessFlash
                      ? 'border-emerald-500/30'
                      : 'border-white/[0.06]'
                  }`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                    <span>{passwordErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="h-10 px-6 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 active:scale-[0.98] transition-all duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none"
                >
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" strokeWidth={1.75} />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>

            {/* 2FA Toggle */}
            <div className="mt-8 border-t border-white/[0.06] pt-5">
              <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-white/25 mb-3">
                TWO-FACTOR AUTHENTICATION
              </h3>
              <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-white/90">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-white/30">Protect your AfriLink profile with authenticator app codes on login.</p>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => {
                    setTwoFactorEnabled(e.target.checked);
                    if (e.target.checked) {
                      toast.success('2FA Activated', 'Authenticator verification enabled.');
                    } else {
                      toast.info('2FA Disabled', 'Two-factor protection turned off.');
                    }
                  }}
                  className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Your AfriLink Account"
        description="Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-white/40 leading-relaxed">
            All your posts, stories, community contributions, and messages will be permanently scheduled for deletion.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Yes, Delete Account</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
