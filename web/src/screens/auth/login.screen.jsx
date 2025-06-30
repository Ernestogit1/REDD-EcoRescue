import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth/login.style.css';

const LoginScreen = () => {
  const [credentials, setCredentials] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.emailOrUsername || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // This will be replaced with actual API call later
      console.log('Login with:', credentials);
      
      // Simulating successful login
      setTimeout(() => {
        setIsLoading(false);
        navigate('/menu');
      }, 1000);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Will implement Google OAuth later
    console.log('Google login clicked');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="pixel-text">REDD-EcoRescue</h2>
          <div className="login-avatar">🌲</div>
          <h3 className="pixel-text">Login</h3>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="pixel-label">Username or Email</label>
            <input
              type="text"
              name="emailOrUsername"
              value={credentials.emailOrUsername}
              onChange={handleChange}
              className="pixel-input"
              placeholder="Enter username or email"
            />
          </div>
          
          <div className="form-group">
            <label className="pixel-label">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="pixel-input"
              placeholder="Enter password"
            />
          </div>
          
          <div className="forgot-password">
            <Link to="/forgot-password" className="pixel-link">Forgot Password?</Link>
          </div>
          
          <button 
            type="submit" 
            className="pixel-button primary"
            disabled={isLoading}
          >
            {isLoading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
          
          <div className="or-divider">
            <span>OR</span>
          </div>
          
          <button 
            type="button" 
            className="pixel-button google-btn"
            onClick={handleGoogleLogin}
          >
            <span className="google-icon">G</span> LOGIN WITH GOOGLE
          </button>
        </form>
        
        <div className="register-link">
          Don't have an account? <Link to="/register" className="pixel-link">Register</Link>
        </div>
      </div>
      
      <div className="login-decoration">
        <div className="tree">🌲</div>
        <div className="tree">🌳</div>
        <div className="animal">🦁</div>
        <div className="animal">🐘</div>
      </div>
    </div>
  );
};

export default LoginScreen;