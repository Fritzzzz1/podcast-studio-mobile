import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing } from '@theme';

interface AudioLevelMeterProps {
  level: number; // Audio level from -160 (silence) to 0 (max)
  barCount?: number;
  height?: number;
}

export const AudioLevelMeter: React.FC<AudioLevelMeterProps> = ({
  level,
  barCount = 20,
  height = 200,
}) => {
  const animatedValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Convert metering level (-160 to 0) to a 0-1 scale
    const normalizedLevel = Math.max(0, Math.min(1, (level + 160) / 160));

    // Calculate how many bars should be active based on level
    const activeBars = Math.floor(normalizedLevel * barCount);

    // Animate each bar
    animatedValues.forEach((animValue, index) => {
      Animated.timing(animValue, {
        toValue: index < activeBars ? 1 : 0,
        duration: 100,
        useNativeDriver: false,
      }).start();
    });
  }, [level, barCount, animatedValues]);

  const barHeight = height / barCount;

  return (
    <View style={[styles.container, { height }]}>
      {animatedValues.map((animValue, index) => {
        // Color gradient: green -> yellow -> red
        const barPosition = index / barCount;
        let barColor = colors.success;
        if (barPosition > 0.7) {
          barColor = colors.error;
        } else if (barPosition > 0.5) {
          barColor = colors.warning;
        }

        return (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height: barHeight - 2,
                backgroundColor: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [colors.border, barColor],
                }),
                opacity: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column-reverse',
    justifyContent: 'space-between',
    width: 40,
    borderRadius: spacing.sm,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    padding: spacing.xs,
  },
  bar: {
    width: '100%',
    borderRadius: 2,
  },
});
