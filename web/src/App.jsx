import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import './styles/App.css';

// Providers
import { AudioProvider } from './hooks/useAudio.hook';

// Components
import ProtectedRoute from './components/common/protectedRoute.component';

// Public screens
import LandingPage from './screens/public/landing.screen';
import TitleScreen from './screens/public/title.screen';
import GameScreen from './screens/public/game.screen';
import SettingsScreen from './screens/public/settings.screen';
import CarbonCalculator from './screens/public/carbon.screen';
import EncourageScreen from './screens/public/encourage.screen'; // Changed from encourageScreen to EncourageScreen

// Auth screens
import LoginScreen from './screens/auth/login.screen'; 
import RegisterScreen from './screens/auth/register.screen';

// App screens
import MenuScreen from './screens/app/app.screen';
import ProfileScreen from './screens/app/profile.screen';

// Layout
import AppLayout from './layouts/app.layout';

function App() {
  return (
    <Provider store={store}>
      <AudioProvider>
        <Router>
          <Routes>
            <Route 
              path="/" 
              element={
               <ProtectedRoute isPublic={true} redirectTo="/app">
                <AppLayout showAudioControls={false}>
                  <LandingPage />
                </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/login" 
              element={
                <ProtectedRoute isPublic={true} redirectTo="/app">
                  <AppLayout showAudioControls={false}>
                    <LoginScreen />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/register" 
              element={
                <ProtectedRoute isPublic={true} redirectTo="/app">
                  <AppLayout showAudioControls={false}>
                    <RegisterScreen />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/menu" 
              element={
                <ProtectedRoute isPublic={true} redirectTo="/app">
                  <AppLayout>
                    <TitleScreen />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/game" 
              element={
                <ProtectedRoute isPublic={true} redirectTo="/app">
                  <AppLayout>
                    <GameScreen />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
          <Route 
              path="/encourage" 
              element={
                <ProtectedRoute isPublic={true} redirectTo="/app">
                  <AppLayout>
                    <EncourageScreen />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute isPublic={true} redirectTo="/app">
                  <AppLayout>
                    <SettingsScreen />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/calculator" 
              element={
                <ProtectedRoute isPublic={true} redirectTo="/app">
                  <AppLayout>
                    <CarbonCalculator />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <AppLayout showAudioControls={false}>
                    <MenuScreen />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <AppLayout showAudioControls={false}>
                    <ProfileScreen />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            {/* <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            /> */}
          </Routes>
        </Router>
      </AudioProvider>
    </Provider>
  );
}

export default App;