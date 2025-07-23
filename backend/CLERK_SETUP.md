# Clerk Authentication Setup Guide

This document outlines how to set up Clerk authentication for DevProposals.com, replacing the previous passport-based Google OAuth implementation.

## Overview

Clerk provides a modern authentication solution that handles:
- Google OAuth (and other providers)
- User management
- JWT token generation and verification
- Session management
- Multi-factor authentication

## Setup Steps

### 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### 2. Configure Your Application

1. **Get your API keys** from the Clerk dashboard:
   - `CLERK_PUBLISHABLE_KEY` (for frontend)
   - `CLERK_SECRET_KEY` (for backend)

2. **Enable Google OAuth**:
   - Go to "User & Authentication" → "Social Connections"
   - Enable Google
   - Configure your Google OAuth credentials

### 3. Environment Variables

Add these to your `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/devproposals

# Clerk Configuration
CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key
CLERK_SECRET_KEY=sk_test_your-secret-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Frontend Integration

Install Clerk in your frontend:

```bash
npm install @clerk/clerk-react
```

Wrap your app with ClerkProvider:

```tsx
import { ClerkProvider } from '@clerk/clerk-react';

function App() {
  return (
    <ClerkProvider publishableKey={process.env.REACT_APP_CLERK_PUBLISHABLE_KEY}>
      {/* Your app components */}
    </ClerkProvider>
  );
}
```

### 5. Authentication Components

Use Clerk's pre-built components:

```tsx
import { SignIn, SignUp, UserButton } from '@clerk/clerk-react';

// Sign in page
<SignIn />

// Sign up page
<SignUp />

// User profile button
<UserButton />
```

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/me` | Update user profile | Yes |
| GET | `/api/auth/users` | Get all users (admin) | Yes |
| PUT | `/api/auth/users/:userId/role` | Update user role (admin) | Yes |

### Request/Response Examples

#### Get User Profile
```bash
GET /api/auth/me
Authorization: Bearer <clerk-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "imageUrl": "https://example.com/avatar.jpg"
    }
  }
}
```

#### Update User Profile
```bash
PUT /api/auth/me
Authorization: Bearer <clerk-jwt-token>
Content-Type: application/json

{
  "name": "John Smith"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Smith",
      "role": "user",
      "imageUrl": "https://example.com/avatar.jpg"
    }
  },
  "message": "Profile updated successfully"
}
```

## Database Schema Changes

The User model has been updated to work with Clerk:

```typescript
interface IUser {
  clerkId: string;        // Clerk user ID
  email: string;          // User email
  name: string;           // User name
  role: 'user' | 'admin'; // User role
  imageUrl?: string;      // Profile image URL
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Features

- **JWT Verification**: Tokens are verified using Clerk's public keys
- **Automatic User Creation**: Users are automatically created in your database when they first authenticate
- **Role-based Access**: Admin and user roles with proper authorization
- **Secure Token Handling**: No password storage, all auth handled by Clerk

## Migration from Previous Auth

If you have existing users with the old authentication system:

1. **Export existing users** from your database
2. **Create Clerk accounts** for each user (or have them sign up)
3. **Update the database** to link Clerk IDs with existing user records
4. **Remove old auth code** (passport, bcrypt, etc.)

## Testing

### 1. Test Authentication Flow

```bash
# Start the server
npm run dev

# Test health endpoint
curl http://localhost:3001/health
```

### 2. Test with Frontend

1. Set up Clerk in your frontend
2. Sign in with Google
3. Make API calls with the JWT token

### 3. Test Admin Functions

```bash
# Get all users (requires admin role)
curl -X GET http://localhost:3001/api/auth/users \
  -H "Authorization: Bearer <admin-token>"

# Update user role
curl -X PUT http://localhost:3001/api/auth/users/userId/role \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

## Error Handling

Common error responses:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authorization header required"
  }
}
```

Error codes:
- `UNAUTHORIZED`: Missing or invalid token
- `USER_NOT_FOUND`: User not found in database
- `FORBIDDEN`: Insufficient permissions
- `INVALID_ROLE`: Invalid role value
- `AUTHENTICATION_ERROR`: Clerk authentication failed

## Production Considerations

1. **Environment Variables**: Use production Clerk keys
2. **Token Verification**: Implement proper JWT verification with Clerk's public keys
3. **Rate Limiting**: Add rate limiting to API endpoints
4. **Logging**: Add proper logging for authentication events
5. **Monitoring**: Monitor authentication failures and user creation

## Troubleshooting

### Common Issues

1. **"Invalid token" errors**: Check that you're using the correct Clerk keys
2. **"User not found"**: Ensure the user exists in your database
3. **CORS errors**: Verify your frontend URL is in the CORS configuration
4. **Google OAuth not working**: Check your Google OAuth configuration in Clerk

### Debug Mode

Enable debug logging:

```typescript
// In your middleware
console.log('Token payload:', tokenData);
console.log('User from DB:', user);
```

## Next Steps

1. **Set up Clerk account** and get your API keys
2. **Configure Google OAuth** in Clerk dashboard
3. **Update environment variables** with your Clerk keys
4. **Test the authentication flow** with your frontend
5. **Deploy to production** with proper security measures 