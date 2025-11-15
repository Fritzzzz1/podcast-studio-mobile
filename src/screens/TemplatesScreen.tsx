import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TemplatesScreenNavigationProp } from '@types/navigation';
import { colors, spacing, typography } from '@theme';
import { useAppSelector, useAppDispatch } from '@store';
import { selectTemplate } from '@store/templatesSlice';
import { TemplateCard, Button, EmptyState } from '@components';

export const TemplatesScreen: React.FC = () => {
  const navigation = useNavigation<TemplatesScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const templates = useAppSelector((state) => state.templates.templates);
  const selectedTemplateId = useAppSelector((state) => state.templates.selectedTemplateId);

  const handleSelectTemplate = (templateId: string) => {
    dispatch(selectTemplate(templateId));
  };

  if (templates.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No Templates Available"
          description="Create your first podcast template to get started"
          actionLabel="Create Template"
          onAction={() => {
            // Navigate to create template screen when implemented
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Podcast Templates</Text>
        <Text style={styles.subtitle}>
          Select a template optimized for your recording style
        </Text>
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TemplateCard
            template={item}
            isSelected={item.id === selectedTemplateId}
            onPress={() => handleSelectTemplate(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Button
          title="Start Recording"
          onPress={() => {
            // Navigate to recording screen when implemented
            // navigation.navigate('Recording', { templateId: selectedTemplateId });
          }}
          fullWidth
          disabled={!selectedTemplateId}
        />
      </View>
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
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
