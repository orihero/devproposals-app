import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  imageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: { name?: string }) => Promise<void>;
  getUsers: () => Promise<User[]>;
  updateUserRole: (userId: string, role: 'user' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth interceptor
api.interceptors.request.use(async (config) => {
  const token = await (window as any).Clerk?.session?.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn } = useClerkAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from our backend
  const fetchUserProfile = async () => {
    if (!isSignedIn || !clerkUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      setError(err.response?.data?.error?.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: { name?: string }) => {
    try {
      setError(null);
      const response = await api.put('/auth/me', data);
      setUser(response.data.data.user);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      throw new Error(err.response?.data?.error?.message || 'Failed to update profile');
    }
  };

  // Get all users (admin only)
  const getUsers = async (): Promise<User[]> => {
    try {
      setError(null);
      const response = await api.get('/auth/users');
      return response.data.data.users;
    } catch (err: any) {
      console.error('Failed to get users:', err);
      throw new Error(err.response?.data?.error?.message || 'Failed to get users');
    }
  };

  // Update user role (admin only)
  const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<void> => {
    try {
      setError(null);
      await api.put(`/auth/users/${userId}/role`, { role });
    } catch (err: any) {
      console.error('Failed to update user role:', err);
      throw new Error(err.response?.data?.error?.message || 'Failed to update user role');
    }
  };

  // Fetch user profile when Clerk user changes
  useEffect(() => {
    if (clerkLoaded) {
      fetchUserProfile();
    }
  }, [clerkLoaded, isSignedIn, clerkUser]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    updateProfile,
    getUsers,
    updateUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 