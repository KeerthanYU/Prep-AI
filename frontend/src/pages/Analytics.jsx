import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FiTrendingUp, FiActivity, FiTarget, FiAward } from 'react-icons/fi';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';

const Analytics = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [overview, setOverview] = useState(null);
  const [progress, setProgress] = useState(null);
  const [skills, setSkills] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchAnalytics();
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const [overviewRes, progressRes, skillsRes] = await Promise.all([
        apiService.get('/analytics/overview'),
        apiService.get('/analytics/progress'),
        apiService.get('/analytics/skills'),
      ]);

      setOverview(overviewRes.data);
      setProgress(progressRes.data);
      setSkills(skillsRes.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIndicator = (trend) => {
    switch (trend) {
      case 'improving':
        return <span className="text-green-600 font-semibold">📈 Improving</span>;
      case 'declining':
        return <span className="text-red-600 font-semibold">📉 Declining</span>;
      case 'stable':
        return <span className="text-blue-600 font-semibold">➡️ Stable</span>;
      default:
        return <span className="text-gray-600">⚠️ Insufficient Data</span>;
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your analytics...</p>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Your Interview Analytics
            </h1>
            <p className="text-gray-600">Track your progress and improve your interview skills</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 font-medium transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`pb-4 px-1 font-medium transition-colors border-b-2 ${
                activeTab === 'progress'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`pb-4 px-1 font-medium transition-colors border-b-2 ${
                activeTab === 'skills'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Skills & Gaps
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Average Score Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Average Score</h3>
                  <FiAward className="text-blue-600" size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {overview.averageScore}%
                </div>
                <progress
                  value={overview.averageScore}
                  max="100"
                  className="w-full h-2 bg-gray-200 rounded-full"
                />
              </div>

              {/* Total Sessions Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Total Sessions</h3>
                  <FiActivity className="text-green-600" size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {overview.totalSessions}
                </div>
                <p className="text-sm text-gray-600 mt-2">interviews completed</p>
              </div>

              {/* Readiness Score Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Readiness Score</h3>
                  <FiTarget className="text-orange-600" size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {overview.interviewReadinessScore}%
                </div>
                <p className="text-sm text-gray-600 mt-2">overall readiness</p>
              </div>

              {/* Domain Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Domain</h3>
                  <FiTrendingUp className="text-purple-600" size={24} />
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {overview.domain || 'Not selected'}
                </div>
                <p className="text-sm text-gray-600 mt-2">your focus area</p>
              </div>
            </div>
          )}

          {/* Domain Strengths */}
          {activeTab === 'overview' && overview && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Domain Strengths</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['contentScore', 'communicationScore', 'confidenceScore'].map((metric) => {
                  const labels = {
                    contentScore: 'Content Knowledge',
                    communicationScore: 'Communication',
                    confidenceScore: 'Confidence',
                  };
                  const value = overview.domainStrengths?.[metric] || 0;
                  const isStrong = value >= 70;

                  return (
                    <div key={metric} className="relative">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">{labels[metric]}</span>
                        <span className="font-bold text-gray-900">{value}%</span>
                      </div>
                      <progress
                        value={value}
                        max="100"
                        className={`w-full h-3 rounded-full ${
                          isStrong ? 'bg-green-200' : 'bg-orange-200'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && progress && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Interview Progress</h2>
                  <div className="text-sm font-medium">
                    {getTrendIndicator(progress.trend)}
                  </div>
                </div>
              </div>

              {progress.interviews && progress.interviews.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progress.interviews}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString()
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-600 py-8">No interview data yet</p>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && skills && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strong Areas */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💪 Strong Areas</h3>
                {skills.strongAreas && skills.strongAreas.length > 0 ? (
                  <div className="space-y-3">
                    {skills.strongAreas.map((area, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium text-gray-700">{area.area}</span>
                        <span className="font-bold text-green-600">{area.score}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Keep practicing to identify your strengths!</p>
                )}
              </div>

              {/* Weak Areas */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Areas to Improve</h3>
                {skills.weakAreas && skills.weakAreas.length > 0 ? (
                  <div className="space-y-3">
                    {skills.weakAreas.map((area, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span className="font-medium text-gray-700">{area.area}</span>
                        <span className="font-bold text-orange-600">{area.score}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Great! You don't have any weak areas identified yet.</p>
                )}
              </div>

              {/* Skills Gap */}
              {skills.skillsGap && skills.skillsGap.length > 0 && (
                <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Skills Gap Analysis</h3>
                  <div className="space-y-4">
                    {skills.skillsGap.map((skill, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">{skill.skill}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            skill.priority === 'high' ? 'bg-red-100 text-red-700' :
                            skill.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {skill.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Proficiency: <strong>{skill.proficiency}</strong>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Refresh Button */}
          <div className="mt-8 text-center">
            <button
              onClick={fetchAnalytics}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Analytics
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Analytics;
