import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../theme';

interface AudioWaveformProps {
  waveformData: number[];
  duration: number; // in seconds
  currentPosition: number; // in seconds
  selection?: {
    start: number;
    end: number;
  };
  height?: number;
  onSeek?: (position: number) => void;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  waveformData,
  duration,
  currentPosition,
  selection,
  height = 100,
  onSeek,
}) => {
  const screenWidth = Dimensions.get('window').width - 32; // Account for padding

  // Calculate bar width based on available space
  const barWidth = Math.max(2, screenWidth / waveformData.length - 1);
  const barSpacing = 1;

  // Calculate position indicator
  const positionX = duration > 0 ? (currentPosition / duration) * screenWidth : 0;

  // Calculate selection overlay
  const selectionStartX = selection && duration > 0 ? (selection.start / duration) * screenWidth : 0;
  const selectionEndX =
    selection && duration > 0 ? (selection.end / duration) * screenWidth : screenWidth;

  return (
    <View style={[styles.container, { height }]}>
      {/* Waveform bars */}
      <View style={styles.waveformContainer}>
        {waveformData.map((amplitude, index) => {
          const barHeight = Math.max(4, amplitude * height);
          const barX = index * (barWidth + barSpacing);

          // Check if bar is within selection
          const isInSelection =
            !selection || (barX >= selectionStartX && barX <= selectionEndX);

          return (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: isInSelection
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                  opacity: isInSelection ? 1 : 0.3,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Selection overlay */}
      {selection && (
        <>
          {/* Left fade (before selection) */}
          {selectionStartX > 0 && (
            <View
              style={[
                styles.fadeOverlay,
                {
                  left: 0,
                  width: selectionStartX,
                },
              ]}
            />
          )}

          {/* Right fade (after selection) */}
          {selectionEndX < screenWidth && (
            <View
              style={[
                styles.fadeOverlay,
                {
                  left: selectionEndX,
                  width: screenWidth - selectionEndX,
                },
              ]}
            />
          )}

          {/* Selection markers */}
          <View
            style={[
              styles.selectionMarker,
              {
                left: selectionStartX - 1,
              },
            ]}
          />
          <View
            style={[
              styles.selectionMarker,
              {
                left: selectionEndX - 1,
              },
            ]}
          />
        </>
      )}

      {/* Current position indicator */}
      <View
        style={[
          styles.positionIndicator,
          {
            left: positionX,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  bar: {
    borderRadius: 2,
    marginHorizontal: 0.5,
  },
  positionIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: theme.colors.error,
    zIndex: 10,
  },
  fadeOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 5,
  },
  selectionMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: theme.colors.primary,
    zIndex: 8,
  },
});
