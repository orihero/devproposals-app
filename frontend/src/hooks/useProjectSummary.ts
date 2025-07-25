import { useState, useEffect } from 'react';
import { projectSummaryService, type ProjectSummary } from '../services/api/projectSummaryService';

interface UseProjectSummaryReturn {
  summary: ProjectSummary | null;
  loading: boolean;
  error: string | null;
  deleteSummary: () => Promise<void>;
  refreshSummary: () => Promise<void>;
}

export const useProjectSummary = (projectId: string): UseProjectSummaryReturn => {
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      const summaryData = await projectSummaryService.getProjectSummary(projectId);
      setSummary(summaryData);
    } catch (error: any) {
      if (error.message !== 'Resource not found') {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };



  const deleteSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      await projectSummaryService.deleteProjectSummary(projectId);
      setSummary(null);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSummary = async () => {
    await loadSummary();
  };

  useEffect(() => {
    loadSummary();
  }, [projectId]);

  return {
    summary,
    loading,
    error,
    deleteSummary,
    refreshSummary
  };
}; 