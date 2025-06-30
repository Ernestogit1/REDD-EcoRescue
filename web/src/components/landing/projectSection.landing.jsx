import React from 'react';

const ProjectSection = () => {
  return (
    <section id="project" className="project-section">
      <div className="container">
        <h2 className="section-title pixel-text">ABOUT OUR PROJECT</h2>
        <div className="project-content">
          <div className="project-text">
            <h3 className="pixel-text">REDD+ and Forest Conservation</h3>
            <p>REDD-EcoRescue combines REDD+ principles with modern technology to create an engaging educational experience.</p>
            
            <h3 className="pixel-text">Our Mission</h3>
            <div className="mission-list">
              <div className="mission-item">🌱 Promote sustainable environment</div>
              <div className="mission-item">📊 Provide forest monitoring tools</div>
              <div className="mission-item">🎮 Create educational games</div>
              <div className="mission-item">🤝 Connect communities</div>
              <div className="mission-item">📈 Track conservation impact</div>
            </div>
          </div>
          
          <div className="project-stats">
            <div className="stat-item">
              <span className="stat-number pixel-text">700</span>
              <span className="stat-label">Numbered of endangered species</span>
            </div>
            <div className="stat-item">
              <span className="stat-number pixel-text">2k</span>
              <span className="stat-label">Animals facing extinction</span>
            </div>
            <div className="stat-item">
              <span className="stat-number pixel-text">52k</span>
              <span className="stat-label">Endemic Species</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectSection;