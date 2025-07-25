import apiClient from './axiosConfig';

export interface DashboardStats {
  totalProjects: number;
  totalProposals: number;
  averageScore: number;
  bestScore: number;
  statusCounts: {
    pending: number;
    accepted: number;
    rejected: number;
  };
  projectsWithScores: number;
}

export interface Activity {
  id: string;
  type: 'proposal' | 'project';
  message: string;
  timestamp: string;
  status: string;
  score?: number | null;
  projectTitle: string;
}

export interface DashboardActivity {
  activities: Activity[];
}

export const dashboardService = {
  // Get dashboard statistics
  async getStats(): Promise<{ data: DashboardStats }> {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data;
  },

  // Get recent activity
  async getActivity(): Promise<{ data: DashboardActivity }> {
    const response = await apiClient.get('/api/dashboard/activity');
    return response.data;
  }
}; 