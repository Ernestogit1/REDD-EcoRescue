import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../../layouts/hero/landing.hero';
import Navbar from '../../layouts/navbar/landing.navbar';
import AboutSection from '../../components/landing/aboutUS.landing';
import ProjectSection from '../../components/landing/projectSection.landing';
import GameSection from '../../components/landing/gameSection.landing';
import ContactSection from '../../components/landing/contactSection.landing';
import Footer from '../../layouts/footer/landing.footer';
import { useScrollSpy } from '../../hooks/scrollspy.hook';
import '../../styles/public/landing.style.css';

const SECTION_IDS = ['home', 'about', 'project', 'games', 'contact'];

const LandingPage = () => {
  const [showPixelEffect, setShowPixelEffect] = useState(false);
  const { activeSection, scrollToSection } = useScrollSpy(SECTION_IDS);
  const navigate = useNavigate();
  
  // Add pixel effect on mount
  useState(() => {
    setShowPixelEffect(true);
  }, []);

  const handleEnterApp = () => {
    navigate('/menu');
  };

  const handleCarbonCalculator = () => {
    navigate('/calculator');
  };
  
  const handlePlayGame = () => {
    navigate('/game');
  };

  return (
    <div className="landing-page">
      {/* 8-bit Pixel Background */}
      <div className="pixel-bg"></div>
      
      {/* Navigation Bar */}
      <Navbar 
        activeSection={activeSection} 
        scrollToSection={scrollToSection} 
      />

      {/* Hero Section */}
      <HeroSection 
        onEnterApp={handleEnterApp} 
        scrollToSection={scrollToSection} 
      />

      {/* About Section */}
      <AboutSection />

      {/* Project Section */}
      <ProjectSection />

      {/* Games Section */}
      <GameSection 
        onCarbonCalculator={handleCarbonCalculator}
        onPlayGame={handlePlayGame} 
      />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
};

export default LandingPage;