import express, { Request, Response } from 'express';
import { Project } from '../models/Project';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models/User';
import mongoose from 'mongoose';

const router = express.Router();

// Create a new project
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, budget, duration, documentFile } = req.body;
    const user = req.authUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title is required'
      });
    }

    // Create new project
    const project = new Project({
      title: title.trim(),
      userId: user.userId,
      budget: budget ? Number(budget) : undefined,
      duration: duration ? Number(duration) : undefined,
      documentFile: documentFile || undefined,
      status: 'active'
    });

    const savedProject = await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: savedProject._id,
        title: savedProject.title,
        budget: savedProject.budget,
        duration: savedProject.duration,
        documentFile: savedProject.documentFile,
        status: savedProject.status,
        createdAt: savedProject.createdAt,
        updatedAt: savedProject.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Project creation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create project'
    });
  }
});

// Get all projects for the authenticated user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.authUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }
    
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { userId: user.userId };
    if (status && ['active', 'completed', 'on-hold'].includes(status as string)) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const total = await Project.countDocuments(query);

    // Transform _id to id for frontend compatibility
    const transformedProjects = projects.map(project => ({
      id: project._id,
      title: project.title,
      budget: project.budget,
      duration: project.duration,
      documentFile: project.documentFile,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));

    res.json({
      projects: transformedProjects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get projects error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get projects'
    });
  }
});

// Get a specific project by ID
router.get('/:projectId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const user = req.authUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid project ID format'
      });
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin';

    // Get the project and verify access
    let project;
    if (isAdmin) {
      // Admin can access any project
      project = await Project.findById(projectId).select('-__v');
    } else {
      // Regular users can only access their own projects
      project = await Project.findOne({
        _id: projectId,
        userId: user.userId
      }).select('-__v');
    }

    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    res.json({
      project: {
        id: project._id,
        title: project.title,
        budget: project.budget,
        duration: project.duration,
        documentFile: project.documentFile,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Get project error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get project'
    });
  }
});

// Update a project
router.put('/:projectId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { title, budget, duration, documentFile, status } = req.body;
    const user = req.authUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid project ID format'
      });
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin';

    // Find the project and verify access
    let project;
    if (isAdmin) {
      // Admin can update any project
      project = await Project.findById(projectId);
    } else {
      // Regular users can only update their own projects
      project = await Project.findOne({
        _id: projectId,
        userId: user.userId
      });
    }

    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    // Update fields if provided
    if (title !== undefined) project.title = title.trim();
    if (budget !== undefined) project.budget = budget ? Number(budget) : undefined;
    if (duration !== undefined) project.duration = duration ? Number(duration) : undefined;
    if (documentFile !== undefined) project.documentFile = documentFile;
    if (status && ['active', 'completed', 'on-hold'].includes(status)) {
      project.status = status;
    }

    const updatedProject = await project.save();

    res.json({
      message: 'Project updated successfully',
      project: {
        id: updatedProject._id,
        title: updatedProject.title,
        budget: updatedProject.budget,
        duration: updatedProject.duration,
        documentFile: updatedProject.documentFile,
        status: updatedProject.status,
        createdAt: updatedProject.createdAt,
        updatedAt: updatedProject.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Update project error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update project'
    });
  }
});

// Delete a project
router.delete('/:projectId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const user = req.authUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid project ID format'
      });
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin';

    // Find the project and verify access
    let project;
    if (isAdmin) {
      // Admin can delete any project
      project = await Project.findById(projectId);
    } else {
      // Regular users can only delete their own projects
      project = await Project.findOne({
        _id: projectId,
        userId: user.userId
      });
    }

    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    // Delete the project file if it exists
    if (project.documentFile) {
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', project.documentFile);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        // Don't fail the request if file deletion fails
      }
    }

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    res.json({
      message: 'Project deleted successfully',
      projectId: projectId
    });
  } catch (error) {
    console.error('❌ Delete project error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete project'
    });
  }
});

// Get projects by user (admin only)
router.get('/user/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminUser = req.authUser;
    
    if (!adminUser) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid user ID format'
      });
    }

    // Check if admin user exists and is actually an admin
    const admin = await User.findById(adminUser.userId);
    if (!admin) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Admin user not found'
      });
    }

    if (admin.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    // Get projects for the specified user
    const projects = await Project.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    // Transform _id to id for frontend compatibility
    const transformedProjects = projects.map(project => ({
      id: project._id,
      title: project.title,
      budget: project.budget,
      duration: project.duration,
      documentFile: project.documentFile,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));

    res.json({
      projects: transformedProjects,
      userId: userId
    });
  } catch (error) {
    console.error('❌ Get projects by user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get projects by user'
    });
  }
});

export default router; 