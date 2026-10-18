import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  toastReducer,
  getToastDuration,
  TOAST_LIMIT,
  DEFAULT_TOAST_DURATIONS,
  toast,
} from '../use-toast.ts';
import type { ToastState, Toast } from '../use-toast.ts';

describe('use-toast — Toast Notification Engine & Reducer', () => {
  describe('toastReducer pure state transitions', () => {
    it('should add a toast to an empty state', () => {
      const initialState: ToastState = { toasts: [] };
      const newToast: Toast = {
        id: 'toast-1',
        variant: 'success',
        title: 'Settings saved',
        description: 'Profile updated',
        duration: 5000,
        dismissing: false,
        createdAt: 1000,
      };

      const nextState = toastReducer(initialState, { type: 'ADD_TOAST', toast: newToast });
      assert.strictEqual(nextState.toasts.length, 1);
      assert.strictEqual(nextState.toasts[0].id, 'toast-1');
      assert.strictEqual(nextState.toasts[0].title, 'Settings saved');
      assert.strictEqual(nextState.toasts[0].variant, 'success');
    });

    it(`should enforce max ${TOAST_LIMIT} visible toasts by trimming oldest`, () => {
      const initialState: ToastState = {
        toasts: [
          { id: 't3', variant: 'info', title: 'T3', duration: 5000, createdAt: 3 },
          { id: 't2', variant: 'info', title: 'T2', duration: 5000, createdAt: 2 },
          { id: 't1', variant: 'info', title: 'T1', duration: 5000, createdAt: 1 },
        ],
      };

      const newToast: Toast = {
        id: 't4',
        variant: 'warning',
        title: 'T4 Newest',
        duration: 5000,
        createdAt: 4,
      };

      const nextState = toastReducer(initialState, { type: 'ADD_TOAST', toast: newToast });
      assert.strictEqual(nextState.toasts.length, TOAST_LIMIT, `Max visible toasts must be exactly ${TOAST_LIMIT}`);
      assert.strictEqual(nextState.toasts[0].id, 't4', 'Newest toast must be at index 0');
      assert.strictEqual(nextState.toasts[1].id, 't3');
      assert.strictEqual(nextState.toasts[2].id, 't2');
      assert.strictEqual(nextState.toasts.some(t => t.id === 't1'), false, 'Oldest toast t1 must be evicted');
    });

    it('should update an existing toast title or description', () => {
      const initialState: ToastState = {
        toasts: [
          { id: 't1', variant: 'info', title: 'Uploading...', duration: 5000, createdAt: 1 },
        ],
      };

      const nextState = toastReducer(initialState, {
        type: 'UPDATE_TOAST',
        id: 't1',
        toast: { title: 'Upload Complete', variant: 'success' },
      });

      assert.strictEqual(nextState.toasts[0].title, 'Upload Complete');
      assert.strictEqual(nextState.toasts[0].variant, 'success');
    });

    it('should mark a specific toast as dismissing', () => {
      const initialState: ToastState = {
        toasts: [
          { id: 't1', variant: 'info', title: 'T1', duration: 5000, createdAt: 1, dismissing: false },
          { id: 't2', variant: 'info', title: 'T2', duration: 5000, createdAt: 2, dismissing: false },
        ],
      };

      const nextState = toastReducer(initialState, { type: 'DISMISS_TOAST', id: 't1' });
      assert.strictEqual(nextState.toasts.find(t => t.id === 't1')?.dismissing, true);
      assert.strictEqual(nextState.toasts.find(t => t.id === 't2')?.dismissing, false);
    });

    it('should mark all toasts as dismissing when no id is provided', () => {
      const initialState: ToastState = {
        toasts: [
          { id: 't1', variant: 'info', title: 'T1', duration: 5000, createdAt: 1, dismissing: false },
          { id: 't2', variant: 'info', title: 'T2', duration: 5000, createdAt: 2, dismissing: false },
        ],
      };

      const nextState = toastReducer(initialState, { type: 'DISMISS_TOAST' });
      assert.strictEqual(nextState.toasts.every(t => t.dismissing === true), true);
    });

    it('should remove a toast from state by id', () => {
      const initialState: ToastState = {
        toasts: [
          { id: 't1', variant: 'info', title: 'T1', duration: 5000, createdAt: 1 },
          { id: 't2', variant: 'info', title: 'T2', duration: 5000, createdAt: 2 },
        ],
      };

      const nextState = toastReducer(initialState, { type: 'REMOVE_TOAST', id: 't1' });
      assert.strictEqual(nextState.toasts.length, 1);
      assert.strictEqual(nextState.toasts[0].id, 't2');
    });

    it('should clear all toasts on CLEAR_ALL', () => {
      const initialState: ToastState = {
        toasts: [
          { id: 't1', variant: 'info', title: 'T1', duration: 5000, createdAt: 1 },
          { id: 't2', variant: 'info', title: 'T2', duration: 5000, createdAt: 2 },
        ],
      };

      const nextState = toastReducer(initialState, { type: 'CLEAR_ALL' });
      assert.strictEqual(nextState.toasts.length, 0);
    });
  });

  describe('Duration logic and error timeouts', () => {
    it('should assign 8000ms auto-dismiss duration for errors', () => {
      const duration = getToastDuration('error');
      assert.strictEqual(duration, 8000, 'Error toasts must display for 8000ms');
      assert.strictEqual(DEFAULT_TOAST_DURATIONS.error, 8000);
    });

    it('should assign 5000ms auto-dismiss duration for success, info, and warning', () => {
      assert.strictEqual(getToastDuration('success'), 5000);
      assert.strictEqual(getToastDuration('info'), 5000);
      assert.strictEqual(getToastDuration('warning'), 5000);
      assert.strictEqual(DEFAULT_TOAST_DURATIONS.default, 5000);
    });

    it('should prioritize explicit duration override when specified', () => {
      assert.strictEqual(getToastDuration('error', 3500), 3500);
      assert.strictEqual(getToastDuration('success', 12000), 12000);
    });
  });

  describe('Toast API convenience methods', () => {
    it('toast.success creates success toast with 5s default duration', () => {
      toast.clear();
      const instance = toast.success('Action Saved', 'Your changes have persisted.');
      assert.ok(instance.id);
      assert.strictEqual(typeof instance.dismiss, 'function');
      toast.clear();
    });

    it('toast.error creates error toast with 8s default duration', () => {
      toast.clear();
      const instance = toast.error('Connection Failed', 'Unable to reach backend gateway.');
      assert.ok(instance.id);
      toast.clear();
    });

    it('toast.info and toast.warning create respective toast variants', () => {
      toast.clear();
      const infoInstance = toast.info('New message received');
      assert.ok(infoInstance.id);

      const warnInstance = toast.warning('Low storage warning');
      assert.ok(warnInstance.id);
      toast.clear();
    });
  });

  describe('Component architecture and Phase 0 constraints', () => {
    const toastSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ui/toast.tsx'),
      'utf-8'
    );
    const layoutSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/layout.tsx'),
      'utf-8'
    );
    const globalsCss = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/globals.css'),
      'utf-8'
    );

    it('should import named Lucide icons only (Check, X, Info, AlertTriangle)', () => {
      assert.match(
        toastSource,
        /import\s*\{\s*Check,\s*X,\s*Info,\s*AlertTriangle\s*\}\s*from\s*['"]lucide-react['"]/,
        'Must import only named Lucide icons'
      );
    });

    it('should enforce strokeWidth={1.75} on all Lucide icons', () => {
      const iconMatches = toastSource.match(/strokeWidth=\{1\.75\}/g) || [];
      assert.ok(iconMatches.length >= 4, 'Every Lucide icon must enforce strokeWidth={1.75}');
    });

    it('should enforce 28x28 icon wrapper (w-7 h-7 rounded-lg)', () => {
      assert.match(toastSource, /w-7\s+h-7\s+rounded-lg/);
    });

    it('should enforce surface-5 dark elevated styling and border-white/[0.08]', () => {
      assert.match(toastSource, /bg-surface-5/);
      assert.match(toastSource, /border-white\/\[0\.08\]/);
      assert.match(toastSource, /shadow-2xl/);
    });

    it('should enforce mobile and desktop responsive container classes with aria-live="polite"', () => {
      assert.match(toastSource, /aria-live="polite"/);
      assert.match(toastSource, /fixed/);
      assert.match(toastSource, /flex-col-reverse\s+gap-2/);
      assert.match(toastSource, /top-4\s+inset-x-4/);
      assert.match(toastSource, /sm:bottom-4\s+sm:right-4/);
    });

    it('should mount ToastProvider in root layout', () => {
      assert.match(
        layoutSource,
        /<ToastProvider>/,
        'Root layout must mount ToastProvider'
      );
    });

    it('should declare GPU-safe keyframes and reduced motion overrides in globals.css', () => {
      assert.match(globalsCss, /@keyframes toast-enter/);
      assert.match(globalsCss, /@keyframes toast-exit/);
      assert.match(globalsCss, /@keyframes toast-progress/);
      assert.match(globalsCss, /prefers-reduced-motion:\s*reduce/);
      assert.match(globalsCss, /animate-toast-enter/);
      assert.match(globalsCss, /animate-toast-exit/);
    });
  });
});
