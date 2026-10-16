'use client';

import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Lock,
  Trash2,
  Check,
  Smartphone,
  Eye,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/stores/authContext';

export const SettingsView: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications' | 'security'>('account');

  // Account State
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [username, setUsername] = useState(currentUser?.username || '');

  // Privacy State
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [allowFriendRequests, setAllowFriendRequests] = useState('everyone');
  const [allowMessages, setAllowMessages] = useState('everyone');
  const [showFriendList, setShowFriendList] = useState(true);

  // Notification State
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [communityNotifs, setCommunityNotifs] = useState(true);

  // Status feedback
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      email,
      phone,
      username,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm border border-neutral-200/80 dark:border-neutral-800">
      {/* Header */}
      <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
          Settings & Preferences
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage your AfriLink identity, privacy controls, notifications and account security
        </p>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'account'
                ? 'bg-[#087443] text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Account
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'bg-[#087443] text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Privacy
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-[#087443] text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> Notifications
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-[#087443] text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Security
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {savedMessage && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-[#087443] text-xs font-bold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" /> Preferences updated successfully!
          </div>
        )}

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Button type="submit" variant="primary">
              Save Account Details
            </Button>

            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 mt-6">
              <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                Danger Zone
              </h4>
              <p className="text-xs text-neutral-500 mb-3">
                Permanently delete your account and all associated posts, connections, and data.
              </p>
              <Button type="button" variant="danger" size="sm">
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete AfriLink Account
              </Button>
            </div>
          </form>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-5 max-w-lg">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Who can view your profile?
              </label>
              <select
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-xs"
              >
                <option value="public">Everyone across Africa (Public)</option>
                <option value="friends">Accepted Friends Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Who can send you friend requests?
              </label>
              <select
                value={allowFriendRequests}
                onChange={(e) => setAllowFriendRequests(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-xs"
              >
                <option value="everyone">Everyone</option>
                <option value="mutual">Friends of Friends</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Who can message you directly?
              </label>
              <select
                value={allowMessages}
                onChange={(e) => setAllowMessages(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-xs"
              >
                <option value="everyone">Anyone on AfriLink</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                  Public Friends List
                </p>
                <p className="text-[10px] text-neutral-500">Allow others to see your network</p>
              </div>
              <input
                type="checkbox"
                checked={showFriendList}
                onChange={(e) => setShowFriendList(e.target.checked)}
                className="rounded text-[#087443]"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSavedMessage(true);
                setTimeout(() => setSavedMessage(false), 2000);
              }}
            >
              Update Privacy Preferences
            </Button>
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
                <p className="text-[10px] text-neutral-500">Instant alerts for new DMs and mentions</p>
              </div>
              <input
                type="checkbox"
                checked={pushNotifs}
                onChange={(e) => setPushNotifs(e.target.checked)}
                className="rounded text-[#087443]"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                  Email Digest
                </p>
                <p className="text-[10px] text-neutral-500">Weekly highlights of trending African posts</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="rounded text-[#087443]"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                  Community Announcements
                </p>
                <p className="text-[10px] text-neutral-500">Broadcasts from joined communities</p>
              </div>
              <input
                type="checkbox"
                checked={communityNotifs}
                onChange={(e) => setCommunityNotifs(e.target.checked)}
                className="rounded text-[#087443]"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSavedMessage(true);
                setTimeout(() => setSavedMessage(false), 2000);
              }}
            >
              Save Notification Settings
            </Button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-5 max-w-lg">
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
                    Chrome on Windows (Current)
                  </p>
                  <p className="text-[10px] text-neutral-400">Accra, Ghana • Active Now</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  Current
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
