'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  MessageSquare,
  ShieldAlert,
  LogOut,
  User,
  Settings,
  Compass,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { GlobalSearchModal } from '@/features/search/GlobalSearchModal';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '@/stores/authContext';
import { useSocial } from '@/stores/socialContext';
import { useChat } from '@/stores/chatContext';
import { adminService } from '@/services/adminService';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const { unreadNotifsCount } = useSocial();
  const { unreadMessagesCount } = useChat();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isDiscoverActive = pathname.startsWith('/discover');
  const isMessagesActive = pathname.startsWith('/messages');
  const isNotifsActive = pathname.startsWith('/notifications');

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0B130E]/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-[#1F3327] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-[#087443] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                <span className="font-extrabold text-xl font-sora">A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-neutral-900 dark:text-white tracking-tight font-sora flex items-center gap-1">
                  AfriLink
                  <span className="w-2 h-2 rounded-full bg-[#D9A441]" />
                </span>
                <span className="text-[9px] font-bold text-[#087443] tracking-widest uppercase -mt-1 hidden sm:block">
                  Connected Africa
                </span>
              </div>
            </Link>
          </div>

          {/* Search Trigger Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2 bg-neutral-100 hover:bg-neutral-200/70 dark:bg-[#111D16] dark:border-[#1F3327] dark:hover:border-[#087443] rounded-2xl text-xs transition-all duration-200 border border-transparent hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#087443]"
              aria-label="Search AfriLink"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-neutral-500 dark:text-neutral-400" strokeWidth={1.75} />
                <span className="text-gray-600 dark:text-gray-300 font-medium">Search African people, topics, countries...</span>
              </div>
              <kbd className="hidden lg:inline-block border border-slate-200 dark:border-[#1F3327] bg-slate-50 dark:bg-[#16241C] px-1.5 py-0.5 text-[10px] rounded-md text-slate-400 font-mono shadow-sm">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-[#16241C] transition-all duration-200"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>

            {/* Explore / Discover */}
            <Link
              href="/discover"
              className={`p-2 rounded-full transition-all duration-200 relative hidden sm:flex ${
                isDiscoverActive
                  ? 'bg-emerald-50 dark:bg-[#16241C] text-[#087443]'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-[#16241C]'
              }`}
              title="Explore Africa"
              aria-label="Explore Africa"
            >
              <Compass className="h-5 w-5" strokeWidth={1.75} />
            </Link>

            {/* Messages */}
            <Link
              href="/messages"
              className={`p-2 rounded-full transition-all duration-200 relative ${
                isMessagesActive
                  ? 'bg-emerald-50 dark:bg-[#16241C] text-[#087443]'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-[#16241C]'
              }`}
              title="Messages"
              aria-label="Messages"
            >
              <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#087443] px-1 text-[10px] font-bold text-white leading-none">
                  {unreadMessagesCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <Link
              href="/notifications"
              className={`p-2 rounded-full transition-all duration-200 relative ${
                isNotifsActive
                  ? 'bg-emerald-50 dark:bg-[#16241C] text-[#087443]'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-[#16241C]'
              }`}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" strokeWidth={1.75} />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#087443] px-1 text-[10px] font-bold text-white leading-none">
                  {unreadNotifsCount}
                </span>
              )}
            </Link>

            {/* Afro-Futurist Dark / Light Mode Toggle */}
            <ThemeToggle />

            {/* Profile Avatar & Menu */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#087443]/30 transition-all duration-200"
                >
                  <Avatar
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    size="sm"
                    countryFlag={currentUser.countryCode === 'GH' ? '🇬🇭' : currentUser.countryCode === 'NG' ? '🇳🇬' : '🌍'}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                      <p className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                        {currentUser.fullName}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        @{currentUser.username} • {currentUser.country}
                      </p>
                    </div>

                    <Link
                      href={`/profile/${currentUser.username}`}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-200"
                    >
                      <User className="h-4 w-4" strokeWidth={1.75} /> My Profile
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-200"
                    >
                      <Settings className="h-4 w-4" strokeWidth={1.75} /> Settings & Privacy
                    </Link>

                    {adminService.hasAdminAccess(currentUser) && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#087443] dark:text-[#0e9357] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all duration-200"
                      >
                        <ShieldAlert className="h-4 w-4" strokeWidth={1.75} /> Trust & Admin Ops
                      </Link>
                    )}

                    <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-left transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.75} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
