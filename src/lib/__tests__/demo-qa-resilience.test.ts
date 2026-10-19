import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { getAvatarGradientStyle, getInitials } from '../avatar-gradient.ts';
import {
  SAFE_SPRING_CONFIG,
  getButtonPressClass,
  getCardHoverClass,
  getToggleKnobClass,
} from '../animations.ts';
import { isEditableElement, KeyboardSequenceParser } from '../keyboard-shortcuts.ts';

describe('Demo Hardening, 3G Low-Bandwidth QA & Investor Script Verification', () => {
  // ══════════════════════════════════════════════════════════════════════════
  // Test 1: Zero-Network UserAvatar Gradient & Initials Calculation
  // ══════════════════════════════════════════════════════════════════════════
  it('1. Computes deterministic HSL avatar gradients and initials instantly without network dependency', () => {
    const style1 = getAvatarGradientStyle('kwame_accra');
    const style2 = getAvatarGradientStyle('amina_nairobi');
    const styleSame = getAvatarGradientStyle('kwame_accra');

    assert.ok(style1.background.includes('linear-gradient'), 'Must generate CSS linear-gradient');
    assert.ok(style1.background.includes('hsl('), 'Must utilize HSL color space');
    assert.deepEqual(style1, styleSame, 'Hash must be strictly deterministic for the same username');
    assert.notDeepEqual(style1, style2, 'Different users must receive distinct gradient styles');

    // Initials computation
    assert.equal(getInitials('Kwame Mensah'), 'KM');
    assert.equal(getInitials('Amina Yusuf'), 'AY');
    assert.equal(getInitials('Chinedu'), 'CH');
    assert.equal(getInitials(''), 'AL');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Test 2: Animation & Safe Motion Guards (Reduced-Motion Compliance)
  // ══════════════════════════════════════════════════════════════════════════
  it('2. Enforces GPU-safe micro-interactions and disables motion when prefers-reduced-motion is true', () => {
    // Standard motion classes
    const activePressNormal = getButtonPressClass(false);
    const hoverLiftNormal = getCardHoverClass(false);
    const toggleKnobNormal = getToggleKnobClass(false);

    assert.ok(activePressNormal.includes('active:scale-[0.97]'));
    assert.ok(hoverLiftNormal.includes('hover:translate-y-[-2px]'));
    assert.ok(toggleKnobNormal.includes('transition-transform duration-200'));

    // Reduced motion classes must strip transform animations
    const activePressReduced = getButtonPressClass(true);
    const hoverLiftReduced = getCardHoverClass(true);
    const toggleKnobReduced = getToggleKnobClass(true);

    assert.equal(activePressReduced, 'active:scale-100');
    assert.equal(hoverLiftReduced, 'hover:translate-y-0');
    assert.equal(toggleKnobReduced, 'transition-none');

    // Safe spring physics
    assert.ok(SAFE_SPRING_CONFIG.stiffness <= 400, 'Stiffness must be <= 400 for 60fps safety');
    assert.ok(SAFE_SPRING_CONFIG.damping >= 20, 'Damping must be >= 20 to prevent runaway oscillations');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Test 3: Keyboard Shortcuts Protection inside Editable Form Inputs
  // ══════════════════════════════════════════════════════════════════════════
  it('3. Prevents desktop keyboard shortcuts from intercepting user input inside form fields', () => {
    const parser = new KeyboardSequenceParser(1000);

    // Mock editable targets
    assert.equal(isEditableElement({ tagName: 'INPUT' }), true);
    assert.equal(isEditableElement({ tagName: 'TEXTAREA' }), true);
    assert.equal(isEditableElement({ tagName: 'SELECT' }), true);
    assert.equal(isEditableElement({ isContentEditable: true }), true);
    assert.equal(isEditableElement({ tagName: 'DIV' }), false);
    assert.equal(isEditableElement(null), false);

    // When inside an editable field, Cmd+K / Cmd+N / '?' must NOT trigger action
    const searchInInput = parser.parse({ key: 'k', metaKey: true }, true);
    assert.equal(searchInInput.matched, false, 'Cmd+K must not trigger search while typing in input');

    const newPostInInput = parser.parse({ key: 'n', metaKey: true }, true);
    assert.equal(newPostInInput.matched, false, 'Cmd+N must not trigger composer while typing in input');

    const questionInInput = parser.parse({ key: '?' }, true);
    assert.equal(questionInInput.matched, false, '? must not open shortcuts modal while typing in input');

    // ONLY Escape is permitted in editable elements (to dismiss/blur)
    const escapeInInput = parser.parse({ key: 'Escape' }, true);
    assert.equal(escapeInInput.matched, true);
    assert.equal(escapeInInput.action, 'close_modal');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Test 4: Accessibility Audit - Icon-Only Controls Have Explicit aria-label
  // ══════════════════════════════════════════════════════════════════════════
  it('4. Confirms AudioPlayer, VoiceRecorder, ThemeToggle, ShareModal and ConnectRow have explicit aria-label attributes', () => {
    const checkFile = (relPath: string, expectedTokens: string[]) => {
      const fullPath = path.resolve(process.cwd(), relPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const token of expectedTokens) {
        assert.ok(
          content.includes(token),
          `Expected ${relPath} to include aria-label token "${token}"`
        );
      }
    };

    // AudioPlayer
    checkFile('src/features/messaging/AudioPlayer.tsx', [
      'aria-label={isPlaying ?',
      'Pause audio',
      'Play voice message',
    ]);

    // VoiceRecorder
    checkFile('src/features/messaging/VoiceRecorder.tsx', [
      'aria-label="Record voice message"',
      'aria-label="Cancel recording"',
      'aria-label="Send voice note"',
    ]);

    // ThemeToggle
    checkFile('src/components/theme/ThemeToggle.tsx', [
      'aria-label={isDark ?',
      'Switch to light mode',
    ]);

    // ShareModal
    checkFile('src/features/posts/ShareModal.tsx', [
      'aria-label="Share to My Feed"',
      'aria-label="Share to Community"',
      'aria-label="Share via Direct Message"',
      'aria-label="Copy link to post"',
    ]);

    // ConnectRow
    checkFile('src/features/connect/ConnectRow.tsx', [
      'aria-label={`${buttonConfig.label} ${user.fullName}`}',
    ]);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Test 5: Dynamic Chunk Lazy-Loading Isolation
  // ══════════════════════════════════════════════════════════════════════════
  it('5. Confirms SearchOverlay, EmojiPicker, and VoiceRecorder chunks are lazy-loaded with { ssr: false }', () => {
    const navbarContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/layout/Navbar.tsx'),
      'utf8'
    );
    assert.match(
      navbarContent,
      /dynamic\(\s*\(\)\s*=>\s*import\(['"]@\/features\/search\/GlobalSearchModal['"]\)/,
      'GlobalSearchModal must be dynamically imported in Navbar'
    );

    const emojiContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ui/EmojiPickerPopover.tsx'),
      'utf8'
    );
    assert.match(
      emojiContent,
      /dynamic\(\s*\(\)\s*=>\s*import\(['"]emoji-picker-react['"]\),\s*\{[^}]*ssr:\s*false/s,
      'EmojiPicker must be dynamically imported with { ssr: false }'
    );

    const chatViewContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/features/messaging/ChatView.tsx'),
      'utf8'
    );
    assert.match(
      chatViewContent,
      /dynamic\(\s*\(\)\s*=>\s*import\(['"]\.\/VoiceRecorder['"]\)/,
      'VoiceRecorder must be dynamically imported'
    );
    assert.match(
      chatViewContent,
      /VoiceRecorder[\s\S]*?ssr:\s*false/,
      'VoiceRecorder must have ssr: false'
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Test 6: Investor Demonstration Guide (DEMO.md) Verification
  // ══════════════════════════════════════════════════════════════════════════
  it('6. Verifies DEMO.md contains comprehensive 6-Act investor demonstration script and technical specs', () => {
    const demoPath = path.resolve(process.cwd(), 'DEMO.md');
    assert.ok(fs.existsSync(demoPath), 'DEMO.md must exist in root project directory');

    const demoContent = fs.readFileSync(demoPath, 'utf8');

    // Verify all 6 acts are present
    assert.match(demoContent, /Act 1:.*Pan-African Onboarding/i, 'Must contain Act 1');
    assert.match(demoContent, /Act 2:.*Pan-African Feed.*Reactions/i, 'Must contain Act 2');
    assert.match(demoContent, /Act 3:.*Regional Discovery Track/i, 'Must contain Act 3');
    assert.match(demoContent, /Act 4:.*Voice Messaging.*AI Translation/i, 'Must contain Act 4');
    assert.match(demoContent, /Act 5:.*Trust & Safety.*Admin/i, 'Must contain Act 5');
    assert.match(demoContent, /Act 6:.*Low-Bandwidth.*Offline PWA/i, 'Must contain Act 6');

    // Verify key 3G / low-bandwidth technical highlights
    assert.match(demoContent, /Slow 3G|Fast 3G/i, 'Must detail 3G simulation');
    assert.match(demoContent, /150\s*kB/i, 'Must specify bundle budget');
    assert.match(demoContent, /54 sovereign African nations/i, 'Must mention 54 nations');
    assert.match(demoContent, /1-tier comment/i, 'Must explain 1-tier comment hierarchy');
  });
});
