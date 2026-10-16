'use client';

import React from 'react';
import { SUPPORTED_AFRICAN_LANGUAGES } from '@/services/languageService';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (languageCode: string) => void;
  label?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  label,
  id,
  className = '',
  disabled = false,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 font-sora"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <Globe className="w-4 h-4 text-[#087443]" />
        </div>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs sm:text-sm text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#087443] focus:border-transparent transition appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
        >
          {SUPPORTED_AFRICAN_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="py-1">
              {lang.flag} {lang.name} — {lang.nativeName} ({lang.region || 'Africa'})
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
