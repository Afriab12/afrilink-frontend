'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Key, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export const PasswordResetForm: React.FC = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const [step, setStep] = useState<'request' | 'sent' | 'reset'>('request');

  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please provide your registered email address.');
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(cleanEmail);
    setIsLoading(false);

    if (result.success) {
      setStep('sent');
    } else {
      setError(result.error || 'Failed to send recovery instructions. Please try again.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resetToken.trim()) {
      setError('Reset token is required.');
      return;
    }
    if (newPassword.length < 10) {
      setError('New password must be at least 10 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(resetToken.trim(), newPassword);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Your password has been successfully reset. You can now sign in.');
    } else {
      setError(result.error || 'Failed to reset password. The token may be expired or invalid.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#087443]/10 text-[#087443] mb-3">
          <span className="text-2xl font-black font-sora">🔑</span>
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
          {step === 'reset' ? 'Set New Password' : 'Reset Password'}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {step === 'reset'
            ? 'Enter your security token and a strong password.'
            : 'Enter your registered email to receive secure recovery instructions.'}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-[#087443] font-bold">{successMessage}</p>
          <Link href="/login">
            <Button variant="primary" className="w-full mt-2">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      )}

      {/* Step 1: Request Reset Link */}
      {step === 'request' && !successMessage && (
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <Input
            label="Registered Email"
            type="email"
            placeholder="e.g. kwame@afrilink.africa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
            Send Recovery Link <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          <div className="flex items-center justify-between pt-2 text-xs">
            <Link
              href="/login"
              className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-[#087443]"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Sign In
            </Link>

            <button
              type="button"
              onClick={() => setStep('reset')}
              className="text-[#087443] font-semibold hover:underline"
            >
              Have a Reset Token?
            </button>
          </div>
        </form>
      )}

      {/* Step 1 Confirmed */}
      {step === 'sent' && !successMessage && (
        <div className="text-center py-2 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#087443] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Recovery Instructions Dispatched
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            We have sent a secure password reset link to <strong>{email}</strong>. Check your inbox and spam folder.
          </p>

          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setStep('reset')}
            >
              Enter Reset Token & Password
            </Button>

            <Link href="/login">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Step 2: Set New Password */}
      {step === 'reset' && !successMessage && (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <Input
            label="Security Reset Token"
            type="text"
            placeholder="Paste code or token from email"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            icon={<Key className="w-4 h-4" />}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Min 10 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Must be at least 10 characters"
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
            Set New Password <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          <div className="text-center pt-2 text-xs">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="text-neutral-500 hover:text-neutral-900 inline-flex items-center"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Request New Token
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
