/**
 * AfriLink Dark Mode 6-Layer Depth Surface System
 * Phase 1A: Non-Negotiable Spatial Elevation Tokens
 * 
 * Replaces flat dark backgrounds with a 6-layer tonal elevation system on the Obsidian Green palette
 * so cards, sidebars, overlays, and toasts sit on distinct spatial planes.
 */

export const SURFACE_TOKENS = {
  0: '#0B130E', // Layer 0: Page Background
  1: '#0F1A13', // Layer 1: Sidebar/Nav
  2: '#131F17', // Layer 2: Cards/Containers
  3: '#172A1F', // Layer 3: Interactive Hover
  4: '#1C3226', // Layer 4: Overlays/Dropdowns
  5: '#213D2E', // Layer 5: Toasts/Tooltips
} as const;

export type SurfaceLayer = keyof typeof SURFACE_TOKENS;

export const BORDER_TOKENS = {
  'surface-0-1': 'border-white/[0.04]',
  'surface-2-3': 'border-white/[0.06]',
  'surface-4-5': 'border-white/[0.08]',
} as const;

export const TEXT_OPACITY_SCALE = {
  primary: 'text-white/90',
  secondary: 'text-white/60',
  tertiary: 'text-white/35',
  disabled: 'text-white/20',
  ghost: 'text-white/10',
} as const;

/**
 * Returns the exact hex color for a given surface elevation level.
 */
export function getSurfaceHex(layer: SurfaceLayer): string {
  return SURFACE_TOKENS[layer];
}

/**
 * Resolves the border class string based on the elevation plane.
 */
export function getBorderForSurface(layer: SurfaceLayer): string {
  if (layer <= 1) return BORDER_TOKENS['surface-0-1'];
  if (layer <= 3) return BORDER_TOKENS['surface-2-3'];
  return BORDER_TOKENS['surface-4-5'];
}
