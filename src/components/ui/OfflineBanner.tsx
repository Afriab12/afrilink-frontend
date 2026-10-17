'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  useEffect(() => {
    // Set initial status on client
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      const timer = setTimeout(() => {
        setShowReconnectedToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnectedToast) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300 animate-in slide-in-from-top"
    >
      {!isOnline ? (
        <div className="bg-surface-5 border-b border-white/[0.08] text-white/90 px-4 py-2 text-xs font-medium flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <WifiOff className="w-4 h-4 text-[#D9A441]" strokeWidth={1.75} />
            <span>
              <strong className="text-[#D9A441]">Offline Resilience Mode:</strong> Browsing cached African feeds and conversations. Live updates will resume automatically.
            </span>
          </div>
        </div>
      ) : showReconnectedToast ? (
        <div className="bg-[#087443] text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg">
          <Wifi className="w-4 h-4 text-emerald-200" strokeWidth={1.75} />
          <span>Connected to African network. Live data synchronized.</span>
        </div>
      ) : null}
    </div>
  );
};
