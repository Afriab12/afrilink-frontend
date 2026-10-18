import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateAccountForm,
  validatePasswordForm,
  SETTINGS_TABS,
} from '../settings-validation.ts';

describe('Phase 2D — Settings & Account Preferences Dashboard', () => {
  const settingsSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/settings/SettingsView.tsx'),
    'utf-8'
  );

  describe('settings-validation pure helper functions', () => {
    describe('validateAccountForm', () => {
      it('should pass on valid username, email, and phone', () => {
        const errors = validateAccountForm({
          username: 'kwame_mensah',
          email: 'kwame@afrilink.africa',
          phone: '+2348012345678',
        });
        assert.strictEqual(Object.keys(errors).length, 0);
      });

      it('should fail when username is empty or whitespace', () => {
        const errors = validateAccountForm({
          username: '   ',
          email: 'kwame@afrilink.africa',
        });
        assert.strictEqual(errors.username, 'Username is required');
      });

      it('should fail when username is shorter than 3 characters', () => {
        const errors = validateAccountForm({
          username: 'ab',
          email: 'kwame@afrilink.africa',
        });
        assert.strictEqual(errors.username, 'Username must be at least 3 characters');
      });

      it('should fail when username contains invalid characters', () => {
        const errors = validateAccountForm({
          username: 'kwame@pan!africa',
          email: 'kwame@afrilink.africa',
        });
        assert.strictEqual(
          errors.username,
          'Username can only contain letters, numbers, and underscores'
        );
      });

      it('should fail when email is invalid or missing', () => {
        const missingErrors = validateAccountForm({
          username: 'kwame',
          email: '',
        });
        assert.strictEqual(missingErrors.email, 'Email address is required');

        const invalidErrors = validateAccountForm({
          username: 'kwame',
          email: 'invalid-email-format',
        });
        assert.strictEqual(invalidErrors.email, 'Please enter a valid email address');
      });

      it('should validate phone format if provided', () => {
        const invalidPhone = validateAccountForm({
          username: 'kwame',
          email: 'kwame@afrilink.africa',
          phone: 'abc',
        });
        assert.strictEqual(invalidPhone.phone, 'Please enter a valid phone number');

        const validPhone = validateAccountForm({
          username: 'kwame',
          email: 'kwame@afrilink.africa',
          phone: '+254 (700) 123-456',
        });
        assert.strictEqual(validPhone.phone, undefined);
      });
    });

    describe('validatePasswordForm', () => {
      it('should pass with valid current and matching new password of 8+ characters', () => {
        const errors = validatePasswordForm({
          currentPassword: 'oldSecret123',
          newPassword: 'newSecretSecure2026',
          confirmPassword: 'newSecretSecure2026',
        });
        assert.strictEqual(Object.keys(errors).length, 0);
      });

      it('should fail when current password is missing', () => {
        const errors = validatePasswordForm({
          newPassword: 'newSecretSecure2026',
          confirmPassword: 'newSecretSecure2026',
        });
        assert.strictEqual(errors.currentPassword, 'Current password is required');
      });

      it('should fail when new password is missing or < 8 chars', () => {
        const missingErrors = validatePasswordForm({
          currentPassword: 'oldSecret123',
          newPassword: '',
          confirmPassword: '',
        });
        assert.strictEqual(missingErrors.newPassword, 'New password is required');

        const shortErrors = validatePasswordForm({
          currentPassword: 'oldSecret123',
          newPassword: 'short',
          confirmPassword: 'short',
        });
        assert.strictEqual(shortErrors.newPassword, 'Password must be at least 8 characters');
      });

      it('should fail when confirm password does not match new password', () => {
        const errors = validatePasswordForm({
          currentPassword: 'oldSecret123',
          newPassword: 'newSecretSecure2026',
          confirmPassword: 'differentPassword2026',
        });
        assert.strictEqual(errors.confirmPassword, 'Passwords do not match');
      });
    });

    describe('SETTINGS_TABS registry', () => {
      it('should define the exact 6 sub-nav tabs with specified icons', () => {
        const expectedTabs = [
          { id: 'account', label: 'Account', iconName: 'User' },
          { id: 'privacy', label: 'Privacy & Safety', iconName: 'Shield' },
          { id: 'notifications', label: 'Notifications', iconName: 'Bell' },
          { id: 'language', label: 'Language & Region', iconName: 'Globe' },
          { id: 'appearance', label: 'Appearance', iconName: 'Palette' },
          { id: 'security', label: 'Security', iconName: 'Lock' },
        ];

        assert.strictEqual(SETTINGS_TABS.length, 6);
        expectedTabs.forEach((expected, i) => {
          assert.strictEqual(SETTINGS_TABS[i].id, expected.id);
          assert.strictEqual(SETTINGS_TABS[i].label, expected.label);
          assert.strictEqual(SETTINGS_TABS[i].iconName, expected.iconName);
        });
      });
    });
  });

  describe('Layout & Sub-Nav Architecture', () => {
    it('should enforce Desktop max-w-3xl mx-auto py-8 and Mobile full-width px-4 py-4', () => {
      assert.match(
        settingsSource,
        /w-full\s+max-w-3xl\s+mx-auto\s+px-4\s+sm:px-0\s+py-4\s+sm:py-8/
      );
    });

    it('should enforce horizontal tab strip border-b border-white/[0.06]', () => {
      assert.match(
        settingsSource,
        /role=["']tablist["']/
      );
      assert.match(
        settingsSource,
        /border-b\s+border-white\/\[0\.06\]/
      );
    });

    it('should enforce tab item styling and active/inactive states', () => {
      // Inactive: text-white/40 hover:text-white/70
      assert.match(settingsSource, /text-white\/40\s+hover:text-white\/70/);
      // Active: text-white border-b-2 border-emerald-500 -mb-px
      assert.match(settingsSource, /text-white\s+border-b-2\s+border-emerald-500\s+-mb-px/);
    });

    it('should include trailing gradient fade for mobile horizontal scrolling', () => {
      assert.match(
        settingsSource,
        /bg-gradient-to-l\s+from-\[#0B130E\]\s+to-transparent\s+sm:hidden/
      );
    });

    it('should render tab icons at h-4 w-4 with strokeWidth={1.75}', () => {
      assert.match(settingsSource, /className:\s*['"]h-4\s+w-4\s+shrink-0['"]/);
      assert.match(settingsSource, /strokeWidth:\s*1\.75/);
    });
  });

  describe('Form Fields, Validation States & Visual Tokens', () => {
    it('should enforce uppercase section headers with tracking-[0.15em] text-white/25', () => {
      assert.match(
        settingsSource,
        /text-xs\s+font-bold\s+tracking-\[0\.15em\]\s+uppercase\s+text-white\/25\s+mb-4\s+mt-8/
      );
    });

    it('should enforce uppercase labels: text-[10px] font-bold tracking-[0.15em] uppercase text-white/30', () => {
      assert.match(
        settingsSource,
        /text-\[10px\]\s+font-bold\s+tracking-\[0\.15em\]\s+uppercase\s+text-white\/30\s+mb-2\s+block/
      );
    });

    it('should enforce soft inputs: h-11 w-full px-4 rounded-xl bg-white/[0.03] border', () => {
      assert.match(
        settingsSource,
        /h-11\s+w-full\s+px-4\s+rounded-xl\s+bg-white\/\[0\.03\]\s+border/
      );
      assert.match(
        settingsSource,
        /focus:border-emerald-500\/50\s+focus:ring-1\s+focus:ring-emerald-500\/20\s+focus:bg-white\/\[0\.05\]/
      );
    });

    it('should enforce helper text: text-[11px] text-white/20 mt-1.5', () => {
      assert.match(settingsSource, /text-\[11px\]\s+text-white\/20\s+mt-1\.5/);
    });

    it('should enforce error state: border-red-500/50 + text-[11px] text-red-400 with AlertCircle h-3 w-3', () => {
      assert.match(settingsSource, /border-red-500\/50/);
      assert.match(settingsSource, /text-\[11px\]\s+text-red-400\s+mt-1\.5\s+flex\s+items-center\s+gap-1/);
      assert.match(settingsSource, /<AlertCircle\s+className=["']h-3\s+w-3\s+shrink-0["']\s+strokeWidth=\{1\.75\}/);
    });

    it('should enforce success border flash: border-emerald-500/30', () => {
      assert.match(settingsSource, /border-emerald-500\/30/);
    });

    it('should enforce save button: h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] with Loader2', () => {
      assert.match(
        settingsSource,
        /h-10\s+px-6\s+rounded-xl\s+bg-emerald-600\s+text-sm\s+font-semibold\s+text-white\s+hover:bg-emerald-500\s+active:scale-\[0\.98\]/
      );
      assert.match(
        settingsSource,
        /<Loader2\s+className=["']h-4\s+w-4\s+animate-spin\s+text-white["']\s+strokeWidth=\{1\.75\}/
      );
    });

    it('should enforce disabled state: disabled:opacity-50 disabled:cursor-not-allowed', () => {
      assert.match(settingsSource, /disabled:opacity-50\s+disabled:cursor-not-allowed/);
    });
  });

  describe('Danger Zone & Loading Architecture', () => {
    it('should enforce danger zone styling: mt-12 border-t border-red-500/10 pt-6 with destructive delete button', () => {
      assert.match(settingsSource, /mt-12\s+border-t\s+border-red-500\/10\s+pt-6/);
      assert.match(
        settingsSource,
        /text-xs\s+font-bold\s+tracking-\[0\.15em\]\s+uppercase\s+text-red-400\/80\s+mb-2/
      );
      assert.match(
        settingsSource,
        /border\s+border-red-500\/30\s+text-red-400\s+hover:bg-red-500\/10\s+rounded-xl\s+px-4\s+py-2\.5/
      );
      assert.match(settingsSource, /<Trash2\s+className=["']h-3\.5\s+w-3\.5["']\s+strokeWidth=\{1\.75\}/);
    });

    it('should render SettingsFormSkeleton during initial data loading', () => {
      assert.match(settingsSource, /if\s*\(isMinimumLoading\)\s*\{\s*return\s*<SettingsFormSkeleton\s*\/>;\s*\}/);
    });

    it('should trigger toast feedback for successful and failed operations', () => {
      assert.match(settingsSource, /toast\.success\(['"]Account updated/);
      assert.match(settingsSource, /toast\.error\(['"]Validation Error/);
      assert.match(settingsSource, /toast\.success\(['"]Password updated/);
    });
  });

  describe('Phase 0 Strict Constraints & Named Lucide Imports', () => {
    it('should strictly use named Lucide imports', () => {
      assert.match(
        settingsSource,
        /import\s*\{[\s\S]*?User[\s\S]*?Shield[\s\S]*?Bell[\s\S]*?Globe[\s\S]*?Palette[\s\S]*?Lock[\s\S]*?AlertCircle[\s\S]*?Loader2[\s\S]*?Trash2[\s\S]*?Sun[\s\S]*?Moon[\s\S]*?Laptop[\s\S]*?\}\s*from\s*['"]lucide-react['"]/
      );
    });

    it('should not import any forbidden flag packages or external icon sets', () => {
      assert.ok(!settingsSource.includes('flag-icons'));
      assert.ok(!settingsSource.includes('react-world-flags'));
      assert.ok(!settingsSource.includes('svg-country-flags'));
      assert.ok(!settingsSource.includes('twemoji'));
      assert.ok(!settingsSource.includes('@heroicons'));
      assert.ok(!settingsSource.includes('react-icons'));
    });
  });
});
