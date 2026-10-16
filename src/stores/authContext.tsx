'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AccountStatus } from '@/types';
import { mockBackend, INITIAL_USERS } from '@/services/mockBackend';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  login: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    username: string;
    emailOrPhone: string;
    password?: string;
    country: string;
    countryCode: string;
    dateOfBirth?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Hydrate current user from mockBackend
    const user = mockBackend.getCurrentUser();
    setCurrentUser(user);
    const onboardedState = localStorage.getItem('afrilink_onboarded');
    setIsOnboarded(onboardedState !== 'false');
    setIsLoading(false);
  }, []);

  const login = async (emailOrPhone: string, _password?: string) => {
    setIsLoading(true);
    // Find matching user or fallback to Kwame
    const users = mockBackend.getUsers();
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === emailOrPhone.toLowerCase() ||
        u.phone === emailOrPhone ||
        u.username.toLowerCase() === emailOrPhone.toLowerCase()
    );

    if (found) {
      if (found.status === 'suspended' || found.status === 'banned') {
        setIsLoading(false);
        return { success: false, error: `Account is ${found.status}. Please contact support.` };
      }
      mockBackend.setCurrentUser(found);
      setCurrentUser(found);
      setIsOnboarded(true);
      localStorage.setItem('afrilink_onboarded', 'true');
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Invalid credentials. User not found.' };
  };

  const register = async (data: {
    fullName: string;
    username: string;
    emailOrPhone: string;
    password?: string;
    country: string;
    countryCode: string;
    dateOfBirth?: string;
  }) => {
    setIsLoading(true);
    const users = mockBackend.getUsers();

    // Check username uniqueness
    if (users.some((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
      setIsLoading(false);
      return { success: false, error: 'Username is already taken.' };
    }

    // Check email uniqueness
    const isEmail = data.emailOrPhone.includes('@');
    if (
      users.some(
        (u) =>
          u.email.toLowerCase() === data.emailOrPhone.toLowerCase() ||
          (u.phone && u.phone === data.emailOrPhone)
      )
    ) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email/phone already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: data.username.toLowerCase().trim(),
      fullName: data.fullName.trim(),
      email: isEmail ? data.emailOrPhone : `${data.username}@afrilink.africa`,
      phone: !isEmail ? data.emailOrPhone : undefined,
      bio: `AfriLink community member from ${data.country}.`,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
      coverImageUrl: `https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80`,
      country: data.country,
      countryCode: data.countryCode,
      city: '',
      interests: [],
      joinedDate: new Date().toISOString().split('T')[0],
      role: 'user',
      status: 'active',
      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('afrilink_db_users', JSON.stringify(updatedUsers));
    mockBackend.setCurrentUser(newUser);
    setCurrentUser(newUser);

    // Prompt onboarding
    setIsOnboarded(false);
    localStorage.setItem('afrilink_onboarded', 'false');
    setIsLoading(false);

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('afrilink_onboarded');
  };

  const updateProfile = (data: Partial<User>) => {
    const updated = mockBackend.updateUserProfile(data);
    setCurrentUser(updated);
  };

  const completeOnboarding = (data: {
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
      bio: data.bio || currentUser?.bio || '',
      city: data.city || currentUser?.city || '',
      avatarUrl: data.avatarUrl || currentUser?.avatarUrl || '',
    });
    setCurrentUser(updated);
    setIsOnboarded(true);
    localStorage.setItem('afrilink_onboarded', 'true');
  };

  const switchUser = (userId: string) => {
    const user = mockBackend.getUserById(userId);
    if (user) {
      mockBackend.setCurrentUser(user);
      setCurrentUser(user);
      setIsOnboarded(true);
      localStorage.setItem('afrilink_onboarded', 'true');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isOnboarded,
        isLoading,
        login,
        register,
        logout,
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
