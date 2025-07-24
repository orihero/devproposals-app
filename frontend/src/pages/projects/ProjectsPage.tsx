import React, { useState } from 'react';
import ProjectsList from '../../components/projects/ProjectsList';
import CreateProject from '../../components/projects/CreateProject';
import type { Project } from '../../services/api/projectService';
import Header from '../home/components/Header';

const ProjectsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProjectCreated = (project: Project) => {
    setShowCreateForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    // You can navigate to a detailed view or show a modal
    console.log('Selected project:', project);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    // You can navigate to an edit page or show an edit modal
    console.log('Edit project:', project);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="mt-2 text-gray-600">
                Manage your development projects and track their progress
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Project
            </button>
          </div>
        </div>

        {/* Content */}
        {showCreateForm ? (
          <div className="mb-8">
            <CreateProject
              onProjectCreated={handleProjectCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        ) : (
          <ProjectsList
            onProjectSelect={handleProjectSelect}
            onEditProject={handleEditProject}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* Selected Project Modal (placeholder for future implementation) */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedProject.title}</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedProject.documentFile && (
                <div className="mb-4">
                  <div className="flex items-center text-sm text-blue-600">
                    <span className="font-medium">Document:</span>
                    <a href={selectedProject.documentFile} target="_blank" rel="noopener noreferrer" className="ml-1 underline hover:text-blue-800">
                      View Document
                    </a>
                  </div>
                </div>
              )}
              <div className="space-y-2 text-sm">
                {selectedProject.budget && (
                  <p><span className="font-medium">Budget:</span> ${selectedProject.budget.toLocaleString()}</p>
                )}
                {selectedProject.duration && (
                  <p><span className="font-medium">Duration:</span> {selectedProject.duration} days</p>
                )}
                <p><span className="font-medium">Status:</span> {selectedProject.status}</p>
                <p><span className="font-medium">Created:</span> {new Date(selectedProject.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage; 