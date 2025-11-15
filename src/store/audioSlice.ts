import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AudioState {
  // Recording State
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  currentRecordingUri: string | null;
  audioLevel: number;

  // Playback State
  isPlaying: boolean;
  currentPlaybackUri: string | null;
  playbackPosition: number;
  playbackDuration: number;
  playbackSpeed: number;
}

const initialState: AudioState = {
  isRecording: false,
  isPaused: false,
  recordingDuration: 0,
  currentRecordingUri: null,
  audioLevel: 0,

  isPlaying: false,
  currentPlaybackUri: null,
  playbackPosition: 0,
  playbackDuration: 0,
  playbackSpeed: 1.0,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    startRecording: (state, action: PayloadAction<{ uri: string }>) => {
      state.isRecording = true;
      state.isPaused = false;
      state.currentRecordingUri = action.payload.uri;
      state.recordingDuration = 0;
    },
    pauseRecording: (state) => {
      state.isPaused = true;
    },
    resumeRecording: (state) => {
      state.isPaused = false;
    },
    stopRecording: (state) => {
      state.isRecording = false;
      state.isPaused = false;
    },
    updateRecordingDuration: (state, action: PayloadAction<number>) => {
      state.recordingDuration = action.payload;
    },
    updateAudioLevel: (state, action: PayloadAction<number>) => {
      state.audioLevel = action.payload;
    },
    startPlayback: (state, action: PayloadAction<{ uri: string; duration: number }>) => {
      state.isPlaying = true;
      state.currentPlaybackUri = action.payload.uri;
      state.playbackDuration = action.payload.duration;
    },
    pausePlayback: (state) => {
      state.isPlaying = false;
    },
    stopPlayback: (state) => {
      state.isPlaying = false;
      state.currentPlaybackUri = null;
      state.playbackPosition = 0;
    },
    updatePlaybackPosition: (state, action: PayloadAction<number>) => {
      state.playbackPosition = action.payload;
    },
    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playbackSpeed = action.payload;
    },
    resetAudio: () => initialState,
  },
});

export const {
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  updateRecordingDuration,
  updateAudioLevel,
  startPlayback,
  pausePlayback,
  stopPlayback,
  updatePlaybackPosition,
  setPlaybackSpeed,
  resetAudio,
} = audioSlice.actions;

export default audioSlice.reducer;
