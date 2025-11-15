import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProjectsScreenNavigationProp } from '@navigation/types';
import { colors, spacing, typography } from '@theme';
import { useAppSelector } from '@store';
import { ProjectCard, EmptyState } from '@components';

export const ProjectsScreen: React.FC = () => {
  const navigation = useNavigation<ProjectsScreenNavigationProp>();
  const projects = useAppSelector((state) => state.projects.projects);

  const handleProjectPress = (projectId: string) => {
    navigation.navigate('ProjectDetail', { projectId });
  };

  if (projects.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No Projects Yet"
          description="Start recording to create your first podcast project"
          actionLabel="Go to Templates"
          onAction={() => navigation.navigate('Main')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Projects</Text>
        <Text style={styles.subtitle}>
          {projects.length} {projects.length === 1 ? 'project' : 'projects'}
        </Text>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => handleProjectPress(item.id)}
          />
        )}
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
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
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
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
