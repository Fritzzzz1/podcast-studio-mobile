export const colors = {
  // Primary Colors
  primary: '#6C63FF',
  primaryDark: '#5753D8',
  primaryLight: '#8E88FF',

  // Secondary Colors
  secondary: '#FF6584',
  secondaryDark: '#E64568',
  secondaryLight: '#FF8BA0',

  // Neutral Colors
  black: '#000000',
  white: '#FFFFFF',
  gray100: '#F7F7F8',
  gray200: '#E8E8EA',
  gray300: '#D1D1D6',
  gray400: '#9E9EA7',
  gray500: '#6E6E78',
  gray600: '#48484E',
  gray700: '#2C2C30',
  gray800: '#1C1C1E',
  gray900: '#0A0A0B',

  // Semantic Colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',

  // Background Colors
  background: '#FFFFFF',
  backgroundDark: '#0A0A0B',
  backgroundSecondary: '#F7F7F8',
  backgroundSecondaryDark: '#1C1C1E',

  // Text Colors
  textPrimary: '#0A0A0B',
  textSecondary: '#6E6E78',
  textTertiary: '#9E9EA7',
  textInverse: '#FFFFFF',

  // Border Colors
  border: '#E8E8EA',
  borderDark: '#2C2C30',

  // Recording Colors
  recording: '#FF3B30',
  playing: '#34C759',
  paused: '#FF9500',
};

export type ColorName = keyof typeof colors;
