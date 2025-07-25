import React, { useState, useEffect } from 'react';
import { useUser } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Header } from '../../components/shared';
import authService, { type User } from '../../services/api/authService';

const UsersPage: React.FC = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await authService.getUsers();
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      setUpdatingRole(userId);
      await authService.updateUserRole(userId, newRole);
      // Refresh the users list
      await fetchUsers();
    } catch (err: any) {
      console.error('Failed to update user role:', err);
      alert('Failed to update user role. Please try again.');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/admin/users/${userId}`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="mt-2 text-gray-600">
              Manage user accounts and permissions
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Users Table */}
          {!loading && !error && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Projects
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proposals
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
                                      {users.map((userItem) => (
                    <tr 
                      key={userItem.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleUserClick(userItem.id)}
                    >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {userItem.imageUrl ? (
                              <img
                                className="h-8 w-8 rounded-full"
                                src={userItem.imageUrl}
                                alt={userItem.name}
                              />
                            ) : (
                              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {userItem.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                              <div className="text-sm text-gray-500">ID: {userItem.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userItem.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userItem.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Icon icon="mdi:folder" className="w-4 h-4 text-blue-500 mr-1" />
                            <span className="font-medium">{userItem.stats?.projects || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Icon icon="mdi:file-document" className="w-4 h-4 text-green-500 mr-1" />
                            <span className="font-medium">{userItem.stats?.proposals || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.createdAt ? formatDate(userItem.createdAt) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUserClick(userItem.id);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Icon icon="mdi:eye" className="w-4 h-4" />
                            </button>
                            {userItem.role === 'user' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRoleUpdate(userItem.id, 'admin');
                                }}
                                disabled={updatingRole === userItem.id}
                                className="text-purple-600 hover:text-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Make Admin"
                              >
                                {updatingRole === userItem.id ? (
                                  <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Icon icon="mdi:account-star" className="w-4 h-4" />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRoleUpdate(userItem.id, 'user');
                                }}
                                disabled={updatingRole === userItem.id}
                                className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove Admin"
                              >
                                {updatingRole === userItem.id ? (
                                  <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Icon icon="mdi:account-remove" className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && users.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="mdi:account-group" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">There are no users in the system yet.</p>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default UsersPage; 