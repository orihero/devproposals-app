import { useEffect, useRef } from 'react';
import { useUser as useClerkUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/authStore';
import { setAuthToken, clearAuthToken } from '../services/api/axiosConfig';
import authService from '../services/api/authService';

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
  const logoutTimeoutRef = useRef<number | null>(null);
  const oauthInProgressRef = useRef(false);
  const syncInProgressRef = useRef(false);

  // Check if we're in an OAuth flow
  const isOAuthFlow = () => {
    const url = window.location.href;
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    return url.includes('code=') || 
           url.includes('state=') ||
           url.includes('access_token') ||
           url.includes('error=') ||
           url.includes('oauth') ||
           url.includes('clerk') ||
           searchParams.has('code') ||
           searchParams.has('state') ||
           hashParams.has('access_token');
  };

  // Reset function to clear all auth state
  const resetAuthState = () => {
    console.log('🔄 Resetting authentication state...');
    hasSynced.current = false;
    lastAuthState.current = { isSignedIn: false, clerkLoaded: false };
    oauthInProgressRef.current = false;
    syncInProgressRef.current = false;
    
    // Clear all storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('socialAuthContext');
    sessionStorage.clear();
    
    // Clear store
    const store = useAuthStore.getState();
    store.setUser(null);
    clearAuthToken();
    
    // Clear any timeouts
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  };

  // Sync Clerk authentication with our store
  useEffect(() => {
    // Prevent multiple syncs at the same time
    if (syncInProgressRef.current) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    // Only sync if the auth state has actually changed
    const currentAuthState = { isSignedIn: !!isSignedIn, clerkLoaded: !!clerkLoaded };
    const authStateChanged = 
      currentAuthState.isSignedIn !== lastAuthState.current.isSignedIn ||
      currentAuthState.clerkLoaded !== lastAuthState.current.clerkLoaded;

    console.log('🔐 Auth state changed:', {
      isSignedIn,
      clerkLoaded,
      authStateChanged,
      hasSynced: hasSynced.current,
      currentPath: window.location.pathname,
      clerkUser: !!clerkUser,
      syncInProgress: syncInProgressRef.current,
      timestamp: new Date().toISOString()
    });

    if (!clerkLoaded) {
      console.log('⏳ Clerk not loaded yet, skipping sync');
      hasSynced.current = false;
      return;
    }

    if (authStateChanged || !hasSynced.current) {
      syncInProgressRef.current = true;
      
      const syncAuth = async () => {
        try {
          if (isSignedIn && clerkUser) {
            console.log('✅ User signed in, syncing authentication');
            console.log('👤 Clerk user details:', {
              id: clerkUser.id,
              email: clerkUser.emailAddresses?.[0]?.emailAddress,
              name: clerkUser.fullName,
              imageUrl: clerkUser.imageUrl
            });
            
            // Get Clerk token and store it
            const token = await (window as any).Clerk?.session?.getToken();
            console.log('🔑 Token obtained:', !!token, token ? `Length: ${token.length}` : 'No token');
            
            if (token) {
              setAuthToken(token);
              console.log('💾 Token stored in localStorage');
              
              // Try to login first, if that fails, try to signup
              const store = useAuthStore.getState();
              console.log('📡 Attempting to login user...');
              
              try {
                // Try to login with the user's clerkId and additional data for auto-creation
                const loginData = {
                  clerkId: clerkUser.id,
                  email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
                  name: clerkUser.fullName || 'User',
                  imageUrl: clerkUser.imageUrl || '',
                };
                const user = await authService.login(loginData);
                console.log('✅ User logged in successfully:', user);
                store.setUser(user);
                
                // Redirect based on user role
                const currentPath = window.location.pathname;
                console.log('📍 Current path:', currentPath);
                console.log('🎯 User role:', user.role);
                
                if (currentPath === '/sign-in' || currentPath === '/sign-up' || currentPath === '/') {
                  const targetPath = user.role === 'admin' ? '/admin' : '/dashboard';
                  console.log('🚀 Redirecting to:', targetPath);
                  
                  // Use window.location.href for now to ensure full redirect
                  window.location.href = targetPath;
                }
              } catch (loginError: any) {
                console.error('❌ Login failed:', loginError);
                console.log('🔍 Login error details:', {
                  message: loginError.message,
                  status: loginError.response?.status,
                  data: loginError.response?.data
                });
                // Don't clear user state here - let the store handle it
                console.log('🔄 Login failed, but keeping auth state');
              }
            } else {
              console.log('⚠️ No token obtained from Clerk');
            }
          } else {
            console.log('❌ User not signed in, clearing auth');
            // User is not signed in
            clearAuthToken();
            const store = useAuthStore.getState();
            store.setUser(null);
          }
        } catch (error) {
          console.error('❌ Error syncing authentication:', error);
          // Don't clear user state on sync errors
          console.log('🔄 Sync error, but keeping auth state');
        } finally {
          syncInProgressRef.current = false;
        }
      };

      syncAuth();
      hasSynced.current = true;
      lastAuthState.current = currentAuthState;
    }
  }, [clerkLoaded, isSignedIn, clerkUser]);

  // Handle Clerk sign out with delay to prevent premature logout during OAuth
  useEffect(() => {
    // Clear any existing timeout
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
    }

    if (clerkLoaded && !isSignedIn) {
      // Check if we're in the middle of an OAuth flow
      const inOAuthFlow = isOAuthFlow();
      
      console.log('🔍 Checking logout conditions:', {
        clerkLoaded,
        isSignedIn,
        inOAuthFlow,
        oauthInProgress: oauthInProgressRef.current,
        currentPath: window.location.pathname
      });
      
      if (inOAuthFlow) {
        console.log('🔄 OAuth flow detected, skipping logout');
        oauthInProgressRef.current = true;
        return;
      }

      // If we were in OAuth flow but now we're not, give it more time
      if (oauthInProgressRef.current) {
        console.log('⏳ OAuth flow completed, waiting before logout');
        oauthInProgressRef.current = false;
        logoutTimeoutRef.current = setTimeout(() => {
          console.log('🚪 Executing delayed logout after OAuth');
          clearAuthToken();
          const store = useAuthStore.getState();
          store.logout();
        }, 2000); // 2 second delay after OAuth
        return;
      }

      // Normal logout flow
      console.log('⏰ Scheduling normal logout');
      logoutTimeoutRef.current = setTimeout(() => {
        console.log('🚪 Executing normal logout');
        clearAuthToken();
        const store = useAuthStore.getState();
        store.logout();
      }, 1000); // 1 second delay
    } else if (isSignedIn) {
      // User is signed in, clear OAuth flag
      oauthInProgressRef.current = false;
    }

    // Cleanup timeout on unmount
    return () => {
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, [clerkLoaded, isSignedIn]);

  // Add reset function to window for debugging
  useEffect(() => {
    (window as any).resetAuthState = resetAuthState;
    (window as any).debugAuthState = () => {
      console.log('🔍 Debug Auth State:', {
        clerkLoaded,
        isSignedIn,
        clerkUser: !!clerkUser,
        hasSynced: hasSynced.current,
        syncInProgress: syncInProgressRef.current,
        oauthInProgress: oauthInProgressRef.current,
        currentPath: window.location.pathname,
        storeUser: useAuthStore.getState().user,
        storeIsAuthenticated: useAuthStore.getState().isAuthenticated,
        authToken: !!localStorage.getItem('auth_token')
      });
    };
    console.log('🔧 Debug functions available: window.resetAuthState() and window.debugAuthState()');
  }, [clerkLoaded, isSignedIn, clerkUser]);

  return {
    clerkUser,
    clerkLoaded: clerkLoaded || false,
    isSignedIn: isSignedIn || false,
  };
}; 