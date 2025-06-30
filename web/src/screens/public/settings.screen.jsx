import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../../hooks/useAudio.hook';

const SettingsScreen = () => {
  const { volume, isPlaying, audioEnabled, handleVolumeChange, toggleMusic, playSound } = useAudio();
  const navigate = useNavigate();
  
  const handleBack = () => {
    playSound();
    navigate('/menu');
  };

  return (
    <div className="settings-screen">
      <h2 className="pixel-text">SETTINGS</h2>
      
      <div className="setting-item">
        <label>Music Volume:</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          disabled={!audioEnabled}
        />
        <span>{Math.round(volume * 100)}%</span>
      </div>

      <div className="setting-item">
        <label>Music:</label>
        <button 
          className="pixel-button small" 
          onClick={toggleMusic}
          disabled={!audioEnabled}
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
      </div>

      {!audioEnabled && (
        <div className="audio-notice">
          <p>🎵 Audio files not found</p>
          <p>Check /public/sounds/README.md for instructions</p>
        </div>
      )}

      <button className="pixel-button" onClick={handleBack}>
        BACK
      </button>
    </div>
  );
};

export default SettingsScreen;