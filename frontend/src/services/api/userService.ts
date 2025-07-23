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

// User API service
export const userService = {
  // Get user by ID
  getUserById: async (userId: string): Promise<User> => {
    const response: AxiosResponse<UserResponse> = await apiClient.get(`/users/${userId}`);
    return response.data.data.user;
  },

  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    const response: AxiosResponse<UsersResponse> = await apiClient.get('/users');
    return response.data.data.users;
  },

  // Update user
  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    const response: AxiosResponse<UserResponse> = await apiClient.put(`/users/${userId}`, data);
    return response.data.data.user;
  },

  // Delete user (admin only)
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },
};

export default userService; 