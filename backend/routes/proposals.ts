import express, { Request, Response } from 'express';
import { Proposal } from '../models/Proposal';
import { Project } from '../models/Project';
import { authenticateToken } from '../middleware/auth';
import { openRouterService } from '../utils/openRouterService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Function to analyze proposal with OpenRouter
async function analyzeProposalWithAI(proposalFileUrl: string): Promise<{
  totalCost?: number;
  timeline?: number;
  features: string[];
  companyName?: string;
  companyLogo?: string;
  analysis: {
    comparisonScore: number;
    aiQuestions: string[];
    aiSuggestions: string[];
  };
}> {
  try {
    // Use OpenRouter service to analyze the proposal
    const analysis = await openRouterService.analyzeProposal(proposalFileUrl);
    return analysis;
  } catch (error) {
    console.error('❌ AI analysis error:', error);
    // Return default values if AI analysis fails
    return {
      totalCost: undefined,
      timeline: undefined,
      features: [],
      analysis: {
        comparisonScore: 0,
        aiQuestions: [],
        aiSuggestions: []
      }
    };
  }
}

// Create a new proposal
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId, proposalFile } = req.body;
    const user = req.authUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate required fields
    if (!projectId || !proposalFile) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'projectId and proposalFile are required'
      });
    }

    // Analyze proposal with AI
    const aiAnalysis = await analyzeProposalWithAI(proposalFile);

    // Create new proposal with AI-extracted data
    const proposal = new Proposal({
      projectId,
      userId: user.userId,
      totalCost: aiAnalysis.totalCost,
      timeline: aiAnalysis.timeline,
      features: aiAnalysis.features,
      companyName: aiAnalysis.companyName,
      companyLogo: aiAnalysis.companyLogo,
      proposalFile,
      status: 'pending',
      analysis: aiAnalysis.analysis
    });

    const savedProposal = await proposal.save();

    res.status(201).json({
      message: 'Proposal created and analyzed successfully',
      proposal: {
        id: savedProposal._id,
        projectId: savedProposal.projectId,
        totalCost: savedProposal.totalCost,
        timeline: savedProposal.timeline,
        features: savedProposal.features,
        companyName: savedProposal.companyName,
        companyLogo: savedProposal.companyLogo,
        status: savedProposal.status,
        analysis: savedProposal.analysis,
        createdAt: savedProposal.createdAt,
        updatedAt: savedProposal.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Proposal creation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create proposal'
    });
  }
});

// Get all proposals for a project
router.get('/project/:projectId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const user = req.authUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin';

    // Get the project and verify access
    let project;
    if (isAdmin) {
      // Admin can access any project
      project = await Project.findById(projectId);
    } else {
      // Regular users can only access their own projects
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

    // Get all proposals for this project
    const proposals = await Proposal.find({ projectId }).sort({ createdAt: -1 });

    res.json({
      proposals: proposals.map(proposal => ({
        id: proposal._id,
        projectId: proposal.projectId,
        userId: proposal.userId,
        totalCost: proposal.totalCost,
        timeline: proposal.timeline,
        features: proposal.features,
        companyName: proposal.companyName,
        companyLogo: proposal.companyLogo,
        proposalFile: proposal.proposalFile,
        status: proposal.status,
        analysis: proposal.analysis,
        createdAt: proposal.createdAt,
        updatedAt: proposal.updatedAt
      }))
    });
  } catch (error) {
    console.error('❌ Get proposals error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get proposals'
    });
  }
});

// Get a specific proposal
router.get('/:proposalId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { proposalId } = req.params;
    const user = req.authUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Proposal not found'
      });
    }

    // Check if user has access to this proposal
    const isAdmin = user.role === 'admin';
    if (!isAdmin && proposal.userId.toString() !== user.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this proposal'
      });
    }

    res.json({
      proposal: {
        id: proposal._id,
        projectId: proposal.projectId,
        userId: proposal.userId,
        totalCost: proposal.totalCost,
        timeline: proposal.timeline,
        features: proposal.features,
        companyName: proposal.companyName,
        companyLogo: proposal.companyLogo,
        proposalFile: proposal.proposalFile,
        status: proposal.status,
        analysis: proposal.analysis,
        createdAt: proposal.createdAt,
        updatedAt: proposal.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Get proposal error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get proposal'
    });
  }
});

// Update a proposal
router.put('/:proposalId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { proposalId } = req.params;
    const updateData = req.body;
    const user = req.authUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Proposal not found'
      });
    }

    // Check if user has access to this proposal
    const isAdmin = user.role === 'admin';
    if (!isAdmin && proposal.userId.toString() !== user.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this proposal'
      });
    }

    // Update the proposal
    const updatedProposal = await Proposal.findByIdAndUpdate(
      proposalId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProposal) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Proposal not found after update'
      });
    }

    res.json({
      message: 'Proposal updated successfully',
      proposal: {
        id: updatedProposal!._id,
        projectId: updatedProposal!.projectId,
        userId: updatedProposal!.userId,
        totalCost: updatedProposal!.totalCost,
        timeline: updatedProposal!.timeline,
        features: updatedProposal!.features,
        companyName: updatedProposal!.companyName,
        companyLogo: updatedProposal!.companyLogo,
        proposalFile: updatedProposal!.proposalFile,
        status: updatedProposal!.status,
        analysis: updatedProposal!.analysis,
        createdAt: updatedProposal!.createdAt,
        updatedAt: updatedProposal!.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Update proposal error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update proposal'
    });
  }
});

// Delete a proposal
router.delete('/:proposalId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { proposalId } = req.params;
    const user = req.authUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Proposal not found'
      });
    }

    // Check if user has access to this proposal
    const isAdmin = user.role === 'admin';
    if (!isAdmin && proposal.userId.toString() !== user.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this proposal'
      });
    }

    // Delete the proposal file if it exists
    if (proposal.proposalFile) {
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', proposal.proposalFile);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        // Don't fail the request if file deletion fails
      }
    }

    // Delete the proposal
    await Proposal.findByIdAndDelete(proposalId);

    res.json({
      message: 'Proposal deleted successfully',
      proposalId: proposalId
    });
  } catch (error) {
    console.error('❌ Proposal deletion error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete proposal'
    });
  }
});

// Generate comparison summary for a project
router.post('/project/:projectId/summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const user = req.authUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin';

    // Get the project and its SOW/PRD document
    let project;
    if (isAdmin) {
      // Admin can access any project
      project = await Project.findById(projectId);
    } else {
      // Regular users can only access their own projects
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

    // Get all proposals for this project
    const proposals = await Proposal.find({ projectId }).sort({ createdAt: -1 });

    if (proposals.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No proposals found for this project'
      });
    }

    // Generate comparison summary using AI
    const summary = await openRouterService.generateComparisonSummary(
      project,
      proposals
    );

    res.json({
      message: 'Comparison summary generated successfully',
      summary: {
        projectId,
        projectTitle: project.title,
        totalProposals: proposals.length,
        summaryContent: summary,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Summary generation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate comparison summary'
    });
  }
});

export default router; 