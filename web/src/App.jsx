import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Providers
import { AudioProvider } from './hooks/useAudio.hook';

// Screens
import LandingPage from './screens/public/landing.screen';
import TitleScreen from './screens/public/title.screen';
import GameScreen from './screens/public/game.screen';
import SettingsScreen from './screens/public/settings.screen';
import CarbonCalculator from './screens/public/carbon.screen';

// Layout
import AppLayout from './layouts/app.layout';

function App() {
  return (
    <AudioProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <AppLayout showAudioControls={false}>
              <LandingPage />
            </AppLayout>
          } />
          <Route path="/menu" element={
            <AppLayout>
              <TitleScreen />
            </AppLayout>
          } />
          <Route path="/game" element={
            <AppLayout>
              <GameScreen />
            </AppLayout>
          } />
          <Route path="/settings" element={
            <AppLayout>
              <SettingsScreen />
            </AppLayout>
          } />
          <Route path="/calculator" element={
            <AppLayout>
              <CarbonCalculator />
            </AppLayout>
          } />
        </Routes>
      </Router>
    </AudioProvider>
  );
}

export default App;