import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiBarChart2, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stats');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!user || userProfile?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchAdminData();
  }, [user, userProfile, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Admin data fetch error:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      setUsersLoading(true);
      const response = await apiService.get(`/admin/users?page=${page}&limit=20`);
      setUsers(response.data.users);
      setCurrentPage(page);
    } catch (err) {
      console.error('Users fetch error:', err);
      setError('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.delete(`/admin/users/${userId}`);
      alert('User deleted successfully');
      fetchUsers(currentPage);
    } catch (err) {
      alert('Failed to delete user');
      console.error(err);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await apiService.put(`/admin/users/${userId}/role`, { role: newRole });
      alert('User role updated successfully');
      fetchUsers(currentPage);
    } catch (err) {
      alert('Failed to update user role');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600">Manage users and view system statistics</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb- border-b border-gray-200 flex-wrap">
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-4 px-1 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'stats'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiBarChart2 size={20} />
              Statistics
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                fetchUsers(1);
              }}
              className={`pb-4 px-1 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiUsers size={20} />
              Users
            </button>
          </div>

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 font-medium text-sm">Total Users</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.summary.totalUsers}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 font-medium text-sm">Total Interviews</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.summary.totalInterviews}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 font-medium text-sm">Average User Score</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.summary.avgUserScore.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 font-medium text-sm">Total Admins</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.summary.totalAdmins}
                  </div>
                </div>
              </div>

              {/* Score Statistics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Interview Score Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-600 text-sm">Minimum Score</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {stats.summary.minScore.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-gray-600 text-sm">Average Score</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {stats.summary.avgUserScore.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-gray-600 text-sm">Maximum Score</p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">
                      {stats.summary.maxScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Users by Domain */}
              {stats.usersByDomain && stats.usersByDomain.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Users by Domain</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.usersByDomain.map((item, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 font-medium">
                          {item._id || 'Not Selected'}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {item.count}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">All Users</h2>
                  <button
                    onClick={() => fetchUsers(1)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiRefreshCw size={16} />
                    Refresh
                  </button>
                </div>
              </div>

              {usersLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : users && users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Sessions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Domain</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.displayName}</td>
                          <td className="px-6 py-4 text-sm">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.totalSessions}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.averageScore}%</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.domain || '-'}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDeleteUser(user._id, user.email)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              title="Delete user"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-600">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminPanel;
