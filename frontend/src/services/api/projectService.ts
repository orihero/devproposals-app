import apiClient from './axiosConfig';

export interface Project {
  id: string;
  title: string;
  budget?: number;
  duration?: number;
  documentFile?: string;
  status: 'active' | 'completed' | 'on-hold';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  title: string;
  budget?: number;
  duration?: number;
  documentFile?: string;
}

export interface UpdateProjectData {
  title?: string;
  budget?: number;
  duration?: number;
  documentFile?: string;
  status?: 'active' | 'completed' | 'on-hold';
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const projectService = {
  // Create a new project
  async createProject(data: CreateProjectData): Promise<{ message: string; project: Project }> {
    const response = await apiClient.post('/api/projects', data);
    return response.data;
  },

  // Get all projects for the authenticated user
  async getProjects(params?: {
    status?: 'active' | 'completed' | 'on-hold';
    page?: number;
    limit?: number;
  }): Promise<ProjectsResponse> {
    const response = await apiClient.get('/api/projects', { params });
    return response.data;
  },

  // Get a specific project by ID
  async getProject(projectId: string): Promise<{ project: Project }> {
    const response = await apiClient.get(`/api/projects/${projectId}`);
    return response.data;
  },

  // Update a project
  async updateProject(projectId: string, data: UpdateProjectData): Promise<{ message: string; project: Project }> {
    const response = await apiClient.put(`/api/projects/${projectId}`, data);
    return response.data;
  },

  // Delete a project
  async deleteProject(projectId: string): Promise<{ message: string; projectId: string }> {
    const response = await apiClient.delete(`/api/projects/${projectId}`);
    return response.data;
  },

  // Get projects by user ID (admin only)
  async getProjectsByUser(userId: string): Promise<{ projects: Project[] }> {
    const response = await apiClient.get(`/api/projects/user/${userId}`);
    return response.data;
  }
}; 