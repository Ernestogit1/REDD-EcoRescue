import React from 'react';

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="error-message pixel-text">
      ❌ {error}
    </div>
  );
};

export default ErrorMessage;