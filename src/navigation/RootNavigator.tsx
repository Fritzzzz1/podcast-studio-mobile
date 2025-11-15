import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '@types/navigation';
import { TabNavigator } from './TabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      {/* Additional stack screens will be added here for:
          - Recording
          - ProjectDetail
          - EpisodeDetail
          - TemplateDetail
          - CreateProject
          - CreateTemplate
      */}
    </Stack.Navigator>
  );
};
