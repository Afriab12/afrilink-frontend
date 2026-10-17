import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  SURFACE_TOKENS,
  BORDER_TOKENS,
  TEXT_OPACITY_SCALE,
  getSurfaceHex,
  getBorderForSurface,
} from '../theme-tokens.ts';

describe('Phase 1A — Dark Mode Depth Layer System Tokens', () => {
  it('SURFACE_TOKENS should have exact 6 elevation layers on Obsidian Green palette', () => {
    assert.strictEqual(SURFACE_TOKENS[0], '#0B130E', 'Layer 0 (Page Background) must be #0B130E');
    assert.strictEqual(SURFACE_TOKENS[1], '#0F1A13', 'Layer 1 (Sidebar/Nav) must be #0F1A13');
    assert.strictEqual(SURFACE_TOKENS[2], '#131F17', 'Layer 2 (Cards/Containers) must be #131F17');
    assert.strictEqual(SURFACE_TOKENS[3], '#172A1F', 'Layer 3 (Interactive Hover) must be #172A1F');
    assert.strictEqual(SURFACE_TOKENS[4], '#1C3226', 'Layer 4 (Overlays/Dropdowns) must be #1C3226');
    assert.strictEqual(SURFACE_TOKENS[5], '#213D2E', 'Layer 5 (Toasts/Tooltips) must be #213D2E');
  });

  it('BORDER_TOKENS should have exact stepped opacity borders', () => {
    assert.strictEqual(BORDER_TOKENS['surface-0-1'], 'border-white/[0.04]');
    assert.strictEqual(BORDER_TOKENS['surface-2-3'], 'border-white/[0.06]');
    assert.strictEqual(BORDER_TOKENS['surface-4-5'], 'border-white/[0.08]');
  });

  it('TEXT_OPACITY_SCALE should have exact 5-tier white opacity hierarchy', () => {
    assert.strictEqual(TEXT_OPACITY_SCALE.primary, 'text-white/90');
    assert.strictEqual(TEXT_OPACITY_SCALE.secondary, 'text-white/60');
    assert.strictEqual(TEXT_OPACITY_SCALE.tertiary, 'text-white/35');
    assert.strictEqual(TEXT_OPACITY_SCALE.disabled, 'text-white/20');
    assert.strictEqual(TEXT_OPACITY_SCALE.ghost, 'text-white/10');
  });

  it('getSurfaceHex should resolve hex codes correctly for all 6 layers', () => {
    for (let layer = 0; layer <= 5; layer++) {
      const hex = getSurfaceHex(layer as any);
      assert.strictEqual(hex, SURFACE_TOKENS[layer as keyof typeof SURFACE_TOKENS]);
    }
  });

  it('getBorderForSurface should map layers 0-1, 2-3, and 4-5 to correct border classes', () => {
    assert.strictEqual(getBorderForSurface(0), 'border-white/[0.04]');
    assert.strictEqual(getBorderForSurface(1), 'border-white/[0.04]');
    assert.strictEqual(getBorderForSurface(2), 'border-white/[0.06]');
    assert.strictEqual(getBorderForSurface(3), 'border-white/[0.06]');
    assert.strictEqual(getBorderForSurface(4), 'border-white/[0.08]');
    assert.strictEqual(getBorderForSurface(5), 'border-white/[0.08]');
  });
});
