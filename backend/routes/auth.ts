import express from 'express';
import { authenticateToken, requireAdmin, requireUser } from '../middleware/auth';
import { User } from '../models';
import { Project } from '../models/Project';
import { Proposal } from '../models/Proposal';

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
      imageUrl,
    });

    await user.save();

    const responseData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      imageUrl: user.imageUrl,
    };

    res.status(201).json({
      success: true,
      data: responseData,
      message: 'User created successfully',
    });
  } catch (error: any) {
    console.error('❌ User creation error:', error);
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
    
    if (!clerkId || !email || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'clerkId, email, and name are required',
        },
      });
    }

    // Find or create user
    let user = await User.findOne({ clerkId });
    if (!user) {
      // Create new user if not exists
      user = new User({
        clerkId,
        email,
        name,
        role: 'user',
        imageUrl,
      });
      await user.save();
    }

    const responseData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      imageUrl: user.imageUrl,
    };

    res.json({
      success: true,
      data: responseData,
      message: 'Login successful',
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to login',
      },
    });
  }
});

// Get current user profile (requires Clerk token)
router.get('/me', async (req, res) => {
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
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          imageUrl: user.imageUrl,
        },
      },
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user profile',
      },
    });
  }
});

// Update user profile
router.put('/me', async (req, res) => {
  try {
    const { name, email, imageUrl } = req.body;
    
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

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (imageUrl) user.imageUrl = imageUrl;

    await user.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          imageUrl: user.imageUrl,
        },
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user profile',
      },
    });
  }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    // Check if user is admin
    if (req.authUser?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
        },
      });
    }

    const users = await User.find({}, { clerkId: 0 }); // Exclude clerkId for security

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get users',
      },
    });
  }
});

// Update user role (admin only)
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Check if user is admin
    if (req.authUser?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
        },
      });
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'Role must be either "user" or "admin"',
        },
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

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
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          imageUrl: user.imageUrl,
        },
      },
      message: 'User role updated successfully',
    });
  } catch (error) {
    console.error('❌ Update user role error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user role',
      },
    });
  }
});

export default router; 