import express from 'express';
import { authenticateToken, requireAdmin, requireUser } from '../middleware/auth';
import { User } from '../models';

const router = express.Router();

// Create new user (called by frontend after successful Clerk signup)
router.post('/signup', async (req, res) => {
  try {
    const { clerkId, email, name, imageUrl } = req.body;
    
    if (!clerkId || !email || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'clerkId, email, and name are required',
        },
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'User already exists',
        },
      });
    }

    // Create new user
    const user = new User({
      clerkId,
      email,
      name,
      role: 'user',
      imageUrl: imageUrl || '',
    });
    
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user',
      },
    });
  }
});

// Login user (called by frontend after successful Clerk signin)
router.post('/login', async (req, res) => {
  try {
    const { clerkId, email, name, imageUrl } = req.body;
    
    if (!clerkId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CLERK_ID',
          message: 'clerkId is required',
        },
      });
    }

    // Find user in database
    let user = await User.findOne({ clerkId });
    
    // If user doesn't exist, create them automatically
    if (!user) {
      console.log('🆕 User not found, creating new user with clerkId:', clerkId);
      
      // Validate required fields for user creation
      if (!email || !name) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USER_DATA',
            message: 'email and name are required for automatic user creation',
          },
        });
      }

      // Create new user
      user = new User({
        clerkId,
        email,
        name,
        role: 'user',
        imageUrl: imageUrl || '',
      });
      
      await user.save();
      console.log('✅ New user created successfully:', user._id);
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: user.createdAt.getTime() === user.updatedAt.getTime() ? 'User created and logged in successfully' : 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to login',
      },
    });
  }
});

// Get current user profile (requires authentication)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.authUser?.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch profile',
      },
    });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.authUser?.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update profile',
      },
    });
  }
});

// Test endpoint for debugging
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Test endpoint called');
    console.log('📋 Request headers:', req.headers);
    console.log('🔗 Request URL:', req.url);
    console.log('📝 Request method:', req.method);
    
    res.json({
      success: true,
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
      headers: {
        authorization: !!req.headers.authorization,
        'content-type': req.headers['content-type'],
        origin: req.headers.origin
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TEST_ERROR',
        message: 'Test endpoint failed',
      },
    });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-__v');
    res.json({
      success: true,
      data: users.map(user => ({
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch users',
      },
    });
  }
});

// Update user role (admin only)
router.put('/users/:userId/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'Role must be either "user" or "admin"',
        },
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user role',
      },
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Logout request for user:', req.authUser?.userId);
    
    // In our new architecture, we don't need to do anything on the backend
    // since we're not maintaining server-side sessions. The frontend will
    // clear the token and Clerk will handle the session.
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to logout',
      },
    });
  }
});

export default router; 