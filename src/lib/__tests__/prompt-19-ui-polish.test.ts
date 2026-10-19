import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Prompt 19 — UI Polish, Centering, Dropdown & Dual-Mode Contrast Gate', () => {
  const emojiPickerSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/ui/EmojiPickerPopover.tsx'),
    'utf-8'
  );
  const profileHeaderSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/profile/ProfileHeader.tsx'),
    'utf-8'
  );
  const languageSelectorSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/ui/LanguageSelector.tsx'),
    'utf-8'
  );
  const settingsSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/settings/SettingsView.tsx'),
    'utf-8'
  );
  const feedFiltersSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/feed/FeedFilters.tsx'),
    'utf-8'
  );
  const feedListSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/feed/FeedList.tsx'),
    'utf-8'
  );

  describe('1. Emoji Picker — Clean, Bright, Well-Arranged', () => {
    it('should configure picker panel with 320px width and dark:bg-[#1C3226]', () => {
      assert.match(
        emojiPickerSource,
        /w-\[320px\]\s+max-h-\[360px\]\s+rounded-2xl\s+bg-white\s+dark:bg-\[#1C3226\]\s+border\s+border-slate-200\s+dark:border-white\/10\s+shadow-2xl/
      );
    });

    it('should render search row with Lucide Search and dual-mode styling', () => {
      assert.match(
        emojiPickerSource,
        /h-10\s+mx-3\s+mt-3\s+mb-2\s+px-3\s+rounded-xl\s+bg-slate-100\s+dark:bg-white\/5\s+border\s+border-slate-200\s+dark:border-white\/10/
      );
      assert.match(emojiPickerSource, /<Search\s+className=["']h-4\s+w-4\s+text-slate-400\s+shrink-0["']/);
    });

    it('should define all 9 emoji categories in exact specified order', () => {
      const expectedOrder = [
        'recent',
        'smileys',
        'animals',
        'food',
        'activity',
        'travel',
        'objects',
        'symbols',
        'flags',
      ];
      expectedOrder.forEach((catId) => {
        assert.ok(
          emojiPickerSource.includes(`id: '${catId}'`),
          `Category ${catId} must be present in EMOJI_CATEGORIES`
        );
      });
      assert.match(
        emojiPickerSource,
        /hover:bg-slate-100\s+dark:hover:bg-white\/10/
      );
      assert.match(
        emojiPickerSource,
        /bg-emerald-500\/15\s+ring-1\s+ring-emerald-500\/40/
      );
    });

    it('should enforce 8-column grid with crisp emoji font and no color dulling', () => {
      assert.match(emojiPickerSource, /grid\s+grid-cols-8\s+gap-0\.5/);
      assert.match(
        emojiPickerSource,
        /h-9\s+w-9\s+rounded-lg\s+flex\s+items-center\s+justify-center\s+text-\[22px\]/
      );
      assert.match(
        emojiPickerSource,
        /fontFamily:\s*['"]"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif['"]/
      );
      assert.ok(!emojiPickerSource.includes('grayscale'));
    });

    it('should support keyboard navigation: Arrow keys, Enter, and Escape', () => {
      assert.match(emojiPickerSource, /e\.key\s*===\s*['"]Escape['"]/);
      assert.match(emojiPickerSource, /e\.key\s*===\s*['"]ArrowRight['"]/);
      assert.match(emojiPickerSource, /e\.key\s*===\s*['"]ArrowLeft['"]/);
      assert.match(emojiPickerSource, /e\.key\s*===\s*['"]ArrowDown['"]/);
      assert.match(emojiPickerSource, /e\.key\s*===\s*['"]ArrowUp['"]/);
      assert.match(emojiPickerSource, /e\.key\s*===\s*['"]Enter['"]/);
    });

    it('should provide messaging popover re-export file', () => {
      assert.ok(fs.existsSync(path.resolve(process.cwd(), 'src/features/messaging/EmojiPickerPopover.tsx')));
    });
  });

  describe('2. Profile Avatar — Centered on Cover', () => {
    it('should place avatar at absolute left-6 md:left-8 bottom-0 translate-y-1/2', () => {
      assert.match(
        profileHeaderSource,
        /absolute\s+left-6\s+md:left-8\s+bottom-0\s+translate-y-1\/2\s+z-10/
      );
    });

    it('should render cover container with h-48 md:h-56 rounded-2xl bg-slate-200 dark:bg-[#131F17]', () => {
      assert.match(
        profileHeaderSource,
        /relative\s+w-full\s+h-48\s+md:h-56\s+rounded-2xl\s+overflow-hidden\s+bg-slate-200\s+dark:bg-\[#131F17\]/
      );
    });

    it('should render avatar frame with 4px ring and dark:ring-[#0B130E]', () => {
      assert.match(
        profileHeaderSource,
        /h-24\s+w-24\s+md:h-28\s+md:w-28\s+rounded-full\s+ring-\[4px\]\s+ring-white\s+dark:ring-\[#0B130E\]\s+bg-slate-100\s+dark:bg-\[#131F17\]\s+overflow-hidden\s+shadow-lg/
      );
    });

    it('should render country badge at bottom-1 right-1 with dual-mode border', () => {
      assert.match(
        profileHeaderSource,
        /absolute\s+bottom-1\s+right-1\s+h-6\s+min-w-\[24px\]\s+px-1\.5\s+rounded-full\s+bg-white\s+dark:bg-\[#0F1A13\]\s+border\s+border-slate-200\s+dark:border-white\/15\s+text-\[10px\]\s+font-bold\s+text-slate-700\s+dark:text-white\/80/
      );
    });

    it('should provide pt-16 md:pt-20 px-6 clearance for the overlapping avatar', () => {
      assert.match(
        profileHeaderSource,
        /pt-16\s+md:pt-20\s+px-6\s+pb-6\s+relative/
      );
    });

    it('should render display name, handle, and bio with dual-mode typography', () => {
      assert.match(
        profileHeaderSource,
        /text-xl\s+sm:text-2xl\s+font-black\s+text-slate-900\s+dark:text-white\s+font-sora/
      );
      assert.match(
        profileHeaderSource,
        /text-xs\s+text-slate-500\s+dark:text-white\/50/
      );
      assert.match(
        profileHeaderSource,
        /text-sm\s+text-slate-700\s+dark:text-white\/80/
      );
    });
  });

  describe('3. Language Dropdown — Custom Polished Menu', () => {
    it('should configure custom trigger button with Globe and ChevronDown icons', () => {
      assert.match(
        languageSelectorSource,
        /h-11\s+w-full\s+px-4\s+rounded-xl\s+bg-white\s+dark:bg-white\/\[0\.04\]\s+border\s+border-slate-200\s+dark:border-white\/10\s+text-sm\s+text-slate-900\s+dark:text-white/
      );
      assert.match(
        languageSelectorSource,
        /<Globe\s+className=["']h-4\s+w-4\s+text-emerald-600\s+shrink-0["']/
      );
      assert.match(
        languageSelectorSource,
        /<ChevronDown/
      );
    });

    it('should configure dropdown panel with max-h-72 dark:bg-[#1C3226] and shadow-xl', () => {
      assert.match(
        languageSelectorSource,
        /mt-2\s+max-h-72\s+overflow-y-auto\s+rounded-xl\s+bg-white\s+dark:bg-\[#1C3226\]\s+border\s+border-slate-200\s+dark:border-white\/10\s+shadow-xl/
      );
    });

    it('should render ISO chips and language rows with native and English names', () => {
      assert.match(
        languageSelectorSource,
        /h-6\s+min-w-\[28px\]\s+px-1\.5\s+rounded-md\s+bg-slate-100\s+dark:bg-white\/10\s+text-\[10px\]\s+font-bold\s+tracking-wide\s+text-slate-600\s+dark:text-white\/70/
      );
      assert.match(
        languageSelectorSource,
        /hover:bg-slate-100\s+dark:hover:bg-white\/10/
      );
      assert.match(
        languageSelectorSource,
        /bg-emerald-500\/10\s+text-emerald-700\s+dark:text-emerald-300/
      );
    });

    it('should group languages with sticky regional headers', () => {
      assert.match(
        languageSelectorSource,
        /text-\[10px\]\s+font-bold\s+uppercase\s+tracking-wider\s+text-slate-400\s+dark:text-white\/30\s+px-3\s+py-1\.5\s+bg-slate-50\s+dark:bg-white\/\[0\.03\]\s+sticky\s+top-0/
      );
    });
  });

  describe('4. Settings Page — Full Light Mode Contrast', () => {
    it('should enforce page title text-2xl font-bold text-slate-900 dark:text-white', () => {
      assert.match(
        settingsSource,
        /text-2xl\s+font-bold\s+text-slate-900\s+dark:text-white\s+font-sora\s+tracking-tight/
      );
      assert.match(
        settingsSource,
        /text-sm\s+text-slate-500\s+dark:text-white\/50/
      );
    });

    it('should enforce tab strip border-b border-slate-200 dark:border-white/10 and dual-mode tabs', () => {
      assert.match(
        settingsSource,
        /border-b\s+border-slate-200\s+dark:border-white\/10/
      );
      assert.match(
        settingsSource,
        /text-slate-500\s+dark:text-white\/40\s+hover:text-slate-800\s+dark:hover:text-white\/70/
      );
      assert.match(
        settingsSource,
        /text-emerald-700\s+dark:text-emerald-400\s+border-b-2\s+border-emerald-600\s+dark:border-emerald-500\s+-mb-px/
      );
    });

    it('should enforce section headers and labels in dual-mode uppercase style', () => {
      assert.match(
        settingsSource,
        /text-\[10px\]\s+font-bold\s+tracking-\[0\.15em\]\s+uppercase\s+text-slate-500\s+dark:text-white\/30/
      );
      assert.match(
        settingsSource,
        /text-\[10px\]\s+font-bold\s+tracking-\[0\.15em\]\s+uppercase\s+text-slate-500\s+dark:text-white\/35/
      );
    });

    it('should enforce input fields with light backgrounds and dark borders', () => {
      assert.match(
        settingsSource,
        /h-11\s+w-full\s+px-4\s+rounded-xl\s+bg-white\s+dark:bg-white\/\[0\.04\]\s+border\s+text-sm\s+text-slate-900\s+dark:text-white/
      );
    });

    it('should style voice speech rate slider with accent-emerald-600 and dual-mode track', () => {
      assert.match(
        settingsSource,
        /bg-slate-200\s+dark:bg-white\/10\s+accent-emerald-600\s+rounded-lg\s+cursor-pointer\s+h-2/
      );
    });
  });

  describe('5. Home Feed Filter Chips — Balanced Alignment', () => {
    it('should render filter track container with px-0 and matching left edge', () => {
      assert.match(
        feedFiltersSource,
        /flex\s+items-center\s+gap-2\s+mt-4\s+mb-2\s+overflow-x-auto\s+scrollbar-hidden\s+px-0/
      );
    });

    it('should style inactive and active chips with equal visual weight', () => {
      assert.match(
        feedFiltersSource,
        /h-9\s+px-4\s+rounded-full\s+text-sm\s+font-medium\s+whitespace-nowrap\s+transition-colors\s+duration-150\s+flex\s+items-center\s+gap-1\.5/
      );
      assert.match(
        feedFiltersSource,
        /bg-emerald-600\s+text-white\s+border-transparent\s+shadow-sm\s+shadow-emerald-600\/20/
      );
      assert.match(
        feedFiltersSource,
        /bg-white\s+dark:bg-white\/5\s+border\s+border-slate-200\s+dark:border-white\/10\s+text-slate-600\s+dark:text-white\/60\s+hover:bg-slate-50\s+dark:hover:bg-white\/10/
      );
    });

    it('should render filter chips in order: For Africa, Friends, Communities, Photos & Video', () => {
      const africaIdx = feedFiltersSource.indexOf('For Africa');
      const friendsIdx = feedFiltersSource.indexOf('Friends');
      const communitiesIdx = feedFiltersSource.indexOf('Communities');
      const mediaIdx = feedFiltersSource.indexOf('Photos & Video');

      assert.ok(africaIdx !== -1 && friendsIdx !== -1 && communitiesIdx !== -1 && mediaIdx !== -1);
      assert.ok(africaIdx < friendsIdx, 'For Africa must precede Friends');
      assert.ok(friendsIdx < communitiesIdx, 'Friends must precede Communities');
      assert.ok(communitiesIdx < mediaIdx, 'Communities must precede Photos & Video');
    });

    it('should wire FeedFilters into FeedList', () => {
      assert.match(
        feedListSource,
        /<FeedFilters\s+currentFilter=\{feedFilter\}\s+onFilterChange=\{setFeedFilter\}\s*\/>/
      );
    });
  });
});
