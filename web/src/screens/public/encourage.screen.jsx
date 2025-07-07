import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../../hooks/useAudio.hook';
import '../../styles/public/encourage.style.css';

const EncourageScreen = () => {
  const { playSound } = useAudio();
  const navigate = useNavigate();

  const handleRegister = () => {
    playSound();
    navigate('/register');
  };

  const handleLogin = () => {
    playSound();
    navigate('/login');
  };

  const handleBackToMenu = () => {
    playSound();
    navigate('/');
  };

  const handleDownloadApp = () => {
    playSound();
    // You can add actual download logic here
    alert('Mobile app download coming soon!');
  };

  return (
    <div className="encourage-screen">
      <div className="encourage-container">
        <div className="encourage-header">
          <h1 className="pixel-text">🎮 READY FOR ADVENTURE?</h1>
          <h2 className="pixel-text encourage-subtitle">Join the EcoRescue Community!</h2>
        </div>

        <div className="encourage-content">
          <div className="benefits-section">
            <h3 className="pixel-text">🌟 UNLOCK AMAZING FEATURES</h3>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">🏆</div>
                <h4 className="pixel-text">Achievement System</h4>
                <p>Earn badges and unlock special rewards as you progress!</p>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">📊</div>
                <h4 className="pixel-text">Progress Tracking</h4>
                <p>Monitor your conservation impact and learning journey!</p>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">🌍</div>
                <h4 className="pixel-text">Global Leaderboard</h4>
                <p>Compete with eco-warriors worldwide and save the planet!</p>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">🎯</div>
                <h4 className="pixel-text">Exclusive Missions</h4>
                <p>Access special conservation challenges and mini-games!</p>
              </div>
            </div>
          </div>

          <div className="mobile-app-section">
            <h3 className="pixel-text">📱 DOWNLOAD OUR MOBILE APP</h3>
            <div className="app-preview">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-icon">🌲</div>
                  <div className="app-name">REDD EcoRescue</div>
                  <div className="app-features">
                    <div className="feature-item">🎮 Offline Gaming</div>
                    <div className="feature-item">📸 AR Forest Scanner</div>
                    <div className="feature-item">🌿 Daily Eco-Tips</div>
                    <div className="feature-item">👥 Social Features</div>
                  </div>
                </div>
              </div>
              <div className="app-description">
                <p>Experience the full depth of our conservation games!</p>
                <p>🚀 Enhanced graphics and gameplay</p>
                <p>🌐 Play anywhere, anytime</p>
                <p>🎯 Exclusive mobile-only content</p>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <div className="primary-actions">
              <button className="pixel-button primary large" onClick={handleRegister}>
                🌟 CREATE FREE ACCOUNT
              </button>
              <button className="pixel-button secondary large" onClick={handleLogin}>
                👤 ALREADY HAVE ACCOUNT?
              </button>
            </div>
            
            <div className="secondary-actions">
              <button className="pixel-button download-btn" onClick={handleDownloadApp}>
                📱 DOWNLOAD MOBILE APP
              </button>
              <button className="pixel-button back-btn" onClick={handleBackToMenu}>
                🔙 BACK TO MENU
              </button>
            </div>
          </div>
        </div>

        <div className="encourage-footer">
          <p className="pixel-text">Join thousands of young eco-warriors making a difference!</p>
          <div className="stats-preview">
            <div className="stat-item">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Players</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50,000+</span>
              <span className="stat-label">Trees Saved</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Species Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncourageScreen;