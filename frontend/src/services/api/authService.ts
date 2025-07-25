import apiClient from './axiosConfig';
import type { AxiosResponse } from 'axios';

// Types
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  stats?: {
    projects: number;
    proposals: number;
  };
}

export interface AuthResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
  message?: string;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
  };
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface UpdateUserRoleData {
  role: 'user' | 'admin';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
}

export interface SignupData {
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string;
}

export interface LoginData {
  clerkId: string;
  email?: string;
  name?: string;
  imageUrl?: string;
}

// Auth API service
export const authService = {
  // Sign up new user
  signup: async (data: SignupData): Promise<User> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/signup', data);
    return response.data.data;
  },

  // Login user
  login: async (data: LoginData): Promise<User> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/login', data);
    return response.data.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response: AxiosResponse<UserResponse> = await apiClient.get('/api/auth/me');
    return response.data.data.user;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response: AxiosResponse<UserResponse> = await apiClient.put('/api/auth/me', data);
    return response.data.data.user;
  },

  // Get all users (admin only)
  getUsers: async (): Promise<User[]> => {
    const response: AxiosResponse<UsersResponse> = await apiClient.get('/api/auth/users');
    return response.data.data.users;
  },

  // Update user role (admin only)
  updateUserRole: async (userId: string, role: 'user' | 'admin'): Promise<void> => {
    await apiClient.put(`/api/auth/users/${userId}/role`, { role });
  },

  // Get single user (admin only)
  getUser: async (userId: string): Promise<User> => {
    const response: AxiosResponse<UserResponse> = await apiClient.get(`/api/auth/users/${userId}`);
    return response.data.data.user;
  },

  // Update user (admin only)
  updateUser: async (userId: string, data: UpdateUserData): Promise<User> => {
    const response: AxiosResponse<UserResponse> = await apiClient.put(`/api/auth/users/${userId}`, data);
    return response.data.data.user;
  },

  // Delete user (admin only)
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/api/auth/users/${userId}`);
  },

  // Logout (client-side)
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },
};

export default authService; 