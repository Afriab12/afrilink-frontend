'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Bell,
  Lock,
  Trash2,
  Check,
  Eye,
  Key,
  Ban,
  UserCheck,
  AlertTriangle,
  Globe,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useAuth } from '@/stores/authContext';
import { moderationService } from '@/services/moderationService';
import { languageService } from '@/services/languageService';
import { User as UserType } from '@/types';
import { SettingsFormSkeleton, useMinimumLoading } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';

interface SettingsViewProps {
  isLoading?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isLoading = false }) => {
  const { currentUser, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications' | 'language' | 'security'>('account');
  const isMinimumLoading = useMinimumLoading(isLoading, 300);

  // Account State
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [username, setUsername] = useState(currentUser?.username || '');

  // Language & Voice State
  const initialLangPrefs = languageService.getUserLanguagePreferences();
  const [nativeLanguage, setNativeLanguage] = useState(initialLangPrefs.nativeLanguage || 'yo');
  const [preferredLanguage, setPreferredLanguage] = useState(initialLangPrefs.preferredLanguage || 'en');
  const [autoTranslate, setAutoTranslate] = useState(initialLangPrefs.autoTranslateIncoming || false);
  const [voiceSpeechRate, setVoiceSpeechRate] = useState(initialLangPrefs.voiceSpeechRate || 1.0);

  // Privacy State
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [allowFriendRequests, setAllowFriendRequests] = useState<'everyone' | 'friends_of_friends' | 'none'>('everyone');
  const [allowMessages, setAllowMessages] = useState<'everyone' | 'friends' | 'none'>('everyone');
  const [showFriendList, setShowFriendList] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<UserType[]>([]);

  // Notification State
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [communityNotifs, setCommunityNotifs] = useState(true);

  // Status feedback
  const [savedMessage, setSavedMessage] = useState(false);
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

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      email,
      phone,
      username,
    });
    setSavedMessage(true);
    toast.success('Account updated', 'Your account details have been saved.');
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const handleSavePrivacy = async () => {
    await moderationService.updateUserSettings({
      privacy: {
        profileVisibility,
        allowFriendRequests,
        allowMessages,
        showFriendList,
      },
    });
    setSavedMessage(true);
    toast.success('Privacy updated', 'Your privacy preferences have been saved.');
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const handleSaveNotifications = async () => {
    await moderationService.updateUserSettings({
      notifications: {
        pushNotifs,
        emailNotifs,
        communityNotifs,
      },
    });
    setSavedMessage(true);
    toast.success('Notifications updated', 'Your notification preferences have been saved.');
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const handleSaveLanguagePreferences = async () => {
    await languageService.saveUserLanguagePreferences({
      nativeLanguage,
      preferredLanguage,
      autoTranslateIncoming: autoTranslate,
      voiceSpeechRate,
    });
    setSavedMessage(true);
    toast.success('Language preferences saved', 'Your translation settings are active.');
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const handleUnblockUser = async (userId: string) => {
    await moderationService.unblockUser(userId);
    const updated = await moderationService.getBlockedUsers();
    setBlockedUsers(updated);
    toast.info('User unblocked', 'User has been removed from your blocked list.');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await moderationService.deleteAccount();
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    logout();
  };

  if (isMinimumLoading) {
    return <SettingsFormSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-surface-0 rounded-3xl overflow-hidden shadow-sm border border-neutral-200/80 dark:border-white/[0.04]">
      {/* Header */}
      <div className="p-6 border-b border-neutral-100 dark:border-white/[0.04]">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white/90 font-sora">
          Settings & Preferences
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage your AfriLink identity, privacy controls, notifications, language and account security
        </p>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'account'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Account
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Privacy & Blocks
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> Notifications
          </button>

          <button
            onClick={() => setActiveTab('language')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'language'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Language & Voice
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> Security & Danger
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-[#087443] rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
          <Check className="w-4 h-4" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* Tab Panels */}
      <div className="p-6">
        {/* Account Tab */}
        {activeTab === 'account' && (
          <form onSubmit={handleSaveAccount} className="space-y-4 max-w-lg">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233 24 000 0000"
            />

            <Button type="submit" variant="primary" size="md" className="font-bold">
              Save Account Changes
            </Button>
          </form>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 max-w-lg">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Profile Visibility
                </label>
                <select
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#087443]"
                >
                  <option value="public">Public (All Africans & Diaspora)</option>
                  <option value="friends">Connections & Friends Only</option>
                  <option value="private">Private (Only Me)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Direct Messaging Permissions
                </label>
                <select
                  value={allowMessages}
                  onChange={(e) => setAllowMessages(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#087443]"
                >
                  <option value="everyone">Everyone (Unconnected in Requests)</option>
                  <option value="friends">Friends & Connections Only</option>
                  <option value="none">Nobody</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">
                    Show Friends & Network List
                  </p>
                  <p className="text-[10px] text-neutral-500">Allow visitors to view your connections on your profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={showFriendList}
                  onChange={(e) => setShowFriendList(e.target.checked)}
                  className="rounded text-[#087443] focus:ring-[#087443]"
                />
              </div>

              <Button variant="primary" size="sm" onClick={handleSavePrivacy} className="font-bold">
                Update Privacy Preferences
              </Button>
            </div>

            {/* Blocked Users Section */}
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-red-500" />
                Blocked Accounts ({blockedUsers.length})
              </h3>
              <p className="text-[11px] text-neutral-500">
                Blocked users cannot view your profile, send you messages, or interact with your posts.
              </p>

              {blockedUsers.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {blockedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar src={user.avatarUrl} alt={user.fullName} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">{user.fullName}</p>
                          <p className="text-[10px] text-neutral-400">@{user.username}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblockUser(user.id)}
                        className="text-xs py-1 px-2.5"
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-1 text-[#087443]" /> Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">No blocked users.</p>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                  Push Notifications
                </p>
                <p className="text-[10px] text-neutral-500">Instant alerts for new DMs, comments, and mentions</p>
              </div>
              <input
                type="checkbox"
                checked={pushNotifs}
                onChange={(e) => setPushNotifs(e.target.checked)}
                className="rounded text-[#087443] focus:ring-[#087443]"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                  Email Digest
                </p>
                <p className="text-[10px] text-neutral-500">Weekly highlights of trending pan-African discussions</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="rounded text-[#087443] focus:ring-[#087443]"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                  Community Announcements
                </p>
                <p className="text-[10px] text-neutral-500">Broadcasts and event notifications from joined hubs</p>
              </div>
              <input
                type="checkbox"
                checked={communityNotifs}
                onChange={(e) => setCommunityNotifs(e.target.checked)}
                className="rounded text-[#087443] focus:ring-[#087443]"
              />
            </div>

            <Button variant="primary" size="sm" onClick={handleSaveNotifications} className="font-bold">
              Save Notification Settings
            </Button>
          </div>
        )}

        {/* Language & Voice Tab */}
        {activeTab === 'language' && (
          <div className="space-y-6 max-w-lg">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
              <span className="font-bold block mb-1">🌍 Pan-African Linguistic Sovereignty</span>
              AfriLink celebrates Africa's linguistic wealth. Choose your native tongue to communicate naturally, and select your preferred display language for instant message translation and speech playback.
            </div>

            <div className="space-y-4">
              <div>
                <LanguageSelector
                  id="native-language-selector"
                  label="Native Language (Mother Tongue)"
                  value={nativeLanguage}
                  onChange={setNativeLanguage}
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  The African language you speak and express yourself in most comfortably.
                </p>
              </div>

              <div>
                <LanguageSelector
                  id="preferred-language-selector"
                  label="Preferred Translation Language"
                  value={preferredLanguage}
                  onChange={setPreferredLanguage}
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Incoming messages from other African languages will translate into this language.
                </p>
              </div>

              {/* Auto Translate Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">
                    Auto-Translate Incoming Messages
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    Automatically show translated text alongside original African messages
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoTranslate}
                  onChange={(e) => setAutoTranslate(e.target.checked)}
                  className="rounded text-[#087443] focus:ring-[#087443]"
                />
              </div>

              {/* Voice Speech Playback Rate */}
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-[#087443]" /> Voice Speech Playback Speed
                  </p>
                  <span className="text-xs font-mono font-bold text-[#087443]">
                    {voiceSpeechRate}x
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[0.8, 1.0, 1.2].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setVoiceSpeechRate(rate)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                        voiceSpeechRate === rate
                          ? 'bg-[#087443] text-white shadow-xs'
                          : 'bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100'
                      }`}
                    >
                      {rate === 0.8 ? 'Slow (0.8x)' : rate === 1.0 ? 'Normal (1.0x)' : 'Fast (1.2x)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveLanguagePreferences}
              className="font-bold"
            >
              Save Language Preferences
            </Button>
          </div>
        )}

        {/* Security & Danger Zone Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-lg">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Change Password
              </h3>
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <Input label="New Password" type="password" placeholder="••••••••" />
              <Button variant="outline" size="sm">
                Update Password
              </Button>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
                Active Login Sessions
              </h3>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-neutral-800 dark:text-neutral-200">
                    Chrome on Windows (Current Session)
                  </p>
                  <p className="text-[10px] text-neutral-400">Accra, Ghana • Active Now</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-red-100 dark:border-red-950/40 space-y-3">
              <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
              </h3>
              <p className="text-xs text-neutral-500">
                Deactivating your account will soft-delete your PII, hide your posts, and disconnect all relationships in compliance with African NDPR standards.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="font-bold"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Deactivate Account
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Deactivate AfriLink Account?"
        description="This action will disable your profile and redact personal data"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Are you sure you want to deactivate your AfriLink citizen profile? Your posts, messages, and community memberships will be archived.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
              className="font-bold"
            >
              Confirm Deactivation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
