import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TemplatesScreenNavigationProp } from '@types/navigation';
import { colors, spacing, typography } from '@theme';
import { useAppSelector } from '@store';

export const TemplatesScreen: React.FC = () => {
  const navigation = useNavigation<TemplatesScreenNavigationProp>();
  const templates = useAppSelector((state) => state.templates.templates);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Templates</Text>
      <Text style={styles.subtitle}>Choose a template for your podcast recording</Text>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.templateCard}>
            <Text style={styles.templateName}>{item.name}</Text>
            <Text style={styles.templateDesc}>{item.description}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
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
    marginBottom: spacing.lg,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  templateCard: {
    backgroundColor: colors.gray100,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  templateName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  templateDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
