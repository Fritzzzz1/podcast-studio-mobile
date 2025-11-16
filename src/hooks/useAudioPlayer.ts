/**
 * Custom hook for audio playback
 * Encapsulates AudioPlayer initialization, lifecycle, and state management
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { AudioPlayer, PlaybackStatus } from '../services/AudioPlayer';

export interface UseAudioPlayerReturn {
  player: AudioPlayer | null;
  isLoading: boolean;
  isPlaying: boolean;
  isLoaded: boolean;
  currentPosition: number;
  duration: number;
  playbackSpeed: number;
  isBuffering: boolean;
  error: string | null;
  loadAudio: (uri: string) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  skipForward: (ms?: number) => Promise<void>;
  skipBackward: (ms?: number) => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
}

/**
 * Hook to manage audio player lifecycle and state
 * @returns Audio player controls and state
 */
export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const playerRef = useRef<AudioPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize player on mount
  useEffect(() => {
    const handleStatusUpdate = (status: PlaybackStatus) => {
      setIsPlaying(status.isPlaying);
      setIsLoaded(status.isLoaded);
      setCurrentPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setPlaybackSpeed(status.playbackSpeed);
      setIsBuffering(status.isBuffering);
    };

    playerRef.current = new AudioPlayer(handleStatusUpdate);

    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.unloadAudio().catch(console.error);
        playerRef.current = null;
      }
    };
  }, []);

  const loadAudio = useCallback(async (uri: string) => {
    if (!playerRef.current) {
      setError('Player not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await playerRef.current.loadAudio(uri);
      setIsLoaded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load audio';
      setError(message);
      console.error('Load audio error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const play = useCallback(async () => {
    if (!playerRef.current) {
      setError('Player not initialized');
      return;
    }

    try {
      setError(null);
      await playerRef.current.play();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to play audio';
      setError(message);
      console.error('Play error:', err);
    }
  }, []);

  const pause = useCallback(async () => {
    if (!playerRef.current) {
      setError('Player not initialized');
      return;
    }

    try {
      setError(null);
      await playerRef.current.pause();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pause audio';
      setError(message);
      console.error('Pause error:', err);
    }
  }, []);

  const stop = useCallback(async () => {
    if (!playerRef.current) {
      setError('Player not initialized');
      return;
    }

    try {
      setError(null);
      await playerRef.current.stop();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop audio';
      setError(message);
      console.error('Stop error:', err);
    }
  }, []);

  const seekTo = useCallback(async (position: number) => {
    if (!playerRef.current) {
      setError('Player not initialized');
      return;
    }

    try {
      setError(null);
      await playerRef.current.seekTo(position);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to seek';
      setError(message);
      console.error('Seek error:', err);
    }
  }, []);

  const skipForward = useCallback(async (ms: number = 15000) => {
    if (!playerRef.current) {
      setError('Player not initialized');
      return;
    }

    try {
      setError(null);
      await playerRef.current.skipForward(ms);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to skip forward';
      setError(message);
      console.error('Skip forward error:', err);
    }
  }, []);

  const skipBackward = useCallback(async (ms: number = 15000) => {
    if (!playerRef.current) {
      setError('Player not initialized');
      return;
    }

    try {
      setError(null);
      await playerRef.current.skipBackward(ms);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to skip backward';
      setError(message);
      console.error('Skip backward error:', err);
    }
  }, []);

  const setSpeed = useCallback(async (speed: number) => {
    if (!playerRef.current) {
      setError('Player not initialized');
      return;
    }

    try {
      setError(null);
      await playerRef.current.setPlaybackSpeed(speed);
      setPlaybackSpeed(speed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set playback speed';
      setError(message);
      console.error('Set speed error:', err);
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  return {
    player: playerRef.current,
    isLoading,
    isPlaying,
    isLoaded,
    currentPosition,
    duration,
    playbackSpeed,
    isBuffering,
    error,
    loadAudio,
    play,
    pause,
    stop,
    seekTo,
    skipForward,
    skipBackward,
    setSpeed,
    togglePlayPause,
  };
};
