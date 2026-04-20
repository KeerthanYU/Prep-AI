import React, { useState, useEffect, useContext, useRef } from 'react';
import apiService from '../../services/apiService';
import { InterviewContext } from '../../context/InterviewContext';
import { useSpeechToText, useTextToSpeech } from '../../hooks/voiceHooks';

const InterviewScreen = () => {
  const {
    resumeData,
    difficulty,
    interviewSession,
    setInterviewSession,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    setResults,
    nextStep,
    setLoading
  } = useContext(InterviewContext);

  const { isListening, transcript, setTranscript, startListening, stopListening } = useSpeechToText();
  const { speak, stopSpeaking } = useTextToSpeech();
  
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const abortControllerRef = useRef(null);

  // 1. Initialize Interview on mount
  useEffect(() => {
    const startInterview = async () => {
      setLoading(true);
      try {
        const response = await apiService.post('/interviews/start', {
          domain: resumeData.domain || 'Software Engineering',
          skills: resumeData.skills || [],
          difficulty: difficulty || 'medium'
        });

        if (response.data.success) {
          const session = response.data.data;
          
          // Flatten sections into a single array for the main flow
          const flatQuestions = [
            ...(session.questions.mcq || []),
            ...(session.questions.descriptive || []),
            ...(session.questions.aptitude || [])
          ];

          setInterviewSession(session);
          setQuestions(flatQuestions);
          
          // Auto-read first question
          if (flatQuestions.length > 0) {
            setTimeout(() => speak(flatQuestions[0].text), 1000);
          }
        }
      } catch (err) {
        console.error('Failed to start interview:', err);
      } finally {
        setLoading(false);
      }
    };

    startInterview();

    return () => {
        stopSpeaking();
        if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [resumeData, difficulty, setInterviewSession, setLoading, speak, stopSpeaking]);

  // 2. Sync transcript to answer box
  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

  // 3. Handle Answer Submission
  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setIsSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];

    try {
      const response = await apiService.post('/interviews/submit-answer', {
        interviewId: interviewSession.interviewId,
        questionText: currentQuestion.text,
        userAnswer: answer,
        answerType: isListening ? 'voice' : 'text'
      });

      if (response.data.success) {
        setLastFeedback(response.data.data);
        
        // For Aptitude questions, show explanation before moving on
        if (currentQuestion.type === 'aptitude') {
          setShowExplanation(true);
          speak(response.data.data.feedback);
        } else {
          handleNext();
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setAnswer('');
    setTranscript('');
    stopListening();
    setShowExplanation(false);
    setLastFeedback(null);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      speak(questions[nextIdx].text);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await apiService.post('/interviews/complete', {
        interviewId: interviewSession.interviewId
      });

      if (response.data.success) {
        setResults(response.data.data);
        nextStep(); 
      }
    } catch (err) {
      console.error('Completion error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (questions.length === 0) return (
    <div className="flex flex-col items-center justify-center p-20">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500">Generating your {difficulty} assessment...</p>
    </div>
  );

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-fadeIn">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">
            {currentQ.type?.toUpperCase()} Assessment • Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-xs text-gray-400 font-bold px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
            {difficulty.toUpperCase()}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-500 ease-out" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Interview Area */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        
        {/* Section Label Ribbon */}
        <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transform rotate-0 rounded-bl-xl shadow-lg">
           Section: {currentQ.type === 'mcq' ? 'Technical MCQ' : currentQ.type === 'aptitude' ? 'Logic & Aptitude' : 'Descriptive Technical'}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 mt-4 leading-tight">
          {currentQ.text}
        </h3>

        {/* --- QUESTION TYPE RENDERER --- */}
        <div className="space-y-6">
          {(currentQ.type === 'mcq' || currentQ.type === 'aptitude') ? (
            <div className="grid grid-cols-1 gap-4">
              {currentQ.options?.map((opt, i) => (
                <button
                  key={i}
                  disabled={showExplanation || isSubmitting}
                  onClick={() => setAnswer(opt)}
                  className={`p-5 text-left rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                    answer === opt 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                      : 'border-gray-100 dark:border-gray-800 hover:border-indigo-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-400'
                  } ${showExplanation ? 'opacity-50' : ''}`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    answer === opt ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-medium">{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="relative group">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here or use the microphone..."
                className="w-full h-56 p-6 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition resize-none text-gray-800 dark:text-gray-200 text-lg"
              />
              
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                 {isListening && (
                   <span className="flex items-center gap-2 text-xs font-bold text-red-500 animate-pulse">
                     <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                     LISTENING
                   </span>
                 )}
                 <button
                   onClick={isListening ? stopListening : startListening}
                   className={`p-4 rounded-full shadow-lg transition transform active:scale-90 ${
                     isListening 
                       ? 'bg-red-500 hover:bg-red-600 text-white' 
                       : 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 hover:scale-110'
                   }`}
                 >
                   {isListening ? '⏹️' : '🎤'}
                 </button>
              </div>
            </div>
          )}
        </div>

        {/* Explanation Area (for Aptitude) */}
        {showExplanation && (
          <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600 rounded-2xl animate-slideUp">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
              <span>💡</span> Explanation
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
               {lastFeedback?.feedback}
            </p>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-8">
          <div className="flex gap-2">
            <button 
                onClick={() => speak(currentQ.text)}
                className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-indigo-600 rounded-xl transition"
                title="Replay Question"
            >
                🔊 Listen Again
            </button>
          </div>

          {showExplanation ? (
             <button
                onClick={handleNext}
                className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:bg-indigo-700 transition transform hover:scale-105 active:scale-95"
             >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Assessment' : 'Next Question →'}
             </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || isSubmitting}
              className={`px-12 py-4 rounded-2xl font-black text-white shadow-xl transition transform active:scale-95 flex items-center gap-3 ${
                !answer.trim() || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 hover:scale-[1.02]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Evaluating...
                </>
              ) : (
                  currentQ.type === 'aptitude' ? 'Submit Choice' : currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Submit Answer'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;
