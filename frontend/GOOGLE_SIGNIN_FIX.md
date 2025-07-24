# Google Sign-In Logout Issue Fix

## Problem Description

When users clicked "Sign in with Google", the application would immediately call logout after the OAuth redirect, preventing successful authentication.

## Root Cause

The issue was in the `useClerkAuthSync` hook in `frontend/src/hooks/useClerkAuth.ts`. The hook had two `useEffect` hooks:

1. **First useEffect**: Handled authentication state synchronization
2. **Second useEffect**: Handled logout when `clerkLoaded && !isSignedIn`

During the OAuth flow, Clerk's authentication state changes multiple times:
- Initial state: `isSignedIn: false, clerkLoaded: true`
- During OAuth redirect: `isSignedIn: false, clerkLoaded: true` (temporarily)
- After successful OAuth: `isSignedIn: true, clerkLoaded: true`

The second `useEffect` was triggering logout during the OAuth redirect phase, causing the authentication to fail.

## Solution

### 1. Added OAuth Flow Detection

```typescript
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
```

### 2. Added Delayed Logout with OAuth Awareness

```typescript
// Handle Clerk sign out with delay to prevent premature logout during OAuth
useEffect(() => {
  // Clear any existing timeout
  if (logoutTimeoutRef.current) {
    clearTimeout(logoutTimeoutRef.current);
  }

  if (clerkLoaded && !isSignedIn) {
    // Check if we're in the middle of an OAuth flow
    const inOAuthFlow = isOAuthFlow();
    
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
```

### 3. Added Debugging Logs

Added comprehensive logging to track the authentication flow and help debug any future issues.

## Testing

### To test the fix:

1. **Start the development servers**:
   ```bash
   # Terminal 1 - Frontend
   cd frontend && yarn dev
   
   # Terminal 2 - Backend
   cd backend && yarn dev
   ```

2. **Open the application** in your browser at `http://localhost:3000`

3. **Navigate to the sign-in page** at `http://localhost:3000/sign-in`

4. **Click "Sign in with Google"** and complete the OAuth flow

5. **Check the browser console** for the debug logs:
   - `🔐 Auth state changed:` - Shows authentication state changes
   - `🔄 OAuth flow detected, skipping logout` - Should appear during OAuth
   - `✅ User signed in, syncing authentication` - Should appear after successful OAuth
   - `🚪 Executing delayed logout after OAuth` - Should NOT appear during normal sign-in

### Expected Behavior

- **Before fix**: User would be logged out immediately after clicking "Sign in with Google"
- **After fix**: User should successfully sign in and be redirected to the dashboard

## Files Modified

- `frontend/src/hooks/useClerkAuth.ts` - Main fix implementation

## Additional Improvements

1. **Better OAuth Detection**: Enhanced URL parameter checking for OAuth flows
2. **Timeout Management**: Proper cleanup of timeouts to prevent memory leaks
3. **Debug Logging**: Comprehensive logging for easier debugging
4. **State Tracking**: Tracks OAuth progress to prevent premature logout

## Notes

- The fix uses a 1-second delay for normal logout and a 2-second delay after OAuth completion
- OAuth flow detection checks for various URL parameters that indicate OAuth redirects
- Debug logs can be removed in production by commenting out the `console.log` statements 