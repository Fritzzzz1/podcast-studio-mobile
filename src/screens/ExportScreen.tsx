import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import {
  AudioExporter,
  ExportFormat,
  QualityPreset,
  AudioMetadata,
} from '../services';
import { Button } from '../components';
import { theme } from '../theme';

type ExportScreenProps = NativeStackScreenProps<RootStackParamList, 'Export'>;

export const ExportScreen: React.FC<ExportScreenProps> = ({ route, navigation }) => {
  const { projectId, episodeId, audioUri, episodeTitle, duration } = route.params;

  // Export state
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('mp3');
  const [selectedQuality, setSelectedQuality] = useState<QualityPreset>('high');
  const [filename, setFilename] = useState<string>(
    episodeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Metadata state
  const [metadata, setMetadata] = useState<AudioMetadata>({
    title: episodeTitle,
    artist: '',
    album: '',
    year: new Date().getFullYear().toString(),
    comment: '',
    genre: 'Podcast',
  });

  const formats: ExportFormat[] = ['mp3', 'wav', 'm4a'];
  const qualityPresets: QualityPreset[] = ['low', 'medium', 'high', 'lossless'];

  const getFormatLabel = (format: ExportFormat): string => {
    const labels: Record<ExportFormat, string> = {
      mp3: 'MP3 (Compressed)',
      wav: 'WAV (Lossless)',
      m4a: 'M4A (AAC)',
    };
    return labels[format];
  };

  const getQualityLabel = (preset: QualityPreset): string => {
    const labels: Record<QualityPreset, string> = {
      low: 'Low (64 kbps)',
      medium: 'Medium (128 kbps)',
      high: 'High (192 kbps)',
      lossless: 'Lossless',
    custom: 'Custom',
    };
    return labels[preset];
  };

  const getEstimatedSize = (): string => {
    const bytes = AudioExporter.estimateFileSize(duration, selectedQuality);
    return AudioExporter.formatFileSize(bytes);
  };

  const handleExport = async () => {
    if (!filename.trim()) {
      Alert.alert('Error', 'Please enter a filename');
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);

      const result = await AudioExporter.exportAudio(
        audioUri,
        {
          format: selectedFormat,
          quality: selectedQuality,
          filename,
          metadata,
        },
        (progress) => {
          setExportProgress(progress);
        }
      );

      setIsExporting(false);

      Alert.alert(
        'Export Successful!',
        `File saved as ${result.filename}\nSize: ${AudioExporter.formatFileSize(
          result.sizeBytes
        )}`,
        [
          {
            text: 'Share',
            onPress: () => handleShare(result.uri),
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      Alert.alert('Error', 'Failed to export audio. Please try again.');
    }
  };

  const handleShare = async (uri: string) => {
    try {
      await AudioExporter.shareAudio(uri, `Sharing ${filename}`);
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share audio. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Export Audio</Text>
        <Text style={styles.subtitle}>{episodeTitle}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Filename Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filename</Text>
          <TextInput
            style={styles.input}
            value={filename}
            onChangeText={setFilename}
            placeholder="Enter filename"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Format Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Format</Text>
          <View style={styles.optionsContainer}>
            {formats.map((format) => (
              <TouchableOpacity
                key={format}
                style={[
                  styles.optionButton,
                  selectedFormat === format && styles.optionButtonActive,
                ]}
                onPress={() => setSelectedFormat(format)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedFormat === format && styles.optionButtonTextActive,
                  ]}
                >
                  {getFormatLabel(format)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quality Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality</Text>
          <View style={styles.optionsContainer}>
            {qualityPresets.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.optionButton,
                  selectedQuality === preset && styles.optionButtonActive,
                ]}
                onPress={() => setSelectedQuality(preset)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedQuality === preset && styles.optionButtonTextActive,
                  ]}
                >
                  {getQualityLabel(preset)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* File Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duration:</Text>
              <Text style={styles.infoValue}>
                {Math.floor(duration / 60)}:{Math.floor(duration % 60)
                  .toString()
                  .padStart(2, '0')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Size:</Text>
              <Text style={styles.infoValue}>{getEstimatedSize()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Output Format:</Text>
              <Text style={styles.infoValue}>{selectedFormat.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metadata (Optional)</Text>
          <Text style={styles.description}>
            Add information that will be embedded in the audio file
          </Text>

          <View style={styles.metadataContainer}>
            <View style={styles.metadataField}>
              <Text style={styles.metadataLabel}>Title</Text>
              <TextInput
                style={styles.metadataInput}
                value={metadata.title}
                onChangeText={(text) => setMetadata({ ...metadata, title: text })}
                placeholder="Episode title"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.metadataField}>
              <Text style={styles.metadataLabel}>Artist / Author</Text>
              <TextInput
                style={styles.metadataInput}
                value={metadata.artist}
                onChangeText={(text) => setMetadata({ ...metadata, artist: text })}
                placeholder="Your name or podcast name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.metadataField}>
              <Text style={styles.metadataLabel}>Album / Series</Text>
              <TextInput
                style={styles.metadataInput}
                value={metadata.album}
                onChangeText={(text) => setMetadata({ ...metadata, album: text })}
                placeholder="Podcast series name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.metadataField}>
              <Text style={styles.metadataLabel}>Genre</Text>
              <TextInput
                style={styles.metadataInput}
                value={metadata.genre}
                onChangeText={(text) => setMetadata({ ...metadata, genre: text })}
                placeholder="e.g., Podcast, Interview"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Export Progress */}
        {isExporting && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exporting...</Text>
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { width: `${exportProgress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(exportProgress)}%
            </Text>
          </View>
        )}

        {/* Export Button */}
        <View style={styles.section}>
          <Button
            title={isExporting ? 'Exporting...' : 'Export Audio'}
            onPress={handleExport}
            disabled={isExporting}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  backButton: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
  optionsContainer: {
    gap: theme.spacing.xs,
  },
  optionButton: {
    padding: theme.spacing.md,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  optionButtonActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  optionButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  optionButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  infoContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  metadataContainer: {
    gap: theme.spacing.sm,
  },
  metadataField: {
    gap: theme.spacing.xs,
  },
  metadataLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  metadataInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  progressContainer: {
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
