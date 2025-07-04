import React from 'react';
import LoginForm from '../../components/auth/loginForm.component';

const LoginLayout = () => {
  return (
    <div className="login-container">
      <div className="pixel-bg"></div>
      
      <div className="login-form-wrapper">
        <div className="login-header">
          <h1 className="pixel-text">WELCOME BACK</h1>
          <p className="login-subtitle">Continue your forest protection journey</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};

export default LoginLayout;