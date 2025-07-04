import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { registerUser } from '../../store/api/auth.api';
import { clearError, clearSuccess, clearMessages } from '../../store/slices/auth.slice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const register = useCallback(async (userData) => {
    return await dispatch(registerUser(userData));
  }, [dispatch]);

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
    register,
    clearAuthError,
    clearAuthSuccess,
    clearAuthMessages,
  };
};