import React, { createContext, useContext, useState } from 'react';

// Background options (should match those in MainMenuScreen)
export const backgrounds = [
  { id: 0, name: 'Default', type: 'gradient' },
  { id: 1, name: 'Forest', type: 'gif', source: require('../../assets/images/main-menu/main-menu1.mp4') },
  { id: 2, name: 'Night Camp', type: 'gif', source: require('../../assets/images/main-menu/main-menu2.mp4') },
  { id: 3, name: 'Waterfall', type: 'gif', source: require('../../assets/images/main-menu/main-menu3.mp4') },
  { id: 4, name: 'Autumn', type: 'gif', source: require('../../assets/images/main-menu/main-menu4.mp4') },
];

const BackgroundContext = createContext({
  currentBackground: 0,
  setCurrentBackground: () => {},
});

export const useBackground = () => useContext(BackgroundContext);

export const BackgroundProvider = ({ children }) => {
  const [currentBackground, setCurrentBackground] = useState(0);
  return (
    <BackgroundContext.Provider value={{ currentBackground, setCurrentBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
}; 