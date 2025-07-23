import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Sign in data:', formData);
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign in
    console.log('Google sign in clicked');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Sign In Form */}
      <div className="w-2/5 bg-gray-900 flex flex-col justify-center px-12">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center text-white text-2xl font-bold">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
              <Icon icon="mdi:sync" className="text-gray-900 w-5 h-5" />
            </div>
            Syncro
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
        <p className="text-gray-300 mb-8">Log in to continue where you left off.</p>

        {/* Social Sign In Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <Icon icon="logos:google-icon" className="w-5 h-5 mr-3" />
            Login with Google
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email/Phone Field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email / Phone Number
            </label>
            <input
              type="text"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleInputChange}
              placeholder="Enter email or phone number"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 bg-green-500 border-green-500 rounded text-white focus:ring-green-400"
              />
              <span className="ml-2 text-sm">Remember me for 14 days</span>
            </label>
            <a href="#" className="text-green-400 hover:text-green-300 text-sm font-medium">
              Forgot password?
            </a>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Continue
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-white mt-8">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-green-400 hover:text-green-300 font-semibold underline">
            Sign up
          </Link>
        </p>
      </div>

      {/* Right Column - Abstract 3D Illustration */}
      <div className="w-3/5 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Abstract 3D Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large swirling forms */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full opacity-60 blur-sm"></div>
            <div className="absolute top-40 right-32 w-48 h-48 bg-blue-200 rounded-full opacity-70 blur-sm"></div>
            
            {/* Flower-like elements */}
            <div className="absolute top-60 left-40 w-32 h-32 bg-pink-300 rounded-full opacity-80"></div>
            <div className="absolute top-80 right-20 w-24 h-24 bg-coral-300 rounded-full opacity-90"></div>
            <div className="absolute bottom-40 left-60 w-20 h-20 bg-pink-400 rounded-full opacity-85"></div>
            
            {/* Small spheres */}
            <div className="absolute top-32 left-80 w-8 h-8 bg-white rounded-full opacity-70"></div>
            <div className="absolute top-96 right-60 w-6 h-6 bg-blue-300 rounded-full opacity-80"></div>
            <div className="absolute bottom-60 left-20 w-10 h-10 bg-pink-200 rounded-full opacity-75"></div>
            
            {/* Textured elements */}
            <div className="absolute bottom-20 right-40 w-16 h-16 bg-purple-300 rounded-full opacity-90"></div>
            <div className="absolute top-40 left-10 w-12 h-12 bg-coral-200 rounded-full opacity-80"></div>
            
            {/* Additional elements for variety */}
            <div className="absolute top-72 left-80 w-16 h-16 bg-red-300 rounded-full opacity-85"></div>
            <div className="absolute bottom-80 right-80 w-12 h-12 bg-orange-300 rounded-full opacity-80"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 