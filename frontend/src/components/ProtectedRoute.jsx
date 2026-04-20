import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (isAuthenticated()) {
    return children;
  }

  // If no token, redirect to signup
  return <Navigate to="/signup" replace state={{ from: location }} />;
};

export default ProtectedRoute;
