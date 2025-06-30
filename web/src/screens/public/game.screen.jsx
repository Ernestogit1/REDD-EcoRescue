import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../../hooks/useAudio.hook';

const GameScreen = () => {
  const navigate = useNavigate();
  const { playSound } = useAudio();

  const handleBack = () => {
    playSound();
    navigate('/menu');
  };

  return (
    <div className="game-screen">
      <h2 className="pixel-text">GAME COMING SOON!</h2>
      <div className="game-preview">
        <div className="forest-scene">
          <div className="tree tree-1">🌳</div>
          <div className="tree tree-2">🌲</div>
          <div className="tree tree-3">🌳</div>
          <div className="player">🧒</div>
          <div className="animal">🦁</div>
        </div>
      </div>
      <p>Interactive wildlife conservation game for elementary students</p>
      <div className="game-features">
        <div className="feature">🌿 Learn about endangered species</div>
        <div className="feature">🎮 Fun educational gameplay</div>
        <div className="feature">🌍 Save the environment</div>
      </div>
      <button className="pixel-button" onClick={handleBack}>
        BACK TO MENU
      </button>
    </div>
  );
};

export default GameScreen;