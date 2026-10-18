import { describe, it } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { useMinimumLoading, calculateRemainingLoadingTime } from '../useMinimumLoading.ts';

// Test component to verify hook rendering under React SSR/DOM
function TestConsumer({ isLoading, minTimeMs = 300 }: { isLoading: boolean; minTimeMs?: number }) {
  const showSkeleton = useMinimumLoading(isLoading, minTimeMs);
  return React.createElement('div', { 'data-testid': 'consumer' }, showSkeleton ? 'SKELETON_ACTIVE' : 'CONTENT_ACTIVE');
}

describe('Phase 1B — useMinimumLoading Helper Hook', () => {
  describe('calculateRemainingLoadingTime', () => {
    it('should return 0 if startTime is null (not previously loading)', () => {
      const remaining = calculateRemainingLoadingTime(null, Date.now(), 300);
      assert.strictEqual(remaining, 0, 'Must return 0 if never started loading');
    });

    it('should calculate remaining duration when elapsed time is less than minTimeMs (prevents flash)', () => {
      const startTime = 1000;
      const now = 1050; // 50ms elapsed
      const remaining = calculateRemainingLoadingTime(startTime, now, 300);
      assert.strictEqual(remaining, 250, 'Must enforce remaining 250ms to meet 300ms minimum threshold');
    });

    it('should return 0 when elapsed time meets exactly or exceeds minTimeMs', () => {
      const startTime = 1000;
      const exactNow = 1300; // 300ms elapsed
      assert.strictEqual(calculateRemainingLoadingTime(startTime, exactNow, 300), 0);

      const pastNow = 1600; // 600ms elapsed
      assert.strictEqual(calculateRemainingLoadingTime(startTime, pastNow, 300), 0);
    });

    it('should respect custom minTimeMs thresholds', () => {
      const startTime = 2000;
      const now = 2100; // 100ms elapsed
      const remaining = calculateRemainingLoadingTime(startTime, now, 500);
      assert.strictEqual(remaining, 400, 'Must compute remaining based on custom 500ms minTimeMs');
    });
  });

  describe('useMinimumLoading React Integration', () => {
    it('should render SKELETON_ACTIVE initially when isLoading is true', () => {
      const html = renderToString(React.createElement(TestConsumer, { isLoading: true }));
      assert.ok(html.includes('SKELETON_ACTIVE'), 'Hook must evaluate to true on initial loading state');
    });

    it('should render CONTENT_ACTIVE initially when isLoading is false', () => {
      const html = renderToString(React.createElement(TestConsumer, { isLoading: false }));
      assert.ok(html.includes('CONTENT_ACTIVE'), 'Hook must evaluate to false when not loading');
    });
  });
});
