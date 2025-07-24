import apiClient from './axiosConfig';

export interface Proposal {
  id: string;
  projectId: string;
  totalCost?: number;
  timeline?: number;
  features: string[];
  companyName?: string;
  companyLogo?: string;
  proposalFile?: string;
  status: 'pending' | 'accepted' | 'rejected';
  analysis?: {
    comparisonScore?: number;
    aiQuestions?: string[];
    aiSuggestions?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalData {
  projectId: string;
  proposalFile: string;
}

export interface UpdateProposalData {
  totalCost?: number;
  timeline?: number;
  features?: string[];
  companyName?: string;
  companyLogo?: string;
  proposalFile?: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

export interface ProposalsResponse {
  proposals: Proposal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ComparisonSummary {
  projectId: string;
  projectTitle: string;
  totalProposals: number;
  summaryContent: string;
  generatedAt: string;
}

export const proposalService = {
  // Create a new proposal
  async createProposal(data: CreateProposalData): Promise<{ message: string; proposal: Proposal }> {
    const response = await apiClient.post('/api/proposals', data, {
      timeout: 120000, // 2 minutes for AI analysis
    });
    return response.data;
  },

  // Get all proposals for a project
  async getProposalsByProject(projectId: string, params?: {
    status?: 'pending' | 'accepted' | 'rejected';
    page?: number;
    limit?: number;
  }): Promise<ProposalsResponse> {
    const response = await apiClient.get(`/api/proposals/project/${projectId}`, { params });
    return response.data;
  },

  // Get a specific proposal by ID
  async getProposal(proposalId: string): Promise<{ proposal: Proposal }> {
    const response = await apiClient.get(`/api/proposals/${proposalId}`);
    return response.data;
  },

  // Update a proposal
  async updateProposal(proposalId: string, data: UpdateProposalData): Promise<{ message: string; proposal: Proposal }> {
    const response = await apiClient.put(`/api/proposals/${proposalId}`, data);
    return response.data;
  },

  // Delete a proposal
  async deleteProposal(proposalId: string): Promise<{ message: string; proposalId: string }> {
    const response = await apiClient.delete(`/api/proposals/${proposalId}`);
    return response.data;
  },

  // Generate comparison summary for a project
  async generateComparisonSummary(projectId: string): Promise<{ message: string; summary: ComparisonSummary }> {
    const response = await apiClient.post(`/api/proposals/project/${projectId}/summary`, {}, {
      timeout: 300000, // 5 minutes for comprehensive analysis
    });
    return response.data;
  }
}; 