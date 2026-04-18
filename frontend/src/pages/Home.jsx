import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBarChart, FiUsers, FiZap } from 'react-icons/fi';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Personal AI Interview Coach
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            PrepMate AI provides free, personalized mock interviews tailored to your experience. 
            Get instant feedback, track progress, and ace your next interview.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            {isAuthenticated ? (
              <>
                <Link to="/interview" className="btn btn-primary">
                  Start Interview
                  <FiArrowRight className="inline ml-2" />
                </Link>
                <Link to="/dashboard" className="btn btn-outline">
                  View Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">
                  Get Started
                  <FiArrowRight className="inline ml-2" />
                </Link>
              </>
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="card text-left">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FiZap className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered Questions
              </h3>
              <p className="text-gray-600">
                Get interview questions tailored to your resume and domain in Software, Marketing, 
                Finance, or HR roles.
              </p>
            </div>

            <div className="card text-left">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FiBarChart className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Instant Feedback
              </h3>
              <p className="text-gray-600">
                Receive scores on Content, Communication, and Confidence with personalized coaching feedback.
              </p>
            </div>

            <div className="card text-left">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FiUsers className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600">
                Monitor your Interview Readiness Score and see how you improve with every session.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            How PrepMate AI Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Select Domain', desc: 'Choose from SWE, Marketing, Finance, or HR' },
              { step: 2, title: 'Upload Resume', desc: 'Personalize questions based on your experience' },
              { step: 3, title: 'Answer Questions', desc: 'Speak or type your responses' },
              { step: 4, title: 'Get Feedback', desc: 'Receive scores and AI-generated coaching' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Excel in Your Next Interview?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of students preparing smarter interviews with PrepMate AI
          </p>

          {!isAuthenticated && (
            <Link to="/login" className="btn btn-primary">
              Start Free Today
            </Link>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p>&copy; 2024 PrepMate AI. Empowering every student to succeed.</p>
        </div>
      </footer>
    </>
  );
};

export default Home;
