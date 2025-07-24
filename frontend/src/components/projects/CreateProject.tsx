import React, { useState } from 'react';
import { projectService } from '../../services/api/projectService';
import { uploadService } from '../../services/api/uploadService';
import type { CreateProjectData } from '../../services/api/projectService';

interface CreateProjectProps {
  onProjectCreated?: (project: any) => void;
  onCancel?: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onProjectCreated, onCancel }) => {
  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    budget: undefined,
    duration: undefined,
    documentFile: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'duration' ? (value ? Number(value) : undefined) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    // Clear the URL field when a file is selected
    if (file) {
      setFormData(prev => ({
        ...prev,
        documentFile: ''
      }));
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      documentFile: value
    }));
    
    // Clear selected file when URL is entered
    if (value) {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      // Handle file upload if a file is selected
      let finalDocumentFile = formData.documentFile;
      if (selectedFile) {
        try {
          const uploadResult = await uploadService.uploadDocument(selectedFile);
          finalDocumentFile = uploadResult.file.url;
        } catch (uploadError: any) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }
      }

      // Create project with the final document file URL
      const projectData = {
        ...formData,
        documentFile: finalDocumentFile
      };

      const result = await projectService.createProject(projectData);
      
      // Reset form
      setFormData({
        title: '',
        budget: undefined,
        duration: undefined,
        documentFile: ''
      });
      setSelectedFile(null);

      // Call callback if provided
      if (onProjectCreated) {
        onProjectCreated(result.project);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Project</h2>
        <p className="text-gray-600">Fill in the details below to create your new project.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter project title"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
              Budget (USD)
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter budget amount"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duration (days)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration || ''}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter project duration"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Document (Optional)
            </label>
            
            {/* File Upload */}
            <div className="mb-4">
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <span className="text-sm text-green-600">
                    ✓ {selectedFile.name}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX, TXT (max 10MB)
              </p>
            </div>

            {/* URL Input */}
            <div>
              <label htmlFor="documentUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Or provide document URL
              </label>
              <input
                type="url"
                id="documentUrl"
                name="documentUrl"
                value={formData.documentFile}
                onChange={handleUrlChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/project-document.pdf"
              />
              <p className="mt-1 text-sm text-gray-500">
                Provide a direct link to your document
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject; 