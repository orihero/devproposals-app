# Authentication Setup Guide

This document outlines the authentication system for DevProposals.com, including both email/password and Google OAuth authentication.

## Features

- **Email/Password Authentication**: Traditional registration and login
- **Google OAuth**: Social login with Google
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: Secure password storage with bcrypt
- **Input Validation**: Comprehensive request validation
- **Role-based Access**: User and admin roles

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/devproposals

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Set the authorized redirect URI to: `http://localhost:3001/api/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/logout` | Logout (client-side) |

### Request/Response Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
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
      "name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
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
      "name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### Get User Profile
```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
      "role": "user"
    }
  }
}
```

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": ["Additional error details"]
  }
}
```

### Common Error Codes

- `MISSING_FIELDS`: Required fields are missing
- `VALIDATION_ERROR`: Input validation failed
- `USER_EXISTS`: User with email already exists
- `INVALID_CREDENTIALS`: Wrong email or password
- `OAUTH_ONLY`: Account was created with Google OAuth
- `UNAUTHORIZED`: Missing or invalid token
- `USER_NOT_FOUND`: User no longer exists
- `FORBIDDEN`: Insufficient permissions

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive validation for all inputs
- **CORS**: Configured for frontend integration
- **Environment Variables**: Sensitive data stored in environment variables

## Frontend Integration

### Google OAuth Flow

1. User clicks "Login with Google" button
2. Frontend redirects to: `GET /api/auth/google`
3. User authenticates with Google
4. Google redirects to: `GET /api/auth/google/callback`
5. Backend generates JWT token and redirects to frontend
6. Frontend receives token via URL parameter: `/auth/callback?token=...`

### Token Management

- Store JWT token in localStorage or secure cookie
- Include token in Authorization header: `Bearer <token>`
- Handle token expiration and refresh logic
- Clear token on logout

## Testing

You can test the authentication endpoints using curl or Postman:

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (replace TOKEN with actual token)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer TOKEN"
``` 