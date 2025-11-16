/**
 * Custom hook for audio recording
 * Encapsulates AudioRecorder initialization, lifecycle, and state management
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { AudioRecorder, RecordingStatus } from '../services/AudioRecorder';
import { Template } from '../store/templatesSlice';

export interface UseAudioRecorderReturn {
  recorder: AudioRecorder | null;
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  hasPermission: boolean;
  isCheckingPermission: boolean;
  error: string | null;
  startRecording: (template: Template) => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  discardRecording: () => Promise<void>;
  checkPermissions: () => Promise<boolean>;
}

/**
 * Hook to manage audio recorder lifecycle and state
 * @returns Audio recorder controls and state
 */
export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const recorderRef = useRef<AudioRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize recorder on mount
  useEffect(() => {
    const handleStatusUpdate = (status: RecordingStatus) => {
      setIsRecording(status.isRecording);
      setIsPaused(!status.isRecording && !status.isDoneRecording);
      setDuration(status.durationMillis);
      setAudioLevel(status.metering || 0);
    };

    recorderRef.current = new AudioRecorder(handleStatusUpdate);

    // Cleanup on unmount
    return () => {
      if (recorderRef.current) {
        recorderRef.current.discardRecording().catch(console.error);
        recorderRef.current = null;
      }
    };
  }, []);

  const checkPermissions = useCallback(async (): Promise<boolean> => {
    if (!recorderRef.current) {
      setError('Recorder not initialized');
      return false;
    }

    setIsCheckingPermission(true);
    setError(null);

    try {
      const granted = await recorderRef.current.requestPermissions();
      setHasPermission(granted);
      return granted;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check permissions';
      setError(message);
      console.error('Permission error:', err);
      return false;
    } finally {
      setIsCheckingPermission(false);
    }
  }, []);

  const startRecording = useCallback(async (template: Template) => {
    if (!recorderRef.current) {
      setError('Recorder not initialized');
      return;
    }

    setError(null);

    try {
      await recorderRef.current.startRecording(template);
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
      console.error('Start recording error:', err);
      setIsRecording(false);
    }
  }, []);

  const pauseRecording = useCallback(async () => {
    if (!recorderRef.current) {
      setError('Recorder not initialized');
      return;
    }

    try {
      setError(null);
      await recorderRef.current.pauseRecording();
      setIsPaused(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pause recording';
      setError(message);
      console.error('Pause recording error:', err);
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    if (!recorderRef.current) {
      setError('Recorder not initialized');
      return;
    }

    try {
      setError(null);
      await recorderRef.current.resumeRecording();
      setIsPaused(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resume recording';
      setError(message);
      console.error('Resume recording error:', err);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!recorderRef.current) {
      setError('Recorder not initialized');
      return null;
    }

    try {
      setError(null);
      const uri = await recorderRef.current.stopRecording();
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      setAudioLevel(0);
      return uri;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(message);
      console.error('Stop recording error:', err);
      return null;
    }
  }, []);

  const discardRecording = useCallback(async () => {
    if (!recorderRef.current) {
      setError('Recorder not initialized');
      return;
    }

    try {
      setError(null);
      await recorderRef.current.discardRecording();
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      setAudioLevel(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to discard recording';
      setError(message);
      console.error('Discard recording error:', err);
    }
  }, []);

  return {
    recorder: recorderRef.current,
    isRecording,
    isPaused,
    duration,
    audioLevel,
    hasPermission,
    isCheckingPermission,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    discardRecording,
    checkPermissions,
  };
};
