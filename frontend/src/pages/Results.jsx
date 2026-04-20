import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { FiDownload, FiShare2 } from 'react-icons/fi';
import Header from '../components/Header';
import ScoreCard from '../components/ScoreCard';
import apiService from '../services/apiService';

const Results = () => {
  const { interviewId } = useParams();
  const location = useLocation();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.result) {
      // Use result from location state if available
      setInterview(location.state.result);
      setLoading(false);
    } else {
      // Fetch interview details from backend
      fetchInterviewDetails();
    }
  }, [interviewId, location.state]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/interviews/${interviewId}`);
      setInterview(response.data.interview);
    } catch (err) {
      setError(err.error || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading results...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div
            className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </div>
          <div className="mt-4">
            <Link to="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleDownload = () => {
    // Generate PDF or download results
    const resultsText = `
Interview Results - ${interview.domain}
=====================================

Overall Score: ${interview.overallScore}/100
Duration: ${Math.floor(interview.duration / 60)}m ${interview.duration % 60}s

Scores by Category:
- Content: ${interview.averageContentScore}/100
- Communication: ${interview.averageCommunicationScore}/100
- Confidence: ${interview.averageConfidenceScore}/100

Questions Answered: ${interview.answers?.length || 0}

For detailed feedback, visit PrepMate AI dashboard.
    `;

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,\n' + encodeURIComponent(resultsText)
    );
    element.setAttribute('download', `interview-results-${interviewId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Results</h1>
          <p className="text-gray-600">
            {interview.domain} • {new Date(interview.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Main Score */}
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 mb-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Overall Performance</p>
            <p className="text-6xl font-bold text-blue-600 mb-4">
              {interview.overallScore}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 max-w-xs mx-auto">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                style={{
                  width: `${(interview.overallScore / 100) * 100}%`,
                }}
              ></div>
            </div>
            <p className="text-gray-600 mt-4">
              Duration: {Math.floor(interview.duration / 60)}m{' '}
              {interview.duration % 60}s
            </p>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <ScoreCard
            title="Content"
            score={interview.averageContentScore}
            color="blue"
          />
          <ScoreCard
            title="Communication"
            score={interview.averageCommunicationScore}
            color="purple"
          />
          <ScoreCard
            title="Confidence"
            score={interview.averageConfidenceScore}
            color="green"
          />
        </div>

        {/* Answers Review */}
        {interview.answers && interview.answers.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Answers Review
            </h2>
            <div className="space-y-6">
              {interview.answers.map((answer, idx) => (
                <div key={idx} className="border-b pb-6 last:border-b-0">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Question {idx + 1}
                    </p>
                    <p className="text-gray-900 font-medium">
                      {answer.questionText}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Your Answer
                    </p>
                    <p className="text-gray-900">{answer.userAnswer}</p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                       Feedback {answer.score === 100 ? '✅' : '❌'}
                    </p>
                    <p className="text-blue-800 dark:text-blue-200">{answer.feedback}</p>
                    
                    {/* New: Logic Explanation for MCQs/Aptitude */}
                    {answer.feedback && answer.feedback.includes('correct answer was') && (
                      <div className="mt-2 p-3 bg-white/50 dark:bg-black/20 rounded border border-blue-200 dark:border-blue-800 text-sm">
                        <span className="font-bold">Pro Tip:</span> Re-read the question carefully and check the reasoning provided above.
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Content</p>
                      <p className="font-bold text-gray-900">
                        {answer.contentScore}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Communication</p>
                      <p className="font-bold text-gray-900">
                        {answer.communicationScore}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Confidence</p>
                      <p className="font-bold text-gray-900">
                        {answer.confidenceScore}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={handleDownload}
            className="btn btn-outline flex items-center gap-2"
          >
            <FiDownload />
            Download Results
          </button>
          <button
            onClick={() => {
              navigator.share?.({
                title: 'PrepMate AI Interview Results',
                text: `I scored ${interview.overallScore}/100 on my ${interview.domain} interview!`,
              });
            }}
            className="btn btn-outline flex items-center gap-2"
          >
            <FiShare2 />
            Share
          </button>
        </div>

        {/* CTA */}
        <div className="card bg-gradient-to-r from-purple-50 to-blue-50 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Keep Improving!
          </h3>
          <p className="text-gray-600 mb-6">
            Practice regularly to boost your Interview Readiness Score
          </p>
          <Link to="/interview" className="btn btn-primary">
            Start Another Interview
          </Link>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </>
  );
};

export default Results;
