import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@theme';
import { Project } from '@store/projectsSlice';

export interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTotalDuration = (): string => {
    const totalMs = project.episodes.reduce((acc, ep) => acc + ep.duration, 0);
    const totalMin = Math.floor(totalMs / 60000);
    if (totalMin < 60) {
      return `${totalMin}m`;
    }
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.coverContainer}>
        {project.coverImage ? (
          <Image source={{ uri: project.coverImage }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.placeholderCover]}>
            <Text style={styles.placeholderText}>🎙️</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {project.name}
        </Text>

        {project.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {project.description}
          </Text>
        ) : null}

        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {project.episodes.length} {project.episodes.length === 1 ? 'episode' : 'episodes'}
          </Text>
          {project.episodes.length > 0 && (
            <>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.metaText}>{getTotalDuration()}</Text>
            </>
          )}
        </View>

        <Text style={styles.date}>Updated {formatDate(project.updatedAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  coverContainer: {
    marginRight: spacing.md,
  },
  cover: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  placeholderCover: {
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  metaDivider: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginHorizontal: spacing.xs,
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
});
