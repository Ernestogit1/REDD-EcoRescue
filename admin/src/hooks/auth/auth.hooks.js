import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, adminLogout } from '../../store/api/auth.api';
import { clearError, clearSuccess, clearMessages } from '../../store/slices/auth.slice';

export const useAdminAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth);

  // Handle navigation after successful login
  useEffect(() => {
    if (authState.isAuthenticated && authState.success) {
      navigate('/dashboard');
    }
  }, [authState.isAuthenticated, authState.success, navigate]);

  const login = useCallback(async (credentials) => {
    return await dispatch(adminLogin(credentials));
  }, [dispatch]);

  const logout = useCallback(async () => {
    const result = await dispatch(adminLogout());
    if (adminLogout.fulfilled.match(result)) {
      navigate('/login');
    }
    return result;
  }, [dispatch, navigate]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearAuthSuccess = useCallback(() => {
    dispatch(clearSuccess());
  }, [dispatch]);

  const clearAuthMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    ...authState,
    login,
    logout,
    clearAuthError,
    clearAuthSuccess,
    clearAuthMessages,
  };
};