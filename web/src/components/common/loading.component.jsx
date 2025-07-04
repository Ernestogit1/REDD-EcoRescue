import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner pixel-text">
        🌲 {message}
      </div>
    </div>
  );
};

export default Loading;