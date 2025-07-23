
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useClerkAuthSync } from './hooks/useClerkAuth';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import SignInPage from './components/auth/SignInPage';
import SignUpPage from './components/auth/SignUpPage';
import Home from './pages/home/Home';

// Import your Clerk publishable key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_demo-key';

// For development, if no key is provided, show a setup message
if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  console.warn('⚠️  VITE_CLERK_PUBLISHABLE_KEY is not set. Please add it to your .env file.');
  console.warn('📝 Create a .env file in the frontend directory with:');
  console.warn('   VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key');
}

// Custom redirect component for unauthenticated users
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  );
};

// Role-based dashboard component
const RoleBasedDashboard: React.FC = () => {
  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  );
};

// Clerk auth sync component
const ClerkAuthSync: React.FC = () => {
  useClerkAuthSync();
  return null;
};

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ClerkAuthSync />
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={<RoleBasedDashboard />} 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              } 
            />
            
            {/* Redirect to dashboard if signed in, otherwise to home */}
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;
