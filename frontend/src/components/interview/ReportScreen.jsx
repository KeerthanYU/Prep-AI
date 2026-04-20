import React, { useContext } from 'react';
import { InterviewContext } from '../../context/InterviewContext';

const ReportScreen = () => {
  const { results, resetInterview } = useContext(InterviewContext);

  if (!results) return null;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 animate-fadeIn pb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Your Performance Report</h2>
        <p className="text-gray-500 dark:text-gray-400">Great job completing the session! Here's a breakdown of your results.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl flex flex-col items-center border border-indigo-50">
           <span className="text-sm font-bold text-gray-400 uppercase mb-2">Overall Score</span>
           <div className="text-6xl font-black text-indigo-600">{results.overallScore}%</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl flex flex-col items-center border border-indigo-50">
           <span className="text-sm font-bold text-gray-400 uppercase mb-2">Total Questions</span>
           <div className="text-6xl font-black text-purple-600">{results.totalQuestions}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl flex flex-col items-center border border-indigo-50">
           <span className="text-sm font-bold text-gray-400 uppercase mb-2">Status</span>
           <div className="text-3xl font-black text-green-500 mt-4 uppercase">Success</div>
        </div>
      </div>

      {/* Breakdown */}
      <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Question-wise Feedback</h3>
      <div className="space-y-8">
        {results.answers.map((ans, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 border-l-8 border-indigo-500">
            <div className="flex justify-between items-start mb-4">
              <span className="text-lg font-bold text-gray-900 dark:text-white max-w-2xl">{ans.questionText}</span>
              <span className={`px-4 py-1 rounded-full text-white font-bold text-sm ${ans.overallScore > 70 ? 'bg-green-500' : 'bg-orange-500'}`}>
                {ans.overallScore}%
              </span>
            </div>
            
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-400 uppercase mb-2">Your Answer</p>
              <p className="text-gray-700 dark:text-gray-300 italic">"{ans.userAnswer}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase mb-2">Feedback</p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{ans.feedback}</p>
              </div>
              {ans.improvements && ans.improvements.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase mb-2">Key Improvements</p>
                  <ul className="list-disc list-inside space-y-1 text-indigo-600 dark:text-indigo-400">
                    {ans.improvements.map((imp, i) => (
                      <li key={i} className="text-sm">{imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <button
          onClick={resetInterview}
          className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-2xl transition hover:scale-105 active:scale-95"
        >
          Start New Practice Session
        </button>
      </div>
    </div>
  );
};

export default ReportScreen;
