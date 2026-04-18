import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

const ScoreCard = ({ title, score, maxScore = 100, color = 'blue' }) => {
  const percentage = (score / maxScore) * 100;

  const getColorClasses = (col) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
    };
    return colors[col] || colors.blue;
  };

  const getTextColor = (col) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
    };
    return colors[col] || colors.blue;
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${getTextColor(color)}`}>
            {score}
            <span className="text-lg text-gray-400">/{maxScore}</span>
          </p>
        </div>
        <FiTrendingUp className={getTextColor(color)} size={24} />
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColorClasses(
            color
          )}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>

      {/* Percentage */}
      <p className="text-xs text-gray-500 mt-2">{Math.round(percentage)}%</p>
    </div>
  );
};

export default ScoreCard;
