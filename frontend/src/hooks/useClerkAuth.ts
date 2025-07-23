import { useEffect, useRef } from 'react';
import { useUser as useClerkUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/authStore';
import { setAuthToken, clearAuthToken } from '../services/api/axiosConfig';

export const useClerkAuthSync = (): {
  clerkUser: any;
  clerkLoaded: boolean;
  isSignedIn: boolean;
} => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  const { isSignedIn } = useClerkAuth();
  
  // Use ref to track if we've already synced to prevent infinite loops
  const hasSynced = useRef(false);
  const lastAuthState = useRef({ isSignedIn: false, clerkLoaded: false });

  // Sync Clerk authentication with our store
  useEffect(() => {
    // Only sync if the auth state has actually changed
    const currentAuthState = { isSignedIn: !!isSignedIn, clerkLoaded: !!clerkLoaded };
    const authStateChanged = 
      currentAuthState.isSignedIn !== lastAuthState.current.isSignedIn ||
      currentAuthState.clerkLoaded !== lastAuthState.current.clerkLoaded;

    if (!clerkLoaded) {
      hasSynced.current = false;
      return;
    }

    if (authStateChanged || !hasSynced.current) {
      const syncAuth = async () => {
        if (isSignedIn && clerkUser) {
          try {
            // Get Clerk token and store it
            const token = await (window as any).Clerk?.session?.getToken();
            if (token) {
              setAuthToken(token);
              
              // Fetch user profile from our backend using the store directly
              const store = useAuthStore.getState();
              await store.fetchProfile();
              
              // Redirect based on user role
              const user = useAuthStore.getState().user;
              if (user) {
                const currentPath = window.location.pathname;
                if (currentPath === '/sign-in' || currentPath === '/sign-up' || currentPath === '/') {
                  if (user.role === 'admin') {
                    window.location.href = '/admin';
                  } else {
                    window.location.href = '/dashboard';
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error syncing authentication:', error);
            const store = useAuthStore.getState();
            store.setUser(null);
          }
        } else {
          // User is not signed in
          clearAuthToken();
          const store = useAuthStore.getState();
          store.setUser(null);
        }
      };

      syncAuth();
      hasSynced.current = true;
      lastAuthState.current = currentAuthState;
    }
  }, [clerkLoaded, isSignedIn, clerkUser]);

  // Handle Clerk sign out
  useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      clearAuthToken();
      const store = useAuthStore.getState();
      store.logout();
    }
  }, [clerkLoaded, isSignedIn]);

  return {
    clerkUser,
    clerkLoaded: clerkLoaded || false,
    isSignedIn: isSignedIn || false,
  };
}; 