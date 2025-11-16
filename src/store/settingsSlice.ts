import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  // Audio Settings
  defaultTemplateId: string;
  autoEnhancement: boolean;

  // Storage Settings
  autoDeleteOldRecordings: boolean;
  autoDeleteDays: number;
  exportLocation: 'internal' | 'external';

  // App Settings
  theme: 'light' | 'dark' | 'system';
  language: string;
  notificationsEnabled: boolean;
  hapticFeedback: boolean;

  // Privacy
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
}

const initialState: SettingsState = {
  // Audio Settings
  defaultTemplateId: 'solo-podcast',
  autoEnhancement: true,

  // Storage Settings
  autoDeleteOldRecordings: false,
  autoDeleteDays: 30,
  exportLocation: 'internal',

  // App Settings
  theme: 'system',
  language: 'en',
  notificationsEnabled: true,
  hapticFeedback: true,

  // Privacy
  analyticsEnabled: false,
  crashReportingEnabled: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload);
    },
    setDefaultTemplate: (state, action: PayloadAction<string>) => {
      state.defaultTemplateId = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    toggleAutoEnhancement: (state) => {
      state.autoEnhancement = !state.autoEnhancement;
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    toggleHapticFeedback: (state) => {
      state.hapticFeedback = !state.hapticFeedback;
    },
    toggleAnalytics: (state) => {
      state.analyticsEnabled = !state.analyticsEnabled;
    },
    toggleCrashReporting: (state) => {
      state.crashReportingEnabled = !state.crashReportingEnabled;
    },
    resetSettings: () => initialState,
  },
});

export const {
  updateSettings,
  setDefaultTemplate,
  setTheme,
  toggleAutoEnhancement,
  toggleNotifications,
  toggleHapticFeedback,
  toggleAnalytics,
  toggleCrashReporting,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
