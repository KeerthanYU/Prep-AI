const calculateScore = (contentScore, communicationScore, confidenceScore) => {
  return Math.round((contentScore + communicationScore + confidenceScore) / 3);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

const calculateDifficulty = (performanceScore) => {
  if (performanceScore < 40) return 'easy';
  if (performanceScore < 70) return 'medium';
  return 'hard';
};

const generateSessionTitle = (domain, date) => {
  return `${domain} Interview - ${formatDate(date)}`;
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  calculateScore,
  formatDate,
  formatTime,
  calculateDifficulty,
  generateSessionTitle,
  asyncHandler,
};
