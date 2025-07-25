import { Request, Response, NextFunction } from 'express';
import { User } from '../models';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      authUser?: {
        userId: string;
        email: string;
        role: string;
        clerkId: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('🔍 Auth middleware - Request headers:', {
      authorization: !!req.headers.authorization,
      'x-clerk-id': !!req.headers['x-clerk-id'],
      'user-agent': req.headers['user-agent'],
      url: req.url,
      method: req.method
    });
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('❌ No authorization header found');
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header required',
        },
      });
      return;
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '');
    console.log('🔐 Received token from frontend:', token.substring(0, 20) + '...');
    
    // Parse the JWT token to extract user information
    const tokenData = parseJwt(token);
    console.log('🔍 Parsed token data:', tokenData);
    
    if (!tokenData || !tokenData.sub) {
      console.log('❌ Invalid token data:', { tokenData, hasSub: !!tokenData?.sub });
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
      return;
    }

    // Find user in our database using clerkId
    const user = await User.findOne({ clerkId: tokenData.sub });
    console.log('👤 User lookup result:', { found: !!user, clerkId: tokenData.sub });
    
    if (!user) {
      console.log('❌ User not found in database:', tokenData.sub);
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found. Please sign up first.',
        },
      });
      return;
    }

    // Set user info in request
    req.authUser = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      clerkId: user.clerkId,
    };
    console.log('✅ Authentication successful for user:', req.authUser);

    next();
  } catch (error) {
    console.error('❌ Token authentication error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed',
      },
    });
  }
};

// JWT parser for Clerk tokens
function parseJwt(token: string) {
  try {
    console.log('🔍 Parsing JWT token...');
    const parts = token.split('.');
    console.log('📦 Token parts:', parts.length);
    
    if (parts.length !== 3) {
      console.log('❌ Invalid JWT format - expected 3 parts');
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    // Use Buffer for base64 decoding in Node.js
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    const payload = JSON.parse(decoded);
    console.log('✅ JWT payload parsed successfully');
    return payload;
  } catch (error) {
    console.error('❌ JWT parsing error:', error);
    return null;
  }
}

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!roles.includes(req.authUser.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireUser = requireRole(['user', 'admin']); 