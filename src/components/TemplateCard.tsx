import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@theme';
import { Template } from '@store/templatesSlice';

export interface TemplateCardProps {
  template: Template;
  isSelected?: boolean;
  onPress?: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected = false,
  onPress,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'solo':
        return colors.primary;
      case 'interview':
        return colors.secondary;
      case 'panel':
        return colors.info;
      case 'narrative':
        return colors.success;
      default:
        return colors.gray400;
    }
  };

  const categoryColor = getCategoryColor(template.category);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        shadows.md,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
        <Text style={styles.categoryText}>{template.category.toUpperCase()}</Text>
      </View>

      <Text style={styles.name}>{template.name}</Text>
      <Text style={styles.description}>{template.description}</Text>

      <View style={styles.specs}>
        <View style={styles.spec}>
          <Text style={styles.specLabel}>Sample Rate</Text>
          <Text style={styles.specValue}>{template.audioSettings.sampleRate / 1000}kHz</Text>
        </View>
        <View style={styles.spec}>
          <Text style={styles.specLabel}>Channels</Text>
          <Text style={styles.specValue}>
            {template.audioSettings.channels === 1 ? 'Mono' : 'Stereo'}
          </Text>
        </View>
        <View style={styles.spec}>
          <Text style={styles.specLabel}>Format</Text>
          <Text style={styles.specValue}>{template.audioSettings.format.toUpperCase()}</Text>
        </View>
      </View>

      {template.effects.noiseReduction.enabled && (
        <View style={styles.features}>
          <Text style={styles.featureText}>✓ Noise Reduction</Text>
          <Text style={styles.featureText}>✓ Normalization</Text>
          <Text style={styles.featureText}>✓ Compression</Text>
        </View>
      )}

      {template.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>DEFAULT</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  specs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  spec: {
    flex: 1,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  specValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  defaultBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.info,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  defaultText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
