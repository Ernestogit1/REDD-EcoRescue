import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth/register.style.css';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // This will be replaced with actual API call later
      console.log('Register with:', formData);
      
      // Simulating successful registration
      setTimeout(() => {
        setIsLoading(false);
        navigate('/login');
      }, 1000);
    } catch (err) {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Will implement Google OAuth later
    console.log('Google signup clicked');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2 className="pixel-text">REDD-EcoRescue</h2>
          <div className="register-avatar">🌲</div>
          <h3 className="pixel-text">Create Account</h3>
        </div>
        
        {error && <div className="register-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label className="pixel-label">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="pixel-input"
              placeholder="Choose a username"
            />
          </div>
          
          <div className="form-group">
            <label className="pixel-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="pixel-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label className="pixel-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="pixel-input"
              placeholder="Create password"
            />
          </div>
          
          <div className="form-group">
            <label className="pixel-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="pixel-input"
              placeholder="Confirm password"
            />
          </div>
          
          <button 
            type="submit" 
            className="pixel-button primary"
            disabled={isLoading}
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </button>
          
          <div className="or-divider">
            <span>OR</span>
          </div>
          
          <button 
            type="button" 
            className="pixel-button google-btn"
            onClick={handleGoogleSignup}
          >
            <span className="google-icon">G</span> SIGN UP WITH GOOGLE
          </button>
        </form>
        
        <div className="login-link">
          Already have an account? <Link to="/login" className="pixel-link">Login</Link>
        </div>
      </div>
      
      <div className="register-decoration">
        <div className="tree">🌲</div>
        <div className="tree">🌳</div>
        <div className="animal">🐼</div>
        <div className="animal">🦒</div>
      </div>
    </div>
  );
};

export default RegisterScreen;