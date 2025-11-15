import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '@navigation/types';
import { colors, spacing, typography, borderRadius, shadows } from '@theme';
import { useAppSelector } from '@store';
import { Button, Card, EmptyState } from '@components';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const projects = useAppSelector((state) => state.projects.projects);
  const selectedTemplate = useAppSelector((state) => {
    const templateId = state.templates.selectedTemplateId;
    return state.templates.templates.find((t) => t.id === templateId);
  });

  const totalRecordings = projects.reduce((acc, project) => acc + project.episodes.length, 0);
  const totalProjects = projects.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back! 👋</Text>
        <Text style={styles.subtitle}>Ready to record your next podcast?</Text>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Button
          title="🎙️ Start Recording"
          onPress={() => {
            navigation.navigate('Recording', {
              templateId: selectedTemplate?.id || 'solo-podcast',
            });
          }}
          size="lg"
          fullWidth
        />
        <View style={styles.row}>
          <Button
            title="Projects"
            onPress={() => navigation.navigate('Projects')}
            variant="outline"
            size="md"
            style={styles.halfButton}
          />
          <Button
            title="Templates"
            onPress={() => navigation.navigate('Templates')}
            variant="outline"
            size="md"
            style={styles.halfButton}
          />
        </View>
      </View>

      <View style={styles.stats}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard} shadow>
            <Text style={styles.statValue}>{totalProjects}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </Card>
          <Card style={styles.statCard} shadow>
            <Text style={styles.statValue}>{totalRecordings}</Text>
            <Text style={styles.statLabel}>Recordings</Text>
          </Card>
        </View>
      </View>

      <View style={styles.currentTemplate}>
        <Text style={styles.sectionTitle}>Current Template</Text>
        {selectedTemplate ? (
          <Card style={styles.templateInfo} shadow>
            <Text style={styles.templateName}>{selectedTemplate.name}</Text>
            <Text style={styles.templateDesc}>{selectedTemplate.description}</Text>
            <View style={styles.templateSpecs}>
              <Text style={styles.spec}>
                {selectedTemplate.audioSettings.sampleRate / 1000}kHz
              </Text>
              <Text style={styles.spec}>•</Text>
              <Text style={styles.spec}>
                {selectedTemplate.audioSettings.channels === 1 ? 'Mono' : 'Stereo'}
              </Text>
              <Text style={styles.spec}>•</Text>
              <Text style={styles.spec}>{selectedTemplate.audioSettings.format.toUpperCase()}</Text>
            </View>
          </Card>
        ) : (
          <EmptyState title="No template selected" actionLabel="Choose Template" onAction={() => navigation.navigate('Templates')} />
        )}
      </View>

      {totalRecordings === 0 && (
        <View style={styles.emptyRecordings}>
          <EmptyState
            title="No recordings yet"
            description="Start your first podcast recording to see it here"
            actionLabel="Start Recording"
            onAction={() => {
              navigation.navigate('Recording', {
                templateId: selectedTemplate?.id || 'solo-podcast',
              });
            }}
          />
        </View>
      )}
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
    paddingBottom: spacing['2xl'],
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  quickActions: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  halfButton: {
    flex: 1,
  },
  stats: {
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  currentTemplate: {
    marginBottom: spacing.xl,
  },
  templateInfo: {
    padding: spacing.md,
  },
  templateName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  templateDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  templateSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  spec: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  emptyRecordings: {
    marginTop: spacing.lg,
  },
});
