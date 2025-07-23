# Environment Setup Guide

## Required Environment Variables

### Frontend (.env file in frontend directory)

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env file in backend directory)

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/devproposals
CLERK_SECRET_KEY=sk_test_your-secret-key-here
FRONTEND_URL=http://localhost:3000
```

## Setup Steps

1. **Create Clerk Account**: Go to [clerk.com](https://clerk.com) and create an account
2. **Create Application**: Create a new application in Clerk dashboard
3. **Get API Keys**: Copy your publishable key and secret key from the Clerk dashboard
4. **Create Environment Files**: Create the .env files as shown above
5. **Update Keys**: Replace the placeholder keys with your actual Clerk keys

## Development Notes

- The frontend will show a warning if `VITE_CLERK_PUBLISHABLE_KEY` is not set
- The backend will fail to start if `CLERK_SECRET_KEY` is not set
- Make sure MongoDB is running locally or update `MONGODB_URI` to point to your database

## Testing

After setting up the environment variables:

1. Restart both frontend and backend servers
2. Navigate to http://localhost:3000
3. Try signing in with Google (if configured in Clerk)
4. Check the browser console for any remaining errors 