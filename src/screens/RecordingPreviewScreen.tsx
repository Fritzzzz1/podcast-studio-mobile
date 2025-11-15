import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, typography } from '@theme';
import { useAppDispatch } from '@store';
import { addEpisode, addProject } from '@store/projectsSlice';
import { resetAudio } from '@store/audioSlice';
import { AudioPlayer, PlaybackStatus } from '@services';
import { Button, Card, PlaybackControls, LoadingSpinner } from '@components';

interface RecordingPreviewScreenParams {
  recordingUri: string;
  templateId: string;
  templateName: string;
  duration: number;
}

export const RecordingPreviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();

  const { recordingUri, templateId, templateName, duration } = route.params as RecordingPreviewScreenParams;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(duration);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    const initializePlayer = async () => {
      try {
        const player = new AudioPlayer(handlePlaybackStatus);
        await player.loadAudio(recordingUri);
        audioPlayerRef.current = player;
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load audio:', error);
        Alert.alert('Error', 'Failed to load recording for playback');
        setIsLoading(false);
      }
    };

    initializePlayer();

    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.unloadAudio().catch(console.error);
      }
    };
  }, [recordingUri]);

  const handlePlaybackStatus = (status: PlaybackStatus) => {
    setIsPlaying(status.isPlaying);
    setCurrentPosition(status.positionMillis);
    setPlaybackDuration(status.durationMillis);
    setPlaybackSpeed(status.playbackSpeed);
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await audioPlayerRef.current?.pause();
      } else {
        await audioPlayerRef.current?.play();
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
      Alert.alert('Error', 'Failed to control playback');
    }
  };

  const handleSeek = async (position: number) => {
    try {
      await audioPlayerRef.current?.seekTo(position);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  const handleSkipForward = async () => {
    try {
      await audioPlayerRef.current?.skipForward(15000);
    } catch (error) {
      console.error('Failed to skip forward:', error);
    }
  };

  const handleSkipBackward = async () => {
    try {
      await audioPlayerRef.current?.skipBackward(15000);
    } catch (error) {
      console.error('Failed to skip backward:', error);
    }
  };

  const handleSpeedChange = async (speed: number) => {
    try {
      await audioPlayerRef.current?.setPlaybackSpeed(speed);
    } catch (error) {
      console.error('Failed to change speed:', error);
    }
  };

  const handleDiscard = () => {
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
              await audioPlayerRef.current?.unloadAudio();
              dispatch(resetAudio());
              navigation.navigate('Main');
            } catch (error) {
              console.error('Failed to discard recording:', error);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Stop playback before saving
      if (isPlaying) {
        await audioPlayerRef.current?.pause();
      }

      // Generate IDs
      const projectId = `project_${Date.now()}`;
      const episodeId = `episode_${Date.now()}`;

      // Create a new project
      dispatch(
        addProject({
          id: projectId,
          name: `Podcast ${new Date().toLocaleDateString()}`,
          description: '',
          coverImage: null,
          category: 'solo',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          episodes: [],
        })
      );

      // Add episode to the project
      dispatch(
        addEpisode({
          projectId,
          episode: {
            id: episodeId,
            title: `Recording ${new Date().toLocaleTimeString()}`,
            description: '',
            duration: playbackDuration,
            recordedAt: Date.now(),
            fileUri: recordingUri,
            waveformData: null,
            status: 'draft',
            templateId: templateId,
          },
        })
      );

      await audioPlayerRef.current?.unloadAudio();

      Alert.alert('Success', 'Recording saved successfully', [
        {
          text: 'OK',
          onPress: () => {
            dispatch(resetAudio());
            navigation.navigate('Main');
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to save recording:', error);
      Alert.alert('Error', 'Failed to save recording');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading recording...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Preview Recording</Text>
        <Text style={styles.subtitle}>{templateName}</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.playerCard} shadow>
          <Text style={styles.label}>Listen to your recording</Text>

          <PlaybackControls
            isPlaying={isPlaying}
            currentPosition={currentPosition}
            duration={playbackDuration}
            playbackSpeed={playbackSpeed}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onSkipForward={handleSkipForward}
            onSkipBackward={handleSkipBackward}
            onSpeedChange={handleSpeedChange}
            disabled={isSaving}
          />
        </Card>

        <View style={styles.actions}>
          <Button
            title="Re-record"
            onPress={handleDiscard}
            variant="outline"
            style={styles.actionButton}
            disabled={isSaving}
          />
          <Button
            title={isSaving ? 'Saving...' : 'Save'}
            onPress={handleSave}
            style={styles.actionButton}
            disabled={isSaving}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
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
  playerCard: {
    padding: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
