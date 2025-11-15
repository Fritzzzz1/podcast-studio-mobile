import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '@theme';

export const SettingsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Settings</Text>
        <Text style={styles.sectionDesc}>Configure default audio preferences</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Management</Text>
        <Text style={styles.sectionDesc}>Manage recordings and storage</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <Text style={styles.sectionDesc}>Theme, language, and notifications</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.sectionDesc}>Version 1.0.0</Text>
      </View>
    </ScrollView>
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
    marginBottom: spacing.lg,
  },
  section: {
    backgroundColor: colors.gray100,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
