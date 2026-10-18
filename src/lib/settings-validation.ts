/**
 * AfriLink Settings & Validation Pure Helpers
 * Phase 2D: Settings Dashboard Soft Inputs & Validation States
 */

export interface AccountFormValues {
  username: string;
  email: string;
  phone?: string;
}

export interface AccountFormErrors {
  username?: string;
  email?: string;
  phone?: string;
}

export function validateAccountForm(values: AccountFormValues): AccountFormErrors {
  const errors: AccountFormErrors = {};

  const trimmedUsername = (values.username || '').trim();
  if (!trimmedUsername) {
    errors.username = 'Username is required';
  } else if (trimmedUsername.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
  }

  const trimmedEmail = (values.email || '').trim();
  if (!trimmedEmail) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address';
  }

  if (values.phone && values.phone.trim()) {
    const cleanedPhone = values.phone.replace(/[\s\-()]/g, '');
    if (!/^\+?[0-9]{7,15}$/.test(cleanedPhone)) {
      errors.phone = 'Please enter a valid phone number';
    }
  }

  return errors;
}

export interface PasswordFormValues {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function validatePasswordForm(values: PasswordFormValues): PasswordFormErrors {
  const errors: PasswordFormErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }

  if (!values.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (values.newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters';
  }

  if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

export type SettingsTabId =
  | 'account'
  | 'privacy'
  | 'notifications'
  | 'language'
  | 'appearance'
  | 'security';

export interface SettingsTabItem {
  id: SettingsTabId;
  label: string;
  iconName: 'User' | 'Shield' | 'Bell' | 'Globe' | 'Palette' | 'Lock';
}

export const SETTINGS_TABS: SettingsTabItem[] = [
  { id: 'account', label: 'Account', iconName: 'User' },
  { id: 'privacy', label: 'Privacy & Safety', iconName: 'Shield' },
  { id: 'notifications', label: 'Notifications', iconName: 'Bell' },
  { id: 'language', label: 'Language & Region', iconName: 'Globe' },
  { id: 'appearance', label: 'Appearance', iconName: 'Palette' },
  { id: 'security', label: 'Security', iconName: 'Lock' },
];
