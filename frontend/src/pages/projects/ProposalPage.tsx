import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../home/components/Header';
import { proposalService, type Proposal } from '../../services/api/proposalService';

const ProposalPage: React.FC = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!proposalId) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const response = await proposalService.getProposal(proposalId);
        setProposal(response.proposal);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch proposal details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposal();
  }, [proposalId]);

  const handleDeleteProposal = async () => {
    if (!proposalId || !window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      await proposalService.deleteProposal(proposalId);
      navigate(`/projects/${proposal?.projectId}`);
    } catch (error: any) {
      console.error('Failed to delete proposal:', error);
      alert('Failed to delete proposal. Please try again.');
    } finally {
      setIsDeleting(false);
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

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Error Loading Proposal</h1>
            <p className="text-red-600">{error || 'Proposal not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate(`/projects/${proposal.projectId}`)}
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Project
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {proposal.companyName || 'Anonymous Company'} - Proposal
            </h1>
            <p className="text-gray-600 mt-1">Submitted {formatDate(proposal.createdAt)}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(proposal.status)}`}>
              {proposal.status}
            </span>
            <button
              onClick={handleDeleteProposal}
              disabled={isDeleting}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isDeleting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isDeleting ? 'Deleting...' : 'Delete Proposal'}
            </button>
          </div>
        </div>

        {/* Proposal Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <span className="text-sm font-medium text-gray-500">Total Cost</span>
              <p className="text-2xl font-semibold text-gray-900">
                {proposal.totalCost ? `$${proposal.totalCost.toLocaleString()}` : 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Timeline</span>
              <p className="text-2xl font-semibold text-gray-900">
                {proposal.timeline ? `${proposal.timeline} days` : 'Not specified'}
              </p>
            </div>
          </div>

          {proposal.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Features & Deliverables</h3>
              <ul className="space-y-2">
                {proposal.features.map((feature, index) => (
                  <li key={index} className="text-gray-700 flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {proposal.proposalFile && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Proposal Document</h3>
              <a 
                href={proposal.proposalFile} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Proposal Document
              </a>
            </div>
          )}

          {proposal.analysis && (
            <div className="space-y-4">
              {proposal.analysis.comparisonScore && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">AI Analysis Score</h3>
                  <p className="text-2xl font-bold text-blue-900">{proposal.analysis.comparisonScore}/100</p>
                </div>
              )}

              {proposal.analysis.aiQuestions && proposal.analysis.aiQuestions.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-md">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">AI Questions</h3>
                  <ul className="space-y-2">
                    {proposal.analysis.aiQuestions.map((question, index) => (
                      <li key={index} className="text-yellow-700 flex items-start">
                        <span className="text-yellow-600 mr-3 mt-1">•</span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {proposal.analysis.aiSuggestions && proposal.analysis.aiSuggestions.length > 0 && (
                <div className="p-4 bg-green-50 rounded-md">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">AI Suggestions</h3>
                  <ul className="space-y-2">
                    {proposal.analysis.aiSuggestions.map((suggestion, index) => (
                      <li key={index} className="text-green-700 flex items-start">
                        <span className="text-green-600 mr-3 mt-1">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalPage; 