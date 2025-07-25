
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useClerkAuthSync } from './hooks/useClerkAuth';
import Dashboard from './components/dashboard/Dashboard';

import SignInPage from './components/auth/SignInPage';
import SignUpPage from './components/auth/SignUpPage';
import Home from './pages/home/Home';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import UsersPage from './pages/admin/UsersPage';
import UserDetailPage from './pages/admin/UserDetailPage';
import UserProjectsPage from './pages/admin/UserProjectsPage';
import AdminIndexPage from './pages/admin/AdminIndexPage';

// Import your Clerk publishable key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_demo-key';

// For development, if no key is provided, show a setup message
if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  console.warn('⚠️  VITE_CLERK_PUBLISHABLE_KEY is not set. Please add it to your .env file.');
  console.warn('📝 Create a .env file in the frontend directory with:');
  console.warn('   VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key');
}

console.log('🔧 Clerk Configuration:', {
  publishableKey: CLERK_PUBLISHABLE_KEY,
  isDemoKey: CLERK_PUBLISHABLE_KEY === 'pk_test_demo-key',
  hasEnvKey: !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
});

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
            
            {/* Projects routes */}
            <Route 
              path="/projects" 
              element={
                <RequireAuth>
                  <ProjectsPage />
                </RequireAuth>
              } 
            />
            <Route 
              path="/projects/:projectId" 
              element={
                <RequireAuth>
                  <ProjectDetailPage />
                </RequireAuth>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <RequireAuth>
                  <AdminIndexPage />
                </RequireAuth>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <RequireAuth>
                  <UsersPage />
                </RequireAuth>
              } 
            />

            <Route 
              path="/admin/users/:userId" 
              element={
                <RequireAuth>
                  <UserProjectsPage />
                </RequireAuth>
              } 
            />
            <Route 
              path="/admin/users/:userId/edit" 
              element={
                <RequireAuth>
                  <UserDetailPage />
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
