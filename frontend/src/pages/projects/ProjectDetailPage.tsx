import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../home/components/Header';
import { projectService, type Project } from '../../services/api/projectService';
import { proposalService, type Proposal, type ComparisonSummary } from '../../services/api/proposalService';
import CreateProposal from '../../components/proposals/CreateProposal';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showComparisonSummary, setShowComparisonSummary] = useState(false);
  const [comparisonSummary, setComparisonSummary] = useState<ComparisonSummary | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deletingProposalId, setDeletingProposalId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const projectData = await projectService.getProject(projectId);
        setProject(projectData.project);
        
        // Fetch proposals for this project
        const proposalsData = await proposalService.getProposalsByProject(projectId);
        setProposals(proposalsData.proposals);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch project details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, refreshTrigger]);

  const handleProposalCreated = (proposal: Proposal) => {
    setShowCreateForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (!window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      return;
    }

    setDeletingProposalId(proposalId);

    try {
      await proposalService.deleteProposal(proposalId);
      // Refresh the proposals list
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Failed to delete proposal:', error);
      alert('Failed to delete proposal. Please try again.');
    } finally {
      setDeletingProposalId(null);
    }
  };

  const generateComparisonSummary = async () => {
    if (!projectId) return;
    
    setGeneratingSummary(true);
    setSummaryError(null);
    
    try {
      const response = await proposalService.generateComparisonSummary(projectId);
      setComparisonSummary(response.summary);
      setShowComparisonSummary(true);
    } catch (err: any) {
      setSummaryError(err.response?.data?.message || 'Failed to generate comparison summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Error Loading Project</h1>
            <p className="text-red-600">{error || 'Project not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-gray-600 mt-2">Project Details</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              project.status === 'active' ? 'bg-green-100 text-green-800' :
              project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.budget && (
              <div>
                <span className="text-sm font-medium text-gray-500">Budget</span>
                <p className="text-lg font-semibold text-gray-900">${project.budget.toLocaleString()}</p>
              </div>
            )}
            {project.duration && (
              <div>
                <span className="text-sm font-medium text-gray-500">Duration</span>
                <p className="text-lg font-semibold text-gray-900">{project.duration} days</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-500">Created</span>
              <p className="text-lg font-semibold text-gray-900">{formatDate(project.createdAt)}</p>
            </div>
          </div>

          {project.documentFile && (
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-500">Project Document</span>
              <div className="mt-1">
                <a 
                  href={project.documentFile} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View Document
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Proposals Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Proposals</h2>
                <p className="text-gray-600 mt-1">Review and manage proposals for this project</p>
              </div>
              <div className="flex items-center space-x-3">
                {proposals.length > 1 && (
                  <button
                    onClick={generateComparisonSummary}
                    disabled={generatingSummary}
                    className={`px-4 py-2 font-medium rounded-md transition-colors ${
                      generatingSummary
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                    }`}
                  >
                    {generatingSummary ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      'Generate Summary'
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Create Proposal
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {showCreateForm ? (
              <div className="mb-6">
                <CreateProposal
                  projectId={projectId!}
                  onProposalCreated={handleProposalCreated}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            ) : null}

            {proposals.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                <p className="text-gray-600">Create the first proposal for this project.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {proposal.companyName || 'Anonymous Company'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Submitted {formatDate(proposal.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                          {proposal.status}
                        </span>
                        <button
                          onClick={() => handleDeleteProposal(proposal.id)}
                          disabled={deletingProposalId === proposal.id}
                          className={`p-1 rounded-md transition-colors ${
                            deletingProposalId === proposal.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                          }`}
                          title="Delete proposal"
                        >
                          {deletingProposalId === proposal.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Total Cost</span>
                        <p className="text-lg font-semibold text-gray-900">
                          {proposal.totalCost ? `$${proposal.totalCost.toLocaleString()}` : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Timeline</span>
                        <p className="text-lg font-semibold text-gray-900">
                          {proposal.timeline ? `${proposal.timeline} days` : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Features</span>
                        <p className="text-sm text-gray-900">{proposal.features.length} features</p>
                      </div>
                    </div>

                    {proposal.features.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-500">Features:</span>
                        <ul className="mt-1 space-y-1">
                          {proposal.features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {proposal.proposalFile && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-500">Proposal Document:</span>
                        <div className="mt-1">
                          <a 
                            href={proposal.proposalFile} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                          >
                            View Proposal
                          </a>
                        </div>
                      </div>
                    )}

                    {proposal.analysis?.comparisonScore && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <span className="text-sm font-medium text-blue-800">AI Analysis Score:</span>
                        <p className="text-lg font-semibold text-blue-900">{proposal.analysis.comparisonScore}/100</p>
                      </div>
                    )}

                    {proposal.analysis?.aiQuestions && proposal.analysis.aiQuestions.length > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                        <span className="text-sm font-medium text-yellow-800">AI Questions:</span>
                        <ul className="mt-2 space-y-1">
                          {proposal.analysis.aiQuestions.map((question, index) => (
                            <li key={index} className="text-sm text-yellow-700 flex items-start">
                              <span className="text-yellow-600 mr-2">•</span>
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {proposal.analysis?.aiSuggestions && proposal.analysis.aiSuggestions.length > 0 && (
                      <div className="mt-3 p-3 bg-green-50 rounded-md">
                        <span className="text-sm font-medium text-green-800">AI Suggestions:</span>
                        <ul className="mt-2 space-y-1">
                          {proposal.analysis.aiSuggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-green-700 flex items-start">
                              <span className="text-green-600 mr-2">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Comparison Summary Section */}
            {showComparisonSummary && comparisonSummary && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Comparison Summary</h3>
                    <button
                      onClick={() => setShowComparisonSummary(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Summary Header */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Project:</span>
                        <p className="text-gray-900">{comparisonSummary.projectTitle}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Proposals Analyzed:</span>
                        <p className="text-gray-900">{comparisonSummary.totalProposals}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Generated:</span>
                        <p className="text-gray-900">{formatDate(comparisonSummary.generatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Content */}
                  <div className="prose prose-lg max-w-none">
                    <div 
                      className="bg-white border border-gray-200 rounded-lg p-6"
                      dangerouslySetInnerHTML={{ 
                        __html: comparisonSummary.summaryContent.replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
                    <button
                      onClick={generateComparisonSummary}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Regenerate Summary
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([comparisonSummary.summaryContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `comparison-summary-${project.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Download Summary
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {summaryError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error Generating Summary
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {summaryError}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={generateComparisonSummary}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage; 