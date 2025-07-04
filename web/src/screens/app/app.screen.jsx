import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AppScreen = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    console.log('Logout functionality to be implemented');
    navigate('/');
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="app-screen">
      <div className="app-container">
        <div className="welcome-header">
          <h1 className="pixel-text">🎮 WELCOME TO THE GAME!</h1>
          <h2 className="pixel-text">Login Successful!</h2>
        </div>

        <div className="user-info">
          <div className="user-card">
            <h3 className="pixel-text">Player Information</h3>
            <div className="info-item">
              <span className="label">Username:</span>
              <span className="value">{user?.username || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{user?.email || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <span className="label">Rank:</span>
              <span className="value">{user?.rank || 'Novice'}</span>
            </div>
            <div className="info-item">
              <span className="label">Rescue Stars:</span>
              <span className="value">⭐ {user?.rescueStars || 0}</span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="pixel-button primary" onClick={() => navigate('/game')}>
            🌲 START FOREST ADVENTURE
          </button>
          <button className="pixel-button secondary" onClick={() => navigate('/calculator')}>
            📊 CARBON CALCULATOR
          </button>
          <button className="pixel-button secondary" onClick={() => navigate('/settings')}>
            ⚙️ SETTINGS
          </button>
          <button className="pixel-button danger" onClick={handleLogout}>
            🚪 LOGOUT
          </button>
        </div>

        <div className="success-animation">
          <div className="pixel-character">🧒</div>
          <div className="floating-text">Ready to save the forest!</div>
        </div>
      </div>
    </div>
  );
};

export default AppScreen;