import React from 'react';
import RegisterForm from '../../components/auth/registerForm.component';

const RegisterLayout = () => {
  return (
    <div className="register-container">
      <div className="pixel-bg"></div>
      
      <div className="register-form-wrapper">
        <div className="register-header">
          <h1 className="pixel-text">JOIN THE ADVENTURE</h1>
          <p className="register-subtitle">Create your account to start protecting the forest</p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterLayout;