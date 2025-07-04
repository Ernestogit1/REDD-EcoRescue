import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { checkAuthStatus } from '../../store/slices/auth.slice';

const ProtectedRoute = ({ children, isPublic = false, redirectTo = '/login' }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status on mount
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isPublic) {
    // Public routes - redirect authenticated users away from auth pages
    if (isAuthenticated) {
      return <Navigate to={redirectTo} replace />;
    }
    return children;
  }

  // Private routes - redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;