import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Prompt 20 — Search Overlay Dual-Mode Contrast, Mobile Nav Bar & Feed Filters Mobile Alignment', () => {
  const searchOverlayPath = path.resolve(process.cwd(), 'src/features/search/SearchOverlay.tsx');
  const mobileNavPath = path.resolve(process.cwd(), 'src/components/layout/MobileNav.tsx');
  const feedFiltersPath = path.resolve(process.cwd(), 'src/features/feed/FeedFilters.tsx');

  const searchOverlaySource = fs.readFileSync(searchOverlayPath, 'utf8');
  const mobileNavSource = fs.readFileSync(mobileNavPath, 'utf8');
  const feedFiltersSource = fs.readFileSync(feedFiltersPath, 'utf8');

  describe('1. Search Overlay Dual-Mode Contrast', () => {
    it('should style modal container with dual-mode background, border, text, and shadow', () => {
      assert.match(
        searchOverlaySource,
        /bg-white\s+dark:bg-\[#0F1A13\](\s+dark:bg-surface-4)?\s+border\s+border-slate-200\s+dark:border-white\/10\s+text-slate-900\s+dark:text-white\s+shadow-2xl/
      );
    });

    it('should maintain dark backdrop with blur for focus containment', () => {
      assert.match(searchOverlaySource, /bg-black\/60/);
      assert.match(searchOverlaySource, /backdrop-blur-xl/);
    });

    it('should style search input container with dual-mode background and border', () => {
      assert.match(
        searchOverlaySource,
        /h-12\s+rounded-xl\s+bg-slate-100\s+dark:bg-white\/5\s+border\s+border-slate-200\s+dark:border-white\/10\s+px-4/
      );
    });

    it('should style search input text and placeholder with high contrast dual-mode tokens', () => {
      assert.match(
        searchOverlaySource,
        /text-sm\s+text-slate-900\s+dark:text-white\s+placeholder:text-slate-400\s+dark:placeholder:text-white\/40/
      );
    });

    it('should render search icon and clear/ESC controls with dual-mode tokens', () => {
      assert.match(searchOverlaySource, /Search className="h-4 w-4 text-slate-400 dark:text-white\/40/);
      assert.match(searchOverlaySource, /text-slate-500 dark:text-white\/40 bg-slate-200\/80 dark:bg-white\/5 border border-slate-300 dark:border-white\/10/);
    });

    it('should style section headers with uppercase dual-mode muted text', () => {
      assert.match(
        searchOverlaySource,
        /text-\[10px\]\s+font-bold\s+tracking-\[0\.2em\]\s+uppercase\s+text-slate-500\s+dark:text-white\/30/
      );
    });

    it('should style result items with dual-mode hover, text, subtitle, and icon box', () => {
      assert.match(
        searchOverlaySource,
        /hover:bg-slate-100\s+dark:hover:bg-white\/5\s+transition-colors\s+cursor-pointer/
      );
      assert.match(
        searchOverlaySource,
        /w-8\s+h-8\s+rounded-lg\s+bg-emerald-500\/10\s+text-emerald-600\s+dark:text-emerald-400/
      );
      assert.match(
        searchOverlaySource,
        /text-xs\s+font-semibold\s+text-slate-900\s+dark:text-white\/90\s+truncate/
      );
      assert.match(
        searchOverlaySource,
        /text-\[11px\]\s+text-slate-500\s+dark:text-white\/40\s+truncate/
      );
    });

    it('should style popular search chips with dual-mode background, border, and text', () => {
      assert.match(
        searchOverlaySource,
        /px-3\s+py-1\s+rounded-full\s+bg-slate-100\s+dark:bg-white\/5\s+hover:bg-slate-200\s+dark:hover:bg-white\/10\s+border\s+border-slate-200\s+dark:border-white\/10\s+text-xs\s+text-slate-600\s+dark:text-white\/60/
      );
    });

    it('should style keyboard shortcut hint footer with dual-mode border and kbd styling', () => {
      assert.match(
        searchOverlaySource,
        /border-t\s+border-slate-200\s+dark:border-white\/\[0\.08\]\s+pt-3\s+mt-2\s+flex\s+items-center\s+justify-between\s+text-\[11px\]\s+text-slate-500\s+dark:text-white\/30/
      );
      assert.match(
        searchOverlaySource,
        /bg-slate-100\s+dark:bg-white\/5\s+border\s+border-slate-200\s+dark:border-white\/10\s+font-mono\s+text-\[9px\]\s+text-slate-600\s+dark:text-white\/50/
      );
    });
  });

  describe('2. Mobile Bottom Navigation Bar Dual-Mode Polish', () => {
    it('should style container with fixed bottom-0, h-16, dual-mode background, and border', () => {
      assert.match(
        mobileNavSource,
        /fixed\s+bottom-0\s+inset-x-0\s+z-40\s+h-16\s+bg-white\s+dark:bg-\[#0F1A13\]\s+border-t\s+border-slate-200\s+dark:border-white\/10\s+transition-colors\s+duration-200/
      );
    });

    it('should style active nav link with text-emerald-600 dark:text-emerald-400 font-semibold', () => {
      assert.match(
        mobileNavSource,
        /text-emerald-600\s+dark:text-emerald-400\s+font-semibold/
      );
    });

    it('should style inactive nav links with text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white', () => {
      assert.match(
        mobileNavSource,
        /text-slate-500\s+dark:text-white\/50\s+hover:text-slate-900\s+dark:hover:text-white/
      );
    });

    it('should style micro-badge with emerald background, white text, and min-w-[16px]', () => {
      assert.match(
        mobileNavSource,
        /absolute\s+-top-1\s+-right-2\s+flex\s+h-4\s+min-w-\[16px\]\s+items-center\s+justify-center\s+rounded-full\s+bg-emerald-600\s+px-1\s+text-\[10px\]\s+font-bold\s+text-white/
      );
    });

    it('should style navigation labels with font-sora, text-[10px], and tracking-tight', () => {
      assert.match(
        mobileNavSource,
        /text-\[10px\]\s+tracking-tight\s+mt-0\.5\s+font-medium\s+font-sora/
      );
    });
  });

  describe('3. Feed Filter Chips Mobile Alignment', () => {
    it('should configure horizontal scroll track with negative margin and padding for mobile alignment', () => {
      assert.match(
        feedFiltersSource,
        /w-full\s+overflow-x-auto\s+scrollbar-hidden\s+flex\s+items-center\s+gap-2\s+py-2\s+-mx-4\s+px-4\s+sm:mx-0\s+sm:px-0\s+scroll-smooth/
      );
    });

    it('should give all chips shrink-0 to prevent compression on small viewports', () => {
      const shrinkMatches = feedFiltersSource.match(/shrink-0/g) || [];
      // At least 4 filter chips plus icons should have shrink-0
      assert.ok(shrinkMatches.length >= 8, 'Filter chips and their icons must include shrink-0');
    });

    it('should style active chip with bg-emerald-600 and shadow-emerald-600/20', () => {
      assert.match(
        feedFiltersSource,
        /bg-emerald-600\s+text-white\s+border-transparent\s+shadow-sm\s+shadow-emerald-600\/20/
      );
    });

    it('should style inactive chips with bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 and text-slate-700', () => {
      assert.match(
        feedFiltersSource,
        /bg-slate-100\s+dark:bg-white\/5\s+border\s+border-slate-200\s+dark:border-white\/10\s+text-slate-700\s+dark:text-white\/60\s+hover:bg-slate-200\s+dark:hover:bg-white\/10/
      );
    });

    it('should not contain any stretched indicator line or underline element', () => {
      assert.doesNotMatch(feedFiltersSource, /border-b-2|h-0\.5\s+bg-emerald|absolute\s+bottom-0/);
    });
  });
});
