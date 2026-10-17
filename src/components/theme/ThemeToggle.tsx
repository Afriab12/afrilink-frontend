'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  className = '',
}) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={
          showLabel
            ? `w-full h-11 rounded-2xl bg-neutral-100 dark:bg-surface-1 animate-pulse ${className}`
            : `w-9 h-9 rounded-full bg-neutral-100 dark:bg-surface-2 animate-pulse ${className}`
        }
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (!showLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-surface-3 transition-all duration-200 text-neutral-600 dark:text-white/60 ${className}`}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to Afro-Futurist dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to Afro-Futurist dark mode'}
      >
        <span className="sr-only">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
        {isDark ? (
          <Sun className="h-5 w-5 text-[#D9A441] transition-transform duration-200" strokeWidth={1.75} />
        ) : (
          <Moon className="h-5 w-5 text-[#087443] transition-transform duration-200" strokeWidth={1.75} />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-neutral-700 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-surface-3 hover:text-neutral-900 dark:hover:text-white/90 transition-all duration-200 group ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to Afro-Futurist dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to Afro-Futurist dark mode'}
    >
      <div className="relative h-5 w-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="h-5 w-5 text-[#D9A441] transition-transform duration-200 group-hover:rotate-45" strokeWidth={1.75} />
        ) : (
          <Moon className="h-5 w-5 text-[#087443] transition-transform duration-200 group-hover:-rotate-12" strokeWidth={1.75} />
        )}
      </div>

      <span className="font-sora">
        {isDark ? 'Afro-Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
};
