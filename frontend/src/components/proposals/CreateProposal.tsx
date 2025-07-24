import React, { useState } from 'react';
import { proposalService, type CreateProposalData } from '../../services/api/proposalService';
import { uploadService } from '../../services/api/uploadService';

interface CreateProposalProps {
  projectId: string;
  onProposalCreated: (proposal: any) => void;
  onCancel: () => void;
}

const CreateProposal: React.FC<CreateProposalProps> = ({ 
  projectId, 
  onProposalCreated, 
  onCancel 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadedFile = await uploadService.uploadDocument(file);
      
      setUploadedFile(uploadedFile.file.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      setError('Please upload a proposal file');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const proposalData: CreateProposalData = {
        projectId,
        proposalFile: uploadedFile
      };

      const result = await proposalService.createProposal(proposalData);
      onProposalCreated(result.proposal);
    } catch (err: any) {
      console.error('Proposal creation error:', err);
      if (err.message?.includes('timeout')) {
        setError('Analysis is taking longer than expected. Please try again or check if the file is readable.');
      } else {
        setError(err.message || 'Failed to create proposal');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Upload Proposal</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Proposal Document *
          </label>
          <div className="space-y-4">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".txt,.md,.csv,.pdf,.doc,.docx,.rtf,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.html,.htm,.xml"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}
            
            {uploadedFile && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">✓ File uploaded successfully</p>
                <p className="text-xs text-green-600 mt-1">AI will now analyze and extract proposal details</p>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <p className="text-sm text-blue-800">AI is analyzing your proposal...</p>
                </div>
                <p className="text-xs text-blue-600 mt-1">This may take 30-60 seconds for large documents</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">AI-Powered Analysis</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Our AI (Google Gemini 2.0) will automatically extract:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Total cost and timeline</li>
                  <li>Features and deliverables</li>
                  <li>Company information</li>
                  <li>Generate comparison score</li>
                  <li>Provide questions and suggestions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isAnalyzing || !uploadedFile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Uploading...' : isAnalyzing ? 'Analyzing with AI...' : 'Analyze & Create Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProposal; 