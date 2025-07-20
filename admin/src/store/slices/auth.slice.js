import { createSlice } from '@reduxjs/toolkit';
import { adminLogin, adminLogout, adminTokenUtils } from '../api/auth.api';

const initialState = {
  user: null,
  isLoading: false,
  error: null,
  success: null,
  isAuthenticated: adminTokenUtils.checkAuth(),
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
      adminTokenUtils.removeToken();
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      if (action.payload.token) {
        adminTokenUtils.setToken(action.payload.token);
      }
    },
    checkAuthStatus: (state) => {
      const isAuth = adminTokenUtils.checkAuth();
      state.isAuthenticated = isAuth;
      if (!isAuth) {
        state.user = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin Login cases
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.success = 'Admin login successful!';
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Admin login failed';
        state.success = null;
        state.isAuthenticated = false;
      })
      // Admin Logout cases
      .addCase(adminLogout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.success = 'Admin logged out successfully';
      })
      .addCase(adminLogout.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload || 'Admin logout failed';
      });
  },
});

export const { clearError, clearSuccess, clearMessages, logout, setCredentials, checkAuthStatus } = authSlice.actions;
export default authSlice.reducer;