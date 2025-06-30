import React, { useState } from 'react';
import HeroSection from '../layouts/hero/landing.hero';
import Navbar from '../layouts/navbar/landing.navbar';
import AboutSection from '../components/landing/aboutUS.landing';
import ProjectSection from '../components/landing/projectSection.landing';
import GameSection from '../components/landing/gameSection.landing';
import ContactSection from '../components/landing/contactSection.landing';
import Footer from '../layouts/footer/landing.footer';
import { useScrollSpy } from '../hooks/scrollspy.hook';
import '../styles/landing.style.css';

const SECTION_IDS = ['home', 'about', 'project', 'games', 'contact'];

const LandingPage = ({ onEnterApp, onCarbonCalculator }) => {
  const [showPixelEffect, setShowPixelEffect] = useState(false);
  const { activeSection, scrollToSection } = useScrollSpy(SECTION_IDS);
  
  // Add pixel effect on mount
  useState(() => {
    setShowPixelEffect(true);
  }, []);

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
        onEnterApp={onEnterApp} 
        scrollToSection={scrollToSection} 
      />

      {/* About Section */}
      <AboutSection />

      {/* Project Section */}
      <ProjectSection />

      {/* Games Section */}
      <GameSection onCarbonCalculator={onCarbonCalculator} />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
};

export default LandingPage;