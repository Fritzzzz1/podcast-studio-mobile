import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AudioSettings {
  sampleRate: 48000 | 44100;
  bitRate: number;
  channels: 1 | 2; // mono/stereo
  format: 'mp3' | 'm4a' | 'wav';
}

export interface EffectSettings {
  noiseReduction: { enabled: boolean; level: number };
  normalization: { enabled: boolean; targetLevel: number };
  compression: { enabled: boolean; threshold: number; ratio: number };
  eq: { preset: 'voice' | 'bass' | 'flat' | 'custom' };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'solo' | 'interview' | 'panel' | 'narrative';
  audioSettings: AudioSettings;
  effects: EffectSettings;
  customizable: boolean;
  isDefault: boolean;
}

export interface TemplatesState {
  templates: Template[];
  selectedTemplateId: string | null;
}

const defaultTemplates: Template[] = [
  {
    id: 'solo-podcast',
    name: 'Solo Podcast',
    description: 'Optimized for single-speaker podcasts with clear voice recording',
    icon: 'microphone',
    category: 'solo',
    audioSettings: {
      sampleRate: 48000,
      bitRate: 128,
      channels: 1,
      format: 'm4a',
    },
    effects: {
      noiseReduction: { enabled: true, level: 0.5 },
      normalization: { enabled: true, targetLevel: -16 },
      compression: { enabled: true, threshold: -20, ratio: 3 },
      eq: { preset: 'voice' },
    },
    customizable: false,
    isDefault: true,
  },
  {
    id: 'interview',
    name: 'Interview',
    description: 'Balanced settings for two-person conversations',
    icon: 'account-multiple',
    category: 'interview',
    audioSettings: {
      sampleRate: 48000,
      bitRate: 128,
      channels: 2,
      format: 'm4a',
    },
    effects: {
      noiseReduction: { enabled: true, level: 0.4 },
      normalization: { enabled: true, targetLevel: -16 },
      compression: { enabled: true, threshold: -18, ratio: 2.5 },
      eq: { preset: 'voice' },
    },
    customizable: false,
    isDefault: true,
  },
  {
    id: 'multi-host',
    name: 'Multi-Host',
    description: 'High-quality stereo recording for multiple hosts',
    icon: 'account-group',
    category: 'panel',
    audioSettings: {
      sampleRate: 48000,
      bitRate: 192,
      channels: 2,
      format: 'm4a',
    },
    effects: {
      noiseReduction: { enabled: true, level: 0.3 },
      normalization: { enabled: true, targetLevel: -14 },
      compression: { enabled: true, threshold: -16, ratio: 2 },
      eq: { preset: 'voice' },
    },
    customizable: false,
    isDefault: true,
  },
  {
    id: 'narrative',
    name: 'Narrative',
    description: 'Professional storytelling with enhanced audio quality',
    icon: 'book-open-variant',
    category: 'narrative',
    audioSettings: {
      sampleRate: 48000,
      bitRate: 192,
      channels: 2,
      format: 'm4a',
    },
    effects: {
      noiseReduction: { enabled: true, level: 0.6 },
      normalization: { enabled: true, targetLevel: -14 },
      compression: { enabled: true, threshold: -18, ratio: 3.5 },
      eq: { preset: 'voice' },
    },
    customizable: false,
    isDefault: true,
  },
];

const initialState: TemplatesState = {
  templates: defaultTemplates,
  selectedTemplateId: 'solo-podcast',
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    addTemplate: (state, action: PayloadAction<Template>) => {
      state.templates.push(action.payload);
    },
    updateTemplate: (state, action: PayloadAction<{ id: string; updates: Partial<Template> }>) => {
      const template = state.templates.find((t) => t.id === action.payload.id);
      if (template && template.customizable) {
        Object.assign(template, action.payload.updates);
      }
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      const template = state.templates.find((t) => t.id === action.payload);
      if (template && !template.isDefault) {
        state.templates = state.templates.filter((t) => t.id !== action.payload);
        if (state.selectedTemplateId === action.payload) {
          state.selectedTemplateId = 'solo-podcast';
        }
      }
    },
    selectTemplate: (state, action: PayloadAction<string>) => {
      state.selectedTemplateId = action.payload;
    },
  },
});

export const { addTemplate, updateTemplate, deleteTemplate, selectTemplate } =
  templatesSlice.actions;

export default templatesSlice.reducer;
