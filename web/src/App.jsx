import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

// Providers
import { AudioProvider } from './hooks/useAudio.hook';

// Screens
import LandingPage from './screens/public/landing.screen';
import TitleScreen from './screens/public/title.screen';
import GameScreen from './screens/public/game.screen';
import SettingsScreen from './screens/public/settings.screen';
import CarbonCalculator from './screens/public/carbon.screen';
import LoginScreen from './screens/auth/login.screen'; 
import RegisterScreen from './screens/auth/register.screen';

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
            <Route path="/login" element={
            <AppLayout showAudioControls={false}>
              <LoginScreen />
            </AppLayout>
          } />
             <Route path="/register" element={
            <AppLayout showAudioControls={false}>
              <RegisterScreen />
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