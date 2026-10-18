import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  KeyboardSequenceParser,
  isEditableElement,
  GLOBAL_SHORTCUTS,
  type KeyEventLike,
} from '../keyboard-shortcuts.ts';

describe('Phase 3D — Global Keyboard Shortcuts & Reference Modal', () => {
  const modalSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/ui/keyboard-shortcuts-modal.tsx'),
    'utf-8'
  );
  const shortcutHintSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/ui/shortcut-hint.tsx'),
    'utf-8'
  );
  const hookSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/hooks/use-keyboard-shortcuts.ts'),
    'utf-8'
  );
  const appShellSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/layout/AppShell.tsx'),
    'utf-8'
  );
  const navbarSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/layout/Navbar.tsx'),
    'utf-8'
  );

  describe('1. Modifier Combination Shortcuts (Cmd/Ctrl + Key)', () => {
    it('Cmd+K and Ctrl+K trigger search action', () => {
      const parser = new KeyboardSequenceParser();

      const cmdK: KeyEventLike = { key: 'k', metaKey: true };
      const resCmd = parser.parse(cmdK);
      assert.strictEqual(resCmd.matched, true);
      assert.strictEqual(resCmd.action, 'search');
      assert.strictEqual(resCmd.shouldPreventDefault, true);

      const ctrlK: KeyEventLike = { key: 'K', ctrlKey: true };
      const resCtrl = parser.parse(ctrlK);
      assert.strictEqual(resCtrl.matched, true);
      assert.strictEqual(resCtrl.action, 'search');
    });

    it('Cmd+N and Ctrl+N trigger new post composer action', () => {
      const parser = new KeyboardSequenceParser();

      const cmdN: KeyEventLike = { key: 'n', metaKey: true };
      const res = parser.parse(cmdN);
      assert.strictEqual(res.matched, true);
      assert.strictEqual(res.action, 'new_post');
      assert.strictEqual(res.shouldPreventDefault, true);
    });

    it('Cmd+M and Ctrl+M trigger messages navigation', () => {
      const parser = new KeyboardSequenceParser();

      const cmdM: KeyEventLike = { key: 'm', metaKey: true };
      const res = parser.parse(cmdM);
      assert.strictEqual(res.matched, true);
      assert.strictEqual(res.action, 'messages');
    });

    it('Cmd+, and Ctrl+, trigger settings navigation', () => {
      const parser = new KeyboardSequenceParser();

      const cmdComma: KeyEventLike = { key: ',', metaKey: true };
      const res = parser.parse(cmdComma);
      assert.strictEqual(res.matched, true);
      assert.strictEqual(res.action, 'settings');
    });
  });

  describe('2. Single Key Triggers (Escape, ?)', () => {
    it('Escape triggers close_modal action and prevents default', () => {
      const parser = new KeyboardSequenceParser();
      const res = parser.parse({ key: 'Escape' });
      assert.strictEqual(res.matched, true);
      assert.strictEqual(res.action, 'close_modal');
      assert.strictEqual(res.shouldPreventDefault, true);
    });

    it('? (and Shift + /) triggers open_shortcuts_modal action', () => {
      const parser = new KeyboardSequenceParser();

      const questionMark = parser.parse({ key: '?' });
      assert.strictEqual(questionMark.matched, true);
      assert.strictEqual(questionMark.action, 'open_shortcuts_modal');

      const shiftSlash = parser.parse({ key: '/', shiftKey: true });
      assert.strictEqual(shiftSlash.matched, true);
      assert.strictEqual(shiftSlash.action, 'open_shortcuts_modal');
    });
  });

  describe('3. Sequential Multi-Key Parser ("G then H / P / D / C")', () => {
    it('G then H triggers go_home within timeout window', () => {
      const parser = new KeyboardSequenceParser(1000);
      const t0 = 10000;

      const step1 = parser.parse({ key: 'g' }, false, t0);
      assert.strictEqual(step1.matched, false);
      assert.strictEqual(step1.pendingSequence, 'g');

      const step2 = parser.parse({ key: 'h' }, false, t0 + 300);
      assert.strictEqual(step2.matched, true);
      assert.strictEqual(step2.action, 'go_home');
      assert.strictEqual(parser.getPendingSequence(), null, 'Buffer must be reset after sequence match');
    });

    it('G then P triggers go_profile', () => {
      const parser = new KeyboardSequenceParser(1000);
      const t0 = 10000;

      parser.parse({ key: 'g' }, false, t0);
      const step2 = parser.parse({ key: 'p' }, false, t0 + 400);
      assert.strictEqual(step2.matched, true);
      assert.strictEqual(step2.action, 'go_profile');
    });

    it('G then D triggers go_discover', () => {
      const parser = new KeyboardSequenceParser(1000);
      const t0 = 10000;

      parser.parse({ key: 'G' }, false, t0);
      const step2 = parser.parse({ key: 'd' }, false, t0 + 400);
      assert.strictEqual(step2.matched, true);
      assert.strictEqual(step2.action, 'go_discover');
    });

    it('G then C triggers go_communities', () => {
      const parser = new KeyboardSequenceParser(1000);
      const t0 = 10000;

      parser.parse({ key: 'g' }, false, t0);
      const step2 = parser.parse({ key: 'C' }, false, t0 + 500);
      assert.strictEqual(step2.matched, true);
      assert.strictEqual(step2.action, 'go_communities');
    });

    it('Sequence expires when second key arrives after timeout (> 1000ms)', () => {
      const parser = new KeyboardSequenceParser(1000);
      const t0 = 10000;

      parser.parse({ key: 'g' }, false, t0);
      const step2 = parser.parse({ key: 'h' }, false, t0 + 1200);
      assert.strictEqual(step2.matched, false, 'Sequence must not trigger after timeout');
      assert.strictEqual(parser.getPendingSequence(), null, 'Buffer must be cleared after timeout');
    });

    it('Sequence resets immediately on mismatched second key', () => {
      const parser = new KeyboardSequenceParser(1000);
      const t0 = 10000;

      parser.parse({ key: 'g' }, false, t0);
      const step2 = parser.parse({ key: 'z' }, false, t0 + 200);
      assert.strictEqual(step2.matched, false);
      assert.strictEqual(parser.getPendingSequence(), null);
    });

    it('Repeated initial key (G then G) refreshes the sequence timer', () => {
      const parser = new KeyboardSequenceParser(1000);
      const t0 = 10000;

      parser.parse({ key: 'g' }, false, t0);
      const repeat = parser.parse({ key: 'g' }, false, t0 + 600);
      assert.strictEqual(repeat.matched, false);
      assert.strictEqual(repeat.pendingSequence, 'g');

      // Now at t0 + 1300 (which is >1000ms from t0, but only 700ms from repeat)
      const stepH = parser.parse({ key: 'h' }, false, t0 + 1300);
      assert.strictEqual(stepH.matched, true);
      assert.strictEqual(stepH.action, 'go_home');
    });
  });

  describe('4. Editable Focus Guard (input / textarea / contenteditable)', () => {
    it('isEditableElement correctly identifies interactive text surfaces', () => {
      assert.strictEqual(isEditableElement({ tagName: 'INPUT' }), true);
      assert.strictEqual(isEditableElement({ tagName: 'textarea' }), true);
      assert.strictEqual(isEditableElement({ tagName: 'SELECT' }), true);
      assert.strictEqual(isEditableElement({ isContentEditable: true }), true);
      assert.strictEqual(isEditableElement({ tagName: 'DIV' }), false);
      assert.strictEqual(isEditableElement({ tagName: 'BUTTON' }), false);
      assert.strictEqual(isEditableElement(null), false);
      assert.strictEqual(isEditableElement(undefined), false);
    });

    it('Ignores navigation and action shortcuts when focus is in editable elements', () => {
      const parser = new KeyboardSequenceParser();
      const isEditable = true;

      assert.strictEqual(parser.parse({ key: 'k', metaKey: true }, isEditable).matched, false);
      assert.strictEqual(parser.parse({ key: 'n', metaKey: true }, isEditable).matched, false);
      assert.strictEqual(parser.parse({ key: 'm', metaKey: true }, isEditable).matched, false);
      assert.strictEqual(parser.parse({ key: ',', metaKey: true }, isEditable).matched, false);
      assert.strictEqual(parser.parse({ key: '?' }, isEditable).matched, false);
      assert.strictEqual(parser.parse({ key: 'g' }, isEditable).matched, false);
    });

    it('Always permits Escape even when focused inside an editable element', () => {
      const parser = new KeyboardSequenceParser();
      const isEditable = true;

      const res = parser.parse({ key: 'Escape' }, isEditable);
      assert.strictEqual(res.matched, true);
      assert.strictEqual(res.action, 'close_modal');
      assert.strictEqual(res.shouldPreventDefault, true);
    });
  });

  describe('5. Global Shortcuts Registry Invariants', () => {
    it('Registry contains all 10 desktop power-user shortcuts', () => {
      const expectedActions = [
        'search',
        'new_post',
        'open_shortcuts_modal',
        'close_modal',
        'go_home',
        'go_profile',
        'go_discover',
        'go_communities',
        'messages',
        'settings',
      ];

      for (const action of expectedActions) {
        const found = GLOBAL_SHORTCUTS.find((s) => s.id === action);
        assert.ok(found, `GLOBAL_SHORTCUTS must define action: ${action}`);
      }
    });

    it('Organizes shortcuts into Navigation and Actions & Search categories', () => {
      const categories = new Set(GLOBAL_SHORTCUTS.map((s) => s.category));
      assert.ok(categories.has('Navigation'));
      assert.ok(categories.has('Actions & Search'));
    });
  });

  describe('6. Component Implementation & Layout Verification', () => {
    it('KeyboardShortcutsModal defines role="dialog", aria-modal="true", and surface-4', () => {
      assert.ok(modalSource.includes('role="dialog"'), 'Must define role="dialog"');
      assert.ok(modalSource.includes('aria-modal="true"'), 'Must define aria-modal="true"');
      assert.ok(
        modalSource.includes('bg-surface-4'),
        'Must style card with surface-4 elevation'
      );
      assert.ok(
        modalSource.includes('border-white/[0.08]'),
        'Must use surface-4 border token border-white/[0.08]'
      );
    });

    it('KeyboardShortcutsModal renders a 2-column list layout', () => {
      assert.ok(
        modalSource.includes('grid grid-cols-1 md:grid-cols-2 gap-6'),
        'Must use 2-column grid layout'
      );
      assert.ok(modalSource.includes('Navigation'), 'Must render Navigation column');
      assert.ok(modalSource.includes('Actions & Overlays'), 'Must render Actions column');
    });

    it('KeyboardShortcutsModal respects useSafeMotion / reduced-motion', () => {
      assert.ok(
        modalSource.includes('useSafeMotion'),
        'Must import and call useSafeMotion'
      );
      assert.ok(
        modalSource.includes('prefersReduced'),
        'Must branch on prefersReduced'
      );
    });

    it('ShortcutHint renders semantic <kbd> elements with surface-3 styling', () => {
      assert.ok(shortcutHintSource.includes('<kbd'), 'Must render <kbd> tags');
      assert.ok(
        shortcutHintSource.includes('dark:bg-surface-3'),
        'Must use dark:bg-surface-3 for kbd background'
      );
    });

    it('AppShell mounts useKeyboardShortcuts and lazy-loads KeyboardShortcutsModal', () => {
      assert.ok(
        appShellSource.includes('useKeyboardShortcuts()'),
        'AppShell must call useKeyboardShortcuts hook'
      );
      assert.ok(
        appShellSource.includes('KeyboardShortcutsModal'),
        'AppShell must render KeyboardShortcutsModal'
      );
      assert.ok(
        appShellSource.includes('dynamic('),
        'AppShell must lazily load modal'
      );
    });

    it('Navbar integrates ShortcutHint with ⌘K badge', () => {
      assert.ok(
        navbarSource.includes('ShortcutHint'),
        'Navbar must import and render ShortcutHint'
      );
      assert.ok(
        navbarSource.includes('shortcut="⌘K"'),
        'Navbar must pass ⌘K to ShortcutHint'
      );
    });
  });
});
