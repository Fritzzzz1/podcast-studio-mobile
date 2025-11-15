import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import {
  RecordingScreen,
  RecordingPreviewScreen,
  ProjectDetailScreen,
  EpisodeDetailScreen,
  EditorScreen,
} from '@screens';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="Recording"
        component={RecordingScreen}
        options={{
          headerShown: true,
          title: 'Recording',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="RecordingPreview"
        component={RecordingPreviewScreen}
        options={{
          headerShown: true,
          title: 'Preview',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{
          headerShown: true,
          title: 'Project',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="EpisodeDetail"
        component={EpisodeDetailScreen}
        options={{
          headerShown: true,
          title: 'Episode',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Editor"
        component={EditorScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      {/* Additional stack screens will be added here for:
          - TemplateDetail
          - CreateProject
          - CreateTemplate
      */}
    </Stack.Navigator>
  );
};
