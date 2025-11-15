import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Bottom Tab Navigator Params
export type MainTabParamList = {
  Home: undefined;
  Projects: undefined;
  Templates: undefined;
  Settings: undefined;
};

// Stack Navigator Params
export type RootStackParamList = {
  Main: undefined;
  Recording: { templateId: string };
  RecordingPreview: {
    recordingUri: string;
    templateId: string;
    templateName: string;
    duration: number;
  };
  ProjectDetail: { projectId: string };
  EpisodeDetail: { projectId: string; episodeId: string };
  TemplateDetail: { templateId: string };
  CreateProject: undefined;
  CreateTemplate: undefined;
};

// Navigation Props for Screens
export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

export type ProjectsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Projects'>,
  StackNavigationProp<RootStackParamList>
>;

export type TemplatesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Templates'>,
  StackNavigationProp<RootStackParamList>
>;

export type SettingsScreenNavigationProp = BottomTabNavigationProp<
  MainTabParamList,
  'Settings'
>;

export type RecordingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Recording'
>;
export type RecordingScreenRouteProp = RouteProp<RootStackParamList, 'Recording'>;

export type ProjectDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProjectDetail'
>;
export type ProjectDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProjectDetail'>;

export type EpisodeDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EpisodeDetail'
>;
export type EpisodeDetailScreenRouteProp = RouteProp<RootStackParamList, 'EpisodeDetail'>;
