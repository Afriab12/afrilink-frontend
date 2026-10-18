'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Search, Users, MessageSquare, Bell, User } from 'lucide-react';
import { useAuth } from '@/stores/authContext';
import { useChat } from '@/stores/chatContext';
import { useSocial } from '@/stores/socialContext';
import { useSearchModal } from '@/hooks/use-search';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { unreadMessagesCount } = useChat();
  const { unreadNotifsCount } = useSocial();
  const { openSearch } = useSearchModal();

  const links: Array<{
    label: string;
    href?: string;
    icon: typeof Home;
    badge?: number;
    onClick?: () => void;
  }> = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', icon: Search, onClick: () => openSearch() },
    { label: 'Explore', href: '/discover', icon: Compass },
    { label: 'Hubs', href: '/communities', icon: Users },
    {
      label: 'Chat',
      href: '/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      label: 'Alerts',
      href: '/notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
    },
    {
      label: 'Profile',
      href: '/profile/me',
      icon: User,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-surface-1/95 backdrop-blur-lg border-t border-neutral-200/80 dark:border-white/[0.04] z-40 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const isActive =
            link.href === '/'
              ? pathname === '/'
              : link.href === '/profile/me'
                ? pathname === '/profile/me' || (!!currentUser?.username && pathname.startsWith(`/profile/${currentUser.username}`))
                : !!link.href && pathname.startsWith(link.href);
          const Icon = link.icon;

          if (link.onClick) {
            return (
              <button
                key={link.label}
                type="button"
                onClick={link.onClick}
                className="flex flex-col items-center justify-center p-2 rounded-2xl relative transition-all duration-200 text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white/90"
              >
                <div className="relative">
                  <Icon className="h-5 w-5 transition-all duration-200" strokeWidth={1.75} />
                </div>
                <span className="text-[10px] mt-0.5 font-medium font-sora">{link.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={link.label}
              href={link.href || '#'}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl relative transition-all duration-200 ${
                isActive
                  ? 'text-[#087443] font-bold'
                  : 'text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white/90'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5 transition-all duration-200" strokeWidth={1.75} />
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#087443] px-1 text-[10px] font-bold text-white leading-none">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium font-sora">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
