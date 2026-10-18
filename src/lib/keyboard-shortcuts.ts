/**
 * AfriLink Global Keyboard Shortcuts & Sequence Parser
 * Phase 3D: Desktop Power-User Shortcuts & Reference Modal System
 */

export interface KeyEventLike {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

export type ShortcutAction =
  | 'search'
  | 'new_post'
  | 'messages'
  | 'settings'
  | 'close_modal'
  | 'go_home'
  | 'go_profile'
  | 'go_discover'
  | 'go_communities'
  | 'open_shortcuts_modal';

export interface SequenceParseResult {
  action?: ShortcutAction;
  matched: boolean;
  pendingSequence?: string | null;
  shouldPreventDefault?: boolean;
}

export interface ShortcutDefinition {
  id: ShortcutAction;
  category: 'Navigation' | 'Actions & Search';
  title: string;
  keys: string[];
  displayKeys: string[];
  separator?: string;
}

export const GLOBAL_SHORTCUTS: ShortcutDefinition[] = [
  // Actions & Search
  {
    id: 'search',
    category: 'Actions & Search',
    title: 'Search AfriLink',
    keys: ['Cmd/Ctrl', 'K'],
    displayKeys: ['⌘/Ctrl', 'K'],
    separator: '+',
  },
  {
    id: 'new_post',
    category: 'Actions & Search',
    title: 'New Post Composer',
    keys: ['Cmd/Ctrl', 'N'],
    displayKeys: ['⌘/Ctrl', 'N'],
    separator: '+',
  },
  {
    id: 'open_shortcuts_modal',
    category: 'Actions & Search',
    title: 'Keyboard Shortcuts Reference',
    keys: ['?'],
    displayKeys: ['?'],
  },
  {
    id: 'close_modal',
    category: 'Actions & Search',
    title: 'Close Modal / Dismiss',
    keys: ['Esc'],
    displayKeys: ['Esc'],
  },
  // Navigation
  {
    id: 'go_home',
    category: 'Navigation',
    title: 'Go to Home Feed',
    keys: ['G', 'H'],
    displayKeys: ['G', 'H'],
    separator: 'then',
  },
  {
    id: 'go_profile',
    category: 'Navigation',
    title: 'Go to Profile',
    keys: ['G', 'P'],
    displayKeys: ['G', 'P'],
    separator: 'then',
  },
  {
    id: 'go_discover',
    category: 'Navigation',
    title: 'Go to Discover Countries',
    keys: ['G', 'D'],
    displayKeys: ['G', 'D'],
    separator: 'then',
  },
  {
    id: 'go_communities',
    category: 'Navigation',
    title: 'Go to Communities',
    keys: ['G', 'C'],
    displayKeys: ['G', 'C'],
    separator: 'then',
  },
  {
    id: 'messages',
    category: 'Navigation',
    title: 'Go to Direct Messages',
    keys: ['Cmd/Ctrl', 'M'],
    displayKeys: ['⌘/Ctrl', 'M'],
    separator: '+',
  },
  {
    id: 'settings',
    category: 'Navigation',
    title: 'Go to Settings',
    keys: ['Cmd/Ctrl', ','],
    displayKeys: ['⌘/Ctrl', ','],
    separator: '+',
  },
];

/**
 * Checks if the event target is an interactive text input/textarea/contenteditable.
 * Power-user shortcuts must be ignored when typing, except for Escape.
 */
export function isEditableElement(
  target: { tagName?: string; isContentEditable?: boolean } | null | undefined
): boolean {
  if (!target) return false;
  const tag = target.tagName ? target.tagName.toLowerCase() : '';
  if (tag === 'input' || tag === 'textarea' || tag === 'select') {
    return true;
  }
  if (target.isContentEditable) {
    return true;
  }
  return false;
}

/**
 * Pure stateful Keyboard Sequence Parser
 * Handles combination shortcuts (Cmd/Ctrl+Key) and sequential chains (G then H/P/D/C).
 * Enforces strict timeout on multi-key sequences and respects editable focus bounds.
 */
export class KeyboardSequenceParser {
  private buffer: string | null = null;
  private timestamp: number = 0;
  public readonly timeoutMs: number;

  constructor(timeoutMs = 1000) {
    this.timeoutMs = timeoutMs;
  }

  public reset(): void {
    this.buffer = null;
    this.timestamp = 0;
  }

  public getPendingSequence(): string | null {
    return this.buffer;
  }

  public parse(
    event: KeyEventLike,
    isEditable = false,
    now: number = Date.now()
  ): SequenceParseResult {
    const key = event.key;
    const isModifier = Boolean(event.metaKey || event.ctrlKey);

    // 1. When in input/textarea/contenteditable, ONLY allow Escape
    if (isEditable) {
      if (key === 'Escape') {
        this.reset();
        return {
          action: 'close_modal',
          matched: true,
          shouldPreventDefault: true,
        };
      }
      return { matched: false };
    }

    // 2. Escape closes topmost overlay/modal
    if (key === 'Escape') {
      this.reset();
      return {
        action: 'close_modal',
        matched: true,
        shouldPreventDefault: true,
      };
    }

    // 3. Modifier combinations: Cmd/Ctrl + [K, N, M, ,]
    if (isModifier) {
      this.reset();
      const lowerKey = key.toLowerCase();

      if (lowerKey === 'k') {
        return { action: 'search', matched: true, shouldPreventDefault: true };
      }
      if (lowerKey === 'n') {
        return { action: 'new_post', matched: true, shouldPreventDefault: true };
      }
      if (lowerKey === 'm') {
        return { action: 'messages', matched: true, shouldPreventDefault: true };
      }
      if (key === ',') {
        return { action: 'settings', matched: true, shouldPreventDefault: true };
      }
      return { matched: false };
    }

    // 4. Help / Reference modal trigger: ? (or Shift + /)
    if (key === '?' || (key === '/' && event.shiftKey)) {
      this.reset();
      return {
        action: 'open_shortcuts_modal',
        matched: true,
        shouldPreventDefault: true,
      };
    }

    // 5. Sequence handling: G then [H, P, D, C]
    const lowerKey = key.toLowerCase();

    if (this.buffer === 'g') {
      const elapsed = now - this.timestamp;

      if (elapsed > this.timeoutMs) {
        // Timeout expired, reset buffer
        this.reset();
        if (lowerKey === 'g') {
          this.buffer = 'g';
          this.timestamp = now;
          return { matched: false, pendingSequence: 'g' };
        }
        return { matched: false };
      }

      // Within timeout window, check next key in sequence
      this.reset();

      if (lowerKey === 'h') {
        return { action: 'go_home', matched: true, shouldPreventDefault: true };
      }
      if (lowerKey === 'p') {
        return { action: 'go_profile', matched: true, shouldPreventDefault: true };
      }
      if (lowerKey === 'd') {
        return { action: 'go_discover', matched: true, shouldPreventDefault: true };
      }
      if (lowerKey === 'c') {
        return { action: 'go_communities', matched: true, shouldPreventDefault: true };
      }
      if (lowerKey === 'g') {
        // Restart sequence with G
        this.buffer = 'g';
        this.timestamp = now;
        return { matched: false, pendingSequence: 'g' };
      }

      return { matched: false };
    }

    // Start sequence with G
    if (lowerKey === 'g' && !event.altKey) {
      this.buffer = 'g';
      this.timestamp = now;
      return { matched: false, pendingSequence: 'g' };
    }

    return { matched: false };
  }
}
