import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { RecordingScreen } from '@screens';

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
      {/* Additional stack screens will be added here for:
          - ProjectDetail
          - EpisodeDetail
          - TemplateDetail
          - CreateProject
          - CreateTemplate
      */}
    </Stack.Navigator>
  );
};
