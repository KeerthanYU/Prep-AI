import React, { createContext, useState } from 'react';

export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [currentInterview, setCurrentInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetInterview = () => {
    setCurrentInterview(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsRecording(false);
    setError(null);
  };

  const addAnswer = (answer) => {
    setAnswers([...answers, answer]);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const value = {
    currentInterview,
    setCurrentInterview,
    questions,
    setQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    addAnswer,
    isRecording,
    setIsRecording,
    interviewHistory,
    setInterviewHistory,
    loading,
    setLoading,
    error,
    setError,
    goToNextQuestion,
    goToPreviousQuestion,
    resetInterview,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
