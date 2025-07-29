import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axiosInterceptor'; // Use your axios interceptor

export const useGameLeaderboard = () => {
  const [leaderboards, setLeaderboards] = useState({
    card: [],
    puz: [],
    match: [],
    color: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState('card');
  
  // Get authentication status from Redux, but get token from localStorage
  const { isAuthenticated } = useSelector((state) => state.auth);

  const gameConfig = {
    card: {
      title: 'Memory Card Game',
      icon: '🃏',
      description: 'Forest Card Matching Adventure',
      color: '#2d5016',
      accent: '#7fb069'
    },
    puz: {
      title: 'Swamp Quest Puzzle',
      icon: '🧩',
      description: 'Wetland Jigsaw Challenge', 
      color: '#1a472a',
      accent: '#27ae60'
    },
    match: {
      title: 'Beach Puzzle',
      icon: '🏖️',
      description: 'Ocean Conservation Matching',
      color: '#2980b9',
      accent: '#3498db'
    },
    color: {
      title: 'Color Game',
      icon: '🎨',
      description: 'Wildlife Coloring Adventure',
      color: '#8e44ad',
      accent: '#9b59b6'
    }
  };

  const fetchLeaderboard = async (gameType) => {
    try {
      console.log(`Fetching ${gameType} leaderboard...`);
      
      // Check if we have a valid token in localStorage
      const token = localStorage.getItem('authToken');
      if (!token || token === 'undefined' || token === 'null') {
        console.error('No valid token found in localStorage');
        return [];
      }

      const response = await axiosInstance.get(`/${gameType}/stats/leaderboard`);
      console.log(`${gameType} leaderboard response:`, response.data);
      return response.data || [];
    } catch (err) {
      console.error(`Error fetching ${gameType} leaderboard:`, err);
      
      // Log more details about the error
      if (err.response) {
        console.error(`Response status: ${err.response.status}`);
        console.error(`Response data:`, err.response.data);
      }
      
      return [];
    }
  };

  const fetchAllLeaderboards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check authentication before making requests
      const token = localStorage.getItem('authToken');
      if (!token || token === 'undefined' || token === 'null') {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Fetching all leaderboards...');
      
      const [cardData, puzData, matchData, colorData] = await Promise.all([
        fetchLeaderboard('card'),
        fetchLeaderboard('puz'), 
        fetchLeaderboard('match'),
        fetchLeaderboard('color')
      ]);

      console.log('All leaderboard data:', { cardData, puzData, matchData, colorData });

      setLeaderboards({
        card: cardData,
        puz: puzData,
        match: matchData,
        color: colorData
      });
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError('Failed to load leaderboards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check both authentication status and token availability
    const token = localStorage.getItem('authToken');
    
    if (isAuthenticated && token && token !== 'undefined' && token !== 'null') {
      console.log('User is authenticated, fetching leaderboards...');
      fetchAllLeaderboards();
    } else {
      console.log('User not authenticated or no valid token');
      setLoading(false);
      setError('Authentication required');
    }
  }, [isAuthenticated]);

  const refreshLeaderboards = () => {
    console.log('Refreshing leaderboards...');
    fetchAllLeaderboards();
  };

  return {
    leaderboards,
    loading,
    error,
    selectedGame,
    setSelectedGame,
    gameConfig,
    refreshLeaderboards
  };
};