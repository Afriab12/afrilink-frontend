'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Users, TrendingUp, Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { INITIAL_USERS } from '@/services/mockBackend';
import { AFRICAN_COUNTRIES } from '@/utils/countryData';
import { useSocial } from '@/stores/socialContext';
import { useAuth } from '@/stores/authContext';

export const RightSidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { isFollowing, toggleFollow } = useSocial();

  if (pathname?.startsWith('/messages')) {
    return null;
  }

  const suggestedUsers = INITIAL_USERS.filter((u) => u.id !== currentUser?.id).slice(0, 3);
  const featuredCountries = AFRICAN_COUNTRIES.slice(0, 4);

  return (
    <aside className="hidden xl:flex flex-col w-80 sticky top-20 h-[calc(100vh-80px)] pb-6 space-y-5">
      {/* Explore Africa Widget */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white font-sora">
            <Compass className="w-4 h-4 text-[#087443]" />
            <span>Explore African Nations</span>
          </div>
          <Link
            href="/discover"
            className="text-[11px] font-bold text-[#087443] dark:text-[#0e9357] hover:underline"
          >
            See All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {featuredCountries.map((country) => (
            <Link
              key={country.code}
              href={`/discover/${country.code.toLowerCase()}`}
              className="p-2.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 hover:border-[#087443] bg-neutral-50/50 dark:bg-neutral-800/40 hover:bg-white dark:hover:bg-neutral-800 transition flex items-center gap-2 group"
            >
              <span className="text-xl">{country.flag}</span>
              <div className="truncate">
                <p className="font-bold text-xs text-neutral-900 dark:text-white group-hover:text-[#087443] transition truncate">
                  {country.name}
                </p>
                <p className="text-[10px] text-neutral-400">{country.region.split(' ')[0]}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Suggested Creators & Changemakers */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white font-sora">
            <Sparkles className="w-4 h-4 text-[#D9A441]" />
            <span>Connect Across Borders</span>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {suggestedUsers.map((user) => {
            const following = isFollowing(user.id);
            return (
              <div key={user.id} className="flex items-center justify-between gap-2">
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-2.5 min-w-0 group"
                >
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.fullName}
                    size="sm"
                    countryFlag={user.countryCode === 'NG' ? '🇳🇬' : user.countryCode === 'KE' ? '🇰🇪' : '🇿🇼'}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-neutral-900 dark:text-white group-hover:text-[#087443] transition truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                </Link>

                <Button
                  size="sm"
                  variant={following ? 'outline' : 'secondary'}
                  onClick={() => toggleFollow(user.id)}
                  className="text-[11px] px-2.5 py-1 font-bold flex-shrink-0"
                >
                  {following ? 'Following' : 'Follow'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Pan-African Topics */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white font-sora">
          <TrendingUp className="w-4 h-4 text-[#087443]" />
          <span>Trending in Africa</span>
        </div>

        <div className="space-y-2.5 pt-1 text-xs">
          <div>
            <p className="text-[10px] text-neutral-400 font-semibold uppercase">Business & Trade • Trending</p>
            <p className="font-bold text-neutral-800 dark:text-neutral-200 hover:text-[#087443] cursor-pointer">
              #AfCFTA Instant Settlements
            </p>
            <p className="text-[10px] text-neutral-400">14.8k posts</p>
          </div>

          <div>
            <p className="text-[10px] text-neutral-400 font-semibold uppercase">Music • Continental Pulse</p>
            <p className="font-bold text-neutral-800 dark:text-neutral-200 hover:text-[#087443] cursor-pointer">
              #AmapianoMeetsAfrobeats
            </p>
            <p className="text-[10px] text-neutral-400">32.1k posts</p>
          </div>

          <div>
            <p className="text-[10px] text-neutral-400 font-semibold uppercase">Tech & Climate • East Africa</p>
            <p className="font-bold text-neutral-800 dark:text-neutral-200 hover:text-[#087443] cursor-pointer">
              #SiliconSavannah
            </p>
            <p className="text-[10px] text-neutral-400">8.2k posts</p>
          </div>
        </div>
      </div>

      <div className="px-2 text-[11px] text-neutral-400 leading-normal">
        <p>© 2026 AfriLink Technologies. Built for Africans across 54 sovereign nations & the global diaspora.</p>
      </div>
    </aside>
  );
};
