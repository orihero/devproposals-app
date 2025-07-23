import apiClient from './axiosConfig';
import type { AxiosResponse } from 'axios';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
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
}

export interface UpdateUserRoleData {
  role: 'user' | 'admin';
}

// Auth API service
export const authService = {
  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.get('/auth/me');
    return response.data.data.user;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.put('/auth/me', data);
    return response.data.data.user;
  },

  // Get all users (admin only)
  getUsers: async (): Promise<User[]> => {
    const response: AxiosResponse<UsersResponse> = await apiClient.get('/auth/users');
    return response.data.data.users;
  },

  // Update user role (admin only)
  updateUserRole: async (userId: string, role: 'user' | 'admin'): Promise<void> => {
    await apiClient.put(`/auth/users/${userId}/role`, { role });
  },

  // Logout (client-side)
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};

export default authService; 