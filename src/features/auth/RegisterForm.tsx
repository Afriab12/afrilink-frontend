'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Calendar, Globe, ArrowRight, Phone, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { AFRICAN_COUNTRIES } from '@/utils/countryData';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [countryCode, setCountryCode] = useState('NG');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Email format regex RFC 5322
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // E.164 Phone format regex
  const phoneE164Regex = /^\+[1-9]\d{7,14}$/;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      errors.username = 'Username must be between 3 and 30 characters.';
    } else if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      errors.username = 'Username can only contain lowercase letters, numbers, and underscores.';
    }

    if (identifierType === 'email') {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        errors.email = 'Email address is required.';
      } else if (!emailRegex.test(cleanEmail)) {
        errors.email = 'Please provide a valid email address (e.g. name@domain.com).';
      }
    } else {
      const cleanPhone = phone.trim();
      if (!cleanPhone) {
        errors.phone = 'Phone number is required.';
      } else if (!phoneE164Regex.test(cleanPhone)) {
        errors.phone = 'Phone number must follow international E.164 format (e.g. +2348012345678).';
      }
    }

    // Phase 2 Spec: password minimum 10 characters
    if (password.length < 10) {
      errors.password = 'Password must be at least 10 characters long.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    const selectedCountry = AFRICAN_COUNTRIES.find((c) => c.code === countryCode);

    setIsLoading(true);

    // Normalize email (lowercase and trim spaces)
    const normalizedEmail = identifierType === 'email' ? email.trim().toLowerCase() : undefined;
    const normalizedPhone = identifierType === 'phone' ? phone.trim() : undefined;

    const result = await register({
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      country: selectedCountry?.name || 'Nigeria',
      countryCode,
      dateOfBirth,
    });

    setIsLoading(false);

    if (result.success) {
      router.push('/onboarding');
    } else {
      setServerError(result.error || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 sm:p-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#087443]/10 text-[#087443] mb-3">
          <span className="text-2xl font-black font-sora">🌍</span>
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white font-sora">
          Join AfriLink
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Africa’s Social Network, Built for Africans
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. Kofi Mensah"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: '' }));
            }}
            error={fieldErrors.fullName}
            aria-invalid={!!fieldErrors.fullName}
            icon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Username"
            placeholder="e.g. kofi_mensah"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'));
              if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: '' }));
            }}
            error={fieldErrors.username}
            helperText="3–30 lowercase letters, numbers, or _"
            aria-invalid={!!fieldErrors.username}
            required
          />
        </div>

        {/* Identifier Type Switcher: Email or Phone */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              {identifierType === 'email' ? 'Email Address' : 'Phone Number (E.164)'}
            </label>
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setIdentifierType('email')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  identifierType === 'email'
                    ? 'bg-[#087443] text-white'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Use Email
              </button>
              <button
                type="button"
                onClick={() => setIdentifierType('phone')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  identifierType === 'phone'
                    ? 'bg-[#087443] text-white'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Use Phone
              </button>
            </div>
          </div>

          {identifierType === 'email' ? (
            <Input
              type="email"
              placeholder="e.g. name@domain.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
              }}
              error={fieldErrors.email}
              aria-invalid={!!fieldErrors.email}
              icon={<Mail className="w-4 h-4" />}
              required
            />
          ) : (
            <Input
              type="tel"
              placeholder="+2348012345678 or +233241234567"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }));
              }}
              error={fieldErrors.phone}
              helperText="Include country code (e.g. +234 for Nigeria, +233 for Ghana)"
              aria-invalid={!!fieldErrors.phone}
              icon={<Phone className="w-4 h-4" />}
              required
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            placeholder="Min 10 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={fieldErrors.password}
            helperText="At least 10 characters"
            aria-invalid={!!fieldErrors.password}
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
          <label
            htmlFor="country-select"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider"
          >
            Select Your African Country
          </label>
          <div className="relative">
            <select
              id="country-select"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/20 transition-all appearance-none pr-10"
              required
            >
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flagEmoji || c.flag} {c.name} ({c.region})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-400">
              <Globe className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500 py-1 leading-relaxed">
          By registering, you agree to AfriLink’s Community Standards and Pan-African Data Privacy Terms.
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
