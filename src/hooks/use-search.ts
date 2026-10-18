'use client';

import { useEffect, useSyncExternalStore, useCallback } from 'react';

interface SearchState {
  isOpen: boolean;
  initialQuery?: string;
}

let searchState: SearchState = {
  isOpen: false,
  initialQuery: '',
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function openSearch(query?: string) {
  searchState = {
    isOpen: true,
    initialQuery: query || '',
  };
  notify();
}

export function closeSearch() {
  searchState = {
    isOpen: false,
    initialQuery: '',
  };
  notify();
}

export function toggleSearch() {
  searchState = {
    isOpen: !searchState.isOpen,
    initialQuery: '',
  };
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): SearchState {
  return searchState;
}

/**
 * Hook to read and control the global search overlay state.
 */
export function useSearchModal() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    isOpen: state.isOpen,
    initialQuery: state.initialQuery,
    openSearch: useCallback((query?: string) => openSearch(query), []),
    closeSearch: useCallback(() => closeSearch(), []),
    toggleSearch: useCallback(() => toggleSearch(), []),
  };
}

/**
 * Registers global Cmd/Ctrl+K keyboard shortcut to toggle search overlay.
 */
export function useSearchKeyboardShortcut() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+K (macOS) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggleSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
