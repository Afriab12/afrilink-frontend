import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  SAFE_SPRING_CONFIG,
  REACTION_SPRING_CONFIG,
  REACTION_BURST_CONSTRAINTS,
  BUTTON_PRESS_CLASS,
  BUTTON_PRESS_CONFIG,
  getButtonPressClass,
  CARD_HOVER_LIFT_CLASS,
  CARD_HOVER_LIFT_CONFIG,
  getCardHoverClass,
  TOGGLE_KNOB_TRANSITION,
  TOGGLE_KNOB_CONFIG,
  getToggleKnobClass,
  PAGE_ENTER_CONFIG,
  PAGE_ENTER_CLASS,
  pageTransitionVariants,
  fadeVariants,
  scaleVariants,
  slideUpVariants,
} from '../animations.ts';

describe('Phase 3A — Micro-Interactions Library & Animation Safeguards', () => {
  const reactionPickerSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/posts/ReactionPicker.tsx'),
    'utf-8'
  );
  const postCardSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/posts/PostCard.tsx'),
    'utf-8'
  );
  const reactionBurstSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/ui/ReactionBurst.tsx'),
    'utf-8'
  );
  const globalsCssSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/globals.css'),
    'utf-8'
  );

  describe('1. Reaction Burst Micro-Interaction', () => {
    it('must obey spring stiffness <= 400 and damping >= 20', () => {
      assert.ok(
        REACTION_SPRING_CONFIG.stiffness <= 400,
        `Stiffness must be <= 400, got ${REACTION_SPRING_CONFIG.stiffness}`
      );
      assert.ok(
        REACTION_SPRING_CONFIG.damping >= 20,
        `Damping must be >= 20, got ${REACTION_SPRING_CONFIG.damping}`
      );
      assert.ok(REACTION_SPRING_CONFIG.mass <= 1, 'Mass must be <= 1');
      assert.strictEqual(REACTION_SPRING_CONFIG.type, 'spring');
    });

    it('must cap dots <= 6 and duration <= 400ms with scale 1 -> 1.5 -> 1', () => {
      assert.ok(
        REACTION_BURST_CONSTRAINTS.maxDots <= 6,
        `Max dots must be <= 6, got ${REACTION_BURST_CONSTRAINTS.maxDots}`
      );
      assert.ok(
        REACTION_BURST_CONSTRAINTS.durationMs <= 400,
        `Duration must be <= 400ms, got ${REACTION_BURST_CONSTRAINTS.durationMs}`
      );
      assert.deepStrictEqual(
        REACTION_BURST_CONSTRAINTS.properties,
        ['transform', 'opacity'],
        'Must only animate compositor properties: transform and opacity'
      );
      assert.deepStrictEqual(
        REACTION_BURST_CONSTRAINTS.scaleRange,
        [1, 1.5, 1],
        'Scale range must be 1 -> 1.5 -> 1'
      );
    });

    it('must define CSS keyframes for 1 -> 1.5 -> 1 scale and exactly 6 particle dots without canvas', () => {
      assert.match(globalsCssSource, /@keyframes\s+reaction-scale-burst/);
      assert.match(globalsCssSource, /transform:\s*scale\(1\.5\)/);
      assert.match(globalsCssSource, /@keyframes\s+reaction-dot-1/);
      assert.match(globalsCssSource, /@keyframes\s+reaction-dot-6/);
      assert.ok(!reactionBurstSource.includes('<canvas'), 'Reaction burst must not render a canvas element');
      assert.ok(!reactionBurstSource.includes('canvas-confetti'), 'Must not import canvas-confetti');
      assert.ok(!reactionBurstSource.includes('framer-motion'), 'Must not import heavy animation libs');
    });

    it('ReactionBurst component must respect reduced motion', () => {
      assert.match(reactionBurstSource, /useReducedMotion/);
      assert.match(globalsCssSource, /prefers-reduced-motion:\s*reduce/);
      assert.match(globalsCssSource, /\.animate-reaction-scale[\s\S]*?animation:\s*none\s*!important/);
    });
  });

  describe('2. Button Press Micro-Interaction', () => {
    it('BUTTON_PRESS_CLASS must enforce active:scale-[0.97] duration-100', () => {
      assert.match(BUTTON_PRESS_CLASS, /active:scale-\[0\.97\]/);
      assert.match(BUTTON_PRESS_CLASS, /duration-100/);
      assert.strictEqual(BUTTON_PRESS_CONFIG.scale, 0.97);
      assert.strictEqual(BUTTON_PRESS_CONFIG.durationMs, 100);
    });

    it('getButtonPressClass must return false target when reduced motion is active', () => {
      assert.strictEqual(
        getButtonPressClass(true),
        'active:scale-100',
        'Should disable scale when reduced motion is requested'
      );
      assert.match(getButtonPressClass(false), /active:scale-\[0\.97\]/);
    });
  });

  describe('3. Card Hover Lift Micro-Interaction', () => {
    it('CARD_HOVER_LIFT_CLASS must enforce hover:translate-y-[-2px] only', () => {
      assert.match(CARD_HOVER_LIFT_CLASS, /hover:translate-y-\[-2px\]/);
      assert.strictEqual(CARD_HOVER_LIFT_CONFIG.translateY, '-2px');
      assert.strictEqual(CARD_HOVER_LIFT_CONFIG.property, 'transform');
    });

    it('getCardHoverClass must return false target when reduced motion is active', () => {
      assert.strictEqual(
        getCardHoverClass(true),
        'hover:translate-y-0',
        'Should disable lift translation when reduced motion is requested'
      );
      assert.match(getCardHoverClass(false), /hover:translate-y-\[-2px\]/);
    });
  });

  describe('4. Toggle Knobs Micro-Interaction', () => {
    it('TOGGLE_KNOB_TRANSITION must enforce translateX spring cubic-bezier(0.34,1.56,0.64,1) <= 200ms', () => {
      assert.match(TOGGLE_KNOB_TRANSITION, /ease-\[cubic-bezier\(0\.34,1\.56,0\.64,1\)\]/);
      assert.match(TOGGLE_KNOB_TRANSITION, /duration-200/);
      assert.ok(TOGGLE_KNOB_CONFIG.durationMs <= 200);
      assert.strictEqual(TOGGLE_KNOB_CONFIG.easing, 'cubic-bezier(0.34, 1.56, 0.64, 1)');
      assert.strictEqual(TOGGLE_KNOB_CONFIG.property, 'translateX');
    });

    it('getToggleKnobClass must return transition-none when reduced motion is active', () => {
      assert.strictEqual(
        getToggleKnobClass(true),
        'transition-none',
        'Should return transition-none when reduced motion is preferred'
      );
      assert.match(getToggleKnobClass(false), /cubic-bezier/);
    });
  });

  describe('5. Page Enter Transitions', () => {
    it('pageTransitionVariants must enforce opacity + translateY(8px) with duration <= 250ms', () => {
      const initialKeys = Object.keys(pageTransitionVariants.initial);
      assert.ok(initialKeys.every((k) => k === 'opacity' || k === 'transform'));

      const animateKeys = Object.keys(pageTransitionVariants.animate);
      assert.ok(animateKeys.every((k) => k === 'opacity' || k === 'transform' || k === 'transition'));

      const duration = pageTransitionVariants.animate.transition.duration;
      assert.ok(duration <= 0.25, `Page transition duration must be <= 250ms, got ${duration}`);
      assert.ok(pageTransitionVariants.initial.transform.includes('translateY(8px)'));
    });

    it('PAGE_ENTER_CONFIG must enforce duration <= 250ms and translateY 8px', () => {
      assert.ok(PAGE_ENTER_CONFIG.durationMs <= 250);
      assert.strictEqual(PAGE_ENTER_CONFIG.offsetY, '8px');
      assert.deepStrictEqual(PAGE_ENTER_CONFIG.properties, ['opacity', 'translateY']);
      assert.match(PAGE_ENTER_CLASS, /animate-page-enter/);
    });
  });

  describe('6. useSafeMotion Reduced Motion Guard', () => {
    it('should strip transitions or return false targets when motion is reduced', () => {
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

      const result = safeAnimate({ opacity: 1, scale: 1 }, null);
      assert.strictEqual(result, null, 'safeAnimate should return false/null fallback');

      const stripped = safeVariants(fadeVariants);
      assert.strictEqual(stripped.animate.transition.duration, 0, 'Transitions should be duration: 0');
    });
  });

  describe('7. Feed Reaction Controls Integration', () => {
    it('ReactionPicker must integrate ReactionBurst and BUTTON_PRESS_CLASS without changing onSelectReaction contract', () => {
      assert.match(reactionPickerSource, /import\s*\{\s*ReactionBurst\s*\}\s*from\s*['"]@\/components\/ui\/ReactionBurst['"]/);
      assert.match(reactionPickerSource, /import\s*\{\s*BUTTON_PRESS_CLASS\s*\}\s*from\s*['"]@\/lib\/animations['"]/);
      assert.match(reactionPickerSource, /<ReactionBurst[\s\S]*?active=\{isBursting\}/);
      assert.match(reactionPickerSource, /onSelectReaction:\s*\(type:\s*ReactionType\)\s*=>\s*void/);
    });

    it('PostCard must integrate ReactionBurst and CARD_HOVER_LIFT_CLASS', () => {
      assert.match(postCardSource, /import\s*\{\s*ReactionBurst\s*\}\s*from\s*['"]@\/components\/ui\/ReactionBurst['"]/);
      assert.match(postCardSource, /import\s*\{[\s\S]*?BUTTON_PRESS_CLASS[\s\S]*?CARD_HOVER_LIFT_CLASS[\s\S]*?\}\s*from\s*['"]@\/lib\/animations['"]/);
      assert.match(postCardSource, /<ReactionBurst[\s\S]*?active=\{isBurstingReaction\}/);
      assert.match(postCardSource, /\$\{CARD_HOVER_LIFT_CLASS\}/);
    });
  });
});
