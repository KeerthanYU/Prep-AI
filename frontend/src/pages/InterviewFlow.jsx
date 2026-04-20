import React, { useContext } from 'react';
import { InterviewContext, INTERVIEW_STEPS } from '../context/InterviewContext';
import GreetingScreen from '../components/interview/GreetingScreen';
import RulesScreen from '../components/interview/RulesScreen';
import ResumeUploadScreen from '../components/interview/ResumeUploadScreen';
import InterviewScreen from '../components/interview/InterviewScreen';
import ReportScreen from '../components/interview/ReportScreen';

const InterviewFlow = () => {
    const { currentStep, loading, error, setError } = useContext(InterviewContext);

    const renderStep = () => {
        switch (currentStep) {
            case INTERVIEW_STEPS.GREETING:
                return <GreetingScreen />;
            case INTERVIEW_STEPS.RULES:
                return <RulesScreen />;
            case INTERVIEW_STEPS.UPLOAD:
                return <ResumeUploadScreen />;
            case INTERVIEW_STEPS.INTERVIEW:
                return <InterviewScreen />;
            case INTERVIEW_STEPS.REPORT:
                return <ReportScreen />;
            default:
                return <GreetingScreen />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-20 transition-colors duration-500">
            {/* Main Content Area */}
            <main className="container mx-auto px-4 py-10 relative">
                {/* Error Banner */}
                {error && (
                    <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl relative">
                        <span className="block sm:inline">{error}</span>
                        <button 
                            className="absolute right-4 top-4"
                            onClick={() => setError(null)}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Global loading overlay for whole-page state changes (if needed) */}
                {loading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                            <h2 className="text-xl font-bold dark:text-white">Connecting with AI...</h2>
                        </div>
                    </div>
                )}

                {/* The Current Step */}
                <div className="transition-all duration-700 ease-in-out">
                    {renderStep()}
                </div>
            </main>

            {/* Subtle Footer Decor */}
            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50"></div>
        </div>
    );
};

export default InterviewFlow;
