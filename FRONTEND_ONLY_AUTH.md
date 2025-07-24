# Frontend-Only Authentication Architecture

## Overview

This implementation handles Google authentication entirely on the frontend using Clerk, and then sends the Clerk token to the backend. The backend validates the token without using Clerk directly.

## Architecture

### Frontend (Clerk)
- **Authentication Provider**: Clerk handles all OAuth flows (Google, etc.)
- **Token Management**: Clerk generates and manages JWT tokens
- **User Management**: Clerk handles user sessions and authentication state
- **Social Auth**: Google OAuth is handled entirely by Clerk

### Backend (Token Validation)
- **No Clerk Dependency**: Backend doesn't use Clerk SDK
- **Token Validation**: Backend validates JWT tokens sent from frontend
- **User Creation**: Backend creates users in its database based on token data
- **Session Management**: Backend manages its own user sessions

## Flow

### 1. User Authentication (Frontend)
```
User clicks "Sign in with Google"
↓
Clerk handles OAuth flow
↓
Clerk generates JWT token
↓
Frontend stores token in localStorage
↓
Frontend sends token to backend with API requests
```

### 2. Backend Token Validation
```
Backend receives request with Bearer token
↓
Backend parses JWT token (no Clerk SDK needed)
↓
Backend extracts user info from token payload
↓
Backend finds/creates user in database
↓
Backend sets user context for request
```

## Key Components

### Frontend Components

#### 1. `frontend/src/hooks/useClerkAuth.ts`
- Syncs Clerk authentication state with our store
- Handles token management
- Redirects users based on authentication state

#### 2. `frontend/src/services/api/axiosConfig.ts`
- Automatically adds Clerk token to API requests
- Handles token refresh and storage
- Manages authentication headers

#### 3. `frontend/src/components/auth/SignInPage.tsx`
- Handles Google OAuth sign-in
- Uses Clerk's `authenticateWithRedirect`

#### 4. `frontend/src/components/auth/SignUpPage.tsx`
- Handles Google OAuth sign-up
- Uses Clerk's `authenticateWithRedirect`

### Backend Components

#### 1. `backend/middleware/auth.ts`
- Validates JWT tokens from frontend
- Parses token payload to extract user info
- Creates/finds users in database
- Sets user context for requests

#### 2. `backend/routes/auth.ts`
- Uses `authenticateToken` middleware
- Handles user profile operations
- Manages user roles and permissions

## Token Structure

### Clerk JWT Token Payload
```json
{
  "sub": "user_clerk_id",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://example.com/avatar.jpg",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Backend User Model
```typescript
{
  clerkId: string;      // From token.sub
  email: string;        // From token.email
  name: string;         // From token.name
  role: 'user' | 'admin';
  imageUrl?: string;    // From token.picture
}
```

## Security Considerations

### 1. Token Validation
- Backend validates JWT token structure
- Checks token expiration
- Verifies token signature (in production)

### 2. User Creation
- Backend creates users automatically when token is valid
- Uses `clerkId` as unique identifier
- Prevents duplicate user creation

### 3. CORS Configuration
- Backend allows requests from frontend origins
- Supports credentials for token transmission

## API Endpoints

### Authentication Required Endpoints
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `GET /api/auth/users` - Get all users (admin only)
- `PUT /api/auth/users/:userId/role` - Update user role (admin only)

### Middleware Usage
```typescript
// All endpoints use authenticateToken middleware
router.get('/me', authenticateToken, async (req, res) => {
  // req.authUser contains user info
});
```

## Benefits

### 1. Separation of Concerns
- Frontend handles all OAuth complexity
- Backend focuses on business logic
- No Clerk dependency in backend

### 2. Scalability
- Backend can handle multiple auth providers
- Easy to add new OAuth providers
- Stateless authentication

### 3. Security
- JWT tokens are stateless
- No session storage required
- Token validation on every request

### 4. Development
- Simpler backend setup
- No Clerk SDK installation in backend
- Easier testing and debugging

## Testing

### Frontend Testing
1. Start frontend: `cd frontend && yarn dev`
2. Go to sign-in page
3. Click "Sign in with Google"
4. Complete OAuth flow
5. Check browser console for token logs

### Backend Testing
1. Start backend: `cd backend && yarn dev`
2. Test health endpoint: `curl http://localhost:3001/health`
3. Test with valid token from frontend

### Token Testing
```bash
# Test with curl (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:3001/api/auth/me
```

## Environment Variables

### Frontend (.env)
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/devproposals
FRONTEND_URL=http://localhost:3000
```

## Migration Notes

### From Previous Implementation
- Removed social auth context handling
- Simplified authentication flow
- Removed backend Clerk dependency
- Updated middleware imports

### Files Changed
- `backend/middleware/auth.ts` - New token validation middleware
- `backend/routes/auth.ts` - Updated to use new middleware
- `frontend/src/hooks/useClerkAuth.ts` - Simplified auth sync
- `frontend/src/components/auth/SignUpPage.tsx` - Removed social auth context

## Production Considerations

### 1. Token Verification
- Implement proper JWT signature verification
- Use Clerk's public keys for validation
- Add token expiration checks

### 2. Security Headers
- Implement rate limiting
- Add request validation
- Use HTTPS in production

### 3. Error Handling
- Add comprehensive error logging
- Implement proper error responses
- Add monitoring and alerting 