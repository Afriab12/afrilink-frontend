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
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-white dark:bg-[#0F1A13] border-t border-slate-200 dark:border-white/10 transition-colors duration-200 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around h-full">
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
                aria-label={link.label}
                className="flex flex-col items-center justify-center p-2 rounded-2xl relative transition-all duration-200 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white"
              >
                <div className="relative">
                  <Icon className="h-5 w-5 transition-all duration-200" strokeWidth={1.75} />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 font-medium font-sora">{link.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={link.label}
              href={link.href || '#'}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl relative transition-all duration-200 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5 transition-all duration-200" strokeWidth={1.75} />
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white leading-none">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 font-medium font-sora">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
