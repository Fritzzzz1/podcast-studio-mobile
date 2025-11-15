import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  RecordingScreenNavigationProp,
  RecordingScreenRouteProp,
} from '@navigation/types';
import { colors, spacing, typography, shadows } from '@theme';
import { useAppSelector, useAppDispatch } from '@store';
import {
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  updateRecordingDuration,
  updateAudioLevel,
  resetAudio,
} from '@store/audioSlice';
import { AudioRecorder, RecordingStatus } from '@services';
import { Button, Card, AudioLevelMeter, LoadingSpinner } from '@components';

export const RecordingScreen: React.FC = () => {
  const navigation = useNavigation<RecordingScreenNavigationProp>();
  const route = useRoute<RecordingScreenRouteProp>();
  const dispatch = useAppDispatch();

  const { templateId } = route.params;
  const template = useAppSelector((state) =>
    state.templates.templates.find((t) => t.id === templateId)
  );

  const { isRecording, isPaused, recordingDuration, audioLevel } = useAppSelector(
    (state) => state.audio
  );

  const [isInitializing, setIsInitializing] = useState(false);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);

  // Initialize audio recorder
  useEffect(() => {
    const recorder = new AudioRecorder(handleRecordingStatus);
    audioRecorderRef.current = recorder;

    return () => {
      // Cleanup on unmount
      if (isRecording) {
        recorder.discardRecording().catch(console.error);
      }
      dispatch(resetAudio());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecordingStatus = useCallback(
    (status: RecordingStatus) => {
      dispatch(updateRecordingDuration(status.durationMillis));
      if (status.metering !== undefined) {
        dispatch(updateAudioLevel(status.metering));
      }
    },
    [dispatch]
  );

  const handleStartRecording = async () => {
    if (!template) {
      Alert.alert('Error', 'Template not found');
      return;
    }

    try {
      setIsInitializing(true);
      const recorder = audioRecorderRef.current;

      if (!recorder) {
        throw new Error('Audio recorder not initialized');
      }

      await recorder.startRecording(template);
      dispatch(startRecording({ uri: '' }));
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert(
        'Recording Error',
        error instanceof Error ? error.message : 'Failed to start recording'
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const handlePauseRecording = async () => {
    try {
      await audioRecorderRef.current?.pauseRecording();
      dispatch(pauseRecording());
    } catch (error) {
      console.error('Failed to pause recording:', error);
      Alert.alert('Error', 'Failed to pause recording');
    }
  };

  const handleResumeRecording = async () => {
    try {
      await audioRecorderRef.current?.resumeRecording();
      dispatch(resumeRecording());
    } catch (error) {
      console.error('Failed to resume recording:', error);
      Alert.alert('Error', 'Failed to resume recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      const uri = await audioRecorderRef.current?.stopRecording();
      if (uri && template) {
        dispatch(stopRecording());

        // Get the recording duration
        const duration = recordingDuration || 0;

        // Navigate to preview screen
        navigation.navigate('RecordingPreview', {
          recordingUri: uri,
          templateId: template.id,
          templateName: template.name,
          duration,
        });
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleDiscardRecording = () => {
    Alert.alert(
      'Discard Recording',
      'Are you sure you want to discard this recording? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isRecording) {
                await audioRecorderRef.current?.discardRecording();
              }
              dispatch(resetAudio());
              navigation.goBack();
            } catch (error) {
              console.error('Failed to discard recording:', error);
            }
          },
        },
      ]
    );
  };


  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!template) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Template not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recording</Text>
        <Text style={styles.subtitle}>{template.name}</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.recordingCard} shadow>
          <View style={styles.meterContainer}>
            <AudioLevelMeter level={audioLevel} height={300} />
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{formatDuration(recordingDuration)}</Text>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>
                  {isPaused ? 'PAUSED' : 'RECORDING'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.specsContainer}>
            <Text style={styles.spec}>
              {template.audioSettings.sampleRate / 1000}kHz
            </Text>
            <Text style={styles.specDivider}>•</Text>
            <Text style={styles.spec}>
              {template.audioSettings.channels === 1 ? 'Mono' : 'Stereo'}
            </Text>
            <Text style={styles.specDivider}>•</Text>
            <Text style={styles.spec}>
              {template.audioSettings.format.toUpperCase()}
            </Text>
          </View>
        </Card>

        {isInitializing ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" />
            <Text style={styles.loadingText}>Initializing...</Text>
          </View>
        ) : !isRecording ? (
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={handleStartRecording}
              activeOpacity={0.8}
            >
              <View style={styles.recordButtonInner} />
            </TouchableOpacity>
            <Text style={styles.controlText}>Tap to start recording</Text>
          </View>
        ) : (
          <View style={styles.controls}>
            <View style={styles.recordingControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={isPaused ? handleResumeRecording : handlePauseRecording}
              >
                <Text style={styles.controlButtonText}>
                  {isPaused ? '▶' : '⏸'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleStopRecording}
              >
                <Text style={styles.controlButtonText}>⏹</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {isRecording && (
        <View style={styles.dangerZone}>
          <Button
            title="Cancel Recording"
            onPress={handleDiscardRecording}
            variant="outline"
            fullWidth
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  recordingCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  meterContainer: {
    marginBottom: spacing.xl,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timer: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.md,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  recordingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.error,
    letterSpacing: 1,
  },
  specsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  spec: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  specDivider: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  controls: {
    alignItems: 'center',
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    marginBottom: spacing.md,
  },
  recordButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    borderWidth: 3,
    borderColor: colors.error,
  },
  controlText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  recordingControls: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  controlButtonText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.background,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  dangerZone: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
