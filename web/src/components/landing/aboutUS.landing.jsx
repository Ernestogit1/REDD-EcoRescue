import React from 'react';

const AboutSection = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <h2 className="section-title pixel-text">WHO ARE WE</h2>
        <div className="about-grid">
          <div className="about-card">
            <div className="card-icon">🌍</div>
            <h3 className="pixel-text">Environmental Advocates</h3>
            <p>Passionate environmentalists dedicated to raising awareness about forest conservation and REDD+ initiatives.</p>
          </div>
          <div className="about-card">
            <div className="card-icon">💻</div>
            <h3 className="pixel-text">Tech Innovators</h3>
            <p>Combining cutting-edge technology with environmental science to create impactful solutions.</p>
          </div>
          <div className="about-card">
            <div className="card-icon">🎓</div>
            <h3 className="pixel-text">Educators</h3>
            <p>Using interactive games and simulations to teach forest conservation principles.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;