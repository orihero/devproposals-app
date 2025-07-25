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
    const tokenData = parseJWT(token);
    
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
    console.error('❌ Clerk authentication error:', error);
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
function parseJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

// Role-based middleware
export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.authUser) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.authUser || req.authUser.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required',
      },
    });
  }
  next();
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.authUser || req.authUser.role !== role) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `${role} access required`,
        },
      });
    }
    next();
  };
}; 