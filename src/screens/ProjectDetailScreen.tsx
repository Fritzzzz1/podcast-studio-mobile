import React from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {  ProjectDetailScreenNavigationProp,
  ProjectDetailScreenRouteProp,
} from '@navigation/types';
import { colors, spacing, typography, borderRadius, shadows } from '@theme';
import { useAppSelector, useAppDispatch } from '@store';
import { deleteProject, deleteEpisode } from '@store/projectsSlice';
import { Button, EpisodeCard, EmptyState, Card } from '@components';

export const ProjectDetailScreen: React.FC = () => {
  const navigation = useNavigation<ProjectDetailScreenNavigationProp>();
  const route = useRoute<ProjectDetailScreenRouteProp>();
  const dispatch = useAppDispatch();

  const { projectId } = route.params;
  const project = useAppSelector((state) =>
    state.projects.projects.find((p) => p.id === projectId)
  );

  const handleEpisodePress = (episodeId: string) => {
    navigation.navigate('EpisodeDetail', { projectId, episodeId });
  };

  const handleDeleteProject = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project and all its episodes? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteProject(projectId));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDeleteEpisode = (episodeId: string) => {
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
          onPress: () => {
            dispatch(deleteEpisode({ projectId, episodeId }));
          },
        },
      ]
    );
  };

  if (!project) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Project Not Found"
          description="This project may have been deleted"
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
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

  const getTotalDuration = (): string => {
    const totalMs = project.episodes.reduce((acc, ep) => acc + ep.duration, 0);
    const totalMin = Math.floor(totalMs / 60000);
    if (totalMin < 60) {
      return `${totalMin} minutes`;
    }
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={project.episodes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Card style={styles.projectCard} shadow>
              <View style={styles.coverContainer}>
                {project.coverImage ? (
                  <Image
                    source={{ uri: project.coverImage }}
                    style={styles.cover}
                  />
                ) : (
                  <View style={[styles.cover, styles.placeholderCover]}>
                    <Text style={styles.placeholderText}>🎙️</Text>
                  </View>
                )}
              </View>

              <Text style={styles.projectName}>{project.name}</Text>

              {project.description ? (
                <Text style={styles.projectDescription}>
                  {project.description}
                </Text>
              ) : null}

              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{project.episodes.length}</Text>
                  <Text style={styles.statLabel}>
                    {project.episodes.length === 1 ? 'Episode' : 'Episodes'}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{getTotalDuration()}</Text>
                  <Text style={styles.statLabel}>Total Duration</Text>
                </View>
              </View>

              <View style={styles.meta}>
                <Text style={styles.metaText}>
                  Created {formatDate(project.createdAt)}
                </Text>
                <Text style={styles.metaText}>
                  Updated {formatDate(project.updatedAt)}
                </Text>
              </View>

              <Button
                title="Delete Project"
                onPress={handleDeleteProject}
                variant="outline"
                fullWidth
              />
            </Card>

            <View style={styles.episodesHeader}>
              <Text style={styles.episodesTitle}>Episodes</Text>
              {project.episodes.length > 0 && (
                <Text style={styles.episodesCount}>
                  {project.episodes.length}
                </Text>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <EpisodeCard
            episode={item}
            onPress={() => handleEpisodePress(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Episodes Yet"
            description="This project doesn't have any episodes"
            actionLabel="Go to Templates"
            onAction={() => navigation.navigate('Main')}
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
  },
  projectCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  coverContainer: {
    marginBottom: spacing.lg,
  },
  cover: {
    width: 150,
    height: 150,
    borderRadius: borderRadius.lg,
  },
  placeholderCover: {
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
  },
  projectName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  projectDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  meta: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs / 2,
  },
  episodesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  episodesTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  episodesCount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
});
