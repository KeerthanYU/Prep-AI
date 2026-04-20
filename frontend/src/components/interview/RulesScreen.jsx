import React, { useContext } from 'react';
import { InterviewContext } from '../../context/InterviewContext';

const RulesScreen = () => {
  const { nextStep, prevStep } = useContext(InterviewContext);

  const rules = [
    { icon: '📝', title: 'Content', desc: 'Focus on providing detailed and accurate technical answers.' },
    { icon: '🗣️', title: 'Communication', desc: 'Speak clearly. Use the voice input for a more realistic experience.' },
    { icon: '⏱️', title: 'Pace', desc: 'Try to answer within 2-3 minutes per question.' },
    { icon: '🧘', title: 'Mindset', desc: 'Treat this like a real interview. Be confident!' },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Interview Guidelines</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-10">
        {rules.map((rule, idx) => (
          <div key={idx} className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <span className="text-3xl mb-3 block">{rule.icon}</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">{rule.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{rule.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={prevStep}
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-full transition"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg transform transition hover:scale-105"
        >
          I'm Ready, Let's Go
        </button>
      </div>
    </div>
  );
};

export default RulesScreen;
