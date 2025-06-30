import React from 'react';

const Footer = ({ scrollToSection }) => {
  return (
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
  );
};

export default Footer;