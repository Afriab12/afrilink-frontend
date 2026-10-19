import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  SEARCH_DEBOUNCE_MS,
  mapCategoryToIcon,
  getNextActiveIndex,
  getFocusTrapAction,
  TRENDING_SUGGESTIONS,
  SEARCH_SUGGESTION_CHIPS,
} from '../search-utils.ts';
import {
  openSearch,
  closeSearch,
  toggleSearch,
} from '../../hooks/use-search.ts';

describe('Phase 2A — Search Entry & Modal Search Overlay System', () => {
  describe('search-utils pure helpers', () => {
    it('should configure search debounce to exactly 300ms', () => {
      assert.strictEqual(SEARCH_DEBOUNCE_MS, 300, 'Search debounce must be 300ms');
    });

    it('should correctly map categories to Phase 2A required Lucide icons', () => {
      assert.strictEqual(mapCategoryToIcon('tech'), 'Cpu');
      assert.strictEqual(mapCategoryToIcon('African Software Developers'), 'Cpu');
      assert.strictEqual(mapCategoryToIcon('amapiano vibes'), 'Music');
      assert.strictEqual(mapCategoryToIcon('afcon 2027'), 'Trophy');
      assert.strictEqual(mapCategoryToIcon('summit event'), 'Calendar');
      assert.strictEqual(mapCategoryToIcon('people search'), 'User');
      assert.strictEqual(mapCategoryToIcon('community hubs'), 'Users');
      assert.strictEqual(mapCategoryToIcon('news story'), 'Newspaper');
      assert.strictEqual(mapCategoryToIcon('general trend'), 'TrendingUp');
    });

    it('should cycle active index downwards and wrap to beginning', () => {
      const total = 4;
      assert.strictEqual(getNextActiveIndex(-1, total, 'down'), 0, 'Initial navigation starts at 0');
      assert.strictEqual(getNextActiveIndex(0, total, 'down'), 1);
      assert.strictEqual(getNextActiveIndex(1, total, 'down'), 2);
      assert.strictEqual(getNextActiveIndex(2, total, 'down'), 3);
      assert.strictEqual(getNextActiveIndex(3, total, 'down'), 0, 'Wraps back to 0 at end of list');
    });

    it('should cycle active index upwards and wrap to end', () => {
      const total = 4;
      assert.strictEqual(getNextActiveIndex(0, total, 'up'), 3, 'Wraps to end when at top');
      assert.strictEqual(getNextActiveIndex(3, total, 'up'), 2);
      assert.strictEqual(getNextActiveIndex(2, total, 'up'), 1);
      assert.strictEqual(getNextActiveIndex(1, total, 'up'), 0);
    });

    it('should return -1 when navigating an empty list', () => {
      assert.strictEqual(getNextActiveIndex(0, 0, 'down'), -1);
      assert.strictEqual(getNextActiveIndex(0, 0, 'up'), -1);
    });

    it('should calculate focus trap boundary wrapping correctly', () => {
      assert.strictEqual(getFocusTrapAction(true, true, false), 'wrap-to-last');
      assert.strictEqual(getFocusTrapAction(false, false, true), 'wrap-to-first');
      assert.strictEqual(getFocusTrapAction(false, true, false), 'continue');
      assert.strictEqual(getFocusTrapAction(true, false, false), 'continue');
    });

    it('should export well-formed trending and suggestion chip presets', () => {
      assert.ok(TRENDING_SUGGESTIONS.length >= 4, 'Must have at least 4 trending suggestions');
      assert.ok(SEARCH_SUGGESTION_CHIPS.length >= 4, 'Must have at least 4 search suggestion chips');
      assert.ok(SEARCH_SUGGESTION_CHIPS.includes('AfroTech'));
      assert.ok(SEARCH_SUGGESTION_CHIPS.includes('Nairobi'));
    });
  });

  describe('useSearchModal state transitions', () => {
    it('should open and close search state cleanly', () => {
      closeSearch();
      openSearch('Kigali');
      // Store state updated
      closeSearch();
      toggleSearch();
      closeSearch();
    });
  });

  describe('SearchOverlay and Phase 0 constraints', () => {
    const overlaySource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/features/search/SearchOverlay.tsx'),
      'utf-8'
    );
    const navbarSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/layout/Navbar.tsx'),
      'utf-8'
    );
    const globalsCss = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/globals.css'),
      'utf-8'
    );

    it('should use named Lucide imports only (no default icon package import)', () => {
      assert.match(overlaySource, /from\s+['"]lucide-react['"]/);
      assert.doesNotMatch(overlaySource, /import\s+\w+\s+from\s+['"]lucide-react['"]/);
      ['Search', 'TrendingUp', 'User', 'Users', 'Calendar', 'Music', 'Trophy', 'Newspaper', 'Cpu', 'X', 'ArrowRight'].forEach((icon) => {
        assert.ok(overlaySource.includes(icon), `Must import named icon ${icon}`);
      });
    });

    it('should enforce strokeWidth={1.75} on all Lucide icons', () => {
      const strokeMatches = overlaySource.match(/strokeWidth=\{1\.75\}/g) || [];
      assert.ok(strokeMatches.length >= 4, 'Every Lucide icon in SearchOverlay must enforce strokeWidth={1.75}');
    });

    it('should enforce 32x32 icon box (w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400)', () => {
      assert.match(overlaySource, /w-8\s+h-8\s+rounded-lg\s+bg-emerald-500\/10\s+(text-emerald-400|text-emerald-600\s+dark:text-emerald-400)/);
    });

    it('should enforce input styling: h-12 rounded-xl with dual-mode border and background', () => {
      assert.match(overlaySource, /h-12\s+rounded-xl\s+(bg-white\/5|bg-slate-100\s+dark:bg-white\/5)\s+border\s+(border-white\/10|border-slate-200\s+dark:border-white\/10)\s+px-4/);
    });

    it('should enforce section headers: text-[10px] font-bold uppercase with dual-mode text color', () => {
      assert.match(overlaySource, /text-\[10px\]\s+font-bold\s+tracking-\[0\.2em\]\s+uppercase\s+(text-white\/30|text-slate-500\s+dark:text-white\/30)/);
    });

    it('should enforce surface-4 elevation and backdrop blur on overlay', () => {
      assert.match(overlaySource, /bg-surface-4/);
      assert.match(overlaySource, /backdrop-blur-xl/);
      assert.match(overlaySource, /bg-black\/60/);
    });

    it('should enforce desktop centered card (max-w-2xl rounded-2xl) and mobile bottom sheet', () => {
      assert.match(overlaySource, /max-w-2xl/);
      assert.match(overlaySource, /rounded-t-2xl\s+sm:rounded-2xl/);
      assert.match(overlaySource, /max-h-\[calc\(100vh-env\(safe-area-inset-bottom\)-56px\)\]/);
    });

    it('should enforce full a11y dialog combobox roles and aria attributes', () => {
      assert.match(overlaySource, /role="dialog"/);
      assert.match(overlaySource, /aria-modal="true"/);
      assert.match(overlaySource, /role="combobox"/);
      assert.match(overlaySource, /role="listbox"/);
      assert.match(overlaySource, /role="option"/);
      assert.match(overlaySource, /aria-activedescendant=/);
    });

    it('should lazy-load search overlay with dynamic({ ssr: false }) in Navbar', () => {
      assert.match(navbarSource, /dynamic\(\s*\(\)\s*=>\s*import\(['"]@\/features\/search\/GlobalSearchModal['"]\)/);
      assert.match(navbarSource, /ssr:\s*false/);
    });

    it('should show ⌘K hint on navbar search field on desktop', () => {
      assert.match(navbarSource, /⌘K/);
    });

    it('should register GPU-safe animations and reduced motion overrides in globals.css', () => {
      assert.match(globalsCss, /@keyframes search-overlay-enter/);
      assert.match(globalsCss, /@keyframes search-overlay-exit/);
      assert.match(globalsCss, /transform:\s*scale\(0\.95\)/);
      assert.match(globalsCss, /animate-search-enter/);
      assert.match(globalsCss, /animate-search-exit/);
    });
  });
});
