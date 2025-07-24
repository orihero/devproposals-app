import React, { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuthStore } from '../../stores/authStore';

const SignUpPage: React.FC = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
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
      const result = await signUp.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
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
        // Handle email verification if required
        if (result.status === 'missing_requirements') {
          setError('Please check your email to verify your account');
        } else {
          setError('Sign up failed. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.errors?.[0]?.message || 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Starting Google OAuth sign-up flow...');
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard',
      });
      console.log('✅ Google OAuth sign-up redirect initiated');
    } catch (err: any) {
      console.error('❌ Google sign up error:', err);
      setError('Google sign up failed. Please try again.');
      setIsLoading(false);
    }
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
              Let's Begin!
            </h1>
            <p className="text-gray-600">
              Your journey starts with a few quick details
            </p>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              <Icon icon="logos:google-icon" className="w-5 h-5 mr-3" />
              Sign up with Google
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="e.g., John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="e.g., Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="e.g., john.doe@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex">
                <select className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-l-xl border-r-0 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+33">+33</option>
                  <option value="+49">+49</option>
                </select>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="e.g., (555) 123-4567"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/sign-in" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Abstract Graphic */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0">
          {/* Abstract 3D shapes */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white bg-opacity-80 rounded-full blur-sm"></div>
          <div className="absolute top-20 left-10 w-24 h-24 bg-green-200 bg-opacity-60 rounded-full blur-sm"></div>
          <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-blue-200 bg-opacity-60 rounded-full blur-sm"></div>
          <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-purple-200 bg-opacity-60 rounded-full blur-sm"></div>
          <div className="absolute bottom-20 right-1/4 w-16 h-16 bg-white bg-opacity-80 rounded-full blur-sm"></div>
          
          {/* Floral elements */}
          <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-green-300 bg-opacity-40 rounded-full"></div>
          <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-blue-300 bg-opacity-40 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/3 w-10 h-10 bg-purple-300 bg-opacity-40 rounded-full"></div>
          
          {/* Swirling patterns */}
          <div className="absolute top-1/3 left-1/2 w-16 h-16 bg-green-200 bg-opacity-30 rounded-full transform rotate-45"></div>
          <div className="absolute bottom-1/3 right-1/2 w-12 h-12 bg-blue-200 bg-opacity-30 rounded-full transform -rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 