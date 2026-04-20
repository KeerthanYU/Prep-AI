import React, { useContext } from 'react';
import { InterviewContext } from '../../context/InterviewContext';

const GreetingScreen = () => {
  const { nextStep } = useContext(InterviewContext);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
      <div className="w-24 h-24 mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
        <span className="text-4xl">👋</span>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Ready for your next big opportunity?
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-10 leading-relaxed">
        PrepMate AI is here to help you practice with realistic, high-quality interview questions tailored to your experience.
      </p>
      <button
        onClick={nextStep}
        className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg transform transition hover:scale-105 active:scale-95"
      >
        Start Interview Prep
      </button>
    </div>
  );
};

export default GreetingScreen;
