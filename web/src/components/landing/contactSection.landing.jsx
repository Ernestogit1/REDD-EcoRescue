import React from 'react';

const ContactSection = () => {
  return (
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
  );
};

export default ContactSection;