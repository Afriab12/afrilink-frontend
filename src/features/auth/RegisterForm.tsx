'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Calendar, Globe, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/stores/authContext';
import { AFRICAN_COUNTRIES } from '@/utils/countryData';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [countryCode, setCountryCode] = useState('NG');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Username validation: 3-30 chars, letters, numbers, underscores
    if (username.length < 3 || username.length > 30) {
      setError('Username must be between 3 and 30 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const selectedCountry = AFRICAN_COUNTRIES.find((c) => c.code === countryCode);

    setIsLoading(true);
    const result = await register({
      fullName,
      username,
      emailOrPhone,
      password,
      dateOfBirth,
      country: selectedCountry?.name || 'Nigeria',
      countryCode,
    });
    setIsLoading(false);

    if (result.success) {
      router.push('/onboarding');
    } else {
      setError(result.error || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 sm:p-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#087443]/10 text-[#087443] mb-3">
          <span className="text-2xl font-black font-sora">🌍</span>
        </div>
        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-sora">
          Join AfriLink
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Connect with people, communities and ideas across Africa
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. Kofi Annan"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Username"
            placeholder="e.g. kofi_annan"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            helperText="3-30 letters, numbers, or _"
            required
          />
        </div>

        <Input
          label="Email Address or Phone Number"
          placeholder="e.g. name@domain.com or +234..."
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="Date of Birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
            required
          />
        </div>

        {/* African Country Selector */}
        <div className="w-full space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Select Your African Country
          </label>
          <div className="relative">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/20 transition-all appearance-none pr-10"
              required
            >
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.region})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-400">
              <Globe className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="text-xs text-neutral-500 py-1">
          By registering, you agree to AfriLink’s Community Standards, Pan-African Safety Policy, and Data Privacy Terms.
        </div>

        <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
          Create Account & Start Onboarding <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-neutral-500">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-[#087443] dark:text-[#0e9357] hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
