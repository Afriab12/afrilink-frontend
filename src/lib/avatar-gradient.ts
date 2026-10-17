/**
 * AfriLink Avatar Placeholder & Gradient Generation Utilities
 * Phase 0: Non-Negotiable Engineering Constraints
 * 
 * Provides zero-network, CSS-only avatar placeholders with deterministic HSL gradients
 * based on username/id hashing and two-letter initials extraction.
 */

import React from 'react';

/**
 * Deterministic hash function (djb2 variant) converting any string into a positive integer.
 */
export function hashString(str: string): number {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns a deterministic HSL hue angle [0, 359] for any user identifier.
 */
export function getAvatarHue(identifier: string): number {
  return hashString(identifier || '') % 360;
}

/**
 * Generates the deterministic CSS linear-gradient string for a user identifier.
 * Requirement: linear-gradient(135deg, hsl(var(--h), 45%, 35%), hsl(calc(var(--h) + 40), 50%, 25%))
 */
export function getAvatarGradient(identifier: string): string {
  const h = getAvatarHue(identifier);
  return `linear-gradient(135deg, hsl(${h}, 45%, 35%), hsl(${(h + 40) % 360}, 50%, 25%))`;
}

/**
 * Generates a React CSSProperties object containing both the CSS variable `--h`
 * and the CSS linear-gradient background.
 */
export function getAvatarGradientStyle(identifier: string): React.CSSProperties {
  const h = getAvatarHue(identifier);
  return {
    ['--h' as any]: `${h}`,
    background: `linear-gradient(135deg, hsl(${h}, 45%, 35%), hsl(${(h + 40) % 360}, 50%, 25%))`,
  };
}

/**
 * Extracts two-letter initials from a user's display name.
 * e.g. "Amara Okafor" -> "AO", "Kwame" -> "KW", "Amara Ngozi Okafor" -> "AO"
 */
export function getInitials(name?: string | null, fallback = 'AL'): string {
  if (!name || typeof name !== 'string') return fallback;
  const trimmed = name.trim();
  if (!trimmed) return fallback;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallback;
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
