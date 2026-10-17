'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Users,
  MessageSquare,
  Bell,
  User,
  Settings,
  ShieldAlert,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/stores/authContext';
import { useSocial } from '@/stores/socialContext';
import { useChat } from '@/stores/chatContext';
import { CreateCommunityModal } from '@/features/communities/CreateCommunityModal';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { adminService } from '@/services/adminService';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  count?: number;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { unreadNotifsCount } = useSocial();
  const { unreadMessagesCount } = useChat();
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);

  const canAccessAdmin = adminService.hasAdminAccess(currentUser);

  const navItems: NavItem[] = [
    { name: 'Home Feed', href: '/', icon: Home },
    { name: 'Explore Africa', href: '/discover', icon: Compass },
    { name: 'Communities', href: '/communities', icon: Users },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageSquare,
      count: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      count: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
    },
    { name: 'Profile', href: '/profile/me', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    ...(canAccessAdmin ? [{ name: 'Admin Ops', href: '/admin', icon: ShieldAlert }] : []),
  ];

  const isItemActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/profile/me') {
      return (
        pathname === '/profile/me' ||
        (!!currentUser?.username && pathname.startsWith(`/profile/${currentUser.username}`))
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 sticky top-20 h-[calc(100vh-80px)] pb-6 pr-4 space-y-6">
        {/* Navigation Items */}
        <nav className="space-y-1.5 bg-white dark:bg-[#111D16] rounded-3xl p-3 border border-neutral-200/80 dark:border-[#1F3327] shadow-sm">
          {navItems.map((item) => {
            const isActive = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#087443] text-white shadow-sm'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-[#16241C] hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 transition-all duration-200 ${
                      isActive ? 'text-white' : 'text-[#087443]'
                    }`}
                    strokeWidth={1.75}
                  />
                  <span className="font-sora">{item.name}</span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none transition-all duration-200 ${
                      isActive ? 'bg-white text-[#087443]' : 'bg-[#087443] text-white'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-neutral-100 dark:border-[#1F3327]">
            <ThemeToggle showLabel className="w-full justify-start px-4 py-2.5" />
          </div>
        </nav>

        {/* Quick Community Launcher Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20 rounded-3xl p-4 border border-emerald-100 dark:border-emerald-900/40 text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#087443] dark:text-[#0e9357] flex items-center justify-center mx-auto mb-1">
            <Sparkles className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h4 className="font-bold text-xs text-neutral-900 dark:text-white font-sora">
            Start an African Hub
          </h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
            Create an open or invite-only community for your trade, startup or culture.
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCommunityModalOpen(true)}
            className="w-full text-xs py-2 font-bold transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4 mr-1" strokeWidth={1.75} /> Create Community
          </Button>
        </div>
      </aside>

      <CreateCommunityModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
      />
    </>
  );
};
