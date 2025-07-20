import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserStats, getGameStats, getOverallAnalytics } from '../../../store/api/admin.api';

export const useAnalytics = () => {
  const dispatch = useDispatch();
  const [chartData, setChartData] = useState({
    userRegistration: { labels: [], datasets: [] },
    gamePopularity: { labels: [], datasets: [] },
    rankDistribution: { labels: [], datasets: [] },
    difficultyPerformance: { labels: [], datasets: [] },
    colors: {}
  });
  
  const { 
    userStats, 
    gameStats, 
    overallStats, 
    isLoading, 
    error 
  } = useSelector((state) => state.admin);

  useEffect(() => {
    // Fetch all analytics data
    dispatch(getUserStats());
    dispatch(getGameStats());
    dispatch(getOverallAnalytics());
  }, [dispatch]);

  useEffect(() => {
    // Always process chart data, even with empty data
    processChartData();
  }, [userStats, gameStats, overallStats]);

  const processChartData = () => {
    const colors = {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      danger: '#EF4444',
      purple: '#8B5CF6',
      pink: '#EC4899',
      indigo: '#6366F1',
      teal: '#14B8A6'
    };

    // User Registration Chart Data
    const userRegistrationData = {
      labels: userStats?.userRegistrations?.map(item => item._id) || [],
      datasets: [{
        label: 'New Users',
        data: userStats?.userRegistrations?.map(item => item.count) || [],
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}20`,
        fill: true,
        tension: 0.4
      }]
    };

    // Game Popularity Chart Data
    const gamePopularityData = {
      labels: ['Memory Card', 'Jigsaw Puzzle', 'Matching Game', 'Coloring'],
      datasets: [{
        data: [
          gameStats?.gamePopularity?.memoryCard || 0,
          gameStats?.gamePopularity?.jigsawPuzzle || 0,
          gameStats?.gamePopularity?.matching || 0,
          gameStats?.gamePopularity?.coloring || 0
        ],
        backgroundColor: [colors.primary, colors.secondary, colors.accent, colors.purple],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };

    // User Rank Distribution
    const rankData = {
      labels: userStats?.rankDistribution?.map(item => item._id) || ['No Data'],
      datasets: [{
        data: userStats?.rankDistribution?.map(item => item.count) || [0],
        backgroundColor: [colors.secondary, colors.accent, colors.danger, colors.purple],
        borderWidth: 0
      }]
    };

    // Game Difficulty Performance
    const difficultyData = {
      labels: ['Easy', 'Medium', 'Hard'],
      datasets: [
        {
          label: 'Memory Card Games',
          data: ['Easy', 'Normal', 'Hard'].map(diff => {
            const stat = gameStats?.cardStats?.find(s => s._id === diff);
            return stat ? stat.totalGames : 0;
          }),
          backgroundColor: colors.primary,
          borderRadius: 8
        },
        {
          label: 'Jigsaw Puzzle Games',
          data: ['easy', 'medium', 'hard'].map(diff => {
            const stat = gameStats?.puzStats?.find(s => s._id === diff);
            return stat ? stat.totalGames : 0;
          }),
          backgroundColor: colors.secondary,
          borderRadius: 8
        },
        {
          label: 'Matching Games',
          data: ['easy', 'medium', 'hard'].map(diff => {
            const stat = gameStats?.matchStats?.find(s => s._id === diff);
            return stat ? stat.totalGames : 0;
          }),
          backgroundColor: colors.accent,
          borderRadius: 8
        }
      ]
    };

    setChartData({
      userRegistration: userRegistrationData,
      gamePopularity: gamePopularityData,
      rankDistribution: rankData,
      difficultyPerformance: difficultyData,
      colors
    });
  };

  return {
    chartData,
    userStats,
    gameStats,
    overallStats,
    loading: isLoading,
    error
  };
};