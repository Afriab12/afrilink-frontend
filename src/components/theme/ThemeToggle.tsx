'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  className = '',
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-2xl transition-all duration-200 flex items-center gap-2 group ${
        isDark
          ? 'bg-[#111D16] text-[#D9A441] hover:bg-[#16241C] border border-[#1F3327]'
          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-transparent'
      } ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to Afro-Futurist dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to Afro-Futurist dark mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-[#D9A441] transition-transform duration-300 group-hover:rotate-90" />
        ) : (
          <Moon className="w-4 h-4 text-[#087443] transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold font-sora">
          {isDark ? 'Afro-Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};
