import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const location = useLocation();

  // Simple token check: Source of truth for routing
  if (token) {
    return children;
  }

  // If no token, always redirect to login
  return <Navigate to="/login" replace state={{ from: location }} />;
};

export default ProtectedRoute;
