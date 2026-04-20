import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { InterviewContext } from '../../context/InterviewContext';
import { useSpeechToText, useTextToSpeech } from '../../hooks/voiceHooks';

const InterviewScreen = () => {
  const {
    resumeData,
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
  const abortControllerRef = useRef(null);

  // 1. Initialize Interview on mount
  useEffect(() => {
    const startInterview = async () => {
      setLoading(true);
      try {
        const response = await axios.post('/api/interviews/start', {
          domain: resumeData.domain || 'Software Engineering',
          skills: resumeData.skills || []
        }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.success) {
          const session = response.data.data;
          setInterviewSession(session);
          setQuestions(session.questions);
          // Auto-read first question
          if (session.questions.length > 0) {
            setTimeout(() => speak(session.questions[0].text), 1000);
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
  }, [resumeData, setInterviewSession, setLoading, speak, stopSpeaking]);

  // 2. Sync transcript to answer box
  useEffect(() => {
    if (transcript) {
      setAnswer(prev => {
        // If we are appending or replacing. Let's replace for simplicity in voice mode
        return transcript;
      });
    }
  }, [transcript]);

  // 3. Handle Answer Submission
  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setIsSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];

    try {
      const response = await axios.post('/api/interviews/submit-answer', {
        interviewId: interviewSession.interviewId,
        questionText: currentQuestion.text,
        userAnswer: answer,
        answerType: isListening ? 'voice' : 'text'
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        // Clear for next question
        setAnswer('');
        setTranscript('');
        stopListening();

        if (currentQuestionIndex < questions.length - 1) {
          const nextIdx = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIdx);
          // Read next question automatically
          speak(questions[nextIdx].text);
        } else {
          // Interview complete
          handleComplete();
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/interviews/complete', {
        interviewId: interviewSession.interviewId
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setResults(response.data.data);
        nextStep(); // Move to Report screen
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
      <p className="text-gray-500">Generating your interview questions...</p>
    </div>
  );

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-fadeIn">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
            {currentQ.category}
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
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {currentQ.text}
        </h3>

        <div className="relative group">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here or use the microphone..."
            className="w-full h-48 p-6 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition resize-none text-gray-800 dark:text-gray-200 text-lg"
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

        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-2">
            <button 
                onClick={() => speak(currentQ.text)}
                className="p-2 text-gray-400 hover:text-indigo-600 transition"
                title="Replay Question"
            >
                🔊
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || isSubmitting}
            className={`px-12 py-4 rounded-2xl font-bold text-white shadow-xl transition transform active:scale-95 flex items-center gap-3 ${
              !answer.trim() || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
                currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Submit & Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;
