import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService, type Project } from '../../services/api/projectService';

interface ProjectsListProps {
  onProjectSelect?: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  refreshTrigger?: number;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ 
  onProjectSelect, 
  onEditProject, 
  refreshTrigger 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.getProjects();
      setProjects(result.projects);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger]);

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await projectService.deleteProject(projectId);
      // Refresh the projects list
      fetchProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchProjects}
          className="mt-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Count */}
      <div className="flex justify-end">
        <span className="text-sm text-gray-600">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600">
            Get started by creating your first project.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {project.title}
                    </h3>
                  </div>

                  {project.documentFile && (
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-blue-600">
                        <span className="font-medium">Document:</span>
                        <a 
                          href={project.documentFile} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="ml-1 underline hover:text-blue-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {project.budget && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Budget:</span>
                        <span className="ml-1">${project.budget.toLocaleString()}</span>
                      </div>
                    )}
                    {project.duration && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Duration:</span>
                        <span className="ml-1">{project.duration} days</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <span>Created:</span>
                      <span className="ml-1">{formatDate(project.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onProjectSelect?.(project);
                        }}
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEditProject?.(project);
                        }}
                        className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded"
                      >
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList; 