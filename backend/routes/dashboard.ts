import express from 'express';
import mongoose from 'mongoose';
import { authenticateClerk } from '../middleware/clerk';
import { Project, Proposal } from '../models';

const router = express.Router();

// Get dashboard statistics for the authenticated user
router.get('/stats', authenticateClerk, async (req, res) => {
  try {
    const userId = req.authUser?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    // Get total projects
    const totalProjects = await Project.countDocuments({ userId });

    // Get total proposals (all proposals for user's projects)
    const userProjects = await Project.find({ userId }).select('_id');
    const projectIds = userProjects.map(project => project._id);
    const totalProposals = await Proposal.countDocuments({ projectId: { $in: projectIds } });

    // Get average score of projects (based on proposal scores)
    const proposalsWithScores = await Proposal.find({
      projectId: { $in: projectIds },
      'analysis.comparisonScore': { $exists: true, $ne: null }
    }).select('analysis.comparisonScore');

    const averageScore = proposalsWithScores.length > 0
      ? proposalsWithScores.reduce((sum, proposal) => sum + (proposal.analysis?.comparisonScore || 0), 0) / proposalsWithScores.length
      : 0;

    // Get best score
    const bestScore = proposalsWithScores.length > 0
      ? Math.max(...proposalsWithScores.map(proposal => proposal.analysis?.comparisonScore || 0))
      : 0;

    // Get proposal status counts
    const proposalStats = await Proposal.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusCounts = {
      pending: 0,
      accepted: 0,
      rejected: 0
    };

    proposalStats.forEach(stat => {
      statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
    });

    res.json({
      success: true,
      data: {
        totalProjects,
        totalProposals,
        averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
        bestScore: Math.round(bestScore * 100) / 100,
        statusCounts,
        projectsWithScores: proposalsWithScores.length
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch dashboard statistics',
      },
    });
  }
});

// Get recent activity for the authenticated user
router.get('/activity', authenticateClerk, async (req, res) => {
  try {
    const userId = req.authUser?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    // Get user's projects
    const userProjects = await Project.find({ userId }).select('_id title');
    const projectIds = userProjects.map(project => project._id as mongoose.Types.ObjectId);
    const projectMap = new Map(userProjects.map(project => [(project._id as mongoose.Types.ObjectId).toString(), project.title]));

    // Get recent proposals for user's projects
    const recentProposals = await Proposal.find({
      projectId: { $in: projectIds }
    })
    .populate('projectId', 'title')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('projectId status createdAt analysis.comparisonScore');

    // Get recent project activities
    const recentProjects = await Project.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status createdAt updatedAt');

    // Combine and sort activities
    interface Activity {
      id: string;
      type: 'proposal' | 'project';
      message: string;
      timestamp: Date;
      status: string;
      score?: number | null;
      projectTitle: string;
    }

    const activities: Activity[] = [];

    // Add proposal activities
    recentProposals.forEach(proposal => {
      const projectTitle = projectMap.get(proposal.projectId.toString()) || 'Unknown Project';
      let message = '';
      let type: 'proposal' = 'proposal';
      let score: number | null = null;

      if (proposal.analysis?.comparisonScore) {
        score = Math.round(proposal.analysis.comparisonScore * 100) / 100;
      }

      switch (proposal.status) {
        case 'accepted':
          message = `Proposal for "${projectTitle}" was accepted`;
          if (score) message += ` (Score: ${score})`;
          break;
        case 'rejected':
          message = `Proposal for "${projectTitle}" was rejected`;
          if (score) message += ` (Score: ${score})`;
          break;
        case 'pending':
          message = `New proposal received for "${projectTitle}"`;
          if (score) message += ` (Score: ${score})`;
          break;
      }

      activities.push({
        id: (proposal._id as mongoose.Types.ObjectId).toString(),
        type,
        message,
        timestamp: proposal.createdAt,
        status: proposal.status,
        score,
        projectTitle
      });
    });

    // Add project activities
    recentProjects.forEach(project => {
      activities.push({
        id: (project._id as mongoose.Types.ObjectId).toString(),
        type: 'project' as const,
        message: `Project "${project.title}" was ${project.status === 'active' ? 'created' : project.status}`,
        timestamp: project.updatedAt,
        status: project.status,
        projectTitle: project.title
      });
    });

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to 15 most recent activities
    const recentActivities = activities.slice(0, 15);

    res.json({
      success: true,
      data: {
        activities: recentActivities
      }
    });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch recent activity',
      },
    });
  }
});

export default router; 