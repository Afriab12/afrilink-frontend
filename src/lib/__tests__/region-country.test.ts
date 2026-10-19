import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { AFRICAN_COUNTRIES, AFRICAN_REGIONS } from '../../utils/countryData.ts';

describe('Phase 2B — Regional Navigation Track & Country Shorthand Cards', () => {
  const explorerSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/countries/CountryExplorer.tsx'),
    'utf-8'
  );
  const trackSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/countries/RegionTrack.tsx'),
    'utf-8'
  );
  const cardSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/countries/CountryCard.tsx'),
    'utf-8'
  );
  const packageJsonSource = fs.readFileSync(
    path.resolve(process.cwd(), 'package.json'),
    'utf-8'
  );

  describe('Taxonomy & Regional Track Structure', () => {
    it('should verify all 54 African countries exist and are categorized into 5 regions', () => {
      assert.strictEqual(AFRICAN_COUNTRIES.length, 54, 'Exactly 54 African countries must exist');
      assert.strictEqual(AFRICAN_REGIONS.length, 5, 'Exactly 5 African regions must exist');

      const expectedRegions = [
        'West Africa',
        'East Africa',
        'Southern Africa',
        'North Africa',
        'Central Africa',
      ];
      assert.deepStrictEqual(AFRICAN_REGIONS, expectedRegions);
    });

    it('should implement horizontal scroll track with mandatory scroll snap and no scrollbars', () => {
      assert.match(trackSource, /overflow-x-auto/);
      assert.match(trackSource, /no-scrollbar/);
      assert.match(trackSource, /\[scroll-snap-type:x_mandatory\]/);
    });

    it('should implement trailing 24px gradient mask signalling overflow', () => {
      // w-6 in Tailwind equals 24px
      assert.match(trackSource, /w-6\s+bg-gradient-to-l/);
      assert.match(trackSource, /pointer-events-none\s+absolute\s+right-0/);
    });
  });

  describe('Tab Styling & Emerald Active States', () => {
    it('should enforce base tab styles: h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap', () => {
      assert.match(trackSource, /h-9\s+px-4\s+rounded-full\s+text-sm\s+font-medium\s+whitespace-nowrap/);
    });

    it('should enforce emerald-600 active tab style with shadow glow', () => {
      assert.match(
        trackSource,
        /bg-emerald-600\s+text-white\s+font-semibold\s+shadow-sm/
      );
    });

    it('should strictly eliminate gold ring or border from active tabs', () => {
      assert.doesNotMatch(
        trackSource,
        /ring-\[#D9A441\]/,
        'Active tabs must not contain African Gold ring'
      );
      assert.doesNotMatch(
        trackSource,
        /border-\[#D9A441\]/,
        'Active tabs must not contain African Gold border'
      );
    });

    it('should enforce inactive tab style: bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 text-slate-700 dark:text-white/50', () => {
      assert.match(
        trackSource,
        /bg-slate-100\s+dark:bg-white\/5\s+border\s+border-slate-200\s+dark:border-white\/8\s+text-slate-700\s+dark:text-white\/50/
      );
    });

    it('should inherit muted opacity on region count badges', () => {
      assert.match(trackSource, /opacity-60\s+ml-1\s+font-normal/);
    });
  });

  describe('Country Shorthand Cards & Responsive Grid', () => {
    it('should enforce responsive grid: 2 cols mobile, 3 cols tablet, 4 cols desktop with gap-3', () => {
      assert.match(
        explorerSource,
        /grid\s+grid-cols-2\s+md:grid-cols-3\s+lg:grid-cols-4\s+gap-3/
      );
    });

    it('should enforce card styling: rounded-2xl p-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]', () => {
      assert.match(cardSource, /rounded-2xl\s+p-4\s+bg-white\s+dark:bg-white\/\[0\.03\]\s+border\s+border-slate-200\s+dark:border-white\/\[0\.06\]/);
      assert.match(cardSource, /hover:border-slate-300\s+dark:hover:border-white\/20/);
      assert.match(cardSource, /hover:-translate-y-\[2px\]/);
    });

    it('should enforce 40x40 typographic badge (h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400)', () => {
      assert.match(cardSource, /h-10\s+w-10\s+rounded-xl\s+bg-emerald-500\/10/);
      assert.match(cardSource, /text-sm\s+font-bold\s+tracking-wide\s+text-emerald-600\s+dark:text-emerald-400/);
      assert.match(cardSource, /font-mono/);
    });

    it('should enforce country name typography: text-sm font-semibold text-slate-900 dark:text-white mt-3', () => {
      assert.match(cardSource, /text-sm\s+font-semibold\s+text-slate-900\s+dark:text-white\s+mt-3/);
    });

    it('should enforce language tags: text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-white/50 border border-slate-200 dark:border-white/[0.06]', () => {
      assert.match(
        cardSource,
        /text-\[10px\]\s+px-2\s+py-0\.5\s+rounded-full\s+bg-slate-100\s+dark:bg-white\/\[0\.04\]\s+text-slate-600\s+dark:text-white\/50\s+border\s+border-slate-200\s+dark:border-white\/\[0\.06\]/
      );
    });

    it('should enforce active count indicator with pulse dot and motion-reduce safeguard', () => {
      assert.match(cardSource, /text-\[10px\]\s+text-emerald-600\s+dark:text-emerald-400\/60/);
      assert.match(cardSource, /animate-ping\s+motion-reduce:animate-none/);
    });

    it('should render CountryCardSkeleton while loading', () => {
      assert.match(explorerSource, /<CountryCardSkeleton/);
    });
  });

  describe('Phase 0 Non-Negotiable Constraints', () => {
    it('should confirm zero flag image packages or CDN dependencies in package.json', () => {
      const forbidden = [
        'flag-icons',
        'react-world-flags',
        'svg-country-flags',
        'twemoji-flags',
        'country-flag-icons',
      ];
      forbidden.forEach((pkg) => {
        assert.strictEqual(
          packageJsonSource.includes(`"${pkg}"`),
          false,
          `Forbidden flag dependency "${pkg}" must not exist in package.json`
        );
      });
    });

    it('should confirm CountryCard has zero <img> or background-image flag assets', () => {
      assert.doesNotMatch(cardSource, /<img/i, 'CountryCard must not render <img> tags');
      assert.doesNotMatch(cardSource, /background-image/i);
    });

    it('should use named Lucide imports only', () => {
      assert.match(cardSource, /import\s*\{\s*ArrowRight\s*\}\s*from\s*['"]lucide-react['"]/);
      assert.match(explorerSource, /import\s*\{\s*Compass\s*\}\s*from\s*['"]lucide-react['"]/);
    });
  });
});
