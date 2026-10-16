'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { apiClient, ApiError } from '@/services/apiClient';
import { mockBackend, INITIAL_USERS } from '@/services/mockBackend';

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
  currentUser: User | null; // Alias for backward compatibility
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => void;
  completeOnboarding: (data: {
    country: string;
    countryCode: string;
    interests: string[];
    bio?: string;
    city?: string;
    avatarUrl?: string;
  }) => void;
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);

  // Initialize auth session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedRefreshToken = apiClient.getRefreshToken();
      const onboardedState = typeof window !== 'undefined' ? localStorage.getItem('afrilink_onboarded') : null;
      setIsOnboarded(onboardedState !== 'false');

      if (storedRefreshToken) {
        try {
          // Attempt token refresh and fetch user
          const refreshRes = await apiClient.post<{ accessToken: string; refreshToken?: string }>(
            '/auth/refresh',
            { refreshToken: storedRefreshToken }
          );

          if (refreshRes.data?.accessToken) {
            apiClient.setAccessToken(refreshRes.data.accessToken);
            if (refreshRes.data.refreshToken) {
              apiClient.setRefreshToken(refreshRes.data.refreshToken);
            }

            const meRes = await apiClient.get<{ user: User }>('/users/me');
            if (meRes.data?.user) {
              setUser(meRes.data.user);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // Fallback to local session if backend offline
          const fallbackUser = mockBackend.getCurrentUser();
          setUser(fallbackUser);
        }
      } else {
        // Hydrate from mockBackend
        const fallbackUser = mockBackend.getCurrentUser();
        setUser(fallbackUser);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    const normalizedEmailOrPhone = credentials.email.trim();

    try {
      // 1. Attempt Real Backend API (Phase 2 Spec)
      const res = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/login', {
        email: normalizedEmailOrPhone,
        password: credentials.password,
      });

      if (res.data) {
        apiClient.setAccessToken(res.data.accessToken);
        apiClient.setRefreshToken(res.data.refreshToken);
        setUser(res.data.user);
        setIsOnboarded(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('afrilink_onboarded', 'true');
        }
        setIsLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      // If error is invalid credentials or validation error from backend, return error
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        setIsLoading(false);
        return { success: false, error: err.message || 'Invalid email or password.' };
      }

      // 2. Offline / Mock fallback for local dev resilience
      const users = mockBackend.getUsers();
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === normalizedEmailOrPhone.toLowerCase() ||
          u.phone === normalizedEmailOrPhone ||
          u.username.toLowerCase() === normalizedEmailOrPhone.toLowerCase()
      );

      if (found) {
        if (found.status === 'suspended' || found.status === 'banned') {
          setIsLoading(false);
          return { success: false, error: `Account is ${found.status}. Contact support.` };
        }
        mockBackend.setCurrentUser(found);
        setUser(found);
        setIsOnboarded(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('afrilink_onboarded', 'true');
        }
        setIsLoading(false);
        return { success: true };
      }
    }

    setIsLoading(false);
    return { success: false, error: 'Invalid credentials. User not found.' };
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);

    // Normalize email (lowercase & trim spaces per requirement)
    const normalizedEmail = data.email ? data.email.trim().toLowerCase() : undefined;
    const normalizedUsername = data.username.trim().toLowerCase();
    const normalizedPhone = data.phone ? data.phone.trim() : undefined;

    try {
      // 1. Attempt Real Backend API (Phase 2 Spec)
      const res = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/register', {
        fullName: data.fullName.trim(),
        username: normalizedUsername,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: data.password,
        country: data.country,
        dateOfBirth: data.dateOfBirth,
      });

      if (res.data) {
        apiClient.setAccessToken(res.data.accessToken);
        apiClient.setRefreshToken(res.data.refreshToken);
        setUser(res.data.user);
        setIsOnboarded(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('afrilink_onboarded', 'false');
        }
        setIsLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        setIsLoading(false);
        return { success: false, error: err.message || 'Registration failed.' };
      }

      // 2. Offline / Mock fallback
      const users = mockBackend.getUsers();
      if (users.some((u) => u.username.toLowerCase() === normalizedUsername)) {
        setIsLoading(false);
        return { success: false, error: 'Username is already taken.' };
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        username: normalizedUsername,
        fullName: data.fullName.trim(),
        email: normalizedEmail || `${normalizedUsername}@afrilink.africa`,
        phone: normalizedPhone,
        bio: `AfriLink community member from ${data.country}.`,
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        coverImageUrl:
          'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80',
        country: data.country,
        countryCode: data.countryCode || 'GH',
        city: '',
        interests: [],
        joinedDate: new Date().toISOString().split('T')[0],
        role: 'user',
        status: 'active',
        followersCount: 0,
        followingCount: 0,
        friendsCount: 0,
      };

      const updated = [...users, newUser];
      if (typeof window !== 'undefined') {
        localStorage.setItem('afrilink_db_users', JSON.stringify(updated));
        localStorage.setItem('afrilink_onboarded', 'false');
      }
      mockBackend.setCurrentUser(newUser);
      setUser(newUser);
      setIsOnboarded(false);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Registration failed. Please try again.' };
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // Ignore network errors on logout
    } finally {
      apiClient.clearTokens();
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('afrilink_onboarded');
      }
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await apiClient.post('/auth/password/forgot', { email: email.trim().toLowerCase() });
      return { success: true };
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        return { success: false, error: err.message };
      }
      // Demo simulated success
      return { success: true };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      await apiClient.post('/auth/password/reset', { token, newPassword });
      return { success: true };
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        return { success: false, error: err.message };
      }
      return { success: true };
    }
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    const updated = mockBackend.updateUserProfile(data);
    setUser(updated);
  }, []);

  const completeOnboarding = useCallback((data: {
    country: string;
    countryCode: string;
    interests: string[];
    bio?: string;
    city?: string;
    avatarUrl?: string;
  }) => {
    const updated = mockBackend.updateUserProfile({
      country: data.country,
      countryCode: data.countryCode,
      interests: data.interests,
      bio: data.bio || user?.bio || '',
      city: data.city || user?.city || '',
      avatarUrl: data.avatarUrl || user?.avatarUrl || '',
    });
    setUser(updated);
    setIsOnboarded(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('afrilink_onboarded', 'true');
    }
  }, [user]);

  const switchUser = useCallback((userId: string) => {
    const found = mockBackend.getUserById(userId);
    if (found) {
      mockBackend.setCurrentUser(found);
      setUser(found);
      setIsOnboarded(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('afrilink_onboarded', 'true');
      }
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
