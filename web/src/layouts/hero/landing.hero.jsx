import React from 'react';

const HeroSection = ({ onEnterApp, scrollToSection }) => {
  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <div className="title-container">
          <h1 className="hero-title pixel-text">REDD</h1>
          <h2 className="hero-subtitle pixel-text">EcoRescue</h2>
          <div className="subtitle-text">Wildlife Conservation Adventure</div>
        </div>
        
        <div className="hero-description">
          <p>🎮 Interactive 8-bit adventure game</p>
          <p>🌿 Learn about endangered species</p>
          <p>🌍 Save the environment through gameplay</p>
        </div>
        
        <div className="hero-buttons">
          <button className="pixel-button primary" onClick={onEnterApp}>
            START GAME
          </button>
          <button className="pixel-button secondary" onClick={() => scrollToSection('about')}>
            LEARN MORE
          </button>
        </div>
      </div>
      
      <div className="hero-visual">
        <div className="forest-scene">
          <div className="tree tree-1">🌳</div>
          <div className="tree tree-2">🌲</div>
          <div className="tree tree-3">🌳</div>
          <div className="animal animal-1">🦁</div>
          <div className="animal animal-2">🐘</div>
          <div className="player">🧒</div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;