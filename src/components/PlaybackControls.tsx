import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography } from '@theme';
import { formatDuration } from '../utils/timeFormatters';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  currentPosition: number;
  duration: number;
  playbackSpeed: number;
  onPlayPause: () => void;
  onSeek: (position: number) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  currentPosition,
  duration,
  playbackSpeed,
  onPlayPause,
  onSeek,
  onSkipForward,
  onSkipBackward,
  onSpeedChange,
  disabled = false,
}) => {

  const handleSpeedPress = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    onSpeedChange(PLAYBACK_SPEEDS[nextIndex]);
  };

  return (
    <View style={styles.container}>
      {/* Progress Slider */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={currentPosition}
          onSlidingComplete={onSeek}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.gray300}
          thumbTintColor={colors.primary}
          disabled={disabled || duration === 0}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatDuration(currentPosition)}</Text>
          <Text style={styles.timeText}>{formatDuration(duration)}</Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View style={styles.controlsContainer}>
        {/* Speed Button */}
        <TouchableOpacity
          style={styles.speedButton}
          onPress={handleSpeedPress}
          disabled={disabled}
        >
          <Text style={[styles.speedText, disabled && styles.disabledText]}>
            {playbackSpeed}x
          </Text>
        </TouchableOpacity>

        {/* Skip Backward */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onSkipBackward}
          disabled={disabled}
        >
          <Text style={[styles.controlButtonText, disabled && styles.disabledText]}>
            ⏮ 15s
          </Text>
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={onPlayPause}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Text style={[styles.playButtonText, disabled && styles.disabledText]}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        {/* Skip Forward */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onSkipForward}
          disabled={disabled}
        >
          <Text style={[styles.controlButtonText, disabled && styles.disabledText]}>
            15s ⏭
          </Text>
        </TouchableOpacity>

        {/* Spacer to balance layout */}
        <View style={styles.speedButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  speedButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: typography.fontSize['3xl'],
    color: colors.white,
  },
  disabledText: {
    opacity: 0.5,
  },
});
