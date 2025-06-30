import React from 'react';
import AudioControls from '../components/common/audioControls.component';

const AppLayout = ({ children, showAudioControls = true }) => {
  return (
    <div className="app">
      {children}
      {showAudioControls && <AudioControls />}
    </div>
  );
};

export default AppLayout;