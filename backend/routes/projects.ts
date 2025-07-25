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
    console.error('Project creation error:', error);
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
    console.error('Project fetch error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch projects'
    });
  }
});

// Get a specific project by ID
router.get('/:projectId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const user = req.authUser;
    
    console.log('🔍 Get project request:', {
      projectId,
      userId: user?.userId,
      userEmail: user?.email
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      console.log('❌ Invalid ObjectId format:', projectId);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid project ID format'
      });
    }

    console.log('✅ ObjectId validation passed, searching for project...');

    // Check if user is admin
    const isAdmin = user.role === 'admin';
    console.log('👤 User role check:', { role: user.role, isAdmin });

    let project;
    if (isAdmin) {
      // Admin can access any project
      project = await Project.findById(projectId).select('-__v');
      console.log('🔍 Admin project search result:', {
        found: !!project,
        projectId
      });
    } else {
      // Regular users can only access their own projects
      project = await Project.findOne({
        _id: projectId,
        userId: user.userId
      }).select('-__v');
      console.log('🔍 User project search result:', {
        found: !!project,
        projectId,
        userId: user.userId
      });
    }

    if (!project) {
      console.log('❌ Project not found:', { 
        projectId, 
        userId: user.userId, 
        isAdmin,
        role: user.role 
      });
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
    console.error('Project fetch error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch project'
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
    console.log('👤 User role check for update:', { role: user.role, isAdmin });

    // Find project and verify ownership (or admin access)
    let project;
    if (isAdmin) {
      // Admin can modify any project
      project = await Project.findById(projectId);
    } else {
      // Regular users can only modify their own projects
      project = await Project.findOne({
        _id: projectId,
        userId: user.userId
      });
    }

    if (!project) {
      console.log('❌ Project not found for update:', { 
        projectId, 
        userId: user.userId, 
        isAdmin,
        role: user.role 
      });
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    // Update fields
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
    console.error('Project update error:', error);
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
    console.log('👤 User role check for delete:', { role: user.role, isAdmin });

    let project;
    if (isAdmin) {
      // Admin can delete any project
      project = await Project.findByIdAndDelete(projectId);
    } else {
      // Regular users can only delete their own projects
      project = await Project.findOneAndDelete({
        _id: projectId,
        userId: user.userId
      });
    }

    if (!project) {
      console.log('❌ Project not found for delete:', { 
        projectId, 
        userId: user.userId, 
        isAdmin,
        role: user.role 
      });
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    res.json({
      message: 'Project deleted successfully',
      projectId
    });
  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete project'
    });
  }
});

// Get projects by user ID (admin only)
router.get('/user/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('🔍 Get projects by user request:', {
      userId: req.params.userId,
      adminUser: req.authUser
    });

    const { userId } = req.params;
    const adminUser = req.authUser;
    
    if (!adminUser) {
      console.log('❌ No admin user found in request');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    console.log('🔍 Checking admin permissions for user:', adminUser.userId);

    // Check if the requesting user is an admin
    const admin = await User.findById(adminUser.userId);
    
    if (!admin) {
      console.log('❌ Admin user not found in database:', adminUser.userId);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin user not found'
      });
    }

    if (admin.role !== 'admin') {
      console.log('❌ User is not admin:', admin.role);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    console.log('✅ Admin check passed, fetching projects for user:', userId);

    const projects = await Project.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    console.log('📊 Found projects:', projects.length);

    res.json({
      projects: projects.map(project => ({
        id: project._id,
        title: project.title,
        budget: project.budget,
        duration: project.duration,
        documentFile: project.documentFile,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }))
    });
  } catch (error) {
    console.error('❌ Get projects by user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get projects by user'
    });
  }
});

// Debug route to check if project exists (for development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/debug/:projectId', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      
      console.log('🔍 Debug: Checking if project exists:', projectId);
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid project ID format'
        });
      }

      const project = await Project.findById(projectId).select('-__v');
      
      if (!project) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Project not found in database',
          projectId
        });
      }

      res.json({
        message: 'Project found',
        project: {
          id: project._id,
          title: project.title,
          userId: project.userId,
          status: project.status,
          createdAt: project.createdAt
        }
      });
    } catch (error) {
      console.error('Debug project check error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to check project'
      });
    }
  });
}

export default router; 