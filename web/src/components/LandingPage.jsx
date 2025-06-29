import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const LandingPage = ({ onEnterApp, onCarbonCalculator }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [showPixelEffect, setShowPixelEffect] = useState(false);

  useEffect(() => {
    // Add pixel effect on mount
    setShowPixelEffect(true);

    // Handle scroll to update active section
    const handleScroll = () => {
      const sections = ['home', 'about', 'project', 'games', 'contact'];
      const navbarHeight = 80;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= navbarHeight + 100) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      // Calculate offset for fixed navbar
      const navbarHeight = 80;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="landing-page">
      {/* 8-bit Pixel Background */}
      <div className="pixel-bg"></div>
      
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="pixel-logo">🌲</div>
            <span className="pixel-text">REDD-EcoRescue</span>
          </div>
          <ul className="nav-menu">
            <li className={`nav-item ${activeSection === 'home' ? 'active' : ''}`}>
              <button className="pixel-nav-btn" onClick={() => scrollToSection('home')}>
                HOME
              </button>
            </li>
            <li className={`nav-item ${activeSection === 'about' ? 'active' : ''}`}>
              <button className="pixel-nav-btn" onClick={() => scrollToSection('about')}>
                ABOUT
              </button>
            </li>
            <li className={`nav-item ${activeSection === 'project' ? 'active' : ''}`}>
              <button className="pixel-nav-btn" onClick={() => scrollToSection('project')}>
                PROJECT
              </button>
            </li>
            <li className={`nav-item ${activeSection === 'games' ? 'active' : ''}`}>
              <button className="pixel-nav-btn" onClick={() => scrollToSection('games')}>
                GAMES
              </button>
            </li>
            <li className={`nav-item ${activeSection === 'contact' ? 'active' : ''}`}>
              <button className="pixel-nav-btn" onClick={() => scrollToSection('contact')}>
                CONTACT
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
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

      {/* About Section */}
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

      {/* Project Section */}
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

      {/* Games Section */}
      <section id="games" className="games-section">
        <div className="container">
          <h2 className="section-title pixel-text">EDUCATIONAL GAMES</h2>
          <p className="section-subtitle">Learn about forest conservation through interactive 8-bit games</p>
          
          <div className="games-grid">
            <div className="game-card">
              <div className="game-icon">🌲</div>
              <h3 className="pixel-text">Forest Guardian</h3>
              <p>Protect virtual forests from deforestation threats while learning about sustainable management.</p>
              <button className="pixel-button game-btn">PLAY NOW</button>
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

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2 className="section-title pixel-text">CONTACT US</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3 className="pixel-text">Get In Touch</h3>
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span>info@redd-ecorescue.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>Conservation Center, Earth</span>
              </div>
            </div>
            
            <div className="contact-form">
              <h3 className="pixel-text">Send Message</h3>
              <form>
                <div className="form-group">
                  <input type="text" placeholder="Your Name" className="pixel-input" />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" className="pixel-input" />
                </div>
                <div className="form-group">
                  <textarea placeholder="Your Message" className="pixel-textarea"></textarea>
                </div>
                <button type="submit" className="pixel-button primary">SEND MESSAGE</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4 className="pixel-text">REDD-EcoRescue</h4>
              <p>Protecting forests, preserving future through interactive education.</p>
            </div>
            <div className="footer-section">
              <h4 className="pixel-text">Quick Links</h4>
              <ul>
                <li><button className="footer-link" onClick={() => scrollToSection('home')}>Home</button></li>
                <li><button className="footer-link" onClick={() => scrollToSection('about')}>About</button></li>
                <li><button className="footer-link" onClick={() => scrollToSection('games')}>Games</button></li>
                <li><button className="footer-link" onClick={() => scrollToSection('contact')}>Contact</button></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="pixel-text">Follow Us</h4>
              <div className="social-links">
                <button className="social-link">📘</button>
                <button className="social-link">🐦</button>
                <button className="social-link">📷</button>
                <button className="social-link">💼</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 REDD-EcoRescue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
