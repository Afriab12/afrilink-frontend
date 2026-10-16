'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboardView } from '@/features/admin/AdminDashboardView';
import { useAuth } from '@/stores/authContext';
import { adminService } from '@/services/adminService';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || !adminService.hasAdminAccess(currentUser)) {
        router.replace('/');
      }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#087443] animate-spin" />
      </div>
    );
  }

  if (!currentUser || !adminService.hasAdminAccess(currentUser)) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 text-center border border-neutral-200 dark:border-neutral-800 shadow-sm max-w-md mx-auto my-12 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-sora">
          Access Restricted
        </h2>
        <p className="text-xs text-neutral-500">
          This command center requires verified administrative or moderation credentials. Redirecting to home feed...
        </p>
      </div>
    );
  }

  return <AdminDashboardView />;
}
