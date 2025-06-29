import { useState, useEffect } from 'react'
import { Howl } from 'howler'
import './App.css'
import LandingPage from './components/LandingPage'

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [currentScreen, setCurrentScreen] = useState('landing')
  const [audioEnabled, setAudioEnabled] = useState(true)

  // Background music with error handling
  const [bgMusic] = useState(new Howl({
    src: ['/sounds/8bit-nature-loop.mp3'],
    loop: true,
    volume: 0.5,
    html5: true,
    onloaderror: () => {
      console.log('Background music not found - continuing without audio')
      setAudioEnabled(false)
    }
  }))

  // Sound effects with error handling
  const [buttonSound] = useState(new Howl({
    src: ['/sounds/8bit-button.mp3'],
    volume: 0.7,
    onloaderror: () => {
      console.log('Button sound not found')
    }
  }))

  const [startSound] = useState(new Howl({
    src: ['/sounds/8bit-start.mp3'],
    volume: 0.8,
    onloaderror: () => {
      console.log('Start sound not found')
    }
  }))

  useEffect(() => {
    // Initialize audio context on user interaction
    const handleUserInteraction = () => {
      if (!isPlaying && audioEnabled) {
        bgMusic.play()
        setIsPlaying(true)
      }
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [bgMusic, isPlaying, audioEnabled])

  useEffect(() => {
    if (audioEnabled) {
      bgMusic.volume(volume)
    }
  }, [volume, bgMusic, audioEnabled])

  const playSound = (sound) => {
    if (audioEnabled) {
      sound.play()
    }
  }

  const handleStartGame = () => {
    playSound(buttonSound)
    setTimeout(() => {
      playSound(startSound)
      setCurrentScreen('game')
    }, 200)
  }

  const handleEnterApp = () => {
    playSound(buttonSound)
    setCurrentScreen('title')
  }

  const handleSettings = () => {
    playSound(buttonSound)
    setCurrentScreen('settings')
  }

  const handleBack = () => {
    playSound(buttonSound)
    setCurrentScreen('title')
  }

  const handleBackToLanding = () => {
    playSound(buttonSound)
    setCurrentScreen('landing')
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  const toggleMusic = () => {
    playSound(buttonSound)
    if (isPlaying) {
      bgMusic.pause()
      setIsPlaying(false)
    } else {
      bgMusic.play()
      setIsPlaying(true)
    }
  }

  const renderTitleScreen = () => (
    <div className="title-screen">
      <div className="game-title">
        <h1 className="pixel-text">REDD</h1>
        <h2 className="pixel-text">EcoRescue</h2>
        <div className="subtitle">Wildlife Conservation Adventure</div>
      </div>
      
      <div className="menu-container">
        <button className="pixel-button" onClick={handleStartGame}>
          START GAME
        </button>
        <button className="pixel-button" onClick={handleSettings}>
          SETTINGS
        </button>
        <button className="pixel-button" onClick={handleBackToLanding}>
          BACK TO LANDING
        </button>
      </div>

      <div className="wildlife-preview">
        <div className="animal-sprite animal-1">🦁</div>
        <div className="animal-sprite animal-2">🐘</div>
        <div className="animal-sprite animal-3">🦒</div>
        <div className="animal-sprite animal-4">🐼</div>
      </div>

      <div className="instructions">
        <p>Help save endangered animals!</p>
        <p>Use arrow keys to move • Space to interact</p>
        {!audioEnabled && (
          <p className="audio-notice">🎵 Add sound files to /public/sounds/ for audio experience</p>
        )}
      </div>
    </div>
  )

  const renderSettingsScreen = () => (
    <div className="settings-screen">
      <h2 className="pixel-text">SETTINGS</h2>
      
      <div className="setting-item">
        <label>Music Volume:</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          disabled={!audioEnabled}
        />
        <span>{Math.round(volume * 100)}%</span>
      </div>

      <div className="setting-item">
        <label>Music:</label>
        <button 
          className="pixel-button small" 
          onClick={toggleMusic}
          disabled={!audioEnabled}
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
      </div>

      {!audioEnabled && (
        <div className="audio-notice">
          <p>🎵 Audio files not found</p>
          <p>Check /public/sounds/README.md for instructions</p>
        </div>
      )}

      <button className="pixel-button" onClick={handleBack}>
        BACK
      </button>
    </div>
  )

  const renderGameScreen = () => (
    <div className="game-screen">
      <h2 className="pixel-text">GAME COMING SOON!</h2>
      <div className="game-preview">
        <div className="forest-scene">
          <div className="tree tree-1">🌳</div>
          <div className="tree tree-2">🌲</div>
          <div className="tree tree-3">🌳</div>
          <div className="player">🧒</div>
          <div className="animal">🦁</div>
        </div>
      </div>
      <p>Interactive wildlife conservation game for elementary students</p>
      <div className="game-features">
        <div className="feature">🌿 Learn about endangered species</div>
        <div className="feature">🎮 Fun educational gameplay</div>
        <div className="feature">🌍 Save the environment</div>
      </div>
      <button className="pixel-button" onClick={handleBack}>
        BACK TO MENU
      </button>
    </div>
  )

  return (
    <div className="app">
      {currentScreen === 'landing' && (
        <LandingPage onEnterApp={handleEnterApp} />
      )}
      
      {currentScreen !== 'landing' && (
        <div className="game-container">
          {currentScreen === 'title' && renderTitleScreen()}
          {currentScreen === 'settings' && renderSettingsScreen()}
          {currentScreen === 'game' && renderGameScreen()}
        </div>
      )}
      
      {currentScreen !== 'landing' && (
        <div className="audio-controls">
          <button 
            className="audio-toggle" 
            onClick={toggleMusic}
            title={isPlaying ? 'Pause Music' : 'Play Music'}
            disabled={!audioEnabled}
          >
            {isPlaying ? '🔊' : '🔇'}
          </button>
        </div>
      )}
    </div>
  )
}

export default App
