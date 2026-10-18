'use client';

import React, { useEffect, useRef } from 'react';
import { X, Keyboard, Compass, Zap } from 'lucide-react';
import { useSafeMotion } from '@/lib/animations';
import { ShortcutHint } from '@/components/ui/shortcut-hint';
import { GLOBAL_SHORTCUTS, ShortcutDefinition } from '@/lib/keyboard-shortcuts';
import { useShortcutsModal } from '@/hooks/use-keyboard-shortcuts';

export interface KeyboardShortcutsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const store = useShortcutsModal();
  const isOpen = propIsOpen !== undefined ? propIsOpen : store.isOpen;
  const onClose = propOnClose ?? store.close;

  const { prefersReduced } = useSafeMotion();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const navigationShortcuts = GLOBAL_SHORTCUTS.filter(
    (s) => s.category === 'Navigation'
  );
  const actionShortcuts = GLOBAL_SHORTCUTS.filter(
    (s) => s.category === 'Actions & Search'
  );

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl bg-surface-4 border border-white/[0.08] rounded-2xl shadow-2xl p-6 sm:p-7 text-white/90 ${
          prefersReduced
            ? ''
            : 'animate-in fade-in zoom-in-95 duration-200 ease-out'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-emerald-400">
              <Keyboard className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2
                id="shortcuts-modal-title"
                className="text-base sm:text-lg font-bold font-sora text-white/90"
              >
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-white/40">
                Pan-African platform navigation for power users
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close keyboard shortcuts modal"
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* 2-Column List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
          {/* Column 1: Navigation */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-3">
              <Compass className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.75} />
              <span>Navigation</span>
            </div>

            <div className="space-y-2">
              {navigationShortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.04]"
                >
                  <span className="text-xs text-white/70 font-medium">
                    {shortcut.title}
                  </span>
                  <ShortcutHint
                    keys={shortcut.displayKeys}
                    separator={shortcut.separator}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Actions & Search */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 mb-3">
              <Zap className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.75} />
              <span>Actions & Overlays</span>
            </div>

            <div className="space-y-2">
              {actionShortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.04]"
                >
                  <span className="text-xs text-white/70 font-medium">
                    {shortcut.title}
                  </span>
                  <ShortcutHint
                    keys={shortcut.displayKeys}
                    separator={shortcut.separator}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/30">
          <span>
            Press <kbd className="px-1 py-0.5 rounded bg-white/[0.06] font-mono text-[10px] text-white/50">?</kbd> anywhere to open this modal
          </span>
          <span>
            Press <kbd className="px-1 py-0.5 rounded bg-white/[0.06] font-mono text-[10px] text-white/50">Esc</kbd> to dismiss
          </span>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
