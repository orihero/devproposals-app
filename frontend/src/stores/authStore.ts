import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import authService from '../services/api/authService';
import type { User, UpdateProfileData } from '../services/api/authService';

// Types
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Async actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  logout: () => Promise<void>;
  
  // Computed
  getIsAuthenticated: () => boolean;
  getUserRole: () => 'user' | 'admin' | null;
}

type AuthStore = AuthState & AuthActions;

// Initial state
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Create store
export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Async actions
      fetchProfile: async () => {
        try {
          set({ loading: true, error: null });
          const user = await authService.getProfile();
          set({ user, isAuthenticated: true, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
          console.error('Profile fetch error:', error);
          
          // Only clear user state for authentication errors, not other API errors
          if (error instanceof Error && error.message.includes('Authentication failed')) {
            console.log('🔐 Authentication error detected, clearing user state');
            set({ 
              error: errorMessage, 
              loading: false, 
              user: null, 
              isAuthenticated: false 
            });
          } else {
            // For other errors (network, server, etc.), keep the user state but show error
            console.log('⚠️ Non-auth error, keeping user state');
            set({ 
              error: errorMessage, 
              loading: false 
              // Don't clear user or isAuthenticated
            });
          }
        }
      },

      updateProfile: async (data) => {
        try {
          set({ loading: true, error: null });
          const user = await authService.updateProfile(data);
          set({ user, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null, 
            loading: false 
          });
        }
      },

      // Computed
      getIsAuthenticated: () => get().isAuthenticated,

      getUserRole: () => get().user?.role || null,
    }),
    {
      name: 'auth-store',
    }
  )
);

// Selectors for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useUserRole = () => useAuthStore((state) => state.user?.role);

// Actions
export const useAuthActions = () => useAuthStore((state) => ({
  setUser: state.setUser,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
  fetchProfile: state.fetchProfile,
  updateProfile: state.updateProfile,
  logout: state.logout,
})); 