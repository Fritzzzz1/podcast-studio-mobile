import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Episode {
  id: string;
  title: string;
  description: string;
  duration: number;
  recordedAt: number;
  fileUri: string;
  waveformData: number[] | null;
  status: 'draft' | 'processed' | 'exported';
  templateId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  coverImage: string | null;
  category: string;
  createdAt: number;
  updatedAt: number;
  episodes: Episode[];
}

export interface ProjectsState {
  projects: Project[];
  currentProjectId: string | null;
  currentEpisodeId: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProjectId: null,
  currentEpisodeId: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<{ id: string; updates: Partial<Project> }>) => {
      const project = state.projects.find((p) => p.id === action.payload.id);
      if (project) {
        Object.assign(project, action.payload.updates);
        project.updatedAt = Date.now();
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.currentProjectId === action.payload) {
        state.currentProjectId = null;
      }
    },
    addEpisode: (state, action: PayloadAction<{ projectId: string; episode: Episode }>) => {
      const project = state.projects.find((p) => p.id === action.payload.projectId);
      if (project) {
        project.episodes.push(action.payload.episode);
        project.updatedAt = Date.now();
      }
    },
    updateEpisode: (
      state,
      action: PayloadAction<{ projectId: string; episodeId: string; updates: Partial<Episode> }>
    ) => {
      const project = state.projects.find((p) => p.id === action.payload.projectId);
      if (project) {
        const episode = project.episodes.find((e) => e.id === action.payload.episodeId);
        if (episode) {
          Object.assign(episode, action.payload.updates);
          project.updatedAt = Date.now();
        }
      }
    },
    deleteEpisode: (state, action: PayloadAction<{ projectId: string; episodeId: string }>) => {
      const project = state.projects.find((p) => p.id === action.payload.projectId);
      if (project) {
        project.episodes = project.episodes.filter((e) => e.id !== action.payload.episodeId);
        project.updatedAt = Date.now();
        if (state.currentEpisodeId === action.payload.episodeId) {
          state.currentEpisodeId = null;
        }
      }
    },
    setCurrentProject: (state, action: PayloadAction<string | null>) => {
      state.currentProjectId = action.payload;
    },
    setCurrentEpisode: (state, action: PayloadAction<string | null>) => {
      state.currentEpisodeId = action.payload;
    },
  },
});

export const {
  addProject,
  updateProject,
  deleteProject,
  addEpisode,
  updateEpisode,
  deleteEpisode,
  setCurrentProject,
  setCurrentEpisode,
} = projectsSlice.actions;

export default projectsSlice.reducer;
