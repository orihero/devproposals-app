import express from 'express';
import { authenticateToken, requireAdmin, requireUser } from '../middleware/auth';
import { User } from '../models';
import { Project } from '../models/Project';
import { Proposal } from '../models/Proposal';

const router = express.Router();

// Create new user (called by frontend after successful Clerk signup)
router.post('/signup', async (req, res) => {
  try {
    console.log('📝 Signup request received');
    console.log('📋 Request headers:', req.headers);
    console.log('📦 Request body:', req.body);
    
    const { clerkId, email, name, imageUrl } = req.body;
    
    console.log('👤 Extracted signup data:', {
      clerkId: clerkId ? 'Present' : 'Missing',
      email: email || 'Not provided',
      name: name || 'Not provided',
      imageUrl: imageUrl ? 'Present' : 'Not provided'
    });
    
    if (!clerkId || !email || !name) {
      console.log('❌ Missing required fields for signup:', { clerkId: !!clerkId, email: !!email, name: !!name });
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'clerkId, email, and name are required',
        },
      });
    }

    // Check if user already exists
    console.log('🔍 Checking if user already exists with clerkId:', clerkId);
    const existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      console.log('⚠️ User already exists:', {
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name
      });
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'User already exists',
        },
      });
    }

    // Create new user
    console.log('🏗️ Creating new user via signup endpoint:', {
      clerkId,
      email,
      name,
      role: 'user',
      imageUrl: imageUrl || ''
    });
    
    const user = new User({
      clerkId,
      email,
      name,
      role: 'user',
      imageUrl: imageUrl || '',
    });
    
    await user.save();
    console.log('✅ New user created via signup:', {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    });

    const responseData = {
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      role: user.role,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    console.log('📤 Sending signup response:', {
      success: true,
      userId: responseData.id,
      userEmail: responseData.email,
      userRole: responseData.role
    });

    res.status(201).json({
      success: true,
      data: responseData,
      message: 'User created successfully',
    });
  } catch (error: any) {
    console.error('❌ User creation error:', error);
    console.error('🔍 Error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name || 'Unknown'
    });
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
    console.log('🔐 Login request received');
    console.log('📋 Request headers:', req.headers);
    console.log('📦 Request body:', req.body);
    
    const { clerkId, email, name, imageUrl } = req.body;
    
    console.log('👤 Extracted user data:', {
      clerkId: clerkId ? 'Present' : 'Missing',
      email: email || 'Not provided',
      name: name || 'Not provided',
      imageUrl: imageUrl ? 'Present' : 'Not provided'
    });
    
    if (!clerkId) {
      console.log('❌ Missing clerkId in request');
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CLERK_ID',
          message: 'clerkId is required',
        },
      });
    }

    // Find user in database
    console.log('🔍 Searching for user with clerkId:', clerkId);
    let user = await User.findOne({ clerkId });
    
    if (user) {
      console.log('✅ Existing user found:', {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } else {
      console.log('🆕 User not found, creating new user with clerkId:', clerkId);
      console.log('📝 User data received:', { email, name, imageUrl: imageUrl ? 'Present' : 'Not provided' });
      
      // Validate required fields for user creation
      if (!email || !name) {
        console.log('❌ Missing required data for user creation:', { email: !!email, name: !!name });
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USER_DATA',
            message: 'email and name are required for automatic user creation',
          },
        });
      }

      // Create new user
      console.log('🏗️ Creating new user with data:', {
        clerkId,
        email,
        name,
        role: 'user',
        imageUrl: imageUrl || ''
      });
      
      user = new User({
        clerkId,
        email,
        name,
        role: 'user',
        imageUrl: imageUrl || '',
      });
      
      await user.save();
      console.log('✅ New user created successfully:', {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      });
    }

    const responseData = {
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      role: user.role,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    console.log('📤 Sending response:', {
      success: true,
      userId: responseData.id,
      userEmail: responseData.email,
      userRole: responseData.role,
      isNewUser: user.createdAt.getTime() === user.updatedAt.getTime()
    });

    res.json({
      success: true,
      data: responseData,
      message: user.createdAt.getTime() === user.updatedAt.getTime() ? 'User created and logged in successfully' : 'Login successful',
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    console.error('🔍 Error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name || 'Unknown'
    });
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
    
    // Get user statistics (projects and proposals count)
    const userStats = await Promise.all(
      users.map(async (user) => {
        const projectCount = await Project.countDocuments({ userId: user._id });
        const proposalCount = await Proposal.countDocuments({ userId: user._id });
        
        return {
          id: user._id,
          clerkId: user.clerkId,
          email: user.email,
          name: user.name,
          role: user.role,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          stats: {
            projects: projectCount,
            proposals: proposalCount,
          },
        };
      })
    );
    
    res.json({
      success: true,
      data: userStats,
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

// Get single user (admin only)
router.get('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
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
    console.error('User fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user',
      },
    });
  }
});

// Update user (admin only)
router.put('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;
    
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

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ROLE',
            message: 'Role must be either "user" or "admin"',
          },
        });
      }
      user.role = role;
    }
    
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
    console.error('User update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user',
      },
    });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent admin from deleting themselves
    if (userId === req.authUser?.userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SELF_DELETE_NOT_ALLOWED',
          message: 'Cannot delete your own account',
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

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete user',
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