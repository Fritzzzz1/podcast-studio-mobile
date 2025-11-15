import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TrimMarkers {
  start: number; // in seconds
  end: number; // in seconds
}

export interface VolumeEffect {
  enabled: boolean;
  level: number; // -20 to +20 dB
}

export interface FadeEffect {
  fadeIn: number; // duration in seconds
  fadeOut: number; // duration in seconds
}

export interface EditorEffect {
  id: string;
  type: 'trim' | 'volume' | 'fade';
  params: TrimMarkers | VolumeEffect | FadeEffect;
}

export interface EditorState {
  episodeId: string | null;
  projectId: string | null;
  audioUri: string | null;
  duration: number; // in seconds

  // Editing state
  selection: TrimMarkers;
  effects: EditorEffect[];

  // Playback state for editor
  isPlaying: boolean;
  currentPosition: number; // in seconds

  // Processing state
  isProcessing: boolean;
  processingProgress: number; // 0-100

  // Undo/Redo
  history: EditorEffect[][];
  historyIndex: number;
}

const initialState: EditorState = {
  episodeId: null,
  projectId: null,
  audioUri: null,
  duration: 0,

  selection: {
    start: 0,
    end: 0,
  },
  effects: [],

  isPlaying: false,
  currentPosition: 0,

  isProcessing: false,
  processingProgress: 0,

  history: [[]],
  historyIndex: 0,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    loadEpisodeForEditing: (
      state,
      action: PayloadAction<{
        episodeId: string;
        projectId: string;
        audioUri: string;
        duration: number;
      }>
    ) => {
      state.episodeId = action.payload.episodeId;
      state.projectId = action.payload.projectId;
      state.audioUri = action.payload.audioUri;
      state.duration = action.payload.duration;
      state.selection = {
        start: 0,
        end: action.payload.duration,
      };
      state.effects = [];
      state.history = [[]];
      state.historyIndex = 0;
      state.currentPosition = 0;
    },

    setSelection: (state, action: PayloadAction<TrimMarkers>) => {
      state.selection = action.payload;
    },

    addEffect: (state, action: PayloadAction<EditorEffect>) => {
      state.effects.push(action.payload);
      // Add to history for undo/redo
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.effects]);
      state.history = newHistory;
      state.historyIndex = newHistory.length - 1;
    },

    removeEffect: (state, action: PayloadAction<string>) => {
      state.effects = state.effects.filter((e) => e.id !== action.payload);
      // Add to history for undo/redo
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.effects]);
      state.history = newHistory;
      state.historyIndex = newHistory.length - 1;
    },

    updateEffect: (
      state,
      action: PayloadAction<{ id: string; params: TrimMarkers | VolumeEffect | FadeEffect }>
    ) => {
      const effect = state.effects.find((e) => e.id === action.payload.id);
      if (effect) {
        effect.params = action.payload.params;
      }
    },

    clearEffects: (state) => {
      state.effects = [];
      state.history = [[]];
      state.historyIndex = 0;
    },

    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1;
        state.effects = [...state.history[state.historyIndex]];
      }
    },

    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex += 1;
        state.effects = [...state.history[state.historyIndex]];
      }
    },

    setPlaybackState: (state, action: PayloadAction<{ isPlaying: boolean; position?: number }>) => {
      state.isPlaying = action.payload.isPlaying;
      if (action.payload.position !== undefined) {
        state.currentPosition = action.payload.position;
      }
    },

    setCurrentPosition: (state, action: PayloadAction<number>) => {
      state.currentPosition = action.payload;
    },

    setProcessing: (state, action: PayloadAction<{ isProcessing: boolean; progress?: number }>) => {
      state.isProcessing = action.payload.isProcessing;
      if (action.payload.progress !== undefined) {
        state.processingProgress = action.payload.progress;
      }
    },

    resetEditor: () => initialState,
  },
});

export const {
  loadEpisodeForEditing,
  setSelection,
  addEffect,
  removeEffect,
  updateEffect,
  clearEffects,
  undo,
  redo,
  setPlaybackState,
  setCurrentPosition,
  setProcessing,
  resetEditor,
} = editorSlice.actions;

export default editorSlice.reducer;
