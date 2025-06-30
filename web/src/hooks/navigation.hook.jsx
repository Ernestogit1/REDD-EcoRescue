import { useState } from 'react';
import { useAudio } from './useAudio';

export const useNavigation = () => {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const { playSound, playStartSound } = useAudio();

  const handleStartGame = () => {
    playSound();
    setTimeout(() => {
      playStartSound();
      setCurrentScreen('game');
    }, 200);
  };

  const handleEnterApp = () => {
    playSound();
    setCurrentScreen('title');
  };

  const handleSettings = () => {
    playSound();
    setCurrentScreen('settings');
  };

  const handleBack = () => {
    playSound();
    setCurrentScreen('title');
  };

  const handleBackToLanding = () => {
    playSound();
    setCurrentScreen('landing');
  };

  const handleCarbonCalculator = () => {
    playSound();
    setCurrentScreen('carbon-calculator');
  };

  return {
    currentScreen,
    handleStartGame,
    handleEnterApp,
    handleSettings,
    handleBack,
    handleBackToLanding,
    handleCarbonCalculator
  };
};