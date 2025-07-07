import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, googleAuth } from '../../store/api/auth.api';
import { clearMessages } from '../../store/slices/auth.slice';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isAuthenticated && success) {
      navigate('/profile');
    }
  }, [isAuthenticated, success, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error || localError) {
      dispatch(clearMessages());
      setLocalError('');
    }
  };

  const validateForm = () => {
    if (!formData.emailOrUsername.trim()) {
      setLocalError('Email or username is required');
      return false;
    }
    if (!formData.password) {
      setLocalError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    await dispatch(loginUser(formData));
  };

  const handleGoogleAuth = async () => {
    await dispatch(googleAuth());
  };

  const displayError = localError || error;

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {displayError && (
        <div className="error-message pixel-text">
          ⚠️ {displayError}
        </div>
      )}
      
      {success && (
        <div className="success-message pixel-text">
          ✅ {success}
        </div>
      )}

      <div className="form-group">
        <label className="pixel-label">EMAIL OR USERNAME</label>
        <input
          type="text"
          name="emailOrUsername"
          value={formData.emailOrUsername}
          onChange={handleInputChange}
          className="pixel-input"
          placeholder="Enter your email or username"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label className="pixel-label">PASSWORD</label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="pixel-input"
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="pixel-button primary"
        disabled={isLoading}
      >
        {isLoading ? 'LOGGING IN...' : 'LOGIN'}
      </button>

      <div className="divider">
        <span className="pixel-text">OR</span>
      </div>

      <button
        type="button"
        className="pixel-button google-btn"
        onClick={handleGoogleAuth}
        disabled={isLoading}
      >
        🎮 CONTINUE WITH GOOGLE
      </button>

      <div className="register-link">
        <span className="pixel-text">Don't have an account? </span>
        <a href="/register" className="pixel-link">REGISTER HERE</a>
      </div>
    </form>
  );
};

export default LoginForm;