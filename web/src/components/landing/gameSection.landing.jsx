import React from 'react';

const GameSection = ({ onCarbonCalculator, onPlayGame }) => {
  return (
    <section id="games" className="games-section">
      <div className="container">
        <h2 className="section-title pixel-text">EDUCATIONAL GAMES</h2>
        <p className="section-subtitle">Learn about forest conservation through interactive 8-bit games</p>
        
        <div className="games-grid">
          <div className="game-card">
            <div className="game-icon">🌲</div>
            <h3 className="pixel-text">Forest Guardian</h3>
            <p>Protect virtual forests from deforestation threats while learning about sustainable management.</p>
            <button className="pixel-button game-btn" onClick={onPlayGame}>PLAY NOW</button>
          </div>
          
          <div className="game-card">
            <div className="game-icon">🦜</div>
            <h3 className="pixel-text">Ecosystem Builder</h3>
            <p>Create and maintain balanced forest ecosystems while understanding species relationships.</p>
            <button className="pixel-button game-btn disabled">COMING SOON</button>
          </div>
          
          <div className="game-card">
            <div className="game-icon">📊</div>
            <h3 className="pixel-text">Carbon Calculator</h3>
            <p>Learn how forests capture carbon and calculate environmental impact of conservation strategies.</p>
            <button className="pixel-button game-btn" onClick={onCarbonCalculator}>TRY IT</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameSection;