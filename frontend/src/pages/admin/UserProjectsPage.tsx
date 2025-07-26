import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../stores/authStore';
import { Icon } from '@iconify/react';
import { Header } from '../../components/shared';
import authService, { type User } from '../../services/api/authService';
import { projectService, type Project } from '../../services/api/projectService';

const UserProjectsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const user = useUser();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
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
      
      // Fetch user data
      const userData = await authService.getUser(userId!);
      setUserData(userData);
      
      // Fetch user's projects
      const projectsData = await projectService.getProjectsByUser(userId!);
      setProjects(projectsData.projects);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user data');
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

  if (!user || user.role !== 'admin') {
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
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !userData) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-2" />
              Back to Users
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {userData?.name}'s Projects
                </h1>
                <p className="mt-2 text-gray-600">
                  View and manage projects for this user
                </p>
              </div>
                             <button
                 onClick={() => navigate(`/admin/users/${userId}/edit`)}
                 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
               >
                 <Icon icon="mdi:account-edit" className="w-4 h-4 mr-2" />
                 Edit User
               </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* User Info Card */}
          {userData && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex items-center">
                {userData.imageUrl ? (
                  <img
                    className="h-12 w-12 rounded-full"
                    src={userData.imageUrl}
                    alt={userData.name}
                  />
                ) : (
                  <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {userData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="ml-4">
                  <h2 className="text-xl font-medium text-gray-900">{userData.name}</h2>
                  <p className="text-gray-600">{userData.email}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    userData.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {userData.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Projects Section */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Projects ({projects.length})
              </h3>
            </div>
            
            {projects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr 
                        key={project.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleProjectClick(project.id)}
                      >
                                                 <td className="px-6 py-4 whitespace-nowrap">
                           <div>
                             <div className="text-sm font-medium text-gray-900">{project.title}</div>
                             <div className="text-sm text-gray-500">
                               Budget: ${project.budget || 'Not set'} | Duration: {project.duration || 'Not set'} days
                             </div>
                           </div>
                         </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.createdAt ? formatDate(project.createdAt) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectClick(project.id);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Project"
                          >
                            <Icon icon="mdi:eye" className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon icon="mdi:folder-open" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-500">This user hasn't created any projects yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProjectsPage; 