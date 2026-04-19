import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { useLocation } from 'react-router-dom';
import { auth, createGoogleProvider } from '../config/firebase';
import { FiLoader } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import Header from '../components/Header';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handle Google Sign-In
   */
  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);

      const provider = createGoogleProvider();

      try {
        await signInWithPopup(auth, provider);
        // onAuthStateChanged will handle backend exchange and navigation
      } catch (popupError) {
        // If popup is blocked or not supported, fallback to redirect flow
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/operation-not-supported-in-this-environment' ||
          popupError.code === 'auth/failed-precondition'
        ) {
          try {
            // Persist intended redirect so it survives full-page redirect flows
            const fromPath = location.state?.from?.pathname || '/dashboard';
            localStorage.setItem('postLoginRedirect', fromPath);
            await signInWithRedirect(auth, provider);
            // Redirect will navigate away; handle post-redirect in auth context
            return;
          } catch (redirectError) {
            console.error('Redirect sign-in failed:', redirectError);
            setError(redirectError.message || 'Google sign-in failed');
          }
        } else {
          throw popupError;
        }
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked. Please allow popups and try again.');
      } else {
        setError(err.message || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                PrepMate AI
              </h1>
              <p className="text-gray-600">
                Your Personal Interview Coach
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={20} />
                  Signing in...
                </>
              ) : (
                <>
                  <FcGoogle size={20} />
                  Sign in with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Secure & Fast
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-5 w-5 rounded-md bg-blue-500 text-white text-sm font-bold">
                    ✓
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Secure Firebase Auth:</strong> Your credentials are protected
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-5 w-5 rounded-md bg-blue-500 text-white text-sm font-bold">
                    ✓
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>AI-Powered Feedback:</strong> Get instant interview feedback
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-5 w-5 rounded-md bg-blue-500 text-white text-sm font-bold">
                    ✓
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Track Progress:</strong> Monitor your improvement over time
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                By signing in, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                  Privacy Policy
                </a>
              </p>
            </div>

            {/* Back to home */}
            <div className="mt-6 text-center pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p className="mb-2">🎯 Free AI-powered interview coaching</p>
            <p className="mb-4">Start practicing and ace your interviews</p>
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-800">
              Production-Grade Security • Real-Time Feedback • Analytics Dashboard
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Login;
