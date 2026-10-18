'use client';

import { useSyncExternalStore } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number;
  dismissing?: boolean;
  createdAt: number;
}

export interface ToastOptions {
  duration?: number;
}

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export const TOAST_LIMIT = 3;

export const DEFAULT_TOAST_DURATIONS = {
  default: 5000,
  error: 8000,
} as const;

export function getToastDuration(variant: ToastVariant, customDuration?: number): number {
  if (typeof customDuration === 'number' && customDuration > 0) {
    return customDuration;
  }
  return variant === 'error' ? DEFAULT_TOAST_DURATIONS.error : DEFAULT_TOAST_DURATIONS.default;
}

export type ToastAction =
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'UPDATE_TOAST'; id: string; toast: Partial<Toast> }
  | { type: 'DISMISS_TOAST'; id?: string }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'CLEAR_ALL' };

export interface ToastState {
  toasts: Toast[];
}

export function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST': {
      // Retain max TOAST_LIMIT items, placing the newest toast at the start
      const existing = state.toasts.slice(0, TOAST_LIMIT - 1);
      return {
        ...state,
        toasts: [action.toast, ...existing],
      };
    }
    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, ...action.toast } : t
        ),
      };
    case 'DISMISS_TOAST': {
      const { id } = action;
      if (!id) {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({ ...t, dismissing: true })),
        };
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === id ? { ...t, dismissing: true } : t
        ),
      };
    }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        toasts: [],
      };
    default:
      return state;
  }
}

let count = 0;
function genId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return `afrilink-toast-${Date.now()}-${count}`;
}

let memoryState: ToastState = { toasts: [] };
const listeners = new Set<() => void>();
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function dispatch(action: ToastAction) {
  memoryState = toastReducer(memoryState, action);
  notify();
}

export function scheduleDismiss(id: string, duration: number, exitDurationMs: number = 200) {
  if (toastTimeouts.has(id)) {
    clearTimeout(toastTimeouts.get(id)!);
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(id);
    dispatch({ type: 'DISMISS_TOAST', id });
    const removeTimeout = setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', id });
    }, exitDurationMs);
    toastTimeouts.set(`${id}-exit`, removeTimeout);
  }, duration);

  toastTimeouts.set(id, timeout);
}

export function dismissToast(id?: string, exitDurationMs: number = 200) {
  if (id) {
    if (toastTimeouts.has(id)) {
      clearTimeout(toastTimeouts.get(id)!);
      toastTimeouts.delete(id);
    }
    dispatch({ type: 'DISMISS_TOAST', id });
    const removeTimeout = setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', id });
    }, exitDurationMs);
    toastTimeouts.set(`${id}-exit`, removeTimeout);
  } else {
    toastTimeouts.forEach((timeout) => clearTimeout(timeout));
    toastTimeouts.clear();
    dispatch({ type: 'DISMISS_TOAST' });
    setTimeout(() => {
      dispatch({ type: 'CLEAR_ALL' });
    }, exitDurationMs);
  }
}

export function createToast(input: ToastInput | string) {
  const options: ToastInput = typeof input === 'string' ? { title: input } : input;
  const variant: ToastVariant = options.variant || 'info';
  const duration = getToastDuration(variant, options.duration);
  const id = genId();

  const newToast: Toast = {
    id,
    variant,
    title: options.title,
    description: options.description,
    duration,
    dismissing: false,
    createdAt: Date.now(),
  };

  dispatch({ type: 'ADD_TOAST', toast: newToast });
  scheduleDismiss(id, duration);

  return {
    id,
    dismiss: () => dismissToast(id),
    update: (props: Partial<Toast>) => dispatch({ type: 'UPDATE_TOAST', id, toast: props }),
  };
}

export const toast = Object.assign(createToast, {
  success: (title: string, description?: string, options?: ToastOptions) =>
    createToast({ title, description, variant: 'success', duration: options?.duration }),
  error: (title: string, description?: string, options?: ToastOptions) =>
    createToast({ title, description, variant: 'error', duration: options?.duration }),
  info: (title: string, description?: string, options?: ToastOptions) =>
    createToast({ title, description, variant: 'info', duration: options?.duration }),
  warning: (title: string, description?: string, options?: ToastOptions) =>
    createToast({ title, description, variant: 'warning', duration: options?.duration }),
  dismiss: (id?: string) => dismissToast(id),
  clear: () => {
    toastTimeouts.forEach((timeout) => clearTimeout(timeout));
    toastTimeouts.clear();
    dispatch({ type: 'CLEAR_ALL' });
  },
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ToastState {
  return memoryState;
}

export function useToast() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    toasts: state.toasts,
    toast,
    dismiss: (id?: string) => dismissToast(id),
  };
}
