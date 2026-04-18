import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import Header from '../components/Header';
import authService from '../services/authService';
import apiService from '../services/apiService';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authService.register(
        formData.email,
        formData.password,
        formData.displayName
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto">
          <div className="card">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`pb-4 font-medium border-b-2 transition-colors ${
                  isLogin
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`pb-4 font-medium border-b-2 transition-colors ${
                  !isLogin
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Register
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={isLogin ? handleLogin : handleRegister}
              className="space-y-4"
            >
              {!isLogin && (
                <div>
                  <label className="label">
                    <FiUser className="inline mr-2" />
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="input"
                    required
                  />
                </div>
              )}

              <div>
                <label className="label">
                  <FiMail className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <FiLock className="inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input"
                  required
                  minLength="6"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="label">
                    <FiLock className="inline mr-2" />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading
                  ? 'Loading...'
                  : isLogin
                  ? 'Login to PrepMate'
                  : 'Create Account'}
              </button>
            </form>

            {/* Back to home */}
            <div className="mt-6 text-center">
              <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm">
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Features Reminder */}
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p className="mb-4">✨ Free, AI-powered interview coaching</p>
            <p>No credit card required. Start practicing now!</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Login;
