import { Audio, AVPlaybackStatus } from 'expo-av';

export interface PlaybackStatus {
  isPlaying: boolean;
  isLoaded: boolean;
  positionMillis: number;
  durationMillis: number;
  playbackSpeed: number;
  isBuffering: boolean;
}

export class AudioPlayer {
  private sound: Audio.Sound | null = null;
  private onStatusUpdate?: (status: PlaybackStatus) => void;

  constructor(onStatusUpdate?: (status: PlaybackStatus) => void) {
    this.onStatusUpdate = onStatusUpdate;
  }

  /**
   * Load audio file for playback
   */
  async loadAudio(uri: string): Promise<void> {
    try {
      // Unload any existing sound
      if (this.sound) {
        await this.unloadAudio();
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Create and load sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        this.handleStatusUpdate.bind(this)
      );

      this.sound = sound;
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw error;
    }
  }

  /**
   * Play or resume playback
   */
  async play(): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      await this.sound.playAsync();
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  /**
   * Pause playback
   */
  async pause(): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      await this.sound.pauseAsync();
    } catch (error) {
      console.error('Failed to pause audio:', error);
      throw error;
    }
  }

  /**
   * Stop playback and reset to beginning
   */
  async stop(): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      await this.sound.stopAsync();
      await this.sound.setPositionAsync(0);
    } catch (error) {
      console.error('Failed to stop audio:', error);
      throw error;
    }
  }

  /**
   * Seek to a specific position in milliseconds
   */
  async seekTo(positionMillis: number): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      await this.sound.setPositionAsync(positionMillis);
    } catch (error) {
      console.error('Failed to seek audio:', error);
      throw error;
    }
  }

  /**
   * Skip forward by specified milliseconds
   */
  async skipForward(milliseconds: number = 15000): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.min(
          status.positionMillis + milliseconds,
          status.durationMillis || 0
        );
        await this.sound.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Failed to skip forward:', error);
      throw error;
    }
  }

  /**
   * Skip backward by specified milliseconds
   */
  async skipBackward(milliseconds: number = 15000): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.max(status.positionMillis - milliseconds, 0);
        await this.sound.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Failed to skip backward:', error);
      throw error;
    }
  }

  /**
   * Set playback speed (rate)
   */
  async setPlaybackSpeed(speed: number): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      await this.sound.setRateAsync(speed, true);
    } catch (error) {
      console.error('Failed to set playback speed:', error);
      throw error;
    }
  }

  /**
   * Get current playback status
   */
  async getStatus(): Promise<AVPlaybackStatus> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      return await this.sound.getStatusAsync();
    } catch (error) {
      console.error('Failed to get status:', error);
      throw error;
    }
  }

  /**
   * Unload the current audio
   */
  async unloadAudio(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
      } catch (error) {
        console.error('Failed to unload audio:', error);
        throw error;
      }
    }
  }

  /**
   * Handle playback status updates
   */
  private handleStatusUpdate(status: AVPlaybackStatus): void {
    if (this.onStatusUpdate && status.isLoaded) {
      this.onStatusUpdate({
        isPlaying: status.isPlaying,
        isLoaded: true,
        positionMillis: status.positionMillis,
        durationMillis: status.durationMillis || 0,
        playbackSpeed: status.rate || 1.0,
        isBuffering: status.isBuffering,
      });
    }
  }

  /**
   * Set status update callback
   */
  setOnStatusUpdate(callback: (status: PlaybackStatus) => void): void {
    this.onStatusUpdate = callback;
  }

  /**
   * Check if audio is loaded
   */
  isLoaded(): boolean {
    return this.sound !== null;
  }
}

export default AudioPlayer;
