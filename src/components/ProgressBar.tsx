import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '@theme';

export interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 4,
  color = colors.primary,
  backgroundColor = colors.gray200,
  style,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.container, { height, backgroundColor }, style]}>
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
