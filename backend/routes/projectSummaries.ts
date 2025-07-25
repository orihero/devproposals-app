import express, { Request, Response } from 'express';
import { ProjectSummary } from '../models/ProjectSummary';
import { Project } from '../models/Project';
import { authenticateToken } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// Create or update a project summary
router.post('/:projectId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { 
      summary, 
      keyPoints, 
      recommendations, 
      technicalDetails, 
      estimatedCost, 
      estimatedDuration, 
      complexity 
    } = req.body;
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

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    const isAdmin = user.role === 'admin';
    if (!isAdmin && project.userId.toString() !== user.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this project'
      });
    }

    // Validate required fields
    if (!summary) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Summary is required'
      });
    }

    // Create or update project summary
    const updateData: any = {
      summary: summary.trim(),
      keyPoints: keyPoints || [],
      recommendations: recommendations || [],
      complexity: complexity || 'medium'
    };

    // Add optional fields only if they are provided
    if (technicalDetails) {
      updateData.technicalDetails = technicalDetails.trim();
    }
    if (estimatedCost !== undefined && estimatedCost !== null) {
      updateData.estimatedCost = Number(estimatedCost);
    }
    if (estimatedDuration !== undefined && estimatedDuration !== null && estimatedDuration > 0) {
      updateData.estimatedDuration = Number(estimatedDuration);
    }

    const projectSummary = await ProjectSummary.findOneAndUpdate(
      { projectId },
      updateData,
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );

    res.status(201).json({
      message: 'Project summary saved successfully',
      summary: {
        id: projectSummary._id,
        projectId: projectSummary.projectId,
        summary: projectSummary.summary,
        keyPoints: projectSummary.keyPoints,
        recommendations: projectSummary.recommendations,
        technicalDetails: projectSummary.technicalDetails,
        estimatedCost: projectSummary.estimatedCost,
        estimatedDuration: projectSummary.estimatedDuration,
        complexity: projectSummary.complexity,
        createdAt: projectSummary.createdAt,
        updatedAt: projectSummary.updatedAt
      }
    });
  } catch (error) {
    console.error('Project summary creation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to save project summary'
    });
  }
});

// Get project summary by project ID
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

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    const isAdmin = user.role === 'admin';
    if (!isAdmin && project.userId.toString() !== user.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this project'
      });
    }

    // Get project summary
    const projectSummary = await ProjectSummary.findOne({ projectId }).select('-__v');

    if (!projectSummary) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project summary not found'
      });
    }

    res.json({
      summary: {
        id: projectSummary._id,
        projectId: projectSummary.projectId,
        summary: projectSummary.summary,
        keyPoints: projectSummary.keyPoints,
        recommendations: projectSummary.recommendations,
        technicalDetails: projectSummary.technicalDetails,
        estimatedCost: projectSummary.estimatedCost,
        estimatedDuration: projectSummary.estimatedDuration,
        complexity: projectSummary.complexity,
        createdAt: projectSummary.createdAt,
        updatedAt: projectSummary.updatedAt
      }
    });
  } catch (error) {
    console.error('Project summary fetch error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch project summary'
    });
  }
});

// Update project summary
router.put('/:projectId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { 
      summary, 
      keyPoints, 
      recommendations, 
      technicalDetails, 
      estimatedCost, 
      estimatedDuration, 
      complexity 
    } = req.body;
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

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    const isAdmin = user.role === 'admin';
    if (!isAdmin && project.userId.toString() !== user.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this project'
      });
    }

    // Find and update project summary
    const projectSummary = await ProjectSummary.findOneAndUpdate(
      { projectId },
      {
        ...(summary && { summary: summary.trim() }),
        ...(keyPoints && { keyPoints }),
        ...(recommendations && { recommendations }),
        ...(technicalDetails && { technicalDetails: technicalDetails.trim() }),
        ...(estimatedCost && { estimatedCost: Number(estimatedCost) }),
        ...(estimatedDuration && { estimatedDuration: Number(estimatedDuration) }),
        ...(complexity && { complexity })
      },
      { new: true, runValidators: true }
    );

    if (!projectSummary) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project summary not found'
      });
    }

    res.json({
      message: 'Project summary updated successfully',
      summary: {
        id: projectSummary._id,
        projectId: projectSummary.projectId,
        summary: projectSummary.summary,
        keyPoints: projectSummary.keyPoints,
        recommendations: projectSummary.recommendations,
        technicalDetails: projectSummary.technicalDetails,
        estimatedCost: projectSummary.estimatedCost,
        estimatedDuration: projectSummary.estimatedDuration,
        complexity: projectSummary.complexity,
        createdAt: projectSummary.createdAt,
        updatedAt: projectSummary.updatedAt
      }
    });
  } catch (error) {
    console.error('Project summary update error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update project summary'
    });
  }
});

// Delete project summary
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

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    const isAdmin = user.role === 'admin';
    if (!isAdmin && project.userId.toString() !== user.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this project'
      });
    }

    // Delete project summary
    const projectSummary = await ProjectSummary.findOneAndDelete({ projectId });

    if (!projectSummary) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project summary not found'
      });
    }

    res.json({
      message: 'Project summary deleted successfully',
      projectId
    });
  } catch (error) {
    console.error('Project summary deletion error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete project summary'
    });
  }
});

export default router; 