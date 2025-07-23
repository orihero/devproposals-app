import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Sign up data:', formData);
  };

  const handleGoogleSignUp = () => {
    // Handle Google sign up
    console.log('Google sign up clicked');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Sign Up Form */}
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
        <h1 className="text-4xl font-bold text-white mb-2">Let's Begin!</h1>
        <p className="text-gray-300 mb-8">Your journey starts with a few quick details</p>

        {/* Social Sign Up Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={handleGoogleSignUp}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <Icon icon="logos:google-icon" className="w-5 h-5 mr-3" />
            Sign up with Google
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="e.g., John"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="e.g., Doe"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g., john.doe@example.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                <span className="text-white text-sm">+1</span>
                <Icon icon="mdi:chevron-down" className="text-white ml-1 w-4 h-4" />
              </div>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="e.g., (123) 456-7890"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
              />
            </div>
          </div>

          {/* Terms and Privacy */}
          <p className="text-sm text-gray-300">
            By clicking Continue, you agree to our{' '}
            <a href="#" className="text-green-400 hover:text-green-300 font-semibold">
              Terms of Use
            </a>{' '}
            and{' '}
            <a href="#" className="text-green-400 hover:text-green-300 font-semibold">
              Privacy Policy
            </a>
          </p>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Continue
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-300 mt-8">
          Already have an account?{' '}
          <Link to="/auth/signin" className="text-green-400 hover:text-green-300 font-semibold">
            Login
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 