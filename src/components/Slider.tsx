import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SliderComponent from '@react-native-community/slider';
import { theme } from '../theme';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onValueChange,
  disabled = false,
}) => {
  const displayValue = unit ? `${value}${unit}` : value.toFixed(step < 1 ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{displayValue}</Text>
      </View>
      <SliderComponent
        style={styles.slider}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onValueChange}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.surface}
        thumbTintColor={theme.colors.primary}
        disabled={disabled}
      />
      <View style={styles.rangeContainer}>
        <Text style={styles.rangeText}>
          {min}
          {unit}
        </Text>
        <Text style={styles.rangeText}>
          {max}
          {unit}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  value: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  rangeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimarySecondary,
  },
});
