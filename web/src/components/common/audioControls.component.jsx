import React from 'react';
import { useAudio } from '../../hooks/useAudio.hook';

const AudioControls = () => {
  const { isPlaying, audioEnabled, toggleMusic } = useAudio();

  return (
    <div className="audio-controls">
      <button 
        className="audio-toggle" 
        onClick={toggleMusic}
        title={isPlaying ? 'Pause Music' : 'Play Music'}
        disabled={!audioEnabled}
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>
    </div>
  );
};

export default AudioControls;