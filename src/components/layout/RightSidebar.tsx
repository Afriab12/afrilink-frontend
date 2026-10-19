'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, TrendingUp, ChevronRight } from 'lucide-react';
import { INITIAL_USERS } from '@/services/mockBackend';
import { AFRICAN_COUNTRIES } from '@/utils/countryData';
import { useSocial } from '@/stores/socialContext';
import { useAuth } from '@/stores/authContext';
import { toast } from '@/components/ui/toast';
import { ConnectRowSkeleton, useMinimumLoading } from '@/components/ui/skeleton';
import { ConnectRow } from '@/features/connect/ConnectRow';
import { User } from '@/types';

export const RightSidebar: React.FC<{ isLoading?: boolean }> = ({ isLoading = false }) => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { isFollowing, toggleFollow } = useSocial();
  const isMinimumLoading = useMinimumLoading(isLoading, 300);

  if (pathname?.startsWith('/messages')) {
    return null;
  }

  const suggestedUsers = INITIAL_USERS.filter((u) => u.id !== currentUser?.id).slice(0, 3);
  const featuredCountries = AFRICAN_COUNTRIES.slice(0, 4);

  const handleToggleFollow = async (user: User) => {
    const currentlyFollowing = isFollowing(user.id);
    try {
      toggleFollow(user.id);
      if (!currentlyFollowing) {
        toast.success(`Following @${user.username}`, `You are now connected with ${user.fullName}`);
      } else {
        toast.info(`Unfollowed @${user.username}`, `You unfollowed ${user.fullName}`);
      }
    } catch {
      toast.error('Network Error', 'Could not update connection status');
    }
  };

  return (
    <aside className="hidden xl:flex flex-col w-80 sticky top-20 h-[calc(100vh-80px)] pb-6 space-y-4 select-none">
      {/* SECTION: Connect Across Borders */}
      <div className="rounded-2xl p-4 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] shadow-sm">
        <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-slate-500 dark:text-white/30 mb-4">
          CONNECT ACROSS BORDERS
        </h2>

        <div className="space-y-1">
          {isMinimumLoading ? (
            <>
              <ConnectRowSkeleton />
              <ConnectRowSkeleton />
              <ConnectRowSkeleton />
            </>
          ) : (
            suggestedUsers.map((user, idx) => (
              <ConnectRow
                key={user.id}
                user={user}
                index={idx}
                isFollowing={isFollowing(user.id)}
                onToggleFollow={handleToggleFollow}
              />
            ))
          )}
        </div>

        {/* Footer: "See more" text-xs text-emerald-600 dark:text-emerald-400 with ChevronRight h-3 w-3 */}
        <Link
          href="/discover"
          className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
        >
          <span>See more</span>
          <ChevronRight className="h-3 w-3" strokeWidth={1.75} />
        </Link>
      </div>

      {/* Explore Africa Widget (Zero flag assets, typographic ISO codes) */}
      <div className="rounded-2xl p-4 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold tracking-[0.15em] uppercase text-slate-500 dark:text-white/30">
            <Compass className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
            <span>EXPLORE NATIONS</span>
          </div>
          <Link
            href="/discover"
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
          >
            All 54
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {featuredCountries.map((country) => (
            <Link
              key={country.code}
              href={`/discover/${country.code.toLowerCase()}`}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.06] hover:border-emerald-500/40 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:-translate-y-[1px] transition-all duration-200 flex items-center gap-2.5 group"
            >
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {country.code}
                </span>
              </div>
              <div className="truncate">
                <p className="font-semibold text-xs text-slate-900 dark:text-white/90 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                  {country.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-white/40">{country.region.split(' ')[0]}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Pan-African Topics */}
      <div className="rounded-2xl p-4 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold tracking-[0.15em] uppercase text-slate-500 dark:text-white/30">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
          <span>TRENDING IN AFRICA</span>
        </div>

        <div className="space-y-2 pt-1 text-xs">
          <div>
            <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase font-semibold">Trade & Growth</p>
            <p className="font-semibold text-slate-900 dark:text-white/90 hover:text-emerald-600 dark:group-hover:text-emerald-400 cursor-pointer transition-colors">
              #AfCFTA Instant Settlements
            </p>
            <p className="text-[10px] text-slate-400 dark:text-white/30">14.8k posts</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase font-semibold">Music & Culture</p>
            <p className="font-semibold text-slate-900 dark:text-white/90 hover:text-emerald-600 dark:group-hover:text-emerald-400 cursor-pointer transition-colors">
              #AmapianoMeetsAfrobeats
            </p>
            <p className="text-[10px] text-slate-400 dark:text-white/30">32.1k posts</p>
          </div>

          <div>
            <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase font-semibold">Innovation</p>
            <p className="font-semibold text-slate-900 dark:text-white/90 hover:text-emerald-600 dark:group-hover:text-emerald-400 cursor-pointer transition-colors">
              #SiliconSavannah
            </p>
            <p className="text-[10px] text-slate-400 dark:text-white/30">8.2k posts</p>
          </div>
        </div>
      </div>

      <div className="px-2 text-[10px] text-slate-400 dark:text-white/20 leading-relaxed">
        <p>© 2026 AfriLink Technologies. Connecting 54 sovereign African nations and the diaspora.</p>
      </div>
    </aside>
  );
};
