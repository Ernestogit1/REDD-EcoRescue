import React from 'react';

const SuccessMessage = ({ success, message }) => {
  if (!success) return null;

  return (
    <div className="success-message pixel-text">
      ✅ {message}
    </div>
  );
};

export default SuccessMessage;