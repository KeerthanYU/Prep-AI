import React, { createContext, useState, useCallback } from 'react';

export const InterviewContext = createContext();

export const INTERVIEW_STEPS = {
  GREETING: 'greeting',
  RULES: 'rules',
  UPLOAD: 'upload',
  DIFFICULTY: 'difficulty',
  INTERVIEW: 'interview',
  REPORT: 'report'
};

export const InterviewProvider = ({ children }) => {
  // Navigation & Flow
  const [currentStep, setCurrentStep] = useState(INTERVIEW_STEPS.GREETING);
  
  // Data
  const [resumeData, setResumeData] = useState({ skills: [], experience_level: '', domain: '' });
  const [difficulty, setDifficulty] = useState('medium');
  const [interviewSession, setInterviewSession] = useState(null); // { id, questions: [] }
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState(null);
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetInterview = useCallback(() => {
    setCurrentStep(INTERVIEW_STEPS.GREETING);
    setResumeData({ skills: [], experience_level: '', domain: '' });
    setInterviewSession(null);
    setCurrentQuestionIndex(0);
    setResults(null);
    setError(null);
  }, []);

  const nextStep = () => {
    const steps = Object.values(INTERVIEW_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps = Object.values(INTERVIEW_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const value = {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    resumeData,
    setResumeData,
    difficulty,
    setDifficulty,
    interviewSession,
    setInterviewSession,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    results,
    setResults,
    loading,
    setLoading,
    error,
    setError,
    resetInterview
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
