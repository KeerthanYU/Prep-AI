import React, { createContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===============================
  // 🔐 HYDRATE USER ON APP LOAD
  // ===============================
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      setLoading(false);
      return;
    }

    // Prepare API service with existing token
    apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    apiService
      .get('/auth/me')
      .then((res) => {
        // Backend should return { user: { ... } } or { data: { user: { ... } } }
        const userData = res.data?.user || res.data?.data?.user || res.data?.data;
        setUser(userData || null);
      })
      .catch((err) => {
        console.error('>>> [AUTH DEBUG] Rehydration failed:', err);
        localStorage.removeItem('authToken');
        delete apiService.defaults.headers.common['Authorization'];
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ===============================
  // 🔑 CENTRAL AUTH SETTER (Atomic)
  // ===============================
  const saveAuthData = (token, userData) => {
    console.log('>>> [AUTH DEBUG] Atomic Save:', { hasToken: !!token, hasUser: !!userData });

    if (token) {
      localStorage.setItem('authToken', token);
      apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    if (userData) {
      setUser(userData);
    }
  };

  // ===============================
  // 🧾 EMAIL LOGIN
  // ===============================
  const login = async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      const res = await apiService.post('/auth/login', { email, password });

      // Normalize different backend response shapes
      const token = res.data.token || res.data.accessToken || res.data.data?.token;
      const userData = res.data.user || res.data.data?.user || res.data.data;

      if (!token) throw new Error('Token missing from server response');

      saveAuthData(token, userData);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🌐 GOOGLE LOGIN
  // ===============================
  const googleLogin = async (idToken) => {
    setError(null);
    setLoading(true);

    try {
      const res = await apiService.post('/auth/google-login', { idToken });

      const token = res.data.token || res.data.accessToken || res.data.data?.token;
      const userData = res.data.user || res.data.data?.user || res.data.data;

      if (!token) throw new Error('Token missing from server response');

      saveAuthData(token, userData);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🧾 SIGNUP
  // ===============================
  const signup = async (email, password, name) => {
    setError(null);
    setLoading(true);

    try {
      const res = await apiService.post('/auth/signup', { email, password, name });

      const token = res.data.token || res.data.accessToken || res.data.data?.token;
      const userData = res.data.user || res.data.data?.user || res.data.data;

      saveAuthData(token, userData);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    delete apiService.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      error,
      setError,
      login,
      signup,
      googleLogin,
      logout,
      isAuthenticated: !!localStorage.getItem('authToken'), // Derived purely from token existence
    }}>
      {children}
    </AuthContext.Provider>
  );
};