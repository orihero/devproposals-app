import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api/dashboardService';
import type { DashboardStats, Activity } from '../services/api/dashboardService';

interface DashboardData {
  stats: DashboardStats | null;
  activities: Activity[];
  loading: boolean;
  error: string | null;
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    activities: [],
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch stats and activity in parallel
      const [statsResponse, activityResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivity()
      ]);

      setData({
        stats: statsResponse.data,
        activities: activityResponse.data.activities,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error?.message || 'Failed to load dashboard data'
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    ...data,
    refreshData
  };
}; 