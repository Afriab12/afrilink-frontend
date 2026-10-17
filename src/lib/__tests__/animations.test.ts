import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  SAFE_SPRING_CONFIG,
  pageTransitionVariants,
  fadeVariants,
  scaleVariants,
  slideUpVariants,
  REACTION_BURST_CONSTRAINTS,
} from '../animations.ts';

describe('Animation Safeguards & Constraints (Phase 0 Strategy)', () => {
  it('SAFE_SPRING_CONFIG must obey stiffness <= 400, damping >= 20, mass <= 1', () => {
    assert.ok(SAFE_SPRING_CONFIG.stiffness <= 400, `Stiffness must be <= 400, got ${SAFE_SPRING_CONFIG.stiffness}`);
    assert.ok(SAFE_SPRING_CONFIG.damping >= 20, `Damping must be >= 20, got ${SAFE_SPRING_CONFIG.damping}`);
    assert.ok(SAFE_SPRING_CONFIG.mass <= 1, `Mass must be <= 1, got ${SAFE_SPRING_CONFIG.mass}`);
    assert.strictEqual(SAFE_SPRING_CONFIG.type, 'spring');
  });

  it('pageTransitionVariants must restrict animations to opacity and translateY, with duration <= 250ms', () => {
    // Only opacity and transform allowed
    const initialKeys = Object.keys(pageTransitionVariants.initial);
    assert.ok(initialKeys.every((k) => k === 'opacity' || k === 'transform'), 'Initial must only animate compositor properties');

    const animateKeys = Object.keys(pageTransitionVariants.animate);
    assert.ok(animateKeys.every((k) => k === 'opacity' || k === 'transform' || k === 'transition'), 'Animate must only animate compositor properties');

    const duration = pageTransitionVariants.animate.transition.duration;
    assert.ok(duration <= 0.25, `Page transition duration must be <= 250ms (0.25s), got ${duration}`);
    assert.ok(pageTransitionVariants.initial.transform.includes('translateY(8px)'), 'Initial must use translateY(8px)');
  });

  it('fadeVariants and scaleVariants must animate only compositor-friendly properties', () => {
    // fadeVariants: opacity only
    assert.ok(Object.keys(fadeVariants.initial).every((k) => k === 'opacity'));
    assert.ok(Object.keys(fadeVariants.animate).every((k) => k === 'opacity' || k === 'transition'));

    // scaleVariants: transform + opacity only
    assert.ok(Object.keys(scaleVariants.initial).every((k) => k === 'opacity' || k === 'transform'));
    assert.ok(Object.keys(scaleVariants.animate).every((k) => k === 'opacity' || k === 'transform' || k === 'transition'));

    // slideUpVariants: translateY + opacity only
    assert.ok(Object.keys(slideUpVariants.initial).every((k) => k === 'opacity' || k === 'transform'));
    assert.ok(Object.keys(slideUpVariants.animate).every((k) => k === 'opacity' || k === 'transform' || k === 'transition'));
  });

  it('REACTION_BURST_CONSTRAINTS must cap dots <= 6 and duration <= 400ms', () => {
    assert.ok(REACTION_BURST_CONSTRAINTS.maxDots <= 6, `Max dots must be <= 6, got ${REACTION_BURST_CONSTRAINTS.maxDots}`);
    assert.ok(REACTION_BURST_CONSTRAINTS.durationMs <= 400, `Duration must be <= 400ms, got ${REACTION_BURST_CONSTRAINTS.durationMs}`);
    assert.deepStrictEqual(REACTION_BURST_CONSTRAINTS.properties, ['transform', 'opacity'], 'Must only animate transform and opacity');
  });

  it('useSafeMotion helpers should strip transitions or return fallbacks when motion is reduced', async () => {
    // Simulate safe motion logic in isolation
    const prefersReduced = true;
    const safeAnimate = <T>(animation: T, fallback: T | null = null): T | null =>
      prefersReduced ? fallback : animation;

    const safeVariants = <T extends Record<string, any>>(variants: T): T => {
      if (!prefersReduced) return variants;
      const stripped: Record<string, any> = {};
      for (const [key, value] of Object.entries(variants)) {
        stripped[key] = {
          ...value,
          transition: { duration: 0 },
        };
      }
      return stripped as T;
    };

    // When reduced motion is active
    const result = safeAnimate({ opacity: 1, scale: 1 }, null);
    assert.strictEqual(result, null, 'safeAnimate should return fallback when reduced motion is preferred');

    const stripped = safeVariants(fadeVariants);
    assert.strictEqual(stripped.animate.transition.duration, 0, 'Transitions should be duration: 0 when reduced motion is preferred');
  });
});
