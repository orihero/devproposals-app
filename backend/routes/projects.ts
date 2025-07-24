import express, { Request, Response } from 'express';
import { Project } from '../models/Project';
import { authenticateToken } from '../middleware/auth';

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
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      userId: user.userId
    }).select('-__v');

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

    // Find project and verify ownership
    const project = await Project.findOne({
      _id: projectId,
      userId: user.userId
    });

    if (!project) {
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

    const project = await Project.findOneAndDelete({
      _id: projectId,
      userId: user.userId
    });

    if (!project) {
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

export default router; 