'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { MobileNav } from './MobileNav';
import { useSearchKeyboardShortcut } from '@/hooks/use-search';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  useSearchKeyboardShortcut();

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/reset-password' ||
    pathname === '/onboarding';

  const isMessagesRoute = pathname?.startsWith('/messages');

  if (isAuthRoute) {
    return (
      <main className="min-h-screen bg-[#F5F7F6] dark:bg-surface-0 dark:text-white/90 flex flex-col justify-center py-10 px-4 transition-colors duration-200">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6] dark:bg-surface-0 dark:text-white/90 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <div
        className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-20 lg:pb-10 flex gap-6 ${
          isMessagesRoute ? 'max-w-full' : 'max-w-7xl'
        }`}
      >
        {/* Left Nav Sidebar */}
        <Sidebar />

        {/* Center Main Stream */}
        <main
          className={`flex-1 min-w-0 w-full ${
            isMessagesRoute ? 'max-w-full' : 'max-w-2xl mx-auto lg:mx-0'
          }`}
        >
          {children}
        </main>

        {/* Right Discovery Sidebar (hidden on messages routes) */}
        {!isMessagesRoute && <RightSidebar />}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};
