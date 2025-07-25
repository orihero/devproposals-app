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
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const oauthInProgressRef = useRef(false);
  const syncInProgressRef = useRef(false);
  const redirectInProgressRef = useRef(false);
  const oauthTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const oauthRetryCountRef = useRef(0);

  // Check if we're in an OAuth flow
  const isOAuthFlow = () => {
    const url = window.location.href;
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    // Check for OAuth parameters in URL
    const hasOAuthParams = url.includes('code=') ||
                           url.includes('state=') ||
                           url.includes('access_token') ||
                           url.includes('error=') ||
                           url.includes('oauth') ||
                           url.includes('clerk') ||
                           searchParams.has('code') ||
                           searchParams.has('state') ||
                           hashParams.has('access_token');

    // Check for any Clerk-related parameters
    const hasClerkParams = searchParams.has('__clerk_status') ||
                           searchParams.has('__clerk_created_session_id') ||
                           searchParams.has('__clerk_modal_state');

    // Also check if we're on sign-in page after a potential OAuth redirect
    const isOnSignInAfterOAuth = window.location.pathname === '/sign-in' &&
                                 (sessionStorage.getItem('oauth_in_progress') === 'true' ||
                                  localStorage.getItem('oauth_in_progress') === 'true');

    // Check for Google OAuth specific parameters
    const hasGoogleOAuthParams = searchParams.has('code') && 
                                 (url.includes('google') || 
                                  searchParams.has('state') ||
                                  sessionStorage.getItem('oauth_in_progress') === 'true');

    console.log('🔍 OAuth flow check:', {
      url: window.location.href,
      hasOAuthParams,
      hasClerkParams,
      hasGoogleOAuthParams,
      isOnSignInAfterOAuth,
      searchParams: window.location.search,
      hashParams: window.location.hash,
      oauthInSession: sessionStorage.getItem('oauth_in_progress'),
      oauthInLocal: localStorage.getItem('oauth_in_progress'),
      allSearchParams: Object.fromEntries(searchParams.entries())
    });

    return hasOAuthParams || hasClerkParams || isOnSignInAfterOAuth || hasGoogleOAuthParams;
  };

  // Check if we're returning from OAuth (has OAuth params but no session yet)
  const isReturningFromOAuth = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasOAuthCallback = searchParams.has('code') || searchParams.has('state');
    const hasOAuthFlag = sessionStorage.getItem('oauth_in_progress') === 'true' || 
                        localStorage.getItem('oauth_in_progress') === 'true';
    
    return hasOAuthCallback || hasOAuthFlag;
  };

      // Reset function to clear all auth state
    const resetAuthState = () => {
      console.log('🔄 Resetting authentication state...');
      hasSynced.current = false;
      lastAuthState.current = { isSignedIn: false, clerkLoaded: false };
      oauthInProgressRef.current = false;
      syncInProgressRef.current = false;
      oauthRetryCountRef.current = 0;
      
      // Clear all storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('socialAuthContext');
      localStorage.removeItem('oauth_in_progress');
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
      if (oauthTimeoutRef.current) {
        clearTimeout(oauthTimeoutRef.current);
        oauthTimeoutRef.current = null;
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
      searchParams: window.location.search,
      clerkUser: !!clerkUser,
      syncInProgress: syncInProgressRef.current,
      redirectInProgress: redirectInProgressRef.current,
      isOAuthFlow: isOAuthFlow(),
      isReturningFromOAuth: isReturningFromOAuth(),
      oauthRetryCount: oauthRetryCountRef.current,
      timestamp: new Date().toISOString()
    });

    if (!clerkLoaded) {
      console.log('⏳ Clerk not loaded yet, skipping sync');
      hasSynced.current = false;
      return;
    }

    if (authStateChanged || !hasSynced.current) {
      syncInProgressRef.current = true;
      redirectInProgressRef.current = false; // Reset redirect flag on auth state change
      
      // Set a timeout to clear OAuth flag if it's been set for too long
      if (sessionStorage.getItem('oauth_in_progress') === 'true' || localStorage.getItem('oauth_in_progress') === 'true') {
        if (oauthTimeoutRef.current) {
          clearTimeout(oauthTimeoutRef.current);
        }
        oauthTimeoutRef.current = setTimeout(() => {
          console.log('⏰ OAuth timeout reached, clearing OAuth flag');
          sessionStorage.removeItem('oauth_in_progress');
          localStorage.removeItem('oauth_in_progress');
          oauthTimeoutRef.current = null;
        }, 30000); // 30 seconds timeout
      }
      
      // Check if we're returning from OAuth but Clerk hasn't processed it yet
      if (isReturningFromOAuth() && !isSignedIn && clerkLoaded) {
        console.log('🔄 Returning from OAuth, waiting for Clerk to process...');
        
        // Try to manually trigger Clerk to process the OAuth callback
        const handleOAuthCallback = async () => {
          try {
            const clerk = (window as any).Clerk;
            if (clerk && clerk.handleRedirectCallback) {
              console.log('🔄 Attempting to manually handle OAuth callback...');
              await clerk.handleRedirectCallback();
              console.log('✅ OAuth callback processed by Clerk');
              
              // Give Clerk a moment to establish the session
              setTimeout(() => {
                console.log('⏰ Checking if Clerk has established session after OAuth...');
                hasSynced.current = false;
                lastAuthState.current = { isSignedIn: false, clerkLoaded: false };
              }, 2000);
            }
          } catch (error) {
            console.log('⚠️ Manual OAuth callback handling failed:', error);
            
            // If manual handling fails, try again after a delay
            if (oauthRetryCountRef.current < 3) {
              oauthRetryCountRef.current++;
              console.log(`🔄 Retrying OAuth callback handling (attempt ${oauthRetryCountRef.current}/3)...`);
              setTimeout(() => {
                hasSynced.current = false;
                lastAuthState.current = { isSignedIn: false, clerkLoaded: false };
              }, 3000);
            } else {
              console.log('❌ Max OAuth retry attempts reached, clearing OAuth flag');
              sessionStorage.removeItem('oauth_in_progress');
              localStorage.removeItem('oauth_in_progress');
            }
          }
        };
        
        handleOAuthCallback();
        return; // Don't proceed with sync yet
      }
      
      const syncAuth = async () => {
        try {
          // Check if we have a Clerk user (either signed in or just completed OAuth)
          const hasClerkUser = clerkUser && clerkUser.id;
          const shouldSync = isSignedIn || (hasClerkUser && isOAuthFlow());
          
          console.log('🔍 Sync conditions:', {
            isSignedIn,
            hasClerkUser,
            isOAuthFlow: isOAuthFlow(),
            isReturningFromOAuth: isReturningFromOAuth(),
            shouldSync,
            clerkUser: clerkUser ? {
              id: clerkUser.id,
              email: clerkUser.emailAddresses?.[0]?.emailAddress,
              name: clerkUser.fullName
            } : null
          });
          
          if (shouldSync && clerkUser) {
            console.log('✅ User signed in or OAuth completed, syncing authentication');
            console.log('🚨 THIS IS WHERE WE SHOULD CALL THE BACKEND');
            console.log('👤 Clerk user details:', {
              id: clerkUser.id,
              email: clerkUser.emailAddresses?.[0]?.emailAddress,
              name: clerkUser.fullName,
              imageUrl: clerkUser.imageUrl
            });
            
            // Force backend call even if isSignedIn is false but we have user data
            const forceBackendCall = !isSignedIn && hasClerkUser && isOAuthFlow();
            if (forceBackendCall) {
              console.log('🔄 Force calling backend with Clerk user data (OAuth completed)');
            }
            
            // Get Clerk token and store it
            let token = null;
            try {
              console.log('🔑 Attempting to get Clerk token...');
              token = await (window as any).Clerk?.session?.getToken();
              console.log('🔑 Token obtained from session:', !!token, token ? `Length: ${token.length}` : 'No token');
              
              if (!token) {
                console.log('⚠️ No token from session, trying with skipCache...');
                token = await (window as any).Clerk?.session?.getToken({ skipCache: true });
                console.log('🔑 Token obtained with skipCache:', !!token);
              }
              
              if (!token) {
                console.log('⚠️ Still no token, trying alternative method...');
                // Try to get token from Clerk's internal state
                const session = (window as any).Clerk?.session;
                if (session) {
                  console.log('🔍 Clerk session available:', !!session);
                  console.log('🔍 Session ID:', session.id);
                  console.log('🔍 Session status:', session.status);
                }
              }
            } catch (error) {
              console.log('⚠️ Could not get token from session:', error);
            }
            
            if (token) {
              setAuthToken(token);
              console.log('💾 Token stored in localStorage');
            } else {
              console.log('⚠️ No token available, but proceeding with user data');
            }
            
            // Always call backend if we have user data from OAuth
            const shouldCallBackend = token || forceBackendCall;
            if (!shouldCallBackend) {
              console.log('⚠️ No token and not forcing backend call, skipping');
              return;
            }
            
            // Try to login first, if that fails, try to signup
            const store = useAuthStore.getState();
            console.log('📡 Attempting to login user...');
            
            try {
              // Prepare user data from Clerk
              const email = clerkUser.emailAddresses?.[0]?.emailAddress;
              const name = clerkUser.fullName || email?.split('@')[0] || 'User';
              const imageUrl = clerkUser.imageUrl || '';
              
              console.log('👤 Preparing user data for login:', {
                clerkId: clerkUser.id,
                email,
                name,
                imageUrl: imageUrl ? 'Present' : 'Not provided'
              });
              
              // Try to login with the user's clerkId and additional data for auto-creation
              const loginData = {
                clerkId: clerkUser.id,
                email: email || '',
                name: name,
                imageUrl: imageUrl,
              };
              
              console.log('📡 Calling backend login endpoint...');
              const user = await authService.login(loginData);
              console.log('✅ User logged in successfully:', user);
              store.setUser(user);
              
              // Clear OAuth in progress flag
              sessionStorage.removeItem('oauth_in_progress');
              localStorage.removeItem('oauth_in_progress');
              console.log('🏷️ OAuth in progress flag cleared');
              
              // Reset OAuth retry count
              oauthRetryCountRef.current = 0;
              
              // Redirect based on user role
              const currentPath = window.location.pathname;
              console.log('📍 Current path:', currentPath);
              console.log('🎯 User role:', user.role);
              
              // Check if we're on auth pages or home page
              const isOnAuthPage = currentPath === '/sign-in' || currentPath === '/sign-up' || currentPath === '/';
              const isOnOAuthCallback = window.location.search.includes('code=') || window.location.search.includes('state=');
              
              console.log('🔍 Redirect conditions:', {
                isOnAuthPage,
                isOnOAuthCallback,
                currentPath
              });
              
              if ((isOnAuthPage || isOnOAuthCallback) && !redirectInProgressRef.current) {
                const targetPath = user.role === 'admin' ? '/admin' : '/dashboard';
                console.log('🚀 Redirecting to:', targetPath);
                
                redirectInProgressRef.current = true;
                
                // Add a small delay to ensure authentication state is properly established
                setTimeout(() => {
                  console.log('⏰ Executing delayed redirect to:', targetPath);
                  window.location.href = targetPath;
                }, 500);
              }
            } catch (loginError: any) {
              console.error('❌ Login failed:', loginError);
              console.log('🔍 Login error details:', {
                message: loginError.message,
                status: loginError.response?.status,
                data: loginError.response?.data
              });
              
              // If login fails due to missing data, try to create user with available data
              if (loginError.response?.status === 400 && 
                  loginError.response?.data?.error?.code === 'MISSING_USER_DATA') {
                console.log('🔄 Missing user data, attempting to create user with available data...');
                
                try {
                  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
                  const name = clerkUser.fullName || email?.split('@')[0] || 'User';
                  
                  if (email && name) {
                    const signupData = {
                      clerkId: clerkUser.id,
                      email: email,
                      name: name,
                      imageUrl: clerkUser.imageUrl || '',
                    };
                    
                    console.log('📡 Attempting to create user via signup endpoint...');
                    const newUser = await authService.signup(signupData);
                    console.log('✅ User created successfully:', newUser);
                    store.setUser(newUser);
                    
                    // Clear OAuth in progress flag
                    sessionStorage.removeItem('oauth_in_progress');
                    localStorage.removeItem('oauth_in_progress');
                    console.log('🏷️ OAuth in progress flag cleared');
                    
                    // Reset OAuth retry count
                    oauthRetryCountRef.current = 0;
                    
                    // Redirect based on user role
                    const currentPath = window.location.pathname;
                    const isOnAuthPage = currentPath === '/sign-in' || currentPath === '/sign-up' || currentPath === '/';
                    const isOnOAuthCallback = window.location.search.includes('code=') || window.location.search.includes('state=');
                    
                    if ((isOnAuthPage || isOnOAuthCallback) && !redirectInProgressRef.current) {
                      const targetPath = newUser.role === 'admin' ? '/admin' : '/dashboard';
                      console.log('🚀 Redirecting to:', targetPath);
                      redirectInProgressRef.current = true;
                      
                      // Add a small delay to ensure authentication state is properly established
                      setTimeout(() => {
                        console.log('⏰ Executing delayed redirect to:', targetPath);
                        window.location.href = targetPath;
                      }, 500);
                    }
                  } else {
                    console.error('❌ Cannot create user: missing email or name');
                    throw new Error('Cannot create user: missing email or name');
                  }
                } catch (signupError: any) {
                  console.error('❌ User creation failed:', signupError);
                  throw signupError;
                }
              } else {
                // Don't clear user state here - let the store handle it
                console.log('🔄 Login failed, but keeping auth state');
              }
            }
          } else {
            console.log('❌ User not signed in, clearing auth');
            // User is not signed in
            clearAuthToken();
            const store = useAuthStore.getState();
            store.setUser(null);
            
            // Clear OAuth in progress flag if we're not in an OAuth flow
            if (!isOAuthFlow()) {
              sessionStorage.removeItem('oauth_in_progress');
              localStorage.removeItem('oauth_in_progress');
              console.log('🏷️ OAuth in progress flag cleared (not in OAuth flow)');
            }
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
        authToken: !!localStorage.getItem('auth_token'),
        oauthRetryCount: oauthRetryCountRef.current,
        isOAuthFlow: isOAuthFlow(),
        isReturningFromOAuth: isReturningFromOAuth(),
        oauthInSession: sessionStorage.getItem('oauth_in_progress'),
        oauthInLocal: localStorage.getItem('oauth_in_progress'),
        searchParams: window.location.search,
        clerkSession: (window as any).Clerk?.session ? {
          id: (window as any).Clerk.session.id,
          status: (window as any).Clerk.session.status,
          userId: (window as any).Clerk.session.userId
        } : null
      });
    };
    
    (window as any).testOAuthFlow = async () => {
      console.log('🧪 Testing OAuth flow...');
      try {
        const clerk = (window as any).Clerk;
        if (clerk && clerk.handleRedirectCallback) {
          console.log('🔄 Testing OAuth callback handling...');
          await clerk.handleRedirectCallback();
          console.log('✅ OAuth callback test successful');
        } else {
          console.log('❌ Clerk or handleRedirectCallback not available');
        }
      } catch (error) {
        console.log('❌ OAuth callback test failed:', error);
      }
    };
    
    console.log('🔧 Debug functions available: window.resetAuthState(), window.debugAuthState(), and window.testOAuthFlow()');
  }, [clerkLoaded, isSignedIn, clerkUser]);

  return {
    clerkUser,
    clerkLoaded: clerkLoaded || false,
    isSignedIn: isSignedIn || false,
  };
}; 