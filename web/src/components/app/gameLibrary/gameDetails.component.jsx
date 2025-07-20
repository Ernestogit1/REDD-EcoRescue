import React from 'react';

const GameDetails = ({ selectedGame, onPlay, onClose, onBackdropClick }) => {
  if (!selectedGame) return null;

  return (
    <div className="game-details-modal-overlay" onClick={onBackdropClick}>
      <div className="game-details-modal">
        <div className="modal-header">
          <h2 className="pixel-text modal-title">{selectedGame.title}</h2>
          <button className="close-btn pixel-button" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-content">
          <div className="game-banner">
            <img 
              src={selectedGame.banner || selectedGame.image || '/placeholder-banner.jpg'} 
              alt={selectedGame.title}
              onError={(e) => {
                e.target.src = '/placeholder-banner.jpg';
              }}
            />
            <div className="game-status-badge">
              <span className={`status-indicator ${selectedGame.status}`}>
                {selectedGame.status === 'available' ? '✅ Available' : 
                 selectedGame.status === 'coming-soon' ? '🔄 Coming Soon' : 
                 '🔒 Locked'}
              </span>
            </div>
            {/* Show external game indicator */}
            {selectedGame.isExternal && (
              <div className="external-game-badge">
                <span className="external-indicator">
                  🔗 External Game
                </span>
              </div>
            )}
          </div>
          
          <div className="modal-body">
            <div className="game-info-section">
              <div className="game-description-full">
                <h3 className="pixel-text section-title">About This Game</h3>
                <p>{selectedGame.fullDescription || selectedGame.description}</p>
                {selectedGame.isExternal && (
                  <div className="external-note">
                    <p style={{ color: '#f39c12', fontSize: '0.6rem', fontStyle: 'italic', marginTop: '1rem' }}>
                      🎮 This game will open in a new window for the best experience!
                    </p>
                  </div>
                )}
              </div>
              
              <div className="game-meta-info">
                <div className="meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">Genre:</span>
                    <span className="meta-value">{selectedGame.genre}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Difficulty:</span>
                    <span className="meta-value">{selectedGame.difficulty || 'Beginner'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Duration:</span>
                    <span className="meta-value">{selectedGame.duration || '30 min'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Age Range:</span>
                    <span className="meta-value">{selectedGame.ageRange || '8-12 years'}</span>
                  </div>
                </div>
              </div>

              {selectedGame.progress !== undefined && (
                <div className="progress-section">
                  <h4 className="pixel-text">Your Progress</h4>
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${selectedGame.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{selectedGame.progress || 0}% Complete</span>
                  </div>
                </div>
              )}
              
              <div className="game-features">
                <h4 className="pixel-text section-title">Game Features</h4>
                <ul className="features-list">
                  {selectedGame.features?.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  )) || ['Educational gameplay', 'Conservation learning', 'Interactive experience']}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <div className="action-buttons">
            {selectedGame.status === 'available' ? (
              <button 
                className={`pixel-button primary large play-game-btn ${selectedGame.isExternal ? 'external-game' : ''}`}
                onClick={() => onPlay(selectedGame)}
              >
                {selectedGame.isExternal ? '🔗 LAUNCH GAME' : '🎮 PLAY NOW'}
              </button>
            ) : selectedGame.status === 'coming-soon' ? (
              <button className="pixel-button secondary large" disabled>
                🔄 COMING SOON
              </button>
            ) : (
              <button className="pixel-button locked large" disabled>
                🔒 UNLOCK WITH PROGRESS
              </button>
            )}
            
            <button className="pixel-button secondary" onClick={onClose}>
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;