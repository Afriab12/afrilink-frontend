'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const PasswordResetForm: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#087443]/10 text-[#087443] mb-3">
          <span className="text-2xl font-black font-sora">🔑</span>
        </div>
        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-sora">
          Reset Password
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Enter your registered email or phone number to receive recovery instructions.
        </p>
      </div>

      {isSubmitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Recovery Instructions Sent
          </h3>
          <p className="text-xs text-neutral-500">
            We sent a secure verification link to <strong>{emailOrPhone}</strong>. Please check your inbox or SMS.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Phone Number"
            placeholder="e.g. kwame@afrilink.africa"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
            Send Reset Link <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-[#087443]"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
