import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  getSocialProofContext,
  getFollowButtonConfig,
  SOCIAL_PROOF_VARIANTS,
} from '../connect-utils.ts';

describe('Phase 2C — Connect Across Borders Sidebar Redesign', () => {
  const sidebarSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/layout/RightSidebar.tsx'),
    'utf-8'
  );
  const rowSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/connect/ConnectRow.tsx'),
    'utf-8'
  );

  describe('connect-utils pure helpers', () => {
    it('should derive social proof context variants accurately', () => {
      assert.strictEqual(
        getSocialProofContext({ city: 'Lagos' }),
        'Popular in Lagos'
      );
      assert.strictEqual(
        getSocialProofContext({ city: 'Kigali' }),
        'Popular in Kigali'
      );
      assert.strictEqual(
        getSocialProofContext({ interests: ['Technology & Startups'] }),
        'Active in Tech Community'
      );
      assert.strictEqual(
        getSocialProofContext({ friendsCount: 15 }),
        '8 mutual connections'
      );

      // Verify all required prompt variants exist
      assert.ok(SOCIAL_PROOF_VARIANTS.includes('8 mutual connections'));
      assert.ok(SOCIAL_PROOF_VARIANTS.includes('Popular in Lagos'));
      assert.ok(SOCIAL_PROOF_VARIANTS.includes('Active in Tech Community'));
      assert.ok(SOCIAL_PROOF_VARIANTS.includes('From your region'));
    });

    it('should return unified button configuration for Follow state', () => {
      const config = getFollowButtonConfig(false, false, false);
      assert.strictEqual(config.label, 'Follow');
      assert.strictEqual(config.variant, 'follow');
      assert.match(config.className, /h-8\s+px-4\s+rounded-full\s+text-xs\s+font-semibold/);
      assert.match(config.className, /bg-emerald-600\s+text-white/);
      assert.match(config.className, /hover:shadow-\[0_0_12px_rgba\(8,116,67,0\.3\)\]/);
      assert.match(config.className, /active:scale-95/);
    });

    it('should return unified button configuration for Following state with unfollow intent on hover', () => {
      const normalConfig = getFollowButtonConfig(true, false, false);
      assert.strictEqual(normalConfig.label, 'Following');
      assert.strictEqual(normalConfig.variant, 'following');
      assert.match(normalConfig.className, /border-slate-300\s+dark:border-white\/15/);
      assert.match(normalConfig.className, /text-slate-700\s+dark:text-white\/60/);
      assert.match(normalConfig.className, /hover:border-red-500\/50\s+hover:text-red-500\s+dark:hover:text-red-400/);

      const hoverConfig = getFollowButtonConfig(true, false, true);
      assert.strictEqual(hoverConfig.label, 'Unfollow', 'Must show Unfollow intent when hovered');
    });

    it('should return unified button configuration for Pending state', () => {
      const config = getFollowButtonConfig(false, true, false);
      assert.strictEqual(config.label, 'Pending');
      assert.strictEqual(config.variant, 'pending');
      assert.match(config.className, /border-amber-500\/30\s+text-amber-400\/60\s+cursor-default/);
    });
  });

  describe('Section Container & Layout Architecture', () => {
    it('should enforce container styling: rounded-2xl p-4 border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]', () => {
      assert.match(
        sidebarSource,
        /rounded-2xl\s+p-4\s+bg-white\s+dark:bg-white\/\[0\.02\]\s+border\s+border-slate-200\s+dark:border-white\/\[0\.06\]/
      );
    });

    it('should enforce section title: text-xs font-bold tracking-[0.15em] uppercase text-slate-500 dark:text-white/30 mb-4 "CONNECT ACROSS BORDERS"', () => {
      assert.match(
        sidebarSource,
        /text-xs\s+font-bold\s+tracking-\[0\.15em\]\s+uppercase\s+text-slate-500\s+dark:text-white\/30\s+mb-4/
      );
      assert.match(sidebarSource, /CONNECT ACROSS BORDERS/);
    });

    it('should enforce footer: "See more" text-xs text-emerald-600 dark:text-emerald-400 with ChevronRight h-3 w-3', () => {
      assert.match(sidebarSource, /See more/);
      assert.match(sidebarSource, /text-xs\s+font-semibold\s+text-emerald-600\s+dark:text-emerald-400/);
      assert.match(sidebarSource, /<ChevronRight\s+className=["']h-3\s+w-3["']/);
    });

    it('should render ConnectRowSkeleton while loading', () => {
      assert.match(sidebarSource, /<ConnectRowSkeleton/);
    });
  });

  describe('User Row Architecture & Inline Verification', () => {
    it('should enforce user row styling: flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04]', () => {
      assert.match(
        rowSource,
        /flex\s+items-center\s+justify-between\s+gap-3\s+py-2\.5\s+px-2\s+rounded-xl\s+hover:bg-slate-100\s+dark:hover:bg-white\/\[0\.04\]/
      );
      assert.match(rowSource, /hover:-translate-y-\[1px\]/);
    });

    it('should enforce 40px UserAvatar with ring-2 ring-slate-200 dark:ring-white/[0.06] and group-hover ring-emerald-500/30', () => {
      assert.match(rowSource, /<UserAvatar/);
      assert.match(rowSource, /size="md"/);
      assert.match(rowSource, /ring-2\s+ring-slate-200\s+dark:ring-white\/\[0\.06\]/);
      assert.match(rowSource, /group-hover:ring-emerald-500\/30/);
    });

    it('should place Lucide BadgeCheck INLINE next to display name (not under avatar)', () => {
      assert.match(
        rowSource,
        /<div\s+className=["']flex\s+items-center\s+gap-1\s+min-w-0["']>/
      );
      assert.match(
        rowSource,
        /<BadgeCheck[\s\S]*?className=["']h-3\.5\s+w-3\.5\s+text-emerald-600\s+dark:text-emerald-400\s+shrink-0\s+inline-block["']/
      );
    });

    it('should enforce name row constraints: max-w-[120px] and truncate', () => {
      assert.match(rowSource, /text-sm\s+font-semibold\s+text-slate-900\s+dark:text-white\s+truncate\s+max-w-\[120px\]/);
    });

    it('should enforce handle and context line typography', () => {
      assert.match(rowSource, /text-xs\s+text-slate-500\s+dark:text-white\/40\s+truncate/);
      assert.match(rowSource, /text-\[10px\]\s+text-slate-400\s+dark:text-white\/30\s+truncate/);
    });

    it('should integrate Phase 1C toast notifications on follow/unfollow toggle', () => {
      assert.match(sidebarSource, /import\s*\{\s*toast\s*\}\s*from\s*['"]@\/components\/ui\/toast['"]/);
      assert.match(sidebarSource, /toast\.success/);
      assert.match(sidebarSource, /toast\.info/);
    });
  });

  describe('Phase 0 Named Lucide Imports & Asset Constraints', () => {
    it('should only use named Lucide imports with strokeWidth={1.75}', () => {
      assert.match(
        sidebarSource,
        /import\s*\{\s*Compass,\s*TrendingUp,\s*ChevronRight\s*\}\s*from\s*['"]lucide-react['"]/
      );
      assert.match(
        rowSource,
        /import\s*\{\s*BadgeCheck\s*\}\s*from\s*['"]lucide-react['"]/
      );
      assert.match(rowSource, /strokeWidth=\{1\.75\}/);
      assert.match(sidebarSource, /strokeWidth=\{1\.75\}/);
    });
  });
});
