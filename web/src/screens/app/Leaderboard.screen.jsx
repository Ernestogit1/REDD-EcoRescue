import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameLeaderboards from '../../components/app/gameLibrary/gameLeaderboards.component';
import '../../styles/app/gameLeaderboards.style.css';

const LeaderboardScreen = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/app');
  };

  return <GameLeaderboards onBack={handleBack} />;
};

export default LeaderboardScreen;