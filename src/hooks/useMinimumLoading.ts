'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Pure calculation helper to determine remaining minimum loading time.
 */
export function calculateRemainingLoadingTime(
  startTime: number | null,
  now: number,
  minTimeMs: number = 300
): number {
  if (startTime === null) return 0;
  const elapsed = now - startTime;
  const remaining = minTimeMs - elapsed;
  return remaining > 0 ? remaining : 0;
}

/**
 * useMinimumLoading
 * 
 * Guarantees that a skeleton or loading state remains visible for at least `minTimeMs` (default 300ms),
 * preventing jarring visual layout flashes on fast networks, high-speed caches, or instant state flips.
 * 
 * @param isLoading Actual boolean loading state from network/stores
 * @param minTimeMs Minimum duration to maintain the visible loading state (default: 300ms)
 * @returns boolean Whether the skeleton/loading state should be displayed
 */
export function useMinimumLoading(isLoading: boolean, minTimeMs: number = 300): boolean {
  const [displayLoading, setDisplayLoading] = useState<boolean>(isLoading);
  const startTimeRef = useRef<number | null>(isLoading ? Date.now() : null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      startTimeRef.current = Date.now();
      setDisplayLoading(true);
    } else {
      if (startTimeRef.current === null) {
        setDisplayLoading(false);
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = minTimeMs - elapsed;

      if (remaining <= 0) {
        setDisplayLoading(false);
        startTimeRef.current = null;
      } else {
        timerRef.current = setTimeout(() => {
          setDisplayLoading(false);
          startTimeRef.current = null;
          timerRef.current = null;
        }, remaining);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading, minTimeMs]);

  return displayLoading;
}

export default useMinimumLoading;
