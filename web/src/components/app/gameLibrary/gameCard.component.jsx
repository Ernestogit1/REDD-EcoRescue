import React from 'react';

const GameCard = ({ game, onGameSelect, isSelected }) => {
  return (
    <div 
      className={`game-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onGameSelect(game)}
    >
      <div className="game-image">
        <img 
          src={game.image || '/placeholder-game.jpg'} 
          alt={game.title}
          onError={(e) => {
            e.target.src = '/placeholder-game.jpg';
          }}
        />
        <div className="game-overlay">
          <div className="play-button">▶</div>
        </div>
      </div>
      
      <div className="game-info">
        <h3 className="game-title pixel-text">{game.title}</h3>
        <p className="game-description">{game.description}</p>
        
        <div className="game-meta">
          <div className="game-genre">
            <span className="genre-tag">{game.genre}</span>
          </div>
          <div className="game-status">
            <span className={`status-badge ${game.status}`}>
              {game.status === 'available' ? '✅ Available' : 
               game.status === 'coming-soon' ? '🔄 Coming Soon' : 
               '🔒 Locked'}
            </span>
          </div>
        </div>
        
        <div className="game-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${game.progress || 0}%` }}
            ></div>
          </div>
          <span className="progress-text">{game.progress || 0}% Complete</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;