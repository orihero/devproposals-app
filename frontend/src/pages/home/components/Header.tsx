
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const Header = () => (
  <header className="w-full bg-white rounded-2xl shadow-md mt-6 mb-10 max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
    {/* Logo */}
    <Link to="/" className="flex items-center text-2xl font-bold text-gray-900">
      DevProposals
      <span className="ml-1 text-violet-500">.</span>
    </Link>
    {/* Navigation */}
    <nav className="hidden md:flex gap-8 text-base font-medium text-gray-700">
      <Link to="/dashboard" className="hover:text-violet-700 transition">Dashboard</Link>
      <Link to="/projects" className="hover:text-violet-700 transition">Projects</Link>
    </nav>
    {/* CTAs */}
    <div className="flex gap-3 items-center">
      <SignedIn>
        <Link 
          to="/dashboard" 
          className="bg-violet-700 text-white font-semibold px-6 py-2 rounded-xl shadow hover:bg-violet-900 transition"
        >
          Dashboard
        </Link>
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: 'w-8 h-8',
            },
          }}
        />
      </SignedIn>
      <SignedOut>
        <Link 
          to="/sign-up" 
          className="bg-violet-700 text-white font-semibold px-6 py-2 rounded-xl shadow hover:bg-violet-900 transition"
        >
          Get Started Free
        </Link>
        <Link 
          to="/sign-in" 
          className="border-2 border-violet-100 text-violet-700 font-semibold px-6 py-2 rounded-xl bg-white hover:bg-violet-50 transition"
        >
          Sign In
        </Link>
      </SignedOut>
    </div>
  </header>
);

export default Header; 