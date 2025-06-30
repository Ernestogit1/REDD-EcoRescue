import { useState, useEffect, useContext, createContext } from 'react';
import { Howl } from 'howler';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Background music
  const [bgMusic] = useState(new Howl({
    src: ['/sounds/8bit-nature-loop.mp3'],
    loop: true,
    volume: 0.5,
    html5: true,
    onloaderror: () => {
      console.log('Background music not found - continuing without audio');
      setAudioEnabled(false);
    }
  }));

  // Sound effects
  const [buttonSound] = useState(new Howl({
    src: ['/sounds/8bit-button.mp3'],
    volume: 0.7,
    onloaderror: () => {
      console.log('Button sound not found');
    }
  }));

  const [startSound] = useState(new Howl({
    src: ['/sounds/8bit-start.mp3'],
    volume: 0.8,
    onloaderror: () => {
      console.log('Start sound not found');
    }
  }));

  useEffect(() => {
    // Initialize audio context on user interaction
    const handleUserInteraction = () => {
      if (!isPlaying && audioEnabled) {
        bgMusic.play();
        setIsPlaying(true);
      }
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [bgMusic, isPlaying, audioEnabled]);

  useEffect(() => {
    if (audioEnabled) {
      bgMusic.volume(volume);
    }
  }, [volume, bgMusic, audioEnabled]);

  const playSound = (sound = buttonSound) => {
    if (audioEnabled) {
      sound.play();
    }
  };

  const playStartSound = () => {
    if (audioEnabled) {
      startSound.play();
    }
  };

  const toggleMusic = () => {
    playSound(buttonSound);
    if (isPlaying) {
      bgMusic.pause();
      setIsPlaying(false);
    } else {
      bgMusic.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        volume,
        audioEnabled,
        playSound,
        playStartSound,
        toggleMusic,
        handleVolumeChange
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  return useContext(AudioContext);
};