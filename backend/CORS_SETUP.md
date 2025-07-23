# CORS Configuration for DevProposals Backend

## Overview

This backend implements comprehensive CORS (Cross-Origin Resource Sharing) configuration to allow secure communication between the frontend and backend APIs.

## Features

### ✅ Enhanced CORS Configuration
- **Dynamic Origin Validation**: Supports multiple allowed origins
- **Credentials Support**: Enables cookies and authentication headers
- **Security Headers**: Implements security best practices
- **Request Logging**: Tracks all incoming requests
- **Error Handling**: Proper CORS error responses

### ✅ Security Features
- **Origin Whitelist**: Only allows requests from specified origins
- **Security Headers**: XSS protection, content type options, frame options
- **Request Size Limits**: Prevents large payload attacks
- **Error Logging**: Detailed error tracking

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/devproposals

# CORS Configuration
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_HTTPS=https://localhost:3000

# Clerk Configuration
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

## Allowed Origins

The CORS configuration allows requests from:

- `http://localhost:3000` (Default React dev server)
- `http://localhost:5173` (Vite dev server)
- `https://localhost:3000` (HTTPS React dev server)
- `https://localhost:5173` (HTTPS Vite dev server)
- `http://127.0.0.1:3000` (Alternative localhost)
- `http://127.0.0.1:5173` (Alternative localhost)
- Custom origins via `FRONTEND_URL` and `FRONTEND_URL_HTTPS` environment variables

## API Endpoints

### Health Check
```bash
GET /health
```

### Authentication Endpoints
```bash
GET /api/auth/me
PUT /api/auth/me
GET /api/auth/users
PUT /api/auth/users/:userId/role
```

## Testing CORS

### Test with curl
```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  http://localhost:3001/api/auth/me

# Test actual request
curl -X GET \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  http://localhost:3001/health
```

### Test with browser
```javascript
// Test from browser console
fetch('http://localhost:3001/health', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

## Security Headers

The backend automatically sets the following security headers:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Referrer policy

## Error Handling

### CORS Errors
If a request comes from an unauthorized origin, the server returns:
```json
{
  "error": "CORS Error",
  "message": "Origin not allowed by CORS policy",
  "origin": "http://unauthorized-domain.com"
}
```

### 404 Errors
For non-existent routes:
```json
{
  "error": "Not Found",
  "message": "Route GET /api/nonexistent not found",
  "availableRoutes": [...]
}
```

## Development vs Production

### Development
- More permissive CORS settings
- Detailed error messages
- Request logging enabled

### Production
- Stricter CORS validation
- Generic error messages
- Reduced logging

## Troubleshooting

### Common Issues

1. **CORS Error**: Check if your frontend URL is in the allowed origins list
2. **Credentials not sent**: Ensure `credentials: 'include'` is set in frontend requests
3. **Preflight failures**: Verify the request method and headers are allowed

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed CORS blocking information in the console.

## Monitoring

The backend logs all requests with timestamps:
```
[2024-01-15T10:30:45.123Z] GET /health - ::1
[2024-01-15T10:30:46.456Z] POST /api/auth/me - ::1
```

CORS blocked requests are logged with warnings:
```
CORS blocked request from origin: http://unauthorized-domain.com
``` 