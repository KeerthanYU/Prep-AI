import React, { createContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Try to fetch current user
      apiService
        .get('/auth/me')
        .then((res) => {
          setUser(res.data?.user || null);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
          delete apiService.defaults.headers.common['Authorization'];
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signup = async (email, password, name) => {
    setError(null);
    try {
      const res = await apiService.post('/auth/signup', {
        email,
        password,
        name,
      });

      if (res.data?.token) {
        localStorage.setItem('authToken', res.data.token);
        apiService.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }

      if (res.data?.user) {
        setUser(res.data.user);
      }

      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await apiService.post('/auth/login', {
        email,
        password,
      });

      if (res.data?.token) {
        localStorage.setItem('authToken', res.data.token);
        apiService.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }

      if (res.data?.user) {
        setUser(res.data.user);
      }

      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      throw err;
    }
  };

  const googleLogin = async (email, name, photoURL) => {
    setError(null);
    try {
      const res = await apiService.post('/auth/google-login', {
        email,
        name,
        photoURL,
      });

      if (res.data?.token) {
        localStorage.setItem('authToken', res.data.token);
        apiService.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }

      if (res.data?.user) {
        setUser(res.data.user);
      }

      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Google login failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    delete apiService.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    loading,
    error,
    setError,
    signup,
    login,
    googleLogin,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

