import { createSlice } from '@reduxjs/toolkit';
import { registerUser, loginUser, logoutUser, tokenUtils } from '../api/auth.api';

const initialState = {
  user: null,
  isLoading: false,
  error: null,
  success: null,
  isAuthenticated: tokenUtils.checkAuth(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.success = null;
      state.error = null;
      // Remove token from localStorage
      tokenUtils.removeToken();
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      if (action.payload.token) {
        tokenUtils.setToken(action.payload.token);
      }
    },
    checkAuthStatus: (state) => {
      const isAuth = tokenUtils.checkAuth();
      state.isAuthenticated = isAuth;
      if (!isAuth) {
        state.user = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.success = 'Registration successful! Welcome to the game!';
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
        state.success = null;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.success = 'Login successful! Welcome back, forest guardian!';
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.success = null;
        state.isAuthenticated = false;
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.success = 'Logged out successfully';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Even if logout fails, clear local state
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload || 'Logout failed';
      });
  },
});

export const { clearError, clearSuccess, clearMessages, logout, setCredentials, checkAuthStatus } = authSlice.actions;
export default authSlice.reducer;