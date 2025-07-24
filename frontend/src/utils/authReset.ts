// Utility function to completely reset authentication state
export const resetAuthenticationState = () => {
  console.log('🔄 Resetting authentication state...');
  
  // Clear all localStorage
  localStorage.clear();
  
  // Clear all sessionStorage
  sessionStorage.clear();
  
  // Clear Clerk session if available
  if (typeof window !== 'undefined') {
    // Clear Clerk session
    if ((window as any).Clerk?.session) {
      try {
        (window as any).Clerk.session.destroy();
        console.log('✅ Clerk session destroyed');
      } catch (error) {
        console.log('⚠️ Could not destroy Clerk session:', error);
      }
    }
    
    // Clear Clerk user
    if ((window as any).Clerk?.user) {
      try {
        (window as any).Clerk.user = null;
        console.log('✅ Clerk user cleared');
      } catch (error) {
        console.log('⚠️ Could not clear Clerk user:', error);
      }
    }

    // Clear Clerk instance
    if ((window as any).Clerk) {
      try {
        (window as any).Clerk = null;
        console.log('✅ Clerk instance cleared');
      } catch (error) {
        console.log('⚠️ Could not clear Clerk instance:', error);
      }
    }
  }
  
  // Clear any auth tokens
  if (typeof window !== 'undefined') {
    // Remove specific auth tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('socialAuthContext');
    localStorage.removeItem('clerk-db');
    localStorage.removeItem('clerk-session');
    localStorage.removeItem('clerk-js');
    localStorage.removeItem('clerk-client');
    
    // Clear any Clerk-related items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('clerk') || key.includes('auth') || key.includes('session'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed: ${key}`);
    });
  }
  
  console.log('✅ Authentication state reset complete');
};

// Function to check if we're stuck in a loading state
export const isStuckInLoading = () => {
  const url = window.location.href;
  return url.includes('code=') || url.includes('state=') || url.includes('error=');
};

// Function to force redirect to sign-in
export const forceRedirectToSignIn = () => {
  console.log('🔄 Force redirecting to sign-in...');
  
  // Clear all state
  resetAuthenticationState();
  
  // Redirect to sign-in
  window.location.href = '/sign-in';
};

// Function to clear everything and reload
export const nuclearReset = () => {
  console.log('☢️ Nuclear reset - clearing everything...');
  
  // Clear all state
  resetAuthenticationState();
  
  // Clear any remaining cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  // Clear Clerk cookies specifically
  const clerkCookies = [
    '__clerk_db',
    '__clerk_session',
    '__clerk_js',
    '__clerk_client',
    'clerk-db',
    'clerk-session',
    'clerk-js',
    'clerk-client'
  ];
  
  clerkCookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.clerk.accounts.dev;`;
    console.log(`🗑️ Cleared cookie: ${cookieName}`);
  });
  
  // Reload the page
  window.location.reload();
};

// Function to clear Clerk cookies specifically
export const clearClerkCookies = () => {
  console.log('🍪 Clearing Clerk cookies...');
  
  const clerkCookies = [
    '__clerk_db',
    '__clerk_session', 
    '__clerk_js',
    '__clerk_client',
    'clerk-db',
    'clerk-session',
    'clerk-js',
    'clerk-client'
  ];
  
  clerkCookies.forEach(cookieName => {
    // Clear for current domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // Clear for clerk.accounts.dev domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.clerk.accounts.dev;`;
    // Clear for .clerk.accounts.dev domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=clerk.accounts.dev;`;
    console.log(`🗑️ Cleared cookie: ${cookieName}`);
  });
  
  console.log('✅ Clerk cookies cleared');
}; 