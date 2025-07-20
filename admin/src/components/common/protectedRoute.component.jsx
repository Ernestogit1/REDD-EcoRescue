import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { checkAuthStatus } from '../../store/slices/auth.slice';
import AdminSpinner from './spinner.component';

const AdminProtectedRoute = ({ children, isPublic = false, redirectTo = '/login' }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) {
    return <AdminSpinner />;
  }

  if (isPublic) {
    // Public routes - redirect authenticated admins away from auth pages
    if (isAuthenticated) {
      return <Navigate to={redirectTo} replace />;
    }
    return children;
  }

  // Private routes - redirect unauthenticated admins to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;