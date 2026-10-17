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
  Shield,
  PlusCircle,
  Building2,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/stores/authContext';
import { useSocial } from '@/stores/socialContext';
import { useChat } from '@/stores/chatContext';
import { CreateCommunityModal } from '@/features/communities/CreateCommunityModal';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { unreadNotifsCount } = useSocial();
  const { unreadMessagesCount } = useChat();
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);

  const navLinks = [
    { label: 'Home Feed', href: '/', icon: Home },
    { label: 'Explore Africa', href: '/discover', icon: Compass },
    { label: 'Communities', href: '/communities', icon: Building2 },
    {
      label: 'Messages',
      href: '/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      badgeColor: 'bg-[#D9A441] text-neutral-900',
    },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
      badgeColor: 'bg-[#087443] text-white',
    },
    {
      label: 'Profile',
      href: currentUser ? `/profile/${currentUser.username}` : '/login',
      icon: User,
    },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Admin Ops', href: '/admin', icon: Shield },
  ];

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 sticky top-20 h-[calc(100vh-80px)] pb-6 pr-4 space-y-6">
        {/* Navigation Items */}
        <nav className="space-y-1.5 bg-white dark:bg-neutral-900 rounded-3xl p-3 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          {navLinks.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#087443] text-white shadow-sm'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#087443]'}`} />
                  <span className="font-sora">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800">
            <ThemeToggle showLabel className="w-full justify-start px-4 py-2.5" />
          </div>
        </nav>

        {/* Quick Community Launcher Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20 rounded-3xl p-4 border border-emerald-100 dark:border-emerald-900/40 text-center space-y-2">
          <span className="text-2xl">🌱</span>
          <h4 className="font-bold text-xs text-neutral-900 dark:text-white font-sora">
            Start an African Hub
          </h4>
          <p className="text-[11px] text-neutral-500 leading-snug">
            Create an open or invite-only community for your trade, startup or culture.
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCommunityModalOpen(true)}
            className="w-full text-xs py-2 font-bold"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" /> Create Community
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
