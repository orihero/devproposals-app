import React, { useState } from 'react';
import { useSignIn, useUser, useAuth } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuthStore } from '../../stores/authStore';
import { resetAuthenticationState, forceRedirectToSignIn, nuclearReset, clearClerkCookies } from '../../utils/authReset';

const SignInPage: React.FC = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user: clerkUser } = useUser();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // Fetch user profile and redirect based on role
        const store = useAuthStore.getState();
        await store.fetchProfile();
        
        const user = useAuthStore.getState().user;
        if (user) {
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.errors?.[0]?.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Starting Google OAuth flow...');
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard',
      });
      console.log('✅ Google OAuth redirect initiated');
    } catch (err: any) {
      console.error('❌ Google sign in error:', err);
      setError('Google sign in failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleTestAuth = async () => {
    console.log('🧪 Testing authentication state...');
    console.log('Clerk User:', clerkUser);
    console.log('Is Signed In:', isSignedIn);
    console.log('Is Loaded:', isLoaded);
    
    if (isSignedIn && clerkUser) {
      try {
        const token = await (window as any).Clerk?.session?.getToken();
        console.log('Token available:', !!token);
        
        if (token) {
          const store = useAuthStore.getState();
          await store.fetchProfile();
          const user = useAuthStore.getState().user;
          console.log('Backend user:', user);
        }
      } catch (error) {
        console.error('Test auth error:', error);
      }
    }
  };

  const handleForceReset = () => {
    console.log('🔄 Force resetting authentication state...');
    resetAuthenticationState();
    window.location.reload();
  };

  const handleNuclearReset = () => {
    console.log('☢️ Nuclear reset...');
    nuclearReset();
  };

  const handleRedirectToSignIn = () => {
    console.log('🔄 Force redirecting to sign-in...');
    forceRedirectToSignIn();
  };

  const handleClearClerkCookies = () => {
    console.log('🍪 Clearing Clerk cookies...');
    clearClerkCookies();
    // Don't reload immediately, let user try again
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="flex items-center text-2xl font-bold text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                Syncro
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back!
            </h1>
            <p className="text-gray-600">
              Sign in to your Syncro account
            </p>
          </div>

          {/* Social Sign In Buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              <Icon icon="logos:google-icon" className="w-5 h-5 mr-3" />
              Sign in with Google
            </button>
            
            {/* Debug buttons - remove in production */}
            <button
              onClick={handleTestAuth}
              type="button"
              className="w-full bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200 font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center text-sm mb-2"
            >
              🧪 Test Auth State
            </button>
            
            <button
              onClick={handleForceReset}
              type="button"
              className="w-full bg-red-100 border border-red-300 text-red-600 hover:bg-red-200 font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center text-sm mb-2"
            >
              🔄 Force Reset Auth
            </button>
            
            <button
              onClick={handleNuclearReset}
              type="button"
              className="w-full bg-orange-100 border border-orange-300 text-orange-600 hover:bg-orange-200 font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center text-sm mb-2"
            >
              ☢️ Nuclear Reset
            </button>
            
            <button
              onClick={handleRedirectToSignIn}
              type="button"
              className="w-full bg-blue-100 border border-blue-300 text-blue-600 hover:bg-blue-200 font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center text-sm mb-2"
            >
              🚀 Force Sign-In Redirect
            </button>
            
            <button
              onClick={handleClearClerkCookies}
              type="button"
              className="w-full bg-yellow-100 border border-yellow-300 text-yellow-600 hover:bg-yellow-200 font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center text-sm"
            >
              🍪 Clear Clerk Cookies
            </button>

            <button
              onClick={handleClearClerkCookies}
              type="button"
              className="w-full bg-yellow-100 border border-yellow-300 text-yellow-600 hover:bg-yellow-200 font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center text-sm"
            >
              🍪 Clear Clerk Cookies
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/sign-up" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Abstract Graphic */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0">
          {/* Abstract 3D shapes */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white bg-opacity-80 rounded-full blur-sm"></div>
          <div className="absolute top-20 left-10 w-24 h-24 bg-blue-200 bg-opacity-60 rounded-full blur-sm"></div>
          <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-pink-200 bg-opacity-60 rounded-full blur-sm"></div>
          <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-purple-200 bg-opacity-60 rounded-full blur-sm"></div>
          <div className="absolute bottom-20 right-1/4 w-16 h-16 bg-white bg-opacity-80 rounded-full blur-sm"></div>
          
          {/* Floral elements */}
          <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-blue-300 bg-opacity-40 rounded-full"></div>
          <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-purple-300 bg-opacity-40 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/3 w-10 h-10 bg-pink-300 bg-opacity-40 rounded-full"></div>
          
          {/* Swirling patterns */}
          <div className="absolute top-1/3 left-1/2 w-16 h-16 bg-blue-200 bg-opacity-30 rounded-full transform rotate-45"></div>
          <div className="absolute bottom-1/3 right-1/2 w-12 h-12 bg-purple-200 bg-opacity-30 rounded-full transform -rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage; 