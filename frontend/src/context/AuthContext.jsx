import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import apiService from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitor Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);

        if (firebaseUser) {
          setUser(firebaseUser);

          // Get Firebase ID token and send it to backend to get JWT session token
          const firebaseToken = await firebaseUser.getIdToken();

          try {
            // Register/Login user with Firebase token
            const response = await apiService.post('/auth/login', {
              firebaseToken,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            });

            if (response.data.sessionToken) {
              setSessionToken(response.data.sessionToken);
              // Store session token in localStorage
              localStorage.setItem('sessionToken', response.data.sessionToken);
              // Set authorization header for future requests
              apiService.defaults.headers.common[
                'Authorization'
              ] = `Bearer ${response.data.sessionToken}`;
            }

            if (response.data.user) {
              setUserProfile(response.data.user);
            }
          } catch (apiError) {
            console.error('Backend auth error:', apiError);
            setError(apiError.response?.data?.message || 'Authentication failed');
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setSessionToken(null);
          localStorage.removeItem('sessionToken');
          delete apiService.defaults.headers.common['Authorization'];
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setSessionToken(null);
      localStorage.removeItem('sessionToken');
      delete apiService.defaults.headers.common['Authorization'];
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
    }
  };

  const value = {
    user,
    userProfile,
    sessionToken,
    loading,
    error,
    logout,
    isAuthenticated: !!user && !!sessionToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
