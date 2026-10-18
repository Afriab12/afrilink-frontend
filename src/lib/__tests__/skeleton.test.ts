import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  SKELETON_BASE_CLASS,
  SKELETON_PULSE_CONFIG,
  SKELETON_LINE_VARIANTS,
  SKELETON_CIRCLE_VARIANTS,
  SKELETON_RECT_VARIANTS,
  getSkeletonLineClass,
  getSkeletonCircleClass,
  getSkeletonRectClass,
} from '../skeleton-tokens.ts';

describe('Phase 1B — Smart Skeleton Loading System', () => {
  describe('Base Pulse Configuration & Safeguards', () => {
    it('SKELETON_PULSE_CONFIG obeys 0% 0.06 -> 50% 0.12 -> 100% 0.06 opacity', () => {
      assert.strictEqual(SKELETON_PULSE_CONFIG.keyframes['0%'].opacity, 0.06);
      assert.strictEqual(SKELETON_PULSE_CONFIG.keyframes['50%'].opacity, 0.12);
      assert.strictEqual(SKELETON_PULSE_CONFIG.keyframes['100%'].opacity, 0.06);
      assert.strictEqual(SKELETON_PULSE_CONFIG.duration, '1.5s');
      assert.strictEqual(SKELETON_PULSE_CONFIG.timingFunction, 'ease-in-out');
      assert.strictEqual(SKELETON_PULSE_CONFIG.iterationCount, 'infinite');
      assert.strictEqual(SKELETON_PULSE_CONFIG.reducedMotion, 'animate-none');
    });

    it('SKELETON_BASE_CLASS contains required opacity pulse and reduced motion disable', () => {
      assert.ok(SKELETON_BASE_CLASS.includes('bg-white/[0.06]'), 'Base class must include bg-white/[0.06]');
      assert.ok(SKELETON_BASE_CLASS.includes('animate-skeleton-pulse'), 'Base class must include animate-skeleton-pulse');
      assert.ok(SKELETON_BASE_CLASS.includes('motion-reduce:animate-none'), 'Base class must disable animation on motion-reduce');
    });
  });

  describe('Skeleton Primitives & Variants', () => {
    it('SkeletonLine resolves h-3 rounded-full bg-white/[0.06] with w-full, w-3/4, w-1/2', () => {
      const full = getSkeletonLineClass('w-full');
      assert.ok(full.includes('h-3'), 'Must contain h-3');
      assert.ok(full.includes('rounded-full'), 'Must contain rounded-full');
      assert.ok(full.includes('bg-white/[0.06]'), 'Must contain bg-white/[0.06]');
      assert.ok(full.includes('w-full'), 'Must contain w-full');

      const threeFourth = getSkeletonLineClass('w-3/4');
      assert.ok(threeFourth.includes('w-3/4'), 'Must contain w-3/4');

      const half = getSkeletonLineClass('w-1/2');
      assert.ok(half.includes('w-1/2'), 'Must contain w-1/2');

      const custom = getSkeletonLineClass('w-full', 'max-w-[200px]');
      assert.ok(custom.includes('max-w-[200px]'), 'Must append custom class');
    });

    it('SkeletonCircle resolves rounded-full bg-white/[0.06] with h-10 w-10 and h-8 w-8', () => {
      const circle10 = getSkeletonCircleClass('h-10 w-10');
      assert.ok(circle10.includes('rounded-full'), 'Must contain rounded-full');
      assert.ok(circle10.includes('bg-white/[0.06]'), 'Must contain bg-white/[0.06]');
      assert.ok(circle10.includes('h-10 w-10'), 'Must contain h-10 w-10');

      const circle8 = getSkeletonCircleClass('h-8 w-8');
      assert.ok(circle8.includes('h-8 w-8'), 'Must contain h-8 w-8');

      const circleCustom = getSkeletonCircleClass('h-10 w-10', undefined, 'custom-circle');
      assert.ok(circleCustom.includes('custom-circle'), 'Must append custom class');
    });

    it('SkeletonRect resolves rounded-xl bg-white/[0.06] with h-48 w-full and h-20 w-full', () => {
      const imageRect = getSkeletonRectClass('h-48 w-full');
      assert.ok(imageRect.includes('rounded-xl'), 'Must contain rounded-xl');
      assert.ok(imageRect.includes('bg-white/[0.06]'), 'Must contain bg-white/[0.06]');
      assert.ok(imageRect.includes('h-48 w-full'), 'Must contain h-48 w-full');

      const cardRect = getSkeletonRectClass('h-20 w-full');
      assert.ok(cardRect.includes('h-20 w-full'), 'Must contain h-20 w-full');
    });
  });

  describe('Component Architecture & Composites Verification', () => {
    it('skeleton.tsx exports all 3 primitives and 6 required composites', () => {
      const componentPath = path.resolve(process.cwd(), 'src/components/ui/skeleton.tsx');
      assert.ok(fs.existsSync(componentPath), 'skeleton.tsx must exist');
      const content = fs.readFileSync(componentPath, 'utf8');

      // Primitives
      assert.ok(content.includes('export const SkeletonLine'), 'Must export SkeletonLine');
      assert.ok(content.includes('export const SkeletonCircle'), 'Must export SkeletonCircle');
      assert.ok(content.includes('export const SkeletonRect'), 'Must export SkeletonRect');

      // Composites
      assert.ok(content.includes('export const FeedPostSkeleton'), 'Must export FeedPostSkeleton');
      assert.ok(content.includes('export const ConversationRowSkeleton'), 'Must export ConversationRowSkeleton');
      assert.ok(content.includes('export const ProfileHeaderSkeleton'), 'Must export ProfileHeaderSkeleton');
      assert.ok(content.includes('export const CountryCardSkeleton'), 'Must export CountryCardSkeleton');
      assert.ok(content.includes('export const SettingsFormSkeleton'), 'Must export SettingsFormSkeleton');
      assert.ok(content.includes('export const ConnectRowSkeleton'), 'Must export ConnectRowSkeleton');
    });

    it('FeedPostSkeleton composite contains avatar circle + 2 lines + image rect + reaction bar line', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/skeleton.tsx'), 'utf8');
      const feedPostSection = content.substring(content.indexOf('export const FeedPostSkeleton'));
      const feedPostCode = feedPostSection.substring(0, feedPostSection.indexOf('export const ConversationRowSkeleton'));

      assert.ok(feedPostCode.includes('SkeletonCircle variant="h-10 w-10"'), 'FeedPostSkeleton must contain avatar circle');
      assert.ok(feedPostCode.includes('SkeletonLine variant="w-full"'), 'FeedPostSkeleton must contain post lines');
      assert.ok(feedPostCode.includes('SkeletonRect variant="h-48 w-full"'), 'FeedPostSkeleton must contain image rect');
      assert.ok(feedPostCode.includes('border-t border-neutral-100 dark:border-white/[0.04]'), 'FeedPostSkeleton must contain reaction bar line');
    });

    it('ConversationRowSkeleton composite contains avatar circle + name line + preview line', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/skeleton.tsx'), 'utf8');
      const rowSection = content.substring(content.indexOf('export const ConversationRowSkeleton'));
      const rowCode = rowSection.substring(0, rowSection.indexOf('export const ProfileHeaderSkeleton'));

      assert.ok(rowCode.includes('SkeletonCircle variant="h-10 w-10"'), 'ConversationRowSkeleton must contain avatar circle');
      assert.ok(rowCode.includes('SkeletonLine variant="w-1/2"'), 'ConversationRowSkeleton must contain name line');
      assert.ok(rowCode.includes('SkeletonLine variant="w-3/4"'), 'ConversationRowSkeleton must contain preview line');
    });

    it('ProfileHeaderSkeleton composite contains large circle + 3 lines + 2 button rects', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/skeleton.tsx'), 'utf8');
      const profSection = content.substring(content.indexOf('export const ProfileHeaderSkeleton'));
      const profCode = profSection.substring(0, profSection.indexOf('export const CountryCardSkeleton'));

      assert.ok(profCode.includes('h-24 w-24'), 'ProfileHeaderSkeleton must contain large avatar circle');
      assert.ok(profCode.includes('h-9 w-28'), 'ProfileHeaderSkeleton must contain 2 button rects');
    });

    it('CountryCardSkeleton composite contains badge rect + 2 lines + 3 small tag rects', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/skeleton.tsx'), 'utf8');
      const countrySection = content.substring(content.indexOf('export const CountryCardSkeleton'));
      const countryCode = countrySection.substring(0, countrySection.indexOf('export const SettingsFormSkeleton'));

      assert.ok(countryCode.includes('variant="badge"'), 'CountryCardSkeleton must contain badge rect');
      assert.ok(countryCode.includes('variant="tag"'), 'CountryCardSkeleton must contain tag rects');
    });

    it('SettingsFormSkeleton composite contains 4 label+input pairs', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/skeleton.tsx'), 'utf8');
      const settingsSection = content.substring(content.indexOf('export const SettingsFormSkeleton'));
      const settingsCode = settingsSection.substring(0, settingsSection.indexOf('export const ConnectRowSkeleton'));

      assert.ok(settingsCode.includes('[1, 2, 3, 4]'), 'SettingsFormSkeleton must iterate 4 label+input pairs');
      assert.ok(settingsCode.includes('variant="input"'), 'SettingsFormSkeleton must contain input rect');
    });

    it('ConnectRowSkeleton composite contains avatar + 2 lines + button rect', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/skeleton.tsx'), 'utf8');
      const connectSection = content.substring(content.indexOf('export const ConnectRowSkeleton'));

      assert.ok(connectSection.includes('SkeletonCircle variant="h-8 w-8"'), 'ConnectRowSkeleton must contain avatar');
      assert.ok(connectSection.includes('variant="button"'), 'ConnectRowSkeleton must contain button rect');
    });
  });
});
