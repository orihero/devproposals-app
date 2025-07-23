import React, { useState, useRef, useEffect } from 'react';
import { useUser, useAuthLoading, useAuthError } from '../../stores/authStore';
import { useClerk } from '@clerk/clerk-react';
import { Icon } from '@iconify/react';

interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Active' | 'Offline' | 'On a Break';
  lastActive: string;
  tasks: number;
  avatar: string;
}

const AdminDashboard: React.FC = () => {
  const user = useUser();
  const loading = useAuthLoading();
  const error = useAuthError();
  const { signOut } = useClerk();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  // Mock data for members
  const [members] = useState<Member[]>([
    {
      id: '1',
      name: 'Guy Hawkins',
      role: 'Ethical Hacker',
      email: 'ulfaha@syncro.com',
      status: 'Active',
      lastActive: '15 minutes ago',
      tasks: 39,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Cody Fisher',
      role: 'Team Leader',
      email: 'fellora@syncro.com',
      status: 'Active',
      lastActive: '2 hours ago',
      tasks: 11,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Jenny Wilson',
      role: 'Scrum Master',
      email: 'jenny@syncro.com',
      status: 'On a Break',
      lastActive: '21 Jan 2024, 4:12 AM',
      tasks: 21,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '4',
      name: 'Marvin McKinney',
      role: 'Software Tester',
      email: 'marvin@syncro.com',
      status: 'Offline',
      lastActive: '1 hour ago',
      tasks: 1,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '5',
      name: 'Darlene Robertson',
      role: 'Ethical Hacker',
      email: 'darlene@syncro.com',
      status: 'Active',
      lastActive: '30 minutes ago',
      tasks: 7,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '6',
      name: 'Bessie Cooper',
      role: 'Software Development Manager',
      email: 'bessie@syncro.com',
      status: 'Active',
      lastActive: '45 minutes ago',
      tasks: 16,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '7',
      name: 'Cameron Williamson',
      role: 'UI/UX Designer',
      email: 'cameron@syncro.com',
      status: 'Active',
      lastActive: '1 hour ago',
      tasks: 14,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '8',
      name: 'Darrell Steward',
      role: 'Project Manager',
      email: 'darrell@syncro.com',
      status: 'Active',
      lastActive: '20 minutes ago',
      tasks: 10,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '9',
      name: 'Jacob Jones',
      role: 'Scrum Master',
      email: 'jacob@syncro.com',
      status: 'Active',
      lastActive: '10 minutes ago',
      tasks: 9,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '10',
      name: 'Dianne Russell',
      role: 'Software Developer',
      email: 'dianne@syncro.com',
      status: 'Active',
      lastActive: '5 minutes ago',
      tasks: 8,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
    }
  ]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(member => member.id));
    }
  };

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleContextMenu = (e: React.MouseEvent, memberId: string) => {
    e.preventDefault();
    setShowContextMenu(memberId);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Offline': return 'bg-red-500';
      case 'On a Break': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaskColor = (tasks: number) => {
    if (tasks > 30) return 'border-red-500';
    if (tasks > 15) return 'border-orange-500';
    return 'border-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-2">
            Error Loading Dashboard
          </h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center text-xl font-bold text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                Syncro
              </div>
            </div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Icon icon="mdi:chevron-down" className="w-5 h-5 text-gray-500" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <Icon icon="mdi:logout" className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <div className="flex space-x-3">
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <Icon icon="mdi:download" className="w-4 h-4 mr-2" />
                Download Report
              </button>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center">
                <Icon icon="mdi:star" className="w-4 h-4 mr-2" />
                Optimize (Beta)
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                Invite Member
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedMembers.length === members.length}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workload Balancer
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => handleSelectMember(member.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                          />
                          <div className="flex items-center">
                            <img
                              className="h-8 w-8 rounded-full"
                              src={member.avatar}
                              alt={member.name}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.role}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)} mr-2`}></div>
                          <span className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded-full">
                            {member.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.lastActive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 mr-2">{member.tasks} tasks</span>
                          <div className={`w-4 h-4 rounded-full border-2 ${getTaskColor(member.tasks)}`}></div>
                          <button
                            onClick={(e) => handleContextMenu(e, member.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <Icon icon="mdi:dots-vertical" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <Icon icon="mdi:pencil" className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <Icon icon="mdi:eye-off" className="w-4 h-4 mr-2" />
            Disable
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <Icon icon="mdi:star" className="w-4 h-4 mr-2" />
            Optimize
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
            <Icon icon="mdi:delete" className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 