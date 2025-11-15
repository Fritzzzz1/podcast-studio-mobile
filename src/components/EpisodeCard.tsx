import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@theme';
import { Episode } from '@store/projectsSlice';

export interface EpisodeCardProps {
  episode: Episode;
  onPress: () => void;
  showStatus?: boolean;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({
  episode,
  onPress,
  showStatus = true,
}) => {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (): string => {
    switch (episode.status) {
      case 'draft':
        return colors.warning;
      case 'processed':
        return colors.info;
      case 'exported':
        return colors.success;
      default:
        return colors.textTertiary;
    }
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
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {episode.title}
          </Text>
          {showStatus && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getStatusLabel()}</Text>
            </View>
          )}
        </View>

        {episode.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {episode.description}
          </Text>
        ) : null}

        <View style={styles.meta}>
          <Text style={styles.metaText}>{formatDuration(episode.duration)}</Text>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.metaText}>{formatDate(episode.recordedAt)}</Text>
        </View>
      </View>

      <View style={styles.playIcon}>
        <Text style={styles.playIconText}>▶</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  content: {
    flex: 1,
    marginRight: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
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
  playIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconText: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
  },
});
