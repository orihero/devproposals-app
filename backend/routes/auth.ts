import { Router, Request, Response } from 'express';
import { User } from '../models';
import { authenticateClerk } from '../middleware/clerk';

const router = Router();

// Get current user profile (requires Clerk token)
router.get('/me', authenticateClerk, async (req: Request, res: Response) => {
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
    console.error('Get profile error:', error);
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
router.put('/me', authenticateClerk, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
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

    if (name) {
      user.name = name;
      await user.save();
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
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update profile',
      },
    });
  }
});

// Get all users (admin only)
router.get('/users', authenticateClerk, async (req: Request, res: Response) => {
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
    console.error('Get users error:', error);
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
router.put('/users/:userId/role', authenticateClerk, async (req: Request, res: Response) => {
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

    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
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
    console.error('Update user role error:', error);
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