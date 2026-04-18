import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrendingUp } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../components/Header';
import ScoreCard from '../components/ScoreCard';
import InterviewCard from '../components/InterviewCard';
import ResumeUpload from '../components/ResumeUpload';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';

const Dashboard = () => {
  const { userProfile, setUserProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/interviews/stats/dashboard');
      setStats(response.data.stats);
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUploadSuccess = (resume) => {
    setUserProfile((prev) => ({
      ...prev,
      resume,
    }));
  };

  const handleResumeDelete = () => {
    setUserProfile((prev) => ({
      ...prev,
      resume: null,
    }));
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {userProfile?.displayName}! Track your interview readiness progress.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-8">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <ScoreCard
            title="Interview Readiness"
            score={stats?.interviewReadinessScore || 0}
            color="blue"
          />
          <ScoreCard
            title="Average Score"
            score={Math.round(stats?.averageScore || 0)}
            color="purple"
          />
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-green-600">
              {stats?.totalSessions || 0}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Domain</p>
            <p className="text-lg font-semibold text-gray-900">
              {userProfile?.domain || 'Not selected'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b flex gap-4">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'profile', label: 'Profile' },
            { id: 'history', label: 'Interview History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Performance Chart */}
            {stats?.recentInterviews?.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FiTrendingUp />
                  Recent Performance
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.recentInterviews}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="createdAt"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value) => value.toFixed(1)}
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="overallScore"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Domain Strengths */}
            {stats?.domainStrengths && (
              <div className="grid md:grid-cols-3 gap-4">
                <ScoreCard
                  title="Content"
                  score={Math.round(stats.domainStrengths.contentScore)}
                  color="blue"
                />
                <ScoreCard
                  title="Communication"
                  score={Math.round(stats.domainStrengths.communicationScore)}
                  color="purple"
                />
                <ScoreCard
                  title="Confidence"
                  score={Math.round(stats.domainStrengths.confidenceScore)}
                  color="green"
                />
              </div>
            )}

            {/* CTA */}
            <div className="card bg-gradient-to-r from-blue-50 to-purple-50 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ready for Your Next Interview?
              </h3>
              <Link to="/interview" className="btn btn-primary inline-flex items-center gap-2">
                <FiPlus />
                Start New Interview
              </Link>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Profile Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Display Name</label>
                  <p className="text-gray-900">{userProfile?.displayName}</p>
                </div>
                <div>
                  <label className="label">Email</label>
                  <p className="text-gray-900">{userProfile?.email}</p>
                </div>
                <div>
                  <label className="label">Interview Domain</label>
                  <p className="text-gray-900">{userProfile?.domain || 'Not selected'}</p>
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Resume
              </h2>
              <ResumeUpload
                onUploadSuccess={handleResumeUploadSuccess}
                existingResume={userProfile?.resume}
                onDelete={handleResumeDelete}
              />
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Recent Interviews
            </h2>
            {stats?.recentInterviews?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {stats.recentInterviews.map((interview) => (
                  <InterviewCard
                    key={interview._id}
                    interview={interview}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No interviews yet</p>
                <Link to="/interview" className="btn btn-primary">
                  Start Your First Interview
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default Dashboard;
