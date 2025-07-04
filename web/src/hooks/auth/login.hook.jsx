import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { loginUser } from '../../store/api/auth.api';
import { clearError, clearSuccess, clearMessages } from '../../store/slices/auth.slice';

export const useLogin = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const login = useCallback(async (credentials) => {
    return await dispatch(loginUser(credentials));
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
    login,
    clearAuthError,
    clearAuthSuccess,
    clearAuthMessages,
  };
};