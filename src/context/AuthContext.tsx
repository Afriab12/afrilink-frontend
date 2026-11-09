'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { apiClient, ApiError } from '@/lib/api-client';
import { mockBackend } from '@/services/mockBackend';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  password: string;
  country: string;
  countryCode?: string;
  dateOfBirth?: string;
}

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (identifier: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    challengeIdOrToken: string,
    newPassword: string,
    code?: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => void;
  completeOnboarding: (data: {
    country: string;
    countryCode: string;
    interests: string[];
    bio?: string;
    city?: string;
    avatarUrl?: string;
  }) => Promise<void>;
  switchUser?: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);

  // Helper to fetch and hydrate full User profile from NestJS GET /api/v1/me/profile
  const fetchProfile = async (): Promise<User | null> => {
    try {
      const res = await apiClient.get<any>('/me/profile');
      if (res.data) {
        const p = res.data;
        return {
          id: p.userId || p.id,
          username: p.displayName?.toLowerCase().replace(/\s+/g, '_') || 'user',
          fullName: p.displayName || 'AfriLink User',
          email: p.email || '',
          phone: p.phone,
          bio: p.bio || '',
          avatarUrl:
            p.avatarMediaUrl ||
            p.avatarUrl ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          coverImageUrl: p.coverMediaUrl || p.coverImageUrl || '',
          country: p.region || 'Ghana',
          countryCode: p.countryCode || 'GH',
          city: p.city || '',
          interests: p.interests || [],
          joinedDate: p.createdAt ? String(p.createdAt).split('T')[0] : '2026-01-01',
          role: p.role || 'user',
          status: p.status || 'active',
          followersCount: p.followersCount || 0,
          followingCount: p.followingCount || 0,
          friendsCount: p.friendsCount || 0,
        };
      }
    } catch {
      return null;
    }
    return null;
  };

  // Initialize auth session on mount via HTTP-only cookies
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Probe active cookie session via /me/profile
        const profileUser = await fetchProfile();
        if (profileUser) {
          setUser(profileUser);
          setIsLoading(false);
          return;
        }

        // 2. Try silent refresh if access token expired but refresh token cookie is active
        const refreshed = await apiClient.refreshAccessToken();
        if (refreshed) {
          const rehydrated = await fetchProfile();
          if (rehydrated) {
            setUser(rehydrated);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fallback on network or dev mode errors
      }

      // 3. Fallback for offline local dev mode
      const fallbackUser = mockBackend.getCurrentUser();
      setUser(fallbackUser);
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    const rawIdentifier = credentials.email.trim();
    const isEmail = rawIdentifier.includes('@');

    // Strict NestJS LoginDto: exactly one of email or phone
    const loginPayload = isEmail
      ? { email: rawIdentifier.toLowerCase(), password: credentials.password }
      : { phone: rawIdentifier, password: credentials.password };

    try {
      const res = await apiClient.post<any>('/auth/login', loginPayload);

      if (res.data) {
        // Session cookies set automatically by NestJS. Rehydrate full user profile.
        const fullUser = await fetchProfile();
        const activeUser: User = fullUser || {
          id: res.data.user.id,
          username: rawIdentifier.split('@')[0],
          fullName: rawIdentifier.split('@')[0],
          email: isEmail ? rawIdentifier : '',
          bio: '',
          coverImageUrl: '',
          city: '',
          country: 'Ghana',
          countryCode: 'GH',
          avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          role: 'user',
          status: 'active',
          followersCount: 0,
          followingCount: 0,
          friendsCount: 0,
          joinedDate: '2026-01-01',
          interests: [],
        };

        setUser(activeUser);
        setIsOnboarded(true);
        setIsLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        setIsLoading(false);
        return { success: false, error: err.message || 'Invalid credentials.' };
      }

      // Offline mock fallback
      const users = mockBackend.getUsers();
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === rawIdentifier.toLowerCase() ||
          u.username.toLowerCase() === rawIdentifier.toLowerCase()
      );

      if (found) {
        mockBackend.setCurrentUser(found);
        setUser(found);
        setIsLoading(false);
        return { success: true };
      }
    }

    setIsLoading(false);
    return { success: false, error: 'Invalid credentials. User not found.' };
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);

    const hasEmail = Boolean(data.email && data.email.trim());
    const registerPayload = hasEmail
      ? { email: data.email!.trim().toLowerCase(), password: data.password }
      : { phone: data.phone!.trim(), password: data.password };

    try {
      const res = await apiClient.post<any>('/auth/register', registerPayload);

      if (res.data) {
        // User registered; immediately sync profile display name
        await apiClient.patch('/me/profile', {
          displayName: data.fullName.trim() || data.username.trim(),
          countryCode: data.countryCode || 'GH',
        }).catch(() => {
          // Best effort sync during registration
        });

        const fullUser = await fetchProfile();
        const activeUser: User = fullUser || {
          id: res.data.user.id,
          username: data.username.trim(),
          fullName: data.fullName.trim(),
          email: data.email || '',
          bio: '',
          coverImageUrl: '',
          city: '',
          country: data.country || 'Ghana',
          countryCode: data.countryCode || 'GH',
          avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          role: 'user',
          status: 'active',
          followersCount: 0,
          followingCount: 0,
          friendsCount: 0,
          joinedDate: '2026-01-01',
          interests: [],
        };

        setUser(activeUser);
        setIsOnboarded(false);
        setIsLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        setIsLoading(false);
        return { success: false, error: err.message || 'Registration failed.' };
      }
    }

    setIsLoading(false);
    return { success: false, error: 'Registration failed.' };
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // Best-effort logout
    } finally {
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (identifier: string) => {
    const raw = identifier.trim();
    const isEmail = raw.includes('@');
    const payload = isEmail ? { email: raw.toLowerCase() } : { phone: raw };

    try {
      await apiClient.post('/auth/password/forgot', payload);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to request password reset.' };
    }
  }, []);

  const resetPassword = useCallback(
    async (challengeIdOrToken: string, newPassword: string, code?: string) => {
      try {
        // Supports NestJS ResetPasswordDto ({ challengeId, code, newPassword })
        // as well as single-token mock fallback
        const payload = code
          ? { challengeId: challengeIdOrToken, code, newPassword }
          : { token: challengeIdOrToken, newPassword };

        await apiClient.post('/auth/password/reset', payload);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to reset password.' };
      }
    },
    []
  );

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
    // Asynchronously synchronize with backend
    if (data.fullName || data.bio || data.countryCode) {
      apiClient.patch('/me/profile', {
        ...(data.fullName && { displayName: data.fullName }),
        ...(data.bio && { bio: data.bio }),
        ...(data.countryCode && { countryCode: data.countryCode }),
      }).catch(() => {});
    }
  }, []);

  const completeOnboarding = useCallback(
    async (data: {
      country: string;
      countryCode: string;
      interests: string[];
      bio?: string;
      city?: string;
      avatarUrl?: string;
    }) => {
      setUser((prev) => (prev ? { ...prev, ...data } : null));
      setIsOnboarded(true);

      // Persist onboarding profile updates to NestJS
      try {
        await apiClient.patch('/me/profile', {
          countryCode: data.countryCode,
          ...(data.bio && { bio: data.bio }),
        });
        if (data.interests?.length > 0) {
          await apiClient.put('/me/interests', { interestIds: data.interests });
        }
      } catch {
        // Graceful offline degradation
      }
    },
    []
  );

  const switchUser = useCallback((userId: string) => {
    const found = mockBackend.getUsers().find((u) => u.id === userId);
    if (found) {
      mockBackend.setCurrentUser(found);
      setUser(found);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        isAuthenticated: !!user,
        isLoading,
        isOnboarded,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        completeOnboarding,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
