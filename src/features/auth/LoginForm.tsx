'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_USERS } from '@/services/mockBackend';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('kwame@afrilink.africa');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanIdentifier = emailOrPhone.trim();
    if (!cleanIdentifier) {
      setError('Please provide your email address or registered phone number.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    // Pass { "email": emailOrPhoneValue, "password": passwordValue } strictly per specification
    const result = await login({
      email: cleanIdentifier,
      password,
    });

    setIsLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleQuickLogin = async (emailToLogin: string) => {
    setEmailOrPhone(emailToLogin);
    setPassword('password123');
    setIsLoading(true);
    const result = await login({
      email: emailToLogin,
      password: 'password123',
    });
    setIsLoading(false);
    if (result.success) {
      router.push('/');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#087443]/10 text-[#087443] mb-3">
          <span className="text-2xl font-black font-sora">🌍</span>
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
          Welcome to AfriLink
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Africa’s Social Network, Built for Africans
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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email or Phone Number"
          type="text"
          placeholder="e.g. kwame@afrilink.africa or +233..."
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-600 dark:text-neutral-400">
            <input
              type="checkbox"
              defaultChecked
              className="rounded text-[#087443] focus:ring-[#087443]"
            />
            Remember me
          </label>
          <Link
            href="/reset-password"
            className="text-[#087443] dark:text-[#0e9357] font-semibold hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
          Sign In to AfriLink <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {/* Quick Demo Switcher */}
      <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800">
        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center mb-3">
          Quick Demo Accounts
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin(INITIAL_USERS[0].email)}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-[#087443] text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
          >
            <span>🇬🇭</span>
            <div className="truncate">
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">Kwame (Creator)</p>
              <p className="text-[10px] text-neutral-500">Ghana</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin(INITIAL_USERS[1].email)}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-[#087443] text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
          >
            <span>🇳🇬</span>
            <div className="truncate">
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">Amina (Community)</p>
              <p className="text-[10px] text-neutral-500">Nigeria</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin(INITIAL_USERS[2].email)}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-[#087443] text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
          >
            <span>🇰🇪</span>
            <div className="truncate">
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">Samuel (User)</p>
              <p className="text-[10px] text-neutral-500">Kenya</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin(INITIAL_USERS[6].email)}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-[#087443] text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
          >
            <span>🛡️</span>
            <div className="truncate">
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">Admin Ops</p>
              <p className="text-[10px] text-neutral-500">Moderation</p>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-neutral-500">
        Don&apos;t have an AfriLink account?{' '}
        <Link href="/register" className="font-bold text-[#087443] dark:text-[#0e9357] hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};
