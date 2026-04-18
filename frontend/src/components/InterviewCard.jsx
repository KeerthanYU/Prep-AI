import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiTrendingUp } from 'react-icons/fi';

const InterviewCard = ({ interview }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Link to={`/results/${interview._id}`}>
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{interview.domain}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
              <FiCalendar size={14} />
              {formatDate(interview.createdAt)}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium badge ${getScoreBadgeColor(interview.overallScore)}`}>
            {interview.overallScore}/100
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FiClock size={16} />
            {interview.duration ? formatTime(interview.duration) : 'N/A'}
          </div>
          <div className="flex items-center gap-1">
            <FiTrendingUp size={16} />
            {interview.answers?.length || 0} questions
          </div>
        </div>

        {interview.status && (
          <div className="mt-4">
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
              {interview.status === 'in-progress' ? 'In Progress' : 'Completed'}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default InterviewCard;
