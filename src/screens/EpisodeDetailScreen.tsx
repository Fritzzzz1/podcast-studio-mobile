import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  EpisodeDetailScreenNavigationProp,
  EpisodeDetailScreenRouteProp,
} from '@navigation/types';
import { colors, spacing, typography, borderRadius, shadows } from '@theme';
import { useAppSelector, useAppDispatch } from '@store';
import { deleteEpisode, updateEpisode } from '@store/projectsSlice';
import { AudioPlayer, PlaybackStatus } from '@services';
import {
  Button,
  Card,
  PlaybackControls,
  LoadingSpinner,
  Input,
} from '@components';

export const EpisodeDetailScreen: React.FC = () => {
  const navigation = useNavigation<EpisodeDetailScreenNavigationProp>();
  const route = useRoute<EpisodeDetailScreenRouteProp>();
  const dispatch = useAppDispatch();

  const { projectId, episodeId } = route.params;
  const project = useAppSelector((state) =>
    state.projects.projects.find((p) => p.id === projectId)
  );
  const episode = project?.episodes.find((e) => e.id === episodeId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (episode) {
      setEditedTitle(episode.title);
      setEditedDescription(episode.description);
      initializePlayer();
    }

    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.unloadAudio().catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode?.fileUri]);

  const initializePlayer = async () => {
    if (!episode) return;

    try {
      const player = new AudioPlayer(handlePlaybackStatus);
      await player.loadAudio(episode.fileUri);
      audioPlayerRef.current = player;
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load audio:', error);
      Alert.alert('Error', 'Failed to load episode for playback');
      setIsLoading(false);
    }
  };

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

  const handleSaveEdit = () => {
    if (!episode) return;

    dispatch(
      updateEpisode({
        projectId,
        episodeId,
        updates: {
          title: editedTitle.trim() || episode.title,
          description: editedDescription.trim(),
        },
      })
    );

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (!episode) return;

    setEditedTitle(episode.title);
    setEditedDescription(episode.description);
    setIsEditing(false);
  };

  const handleDeleteEpisode = () => {
    Alert.alert(
      'Delete Episode',
      'Are you sure you want to delete this episode? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await audioPlayerRef.current?.unloadAudio();
              dispatch(deleteEpisode({ projectId, episodeId }));
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete episode:', error);
            }
          },
        },
      ]
    );
  };

  if (!episode || !project) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Episode not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusLabel = (): string => {
    switch (episode.status) {
      case 'draft':
        return 'Draft';
      case 'processed':
        return 'Processed';
      case 'exported':
        return 'Exported';
      default:
        return episode.status;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.playerCard} shadow>
        <View style={styles.header}>
          {isEditing ? (
            <>
              <Input
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Episode Title"
                style={styles.titleInput}
              />
              <Input
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Episode Description (optional)"
                multiline
                numberOfLines={3}
                style={styles.descriptionInput}
              />
              <View style={styles.editActions}>
                <Button
                  title="Cancel"
                  onPress={handleCancelEdit}
                  variant="outline"
                  style={styles.editButton}
                />
                <Button
                  title="Save"
                  onPress={handleSaveEdit}
                  style={styles.editButton}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{episode.title}</Text>
              {episode.description ? (
                <Text style={styles.description}>{episode.description}</Text>
              ) : null}
              <Button
                title="Edit Details"
                onPress={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                fullWidth
              />
            </>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" />
            <Text style={styles.loadingText}>Loading audio...</Text>
          </View>
        ) : (
          <View style={styles.playerContainer}>
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
            />
          </View>
        )}
      </Card>

      <Card style={styles.infoCard} shadow>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Project</Text>
          <Text style={styles.infoValue}>{project.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>{getStatusLabel()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Recorded</Text>
          <Text style={styles.infoValue}>{formatDate(episode.recordedAt)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>File Location</Text>
          <Text style={[styles.infoValue, styles.fileUri]} numberOfLines={2}>
            {episode.fileUri}
          </Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          title="Edit Audio"
          onPress={() => navigation.navigate('Editor', { projectId, episodeId })}
          fullWidth
          style={styles.actionButton}
        />
        <Button
          title="Delete Episode"
          onPress={handleDeleteEpisode}
          variant="outline"
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  playerCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  titleInput: {
    marginBottom: spacing.md,
  },
  descriptionInput: {
    marginBottom: spacing.md,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  editButton: {
    flex: 1,
  },
  playerContainer: {
    marginTop: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  fileUri: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  actions: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
