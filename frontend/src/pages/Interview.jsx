import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiSend } from 'react-icons/fi';
import Header from '../components/Header';
import VoiceRecorder from '../components/VoiceRecorder';
import { InterviewContext } from '../context/InterviewContext';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const interviewContext = useContext(InterviewContext);
  const [domain, setDomain] = useState(location.state?.domain || 'Software Engineering');
  const [started, setStarted] = useState(false);
  const [answerType, setAnswerType] = useState('text'); // 'text' or 'voice'
  const [textAnswer, setTextAnswer] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const domains = ['Software Engineering', 'Marketing', 'Finance', 'HR'];

  const handleStartInterview = async () => {
    if (!domain) {
      setError('Please select a domain');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await apiService.post('/interviews/start', { domain });
      interviewContext.setCurrentInterview(response.data.interview.interviewId);
      interviewContext.setQuestions(response.data.interview.questions);
      interviewContext.setCurrentQuestionIndex(0);
      interviewContext.setAnswers([]);
      setStarted(true);
    } catch (err) {
      setError(err.error || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!textAnswer.trim() && !voiceTranscript.trim()) {
      setError('Please provide an answer');
      return;
    }

    const answer = answerType === 'text' ? textAnswer : voiceTranscript;

    setError('');
    setLoading(true);

    try {
      const response = await apiService.post('/interviews/submit-answer', {
        interviewId: interviewContext.currentInterview,
        questionIndex: interviewContext.currentQuestionIndex,
        userAnswer: answer,
        answerType,
      });

      interviewContext.addAnswer({
        question: interviewContext.questions[interviewContext.currentQuestionIndex],
        answer,
        evaluation: response.data.evaluation,
      });

      // Reset answer fields
      setTextAnswer('');
      setVoiceTranscript('');

      // Move to next question or complete
      if (
        interviewContext.currentQuestionIndex <
        interviewContext.questions.length - 1
      ) {
        interviewContext.goToNextQuestion();
      } else {
        // Complete interview
        await completeInterview();
      }
    } catch (err) {
      setError(err.error || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const completeInterview = async () => {
    try {
      const response = await apiService.post('/interviews/complete', {
        interviewId: interviewContext.currentInterview,
      });

      navigate(`/results/${interviewContext.currentInterview}`, {
        state: { result: response.data.result },
      });
    } catch (err) {
      setError(err.error || 'Failed to complete interview');
    }
  };

  if (!started) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-lg mx-auto">
            <div className="card">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Start New Interview
              </h1>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <p className="block text-sm font-medium text-gray-700 mb-2">Select Interview Domain</p>
                <div className="space-y-2">
                  {domains.map((d) => {
                    const domainId = `domain-${d.toLowerCase().replace(/\s+/g, '-')}`;
                    return (
                      <label key={d} htmlFor={domainId} className="flex items-center gap-3 cursor-pointer">
                        <input
                          id={domainId}
                          name="interview-domain"
                          type="radio"
                          value={d}
                          checked={domain === d}
                          onChange={(e) => setDomain(e.target.value)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-gray-900">{d}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {userProfile?.resume ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <p className="text-sm text-blue-800">
                    ✓ Resume uploaded: {userProfile.resume.fileName}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                  <p className="text-sm text-yellow-800">
                    💡 Tip: Upload your resume for personalized questions
                  </p>
                </div>
              )}

              <button
                onClick={handleStartInterview}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Starting...' : 'Start Interview'}
              </button>

              <div className="mt-4 text-center">
                <a
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  ← Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Interview in progress
  const currentQuestion =
    interviewContext.questions[interviewContext.currentQuestionIndex];

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">
              Question {interviewContext.currentQuestionIndex + 1} of{' '}
              {interviewContext.questions.length}
            </h2>
            <span className="text-sm text-gray-600">{domain}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{
                width: `${
                  ((interviewContext.currentQuestionIndex + 1) /
                    interviewContext.questions.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Question */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {currentQuestion}
          </h3>

          {/* Answer Type Selection */}
          <div className="mb-6 flex gap-4">
            <p className="sr-only">Choose answer method:</p>
            <label htmlFor="answer-type-text" className="flex items-center gap-2 cursor-pointer">
              <input
                id="answer-type-text"
                name="answer-type"
                type="radio"
                value="text"
                checked={answerType === 'text'}
                onChange={(e) => setAnswerType(e.target.value)}
                className="cursor-pointer"
              />
              <span className="text-gray-700">Type Answer</span>
            </label>
            <label htmlFor="answer-type-voice" className="flex items-center gap-2 cursor-pointer">
              <input
                id="answer-type-voice"
                name="answer-type"
                type="radio"
                value="voice"
                checked={answerType === 'voice'}
                onChange={(e) => setAnswerType(e.target.value)}
                className="cursor-pointer"
              />
              <span className="text-gray-700">Voice Answer</span>
            </label>
          </div>

          {/* Answer Input */}
          {answerType === 'text' ? (
            <div className="mb-6">
              <label htmlFor="text-answer" className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <textarea
                id="text-answer"
                name="textAnswer"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows="6"
                className="input resize-none"
              />
            </div>
          ) : (
            <VoiceRecorder
              onTranscriptChange={setVoiceTranscript}
              onRecordingChange={setIsRecording}
            />
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (interviewContext.currentQuestionIndex > 0) {
                  interviewContext.goToPreviousQuestion();
                  setTextAnswer('');
                  setVoiceTranscript('');
                }
              }}
              disabled={interviewContext.currentQuestionIndex === 0 || loading}
              className="btn btn-outline flex items-center gap-2"
            >
              <FiChevronLeft />
              Previous
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={loading || isRecording}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <FiSend />
              {loading
                ? 'Submitting...'
                : interviewContext.currentQuestionIndex ===
                  interviewContext.questions.length - 1
                ? 'Complete Interview'
                : 'Submit & Next'}
            </button>

            {interviewContext.currentQuestionIndex <
              interviewContext.questions.length - 1 && (
              <button
                onClick={() => {
                  interviewContext.goToNextQuestion();
                  setTextAnswer('');
                  setVoiceTranscript('');
                }}
                disabled={loading}
                className="btn btn-outline flex items-center gap-2"
              >
                Skip
                <FiChevronRight />
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Interview;
