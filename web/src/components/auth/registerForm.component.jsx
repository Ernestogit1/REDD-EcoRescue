import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, googleAuth } from '../../store/api/auth.api';
import { clearMessages } from '../../store/slices/auth.slice';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const { isLoading, error, success } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');

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
    if (!formData.username.trim()) {
      setLocalError('Username is required');
      return false;
    }
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return false;
    }
    if (!formData.password) {
      setLocalError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password
    };

    const result = await dispatch(registerUser(userData));
    
    if (registerUser.fulfilled.match(result)) {
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    }
  };

  const handleGoogleLogin =  async () => {
    await dispatch(googleAuth());
  };

  const displayError = localError || error;

  return (
    <form className="register-form" onSubmit={handleSubmit}>
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
        <label className="pixel-label">USERNAME</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          className="pixel-input"
          placeholder="Enter your username"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label className="pixel-label">EMAIL</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="pixel-input"
          placeholder="Enter your email"
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

      <div className="form-group">
        <label className="pixel-label">CONFIRM PASSWORD</label>
        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="pixel-input"
            placeholder="Confirm your password"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="pixel-button primary"
        disabled={isLoading}
      >
        {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
      </button>

      <div className="divider">
        <span className="pixel-text">OR</span>
      </div>

      <button
        type="button"
        className="pixel-button google-btn"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        🎮 CONTINUE WITH GOOGLE
      </button>

      <div className="login-link">
        <span className="pixel-text">Already have an account? </span>
        <a href="/login" className="pixel-link">LOGIN HERE</a>
      </div>
    </form>
  );
};

export default RegisterForm;