import React, { useContext } from 'react';
import { InterviewContext } from '../../context/InterviewContext';

const DifficultySelectionScreen = () => {
  const { difficulty, setDifficulty, nextStep } = useContext(InterviewContext);

  const levels = [
    {
      id: 'easy',
      title: 'Easy',
      description: 'Ideal for entry-level roles. Focuses on fundamental concepts and simple logic.',
      icon: '🌱',
      color: 'border-green-200 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400',
      activeColor: 'ring-4 ring-green-500/20 border-green-500 bg-green-100 dark:bg-green-900/30'
    },
    {
      id: 'medium',
      title: 'Medium',
      description: 'Practical application and moderate problem solving. Perfect for mid-level professionals.',
      icon: '⚡',
      color: 'border-blue-200 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400',
      activeColor: 'ring-4 ring-blue-500/20 border-blue-500 bg-blue-100 dark:bg-blue-900/30'
    },
    {
      id: 'hard',
      title: 'Hard',
      description: 'Advanced architecture, tricky logic, and scenario-based questions for seniors.',
      icon: '🔥',
      color: 'border-purple-200 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-400',
      activeColor: 'ring-4 ring-purple-500/20 border-purple-500 bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 animate-fadeIn max-w-4xl mx-auto w-full">
      <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 text-center">Choose Difficulty</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-10 text-center max-w-lg">
        The AI will adapt its questions and evaluation criteria based on your selection.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setDifficulty(level.id)}
            className={`flex flex-col items-center p-8 rounded-3xl border-2 transition-all duration-300 transform hover:scale-105 text-left h-full ${
              difficulty === level.id 
                ? level.activeColor 
                : `${level.color} hover:shadow-xl`
            }`}
          >
            <span className="text-5xl mb-6">{level.icon}</span>
            <h3 className="text-xl font-bold mb-3">{level.title}</h3>
            <p className="text-sm opacity-80 leading-relaxed text-center">
              {level.description}
            </p>
            
            {difficulty === level.id && (
              <div className="mt-6 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={nextStep}
        className="mt-12 px-16 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-2xl transition transform hover:scale-105 active:scale-95 text-lg"
      >
        Continue to Interview
      </button>
    </div>
  );
};

export default DifficultySelectionScreen;
