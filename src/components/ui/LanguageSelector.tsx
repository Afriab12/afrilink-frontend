'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_AFRICAN_LANGUAGES } from '@/services/languageService';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (languageCode: string) => void;
  label?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

const ISO_COUNTRY_MAP: Record<string, string> = {
  en: 'AF',
  yo: 'NG',
  ha: 'NG',
  ig: 'NG',
  sw: 'KE',
  am: 'ET',
  zu: 'ZA',
  xh: 'ZA',
  om: 'ET',
  so: 'SO',
  sn: 'ZW',
  ln: 'CD',
  wo: 'SN',
  ak: 'GH',
  ar: 'EG',
  fr: 'SN',
  pt: 'AO',
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  label,
  id,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLanguage =
    SUPPORTED_AFRICAN_LANGUAGES.find((l) => l.code === value) ||
    SUPPORTED_AFRICAN_LANGUAGES.find((l) => l.code === 'en') ||
    SUPPORTED_AFRICAN_LANGUAGES[0];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Group languages by region
  const groupedLanguages = SUPPORTED_AFRICAN_LANGUAGES.reduce<Record<string, typeof SUPPORTED_AFRICAN_LANGUAGES>>(
    (acc, lang) => {
      const region = lang.region || 'Pan-African';
      if (!acc[region]) acc[region] = [];
      acc[region].push(lang);
      return acc;
    },
    {}
  );

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label
          htmlFor={id}
          className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500 dark:text-white/35 mb-2 block"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="h-11 w-full px-4 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white flex items-center justify-between gap-3 text-left focus:outline-none focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Globe className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
            <span className="truncate font-medium">
              {selectedLanguage ? `${selectedLanguage.name} — ${selectedLanguage.nativeName}` : 'Select Language'}
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            strokeWidth={1.75}
          />
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div
            role="listbox"
            className="absolute left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-xl bg-white dark:bg-[#1C3226] border border-slate-200 dark:border-white/10 shadow-xl py-1 z-50 select-none animate-in fade-in zoom-in-95 duration-100"
          >
            {Object.entries(groupedLanguages).map(([region, languages]) => (
              <div key={region}>
                {/* Region Sticky Header */}
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30 px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] sticky top-0 z-10">
                  {region}
                </div>

                {/* Language Item Rows */}
                {languages.map((lang) => {
                  const isSelected = lang.code === selectedLanguage?.code;
                  const isoChip = ISO_COUNTRY_MAP[lang.code] || lang.code.toUpperCase();

                  return (
                    <div
                      key={lang.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(lang.code);
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium'
                          : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white'
                      }`}
                    >
                      {/* ISO Chip */}
                      <span className="h-6 min-w-[28px] px-1.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-bold tracking-wide text-slate-600 dark:text-white/70 flex items-center justify-center shrink-0">
                        {isoChip}
                      </span>

                      {/* Native name — English name */}
                      <span className="text-sm font-medium truncate">
                        {lang.name} — {lang.nativeName}
                      </span>

                      {/* Region Meta */}
                      <span className="text-[11px] text-slate-400 dark:text-white/35 ml-auto shrink-0 whitespace-nowrap">
                        {lang.region || 'Pan-African'}
                      </span>

                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5" strokeWidth={2} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;
