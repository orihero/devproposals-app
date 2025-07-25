import express, { Request, Response } from 'express';
import { Proposal } from '../models/Proposal';
import { Project } from '../models/Project';
import { authenticateToken } from '../middleware/auth';
import { openRouterService } from '../utils/openRouterService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Log environment configuration
console.log('🔧 Environment check:');
console.log('🔧 OPENROUTER_API_KEY configured:', !!process.env.OPENROUTER_API_KEY);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

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
    console.error('AI analysis error:', error);
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
    console.log(`📋 Analyzing proposal file: ${proposalFile}`);
    const aiAnalysis = await analyzeProposalWithAI(proposalFile);
    console.log(`📋 AI analysis result:`, aiAnalysis);

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
        proposalFile: savedProposal.proposalFile,
        status: savedProposal.status,
        analysis: savedProposal.analysis,
        createdAt: savedProposal.createdAt,
        updatedAt: savedProposal.updatedAt
      }
    });
  } catch (error) {
    console.error('Proposal creation error:', error);
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
    
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { projectId };
    if (status && ['pending', 'accepted', 'rejected'].includes(status as string)) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const proposals = await Proposal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const total = await Proposal.countDocuments(query);

    // Transform _id to id for frontend compatibility
    const transformedProposals = proposals.map(proposal => ({
      id: proposal._id,
      projectId: proposal.projectId,
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
    }));

    res.json({
      proposals: transformedProposals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Proposal fetch error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch proposals'
    });
  }
});

// Get a specific proposal by ID
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

    // Check if user is admin
    const isAdmin = user.role === 'admin';
    console.log('👤 User role check for proposal fetch:', { role: user.role, isAdmin });

    let proposal;
    if (isAdmin) {
      // Admin can access any proposal
      proposal = await Proposal.findById(proposalId).select('-__v');
    } else {
      // Regular users can only access their own proposals
      proposal = await Proposal.findOne({
        _id: proposalId,
        userId: user.userId
      }).select('-__v');
    }

    if (!proposal) {
      console.log('❌ Proposal not found for fetch:', { 
        proposalId, 
        userId: user.userId, 
        isAdmin,
        role: user.role 
      });
      return res.status(404).json({
        error: 'Not Found',
        message: 'Proposal not found'
      });
    }

    res.json({ 
      proposal: {
        id: proposal._id,
        projectId: proposal.projectId,
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
    console.error('Proposal fetch error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch proposal'
    });
  }
});

// Update a proposal
router.put('/:proposalId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { proposalId } = req.params;
    const { 
      totalCost, 
      timeline, 
      features, 
      companyName, 
      companyLogo,
      proposalFile,
      status 
    } = req.body;
    const user = req.authUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin';
    console.log('👤 User role check for proposal update:', { role: user.role, isAdmin });

    // Find proposal and verify ownership (or admin access)
    let proposal;
    if (isAdmin) {
      // Admin can update any proposal
      proposal = await Proposal.findById(proposalId);
    } else {
      // Regular users can only update their own proposals
      proposal = await Proposal.findOne({
        _id: proposalId,
        userId: user.userId
      });
    }

    if (!proposal) {
      console.log('❌ Proposal not found for update:', { 
        proposalId, 
        userId: user.userId, 
        isAdmin,
        role: user.role 
      });
      return res.status(404).json({
        error: 'Not Found',
        message: 'Proposal not found'
      });
    }

    // Update fields
    if (totalCost !== undefined) proposal.totalCost = Number(totalCost);
    if (timeline !== undefined) proposal.timeline = Number(timeline);
    if (features && Array.isArray(features)) proposal.features = features.filter((f: string) => f.trim());
    if (companyName !== undefined) proposal.companyName = companyName?.trim();
    if (companyLogo !== undefined) proposal.companyLogo = companyLogo;
    if (proposalFile !== undefined) proposal.proposalFile = proposalFile;
    if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
      proposal.status = status;
    }

    const updatedProposal = await proposal.save();

    res.json({
      message: 'Proposal updated successfully',
      proposal: {
        id: updatedProposal._id,
        projectId: updatedProposal.projectId,
        totalCost: updatedProposal.totalCost,
        timeline: updatedProposal.timeline,
        features: updatedProposal.features,
        companyName: updatedProposal.companyName,
        companyLogo: updatedProposal.companyLogo,
        proposalFile: updatedProposal.proposalFile,
        status: updatedProposal.status,
        analysis: updatedProposal.analysis,
        createdAt: updatedProposal.createdAt,
        updatedAt: updatedProposal.updatedAt
      }
    });
  } catch (error) {
    console.error('Proposal update error:', error);
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

    // Find the proposal first to check permissions
    const proposal = await Proposal.findById(proposalId).populate('projectId');
    
    if (!proposal) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Proposal not found'
      });
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin';
    console.log('👤 User role check for proposal deletion:', { role: user.role, isAdmin });

    // Check if user is the proposal owner, project owner, or admin
    const isProposalOwner = proposal.userId.toString() === user.userId;
    const isProjectOwner = proposal.projectId && (proposal.projectId as any).userId.toString() === user.userId;

    if (!isAdmin && !isProposalOwner && !isProjectOwner) {
      console.log('❌ Access denied for proposal deletion:', { 
        proposalId, 
        userId: user.userId, 
        isAdmin,
        role: user.role,
        isProposalOwner,
        isProjectOwner
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own proposals or proposals for your projects'
      });
    }

    // Clean up the proposal file if it exists
    if (proposal.proposalFile) {
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'uploads', proposal.proposalFile);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Deleted proposal file: ${proposal.proposalFile}`);
        }
      } catch (fileError) {
        console.warn('⚠️  Could not delete proposal file:', fileError);
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
    console.error('Proposal deletion error:', error);
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
    console.log('👤 User role check for summary generation:', { role: user.role, isAdmin });

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
      console.log('❌ Project not found for summary generation:', { 
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

    // Get all proposals for this project
    const proposals = await Proposal.find({ projectId }).sort({ createdAt: -1 });

    if (proposals.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No proposals found for this project'
      });
    }

    // Generate comparison summary using AI
    console.log(`📊 Generating comparison summary for project: ${projectId}`);
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
    console.error('Summary generation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate comparison summary'
    });
  }
});

export default router; 