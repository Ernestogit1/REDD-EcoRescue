import { createSlice } from '@reduxjs/toolkit';
import { getUserStats, getGameStats, getOverallAnalytics } from '../api/admin.api';

const initialState = {
  selectedDateRange: '30days',
  selectedGame: 'all',
  chartType: 'line',
  isLoading: false,
  error: null,
  userStats: null,
  gameStats: null,
  overallStats: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.selectedDateRange = action.payload;
    },
    setSelectedGame: (state, action) => {
      state.selectedGame = action.payload;
    },
    setChartType: (state, action) => {
      state.chartType = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // User Stats cases
      .addCase(getUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userStats = action.payload;
        state.error = null;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch user stats';
      })
      // Game Stats cases
      .addCase(getGameStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGameStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gameStats = action.payload;
        state.error = null;
      })
      .addCase(getGameStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch game stats';
      })
      // Overall Analytics cases
      .addCase(getOverallAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOverallAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overallStats = action.payload;
        state.error = null;
      })
      .addCase(getOverallAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch overall analytics';
      });
  },
});

export const {
  setDateRange,
  setSelectedGame,
  setChartType,
  setLoading,
  setError,
  clearError,
} = adminSlice.actions;

export default adminSlice.reducer;