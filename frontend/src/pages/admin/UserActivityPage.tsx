import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../stores/authStore';
import { Icon } from '@iconify/react';
import { Header } from '../../components/shared';
import { projectService, type Project } from '../../services/api/projectService';
import authService, { type User } from '../../services/api/authService';

const UserActivityPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useUser();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserAndProjects();
    }
  }, [userId]);

  const fetchUserAndProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user details and projects in parallel
      const [usersResponse, projectsResponse] = await Promise.all([
        authService.getUsers(),
        projectService.getProjectsByUser(userId!)
      ]);

      const userData = usersResponse.find(u => u.id === userId);
      if (!userData) {
        setError('User not found');
        return;
      }

      setUser(userData);
      setProjects(projectsResponse.projects);
    } catch (err: any) {
      console.error('Failed to fetch user activity:', err);
      setError(err.message || 'Failed to fetch user activity');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                User Not Found
              </h1>
              <p className="text-gray-600">
                The requested user could not be found.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-1" />
                    Back to Users
                  </button>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.name}'s Activity
                </h1>
                <p className="mt-2 text-gray-600">
                  {user.email} • {user.role}
                </p>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center space-x-4">
              {user.imageUrl ? (
                <img
                  className="h-16 w-16 rounded-full"
                  src={user.imageUrl}
                  alt={user.name}
                />
              ) : (
                <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Projects ({projects.length})
              </h3>
            </div>
            
            <div className="p-6">
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {project.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {project.budget && (
                              <span>Budget: ${project.budget.toLocaleString()}</span>
                            )}
                            {project.duration && (
                              <span>Duration: {project.duration} days</span>
                            )}

                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Created: {formatDate(project.createdAt)}
                          </p>
                        </div>
                        <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon icon="mdi:file-document-outline" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                  <p className="text-gray-500">
                    {user.name} hasn't created any projects yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityPage; 