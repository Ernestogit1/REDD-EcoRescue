import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ activeSection, scrollToSection }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
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
          <li className="nav-item login-btn">
            <button className="pixel-nav-btn user-btn" onClick={handleLoginClick}>
              <span className="user-icon">👤</span>
              <span className="login-text">LOGIN</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;