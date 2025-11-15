import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import audioReducer from './audioSlice';
import projectsReducer from './projectsSlice';
import templatesReducer from './templatesSlice';
import settingsReducer from './settingsSlice';
import editorReducer from './editorSlice';

export const store = configureStore({
  reducer: {
    audio: audioReducer,
    projects: projectsReducer,
    templates: templatesReducer,
    settings: settingsReducer,
    editor: editorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['audio/startRecording', 'audio/startPlayback'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
