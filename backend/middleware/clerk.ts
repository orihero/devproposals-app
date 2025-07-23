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

export const authenticateClerk = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
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
    
    // For now, we'll use a simple token verification
    // In production, you should verify the JWT token with Clerk's public key
    const tokenData = parseJwt(token);
    
    if (!tokenData || !tokenData.sub) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
      return;
    }

    // Find or create user in our database
    let user = await User.findOne({ clerkId: tokenData.sub });
    
    if (!user) {
      // Create new user in our database
      user = new User({
        clerkId: tokenData.sub,
        email: tokenData.email || '',
        name: tokenData.name || 'User',
        role: 'user',
        imageUrl: tokenData.picture,
      });
      await user.save();
    }

    // Set user info in request
    req.authUser = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      clerkId: user.clerkId,
    };

    next();
  } catch (error) {
    console.error('Clerk authentication error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed',
      },
    });
  }
};

// Simple JWT parser (for development - use proper verification in production)
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
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