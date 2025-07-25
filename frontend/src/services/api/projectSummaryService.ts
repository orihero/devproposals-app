import apiClient from './axiosConfig';

export interface ProjectSummary {
  id: string;
  projectId: string;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  technicalDetails: string;
  estimatedCost: number;
  estimatedDuration: number;
  complexity: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectSummaryRequest {
  summary: string;
  keyPoints?: string[];
  recommendations?: string[];
  technicalDetails: string;
  estimatedCost: number;
  estimatedDuration: number;
  complexity?: 'low' | 'medium' | 'high';
}

export interface UpdateProjectSummaryRequest {
  summary?: string;
  keyPoints?: string[];
  recommendations?: string[];
  technicalDetails?: string;
  estimatedCost?: number;
  estimatedDuration?: number;
  complexity?: 'low' | 'medium' | 'high';
}

class ProjectSummaryService {
  // Create or update a project summary
  async createOrUpdateProjectSummary(
    projectId: string, 
    data: CreateProjectSummaryRequest
  ): Promise<ProjectSummary> {
    const response = await apiClient.post(`/api/project-summaries/${projectId}`, data);
    return response.data.summary;
  }

  // Get a project summary
  async getProjectSummary(projectId: string): Promise<ProjectSummary> {
    const response = await apiClient.get(`/api/project-summaries/${projectId}`);
    return response.data.summary;
  }

  // Update a project summary
  async updateProjectSummary(
    projectId: string, 
    data: UpdateProjectSummaryRequest
  ): Promise<ProjectSummary> {
    const response = await apiClient.put(`/api/project-summaries/${projectId}`, data);
    return response.data.summary;
  }

  // Delete a project summary
  async deleteProjectSummary(projectId: string): Promise<void> {
    await apiClient.delete(`/api/project-summaries/${projectId}`);
  }

  // Check if a project summary exists
  async checkProjectSummaryExists(projectId: string): Promise<boolean> {
    try {
      await this.getProjectSummary(projectId);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
}

export const projectSummaryService = new ProjectSummaryService(); 