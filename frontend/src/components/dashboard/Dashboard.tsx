import React from 'react';
import { useUser, useAuthLoading, useAuthError } from '../../stores/authStore';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { Header } from '../shared';
import { useDashboard } from '../../hooks/useDashboard';

const Dashboard: React.FC = () => {
  const user = useUser();
  const loading = useAuthLoading();
  const error = useAuthError();
  const { stats, activities, loading: dashboardLoading, error: dashboardError, refreshData } = useDashboard();

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || dashboardError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-2">
            Error Loading Dashboard
          </h1>
          <p className="text-red-600">{error || dashboardError}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            User Not Found
          </h1>
          <p className="text-gray-600">
            Please sign in to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your account today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon icon="mdi:folder-multiple" className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalProjects || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon icon="mdi:file-document" className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Proposals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalProposals || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Icon icon="mdi:chart-line" className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.averageScore || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Icon icon="mdi:trophy" className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Best Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.bestScore || 0}</p>
                </div>
              </div>
            </div>
          </div>



          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Project</h3>
                  <p className="text-gray-600 mb-4">Start a new development project and get proposals from developers.</p>
                  <Link
                    to="/projects"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                    Create Project
                  </Link>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon icon="mdi:file-document-plus" className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">View Projects</h3>
                  <p className="text-gray-600 mb-4">Manage your existing projects and track their progress.</p>
                  <Link
                    to="/projects"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <Icon icon="mdi:eye" className="w-4 h-4 mr-2" />
                    View Projects
                  </Link>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Icon icon="mdi:folder-multiple" className="w-8 h-8 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              <button
                onClick={refreshData}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Icon icon="mdi:refresh" className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
            <div className="p-6">
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'accepted':
                          return 'bg-green-500';
                        case 'rejected':
                          return 'bg-red-500';
                        case 'pending':
                          return 'bg-yellow-500';
                        case 'active':
                          return 'bg-blue-500';
                        case 'completed':
                          return 'bg-green-500';
                        case 'on-hold':
                          return 'bg-gray-500';
                        default:
                          return 'bg-gray-500';
                      }
                    };

                    const getStatusIcon = (type: string, status: string) => {
                      if (type === 'proposal') {
                        switch (status) {
                          case 'accepted':
                            return 'mdi:check-circle';
                          case 'rejected':
                            return 'mdi:close-circle';
                          case 'pending':
                            return 'mdi:clock';
                          default:
                            return 'mdi:file-document';
                        }
                      } else {
                        return 'mdi:folder';
                      }
                    };

                    const formatTimeAgo = (timestamp: string) => {
                      const now = new Date();
                      const activityTime = new Date(timestamp);
                      const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));
                      
                      if (diffInHours < 1) {
                        return 'Just now';
                      } else if (diffInHours < 24) {
                        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
                      } else {
                        const diffInDays = Math.floor(diffInHours / 24);
                        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
                      }
                    };

                    return (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className={`w-2 h-2 ${getStatusColor(activity.status)} rounded-full`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Icon 
                              icon={getStatusIcon(activity.type, activity.status)} 
                              className="w-4 h-4 text-gray-500" 
                            />
                            <p className="text-sm text-gray-900">{activity.message}</p>
                            {activity.score && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Score: {activity.score}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon icon="mdi:information" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400">Create a project to see activity here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 