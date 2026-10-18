'use client';

import React from 'react';
import { Check, X, Info, AlertTriangle } from 'lucide-react';
import { useToast, toast, Toast as ToastType, ToastVariant } from '@/hooks/use-toast';
import { useReducedMotion } from '@/lib/animations';

interface ToastIconProps {
  variant: ToastVariant;
}

export const ToastIcon: React.FC<ToastIconProps> = ({ variant }) => {
  switch (variant) {
    case 'success':
      return (
        <div
          data-testid="toast-icon-success"
          className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5"
        >
          <Check className="h-4 w-4" strokeWidth={1.75} />
        </div>
      );
    case 'error':
      return (
        <div
          data-testid="toast-icon-error"
          className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </div>
      );
    case 'warning':
      return (
        <div
          data-testid="toast-icon-warning"
          className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5"
        >
          <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
        </div>
      );
    case 'info':
    default:
      return (
        <div
          data-testid="toast-icon-info"
          className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5"
        >
          <Info className="h-4 w-4" strokeWidth={1.75} />
        </div>
      );
  }
};

function getProgressBarColor(variant: ToastVariant): string {
  switch (variant) {
    case 'success':
      return 'bg-emerald-400/70';
    case 'error':
      return 'bg-red-400/70';
    case 'warning':
      return 'bg-amber-400/70';
    case 'info':
    default:
      return 'bg-blue-400/70';
  }
}

interface ToastCardProps {
  toast: ToastType;
  onDismiss: () => void;
  prefersReducedMotion?: boolean;
}

export const ToastCard: React.FC<ToastCardProps> = ({
  toast: t,
  onDismiss,
  prefersReducedMotion = false,
}) => {
  const isExiting = !!t.dismissing;

  const animationClass = prefersReducedMotion
    ? ''
    : isExiting
    ? 'animate-toast-exit'
    : 'animate-toast-enter';

  return (
    <div
      role="status"
      data-testid={`toast-${t.id}`}
      data-variant={t.variant}
      className={`pointer-events-auto relative overflow-hidden bg-surface-5 border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl min-w-[320px] max-w-[420px] w-full sm:w-auto flex items-start gap-3 select-none transition-opacity ${animationClass}`}
    >
      <ToastIcon variant={t.variant} />

      <div className="flex-1 min-w-0 pr-1">
        <p className="text-sm font-semibold text-white/90 leading-tight">
          {t.title}
        </p>
        {t.description && (
          <p className="text-xs text-white/40 mt-1 leading-normal break-words">
            {t.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 -mr-1 -mt-1 p-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-white/20"
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>

      {/* GPU-safe Progress Bar (transform scaleX) */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/[0.06] overflow-hidden">
        <div
          data-testid="toast-progress-bar"
          className={`h-full w-full origin-left ${getProgressBarColor(t.variant)} ${
            prefersReducedMotion ? 'hidden' : 'animate-toast-progress'
          }`}
          style={{ animationDuration: `${t.duration}ms` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();
  const prefersReduced = useReducedMotion();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="fixed z-50 pointer-events-none flex flex-col-reverse gap-2 top-4 inset-x-4 sm:top-auto sm:bottom-4 sm:right-4 sm:left-auto sm:inset-x-auto items-stretch sm:items-end"
    >
      {toasts.map((t) => (
        <ToastCard
          key={t.id}
          toast={t}
          onDismiss={() => dismiss(t.id)}
          prefersReducedMotion={prefersReduced}
        />
      ))}
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};

export { useToast, toast };
