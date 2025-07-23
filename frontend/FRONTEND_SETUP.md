# Frontend Setup Guide

This document outlines how to set up the React frontend with Clerk authentication for DevProposals.com.

## Prerequisites

- Node.js 16+ and npm/yarn
- Clerk account and application setup
- Backend API running on http://localhost:3001

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory:

```env
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key

# API Configuration
VITE_API_URL=http://localhost:3001/api
```

### 3. Get Your Clerk Keys

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "API Keys" in the sidebar
4. Copy your "Publishable Key" (starts with `pk_test_` or `pk_live_`)
5. Add it to your `.env` file

### 4. Configure Google OAuth (Optional)

1. In your Clerk Dashboard, go to "User & Authentication"
2. Click on "Social Connections"
3. Enable Google
4. Configure your Google OAuth credentials

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Features

### Authentication Flow

1. **Home Page**: Public landing page with sign-in/sign-up buttons
2. **Sign In**: Clerk's pre-built sign-in component with Google OAuth
3. **Sign Up**: Clerk's pre-built sign-up component
4. **Dashboard**: Protected dashboard for authenticated users
5. **User Profile**: Profile management with backend integration

### Components

- **AuthContext**: Manages user state and API calls
- **SignInPage**: Clerk sign-in component
- **SignUpPage**: Clerk sign-up component
- **UserProfile**: Profile management component
- **Dashboard**: Main dashboard with stats and actions

### API Integration

The frontend automatically:
- Fetches user profile from backend on authentication
- Includes JWT tokens in API requests
- Handles authentication errors
- Updates user profile in real-time

## Usage

### For Users

1. **Sign Up**: Click "Get Started Free" on the home page
2. **Sign In**: Click "Sign In" or use the UserButton
3. **Dashboard**: Access your dashboard after authentication
4. **Profile**: Update your name and view profile information

### For Developers

#### Adding Protected Routes

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

<Route 
  path="/protected" 
  element={
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  } 
/>
```

#### Using Authentication Context

```tsx
import { useAuth } from './contexts/AuthContext';

const MyComponent = () => {
  const { user, loading, updateProfile } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Welcome, {user.name}!</div>;
};
```

#### Making API Calls

```tsx
import { useAuth } from './contexts/AuthContext';

const MyComponent = () => {
  const { getUsers, updateUserRole } = useAuth();
  
  const handleGetUsers = async () => {
    try {
      const users = await getUsers();
      console.log(users);
    } catch (error) {
      console.error('Failed to get users:', error);
    }
  };
};
```

## File Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── SignInPage.tsx
│   │   ├── SignUpPage.tsx
│   │   └── UserProfile.tsx
│   └── dashboard/
│       └── Dashboard.tsx
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   └── home/
│       └── components/
│           └── Header.tsx
└── App.tsx
```

## Troubleshooting

### Common Issues

1. **"Missing Publishable Key"**: Check your `.env` file and Clerk dashboard
2. **API calls failing**: Ensure backend is running on http://localhost:3001
3. **CORS errors**: Check backend CORS configuration
4. **Authentication not working**: Verify Clerk configuration and keys

### Debug Mode

Enable debug logging in your browser console:

```javascript
// In browser console
localStorage.setItem('clerk-debug', 'true');
```

### Testing

1. **Test Authentication Flow**:
   - Visit http://localhost:3000
   - Click "Get Started Free"
   - Complete sign-up process
   - Verify redirect to dashboard

2. **Test API Integration**:
   - Sign in to the application
   - Check browser network tab for API calls
   - Verify user profile loads correctly

3. **Test Protected Routes**:
   - Try accessing `/dashboard` without signing in
   - Verify redirect to sign-in page
   - Sign in and verify access to dashboard

## Production Deployment

1. **Environment Variables**: Use production Clerk keys
2. **API URL**: Update `VITE_API_URL` to production backend
3. **Build**: Run `npm run build` for production build
4. **Deploy**: Deploy the `dist` folder to your hosting provider

## Next Steps

1. **Set up Clerk account** and get your API keys
2. **Configure environment variables** with your Clerk keys
3. **Test the authentication flow** end-to-end
4. **Add more protected routes** as needed
5. **Implement additional features** like projects and proposals 