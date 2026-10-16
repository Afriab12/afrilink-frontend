'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Building2, MessageSquare, User, Bell } from 'lucide-react';
import { useAuth } from '@/stores/authContext';
import { useChat } from '@/stores/chatContext';
import { useSocial } from '@/stores/socialContext';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { unreadMessagesCount } = useChat();
  const { unreadNotifsCount } = useSocial();

  const links = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/discover', icon: Compass },
    { label: 'Hubs', href: '/communities', icon: Building2 },
    {
      label: 'Chat',
      href: '/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
    {
      label: 'Alerts',
      href: '/notifications',
      icon: Bell,
      badge: unreadNotifsCount,
    },
    {
      label: 'Profile',
      href: currentUser ? `/profile/${currentUser.username}` : '/login',
      icon: User,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-200/80 dark:border-neutral-800 z-40 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const isActive =
            link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl relative transition-colors ${
                isActive
                  ? 'text-[#087443] font-bold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{link.label}</span>

              {link.badge !== undefined && link.badge > 0 && (
                <span className="absolute top-1.5 right-2 w-4 h-4 bg-[#D9A441] text-neutral-900 font-extrabold text-[9px] rounded-full flex items-center justify-center">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
