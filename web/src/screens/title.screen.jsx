import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio.hook';

const TitleScreen = () => {
  const { audioEnabled, playSound, playStartSound } = useAudio();
  const navigate = useNavigate();

  const handleStartGame = () => {
    playSound();
    setTimeout(() => {
      playStartSound();
      navigate('/game');
    }, 200);
  };

  return (
    <div className="title-screen">
      <div className="game-title">
        <h1 className="pixel-text">REDD</h1>
        <h2 className="pixel-text">EcoRescue</h2>
        <div className="subtitle">Wildlife Conservation Adventure</div>
      </div>
      
      <div className="menu-container">
        <button className="pixel-button" onClick={handleStartGame}>
          START GAME
        </button>
        <button className="pixel-button" onClick={() => navigate('/calculator')}>
          CARBON CALCULATOR
        </button>
        <button className="pixel-button" onClick={() => navigate('/settings')}>
          SETTINGS
        </button>
        <button className="pixel-button" onClick={() => navigate('/')}>
          BACK TO LANDING
        </button>
      </div>

      <div className="wildlife-preview">
        <div className="animal-sprite animal-1">🦁</div>
        <div className="animal-sprite animal-2">🐘</div>
        <div className="animal-sprite animal-3">🦒</div>
        <div className="animal-sprite animal-4">🐼</div>
      </div>

      <div className="instructions">
        <p>Help save endangered animals!</p>
        <p>Use arrow keys to move • Space to interact</p>
        {!audioEnabled && (
          <p className="audio-notice">🎵 Add sound files to /public/sounds/ for audio experience</p>
        )}
      </div>
    </div>
  );
};

export default TitleScreen;