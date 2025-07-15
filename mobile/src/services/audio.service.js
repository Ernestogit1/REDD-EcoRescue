import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

class AudioService {
  constructor() {
    this.backgroundMusic = null;
    this.isPlaying = false;
    this.volume = 0.5; // Default volume (50%)
    this.isEnabled = true; // Music enabled by default
  }

  async initializeAudio() {
    try {
      // Configure audio mode for background music
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  async loadBackgroundMusic() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.unloadAsync();
      }

      // Load the asset first to get the proper URI
      const asset = Asset.fromModule(require('../../assets/background-music/pixel-forest-8bit.mp3'));
      await asset.downloadAsync();

      this.backgroundMusic = await Audio.Sound.createAsync(
        { uri: asset.localUri || asset.uri },
        {
          shouldPlay: false,
          isLooping: true,
          volume: this.volume,
        }
      );
      
      // Set up playback status update
      this.backgroundMusic.sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          this.isPlaying = status.isPlaying;
        }
      });

      console.log('Background music loaded successfully');
    } catch (error) {
      console.error('Error loading background music:', error);
    }
  }

  async playBackgroundMusic() {
    try {
      if (!this.isEnabled) return;

      if (!this.backgroundMusic) {
        await this.loadBackgroundMusic();
      }

      if (this.backgroundMusic && !this.isPlaying) {
        await this.backgroundMusic.sound.playAsync();
        console.log('Background music started');
      }
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }

  async pauseBackgroundMusic() {
    try {
      if (this.backgroundMusic && this.isPlaying) {
        await this.backgroundMusic.sound.pauseAsync();
        console.log('Background music paused');
      }
    } catch (error) {
      console.error('Error pausing background music:', error);
    }
  }

  async stopBackgroundMusic() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.sound.stopAsync();
        console.log('Background music stopped');
      }
    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  }

  async setVolume(volume) {
    try {
      this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
      
      if (this.backgroundMusic) {
        await this.backgroundMusic.sound.setVolumeAsync(this.volume);
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  async toggleMusic() {
    this.isEnabled = !this.isEnabled;
    
    if (this.isEnabled) {
      await this.playBackgroundMusic();
    } else {
      await this.pauseBackgroundMusic();
    }
    
    return this.isEnabled;
  }

  async cleanup() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.sound.unloadAsync();
        this.backgroundMusic = null;
      }
    } catch (error) {
      console.error('Error cleaning up audio:', error);
    }
  }

  // Getters
  getIsPlaying() {
    return this.isPlaying;
  }

  getVolume() {
    return this.volume;
  }

  getIsEnabled() {
    return this.isEnabled;
  }
}

// Create and export a singleton instance
const audioService = new AudioService();
export default audioService;