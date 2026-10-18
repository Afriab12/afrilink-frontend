'use client';

import { useEffect, useSyncExternalStore, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/stores/authContext';
import {
  KeyboardSequenceParser,
  isEditableElement,
  ShortcutAction,
} from '@/lib/keyboard-shortcuts';
import { toggleSearch, closeSearch, useSearchModal } from '@/hooks/use-search';

// External store for shortcuts modal visibility
let shortcutsModalOpen = false;
const modalListeners = new Set<() => void>();

function notifyModalListeners() {
  modalListeners.forEach((listener) => listener());
}

export function openShortcutsModal() {
  shortcutsModalOpen = true;
  notifyModalListeners();
}

export function closeShortcutsModal() {
  shortcutsModalOpen = false;
  notifyModalListeners();
}

export function toggleShortcutsModal() {
  shortcutsModalOpen = !shortcutsModalOpen;
  notifyModalListeners();
}

export function isShortcutsModalOpen(): boolean {
  return shortcutsModalOpen;
}

function subscribeShortcutsModal(listener: () => void) {
  modalListeners.add(listener);
  return () => {
    modalListeners.delete(listener);
  };
}

function getShortcutsModalSnapshot(): boolean {
  return shortcutsModalOpen;
}

/**
 * Hook to access and control the keyboard shortcuts reference modal.
 */
export function useShortcutsModal() {
  const isOpen = useSyncExternalStore(
    subscribeShortcutsModal,
    getShortcutsModalSnapshot,
    getShortcutsModalSnapshot
  );

  return {
    isOpen,
    open: useCallback(() => openShortcutsModal(), []),
    close: useCallback(() => closeShortcutsModal(), []),
    toggle: useCallback(() => toggleShortcutsModal(), []),
  };
}

/**
 * Global keyboard shortcuts hook mounted in the root layout / AppShell.
 * Handles desktop power-user navigation and actions:
 * - Cmd/Ctrl+K: Search overlay
 * - Cmd/Ctrl+N: New post composer
 * - Cmd/Ctrl+M: /messages
 * - Cmd/Ctrl+,: /settings
 * - Escape: Close top modal/overlay
 * - G then H: Home feed
 * - G then P: Profile
 * - G then D: Discover countries
 * - G then C: Communities
 * - ?: Shortcut reference modal
 */
export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const parserRef = useRef<KeyboardSequenceParser | null>(null);

  if (!parserRef.current) {
    parserRef.current = new KeyboardSequenceParser(1000);
  }

  useEffect(() => {
    const parser = parserRef.current!;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isEditable = isEditableElement(event.target as HTMLElement | null);
      const result = parser.parse(event, isEditable);

      if (!result.matched || !result.action) {
        return;
      }

      if (result.shouldPreventDefault) {
        event.preventDefault();
      }

      const action: ShortcutAction = result.action;

      switch (action) {
        case 'search':
          toggleSearch();
          break;

        case 'new_post': {
          // If not on home page, navigate to home and focus post composer
          if (pathname !== '/') {
            router.push('/');
          }
          setTimeout(() => {
            const textarea =
              (document.getElementById('post-composer-textarea') as HTMLTextAreaElement | null) ||
              (document.querySelector('textarea') as HTMLTextAreaElement | null);
            if (textarea) {
              textarea.focus();
              textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
          break;
        }

        case 'messages':
          router.push('/messages');
          break;

        case 'settings':
          router.push('/settings');
          break;

        case 'close_modal': {
          // Priority order for closing overlays
          if (shortcutsModalOpen) {
            closeShortcutsModal();
          } else {
            closeSearch();
            if (isEditable && event.target instanceof HTMLElement) {
              event.target.blur();
            }
          }
          break;
        }

        case 'open_shortcuts_modal':
          toggleShortcutsModal();
          break;

        case 'go_home':
          router.push('/');
          break;

        case 'go_profile': {
          const profilePath = currentUser?.username
            ? `/profile/${currentUser.username}`
            : '/profile';
          router.push(profilePath);
          break;
        }

        case 'go_discover':
          router.push('/discover');
          break;

        case 'go_communities':
          router.push('/communities');
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, pathname, currentUser]);
}
