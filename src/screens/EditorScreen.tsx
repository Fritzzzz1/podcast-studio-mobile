import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loadEpisodeForEditing,
  setSelection,
  addEffect,
  removeEffect,
  undo,
  redo,
  setProcessing,
  resetEditor,
  EditorEffect,
  VolumeEffect,
  FadeEffect,
} from '../store/editorSlice';
import { updateEpisode } from '../store/projectsSlice';
import { AudioEditor, AudioEnhancer, EnhancementPreset } from '../services';
import { Button, AudioWaveform, Slider, PlaybackControls } from '../components';
import { theme } from '../theme';
import { EffectSettings } from '../store/templatesSlice';

type EditorScreenProps = NativeStackScreenProps<RootStackParamList, 'Editor'>;

export const EditorScreen: React.FC<EditorScreenProps> = ({ route, navigation }) => {
  const { projectId, episodeId } = route.params;
  const dispatch = useAppDispatch();

  // Redux state
  const editor = useAppSelector((state) => state.editor);
  const projects = useAppSelector((state) => state.projects.projects);

  // Local state
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [fadeIn, setFadeIn] = useState<number>(0);
  const [fadeOut, setFadeOut] = useState<number>(0);

  // Enhancement state
  const [selectedPreset, setSelectedPreset] = useState<EnhancementPreset>('medium');
  const [enhancementSettings, setEnhancementSettings] = useState<EffectSettings>({
    noiseReduction: { enabled: true, level: 0.5 },
    normalization: { enabled: true, targetLevel: -16 },
    compression: { enabled: true, threshold: -18, ratio: 3 },
    eq: { preset: 'voice' },
  });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementProgress, setEnhancementProgress] = useState(0);

  // Find project and episode
  const project = projects.find((p) => p.id === projectId);
  const episode = project?.episodes.find((e) => e.id === episodeId);

  // Load episode on mount
  useEffect(() => {
    if (episode) {
      dispatch(
        loadEpisodeForEditing({
          episodeId: episode.id,
          projectId: projectId,
          audioUri: episode.fileUri,
          duration: episode.duration,
        })
      );

      // Generate waveform
      loadWaveform(episode.fileUri);
    }

    return () => {
      dispatch(resetEditor());
    };
  }, [episode?.id]);

  const loadWaveform = async (uri: string) => {
    try {
      const data = await AudioEditor.generateWaveform(uri, 100);
      setWaveformData(data);
    } catch (error) {
      console.error('Error loading waveform:', error);
    }
  };

  const handleApplyVolume = () => {
    if (volumeLevel === 0) {
      Alert.alert('Info', 'Volume is at 0dB (no change)');
      return;
    }

    const effect: EditorEffect = {
      id: `volume-${Date.now()}`,
      type: 'volume',
      params: {
        enabled: true,
        level: volumeLevel,
      } as VolumeEffect,
    };

    dispatch(addEffect(effect));
    Alert.alert('Success', `Volume adjustment of ${volumeLevel}dB added`);
  };

  const handleApplyFade = () => {
    if (fadeIn === 0 && fadeOut === 0) {
      Alert.alert('Info', 'No fade effects to apply');
      return;
    }

    const effect: EditorEffect = {
      id: `fade-${Date.now()}`,
      type: 'fade',
      params: {
        fadeIn,
        fadeOut,
      } as FadeEffect,
    };

    dispatch(addEffect(effect));
    Alert.alert('Success', 'Fade effects added');
  };

  const handleApplyTrim = () => {
    if (
      editor.selection.start === 0 &&
      editor.selection.end === editor.duration
    ) {
      Alert.alert('Info', 'No trimming needed - selection covers entire audio');
      return;
    }

    const effect: EditorEffect = {
      id: `trim-${Date.now()}`,
      type: 'trim',
      params: editor.selection,
    };

    dispatch(addEffect(effect));
    Alert.alert('Success', 'Trim markers added');
  };

  const handleClearEffect = (effectId: string) => {
    dispatch(removeEffect(effectId));
  };

  const handlePresetChange = (preset: EnhancementPreset) => {
    setSelectedPreset(preset);
    const presets = AudioEnhancer.getPresets();
    const presetConfig = presets[preset];

    setEnhancementSettings({
      noiseReduction: {
        enabled: true,
        level: presetConfig.noiseReduction.level,
      },
      normalization: {
        enabled: true,
        targetLevel: presetConfig.normalization.targetLevel,
      },
      compression: {
        enabled: true,
        threshold: presetConfig.compression.threshold,
        ratio: presetConfig.compression.ratio,
      },
      eq: {
        preset: presetConfig.eq.preset,
      },
    });
  };

  const handleApplyEnhancement = async () => {
    if (!editor.audioUri || !episode) {
      Alert.alert('Error', 'No audio file loaded');
      return;
    }

    try {
      setIsEnhancing(true);
      setEnhancementProgress(0);

      const enhancedUri = await AudioEnhancer.enhanceAudio(
        editor.audioUri,
        enhancementSettings,
        (progress) => {
          setEnhancementProgress(progress);
        }
      );

      // Update episode with enhanced file
      dispatch(
        updateEpisode({
          projectId,
          episodeId,
          updates: {
            fileUri: enhancedUri,
            status: 'processed',
          },
        })
      );

      // Reload waveform with enhanced audio
      await loadWaveform(enhancedUri);

      setIsEnhancing(false);
      setEnhancementProgress(0);

      Alert.alert('Success', 'Audio enhancement applied successfully!');
    } catch (error) {
      console.error('Enhancement error:', error);
      setIsEnhancing(false);
      setEnhancementProgress(0);
      Alert.alert('Error', 'Failed to enhance audio. Please try again.');
    }
  };

  const handleExport = async () => {
    if (!editor.audioUri || !episode) {
      Alert.alert('Error', 'No audio file loaded');
      return;
    }

    if (editor.effects.length === 0) {
      Alert.alert('Info', 'No effects to apply. Use original recording.');
      return;
    }

    try {
      dispatch(setProcessing({ isProcessing: true, progress: 0 }));

      const exportedUri = await AudioEditor.exportWithEffects(
        editor.audioUri,
        editor.effects,
        editor.duration,
        (progress) => {
          dispatch(setProcessing({ isProcessing: true, progress }));
        }
      );

      // Update episode with processed file
      dispatch(
        updateEpisode({
          projectId,
          episodeId,
          updates: {
            fileUri: exportedUri,
            status: 'processed',
          },
        })
      );

      dispatch(setProcessing({ isProcessing: false, progress: 100 }));

      Alert.alert(
        'Success',
        'Audio exported successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Export error:', error);
      dispatch(setProcessing({ isProcessing: false, progress: 0 }));
      Alert.alert('Error', 'Failed to export audio. Please try again.');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!episode) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Episode not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{episode.title}</Text>
        <View style={styles.undoRedoContainer}>
          <TouchableOpacity
            onPress={() => dispatch(undo())}
            disabled={editor.historyIndex <= 0}
          >
            <Text
              style={[
                styles.undoRedoText,
                editor.historyIndex <= 0 && styles.disabledText,
              ]}
            >
              ↶ Undo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => dispatch(redo())}
            disabled={editor.historyIndex >= editor.history.length - 1}
          >
            <Text
              style={[
                styles.undoRedoText,
                editor.historyIndex >= editor.history.length - 1 &&
                  styles.disabledText,
              ]}
            >
              ↷ Redo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Waveform */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Waveform</Text>
          {waveformData.length > 0 ? (
            <AudioWaveform
              waveformData={waveformData}
              duration={editor.duration}
              currentPosition={editor.currentPosition}
              selection={editor.selection}
              height={120}
            />
          ) : (
            <ActivityIndicator color={theme.colors.primary} />
          )}
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>
              Selection: {formatTime(editor.selection.start)} -{' '}
              {formatTime(editor.selection.end)}
            </Text>
            <Text style={styles.timeText}>
              Duration: {formatTime(editor.duration)}
            </Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          <PlaybackControls
            isPlaying={editor.isPlaying}
            currentPosition={editor.currentPosition}
            duration={editor.duration}
            playbackSpeed={1.0}
            onPlayPause={() => {
              // Playback will be implemented with AudioPlayer integration
              console.log('Playback toggle');
            }}
            onSeek={(position) => {
              console.log('Seek to:', position);
            }}
            onSkipForward={() => {
              console.log('Skip forward');
            }}
            onSkipBackward={() => {
              console.log('Skip backward');
            }}
            onSpeedChange={(speed) => {
              console.log('Speed change:', speed);
            }}
          />
        </View>

        {/* Trim Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trim Audio</Text>
          <Text style={styles.description}>
            Adjust the selection markers on the waveform to trim the audio
          </Text>
          <Button
            title="Apply Trim"
            onPress={handleApplyTrim}
            variant="secondary"
          />
        </View>

        {/* Volume Control */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volume Adjustment</Text>
          <Slider
            label="Volume"
            value={volumeLevel}
            min={-20}
            max={20}
            step={1}
            unit="dB"
            onValueChange={setVolumeLevel}
          />
          <Button
            title="Apply Volume"
            onPress={handleApplyVolume}
            variant="secondary"
          />
        </View>

        {/* Fade Effects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fade Effects</Text>
          <Slider
            label="Fade In"
            value={fadeIn}
            min={0}
            max={10}
            step={0.5}
            unit="s"
            onValueChange={setFadeIn}
          />
          <Slider
            label="Fade Out"
            value={fadeOut}
            min={0}
            max={10}
            step={0.5}
            unit="s"
            onValueChange={setFadeOut}
          />
          <Button
            title="Apply Fade"
            onPress={handleApplyFade}
            variant="secondary"
          />
        </View>

        {/* Audio Enhancement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Enhancement</Text>
          <Text style={styles.description}>
            Apply professional audio processing to improve quality
          </Text>

          {/* Preset Selector */}
          <View style={styles.presetContainer}>
            <Text style={styles.label}>Enhancement Preset:</Text>
            <View style={styles.presetButtons}>
              {(['light', 'medium', 'heavy', 'custom'] as EnhancementPreset[]).map(
                (preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetButton,
                      selectedPreset === preset && styles.presetButtonActive,
                    ]}
                    onPress={() => handlePresetChange(preset)}
                  >
                    <Text
                      style={[
                        styles.presetButtonText,
                        selectedPreset === preset && styles.presetButtonTextActive,
                      ]}
                    >
                      {preset.charAt(0).toUpperCase() + preset.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* Enhancement Settings Display */}
          <View style={styles.enhancementSettings}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Noise Reduction:</Text>
              <Text style={styles.settingValue}>
                {enhancementSettings.noiseReduction.enabled
                  ? `${(enhancementSettings.noiseReduction.level * 100).toFixed(0)}%`
                  : 'Off'}
              </Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Normalization:</Text>
              <Text style={styles.settingValue}>
                {enhancementSettings.normalization.enabled
                  ? `${enhancementSettings.normalization.targetLevel} LUFS`
                  : 'Off'}
              </Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Compression:</Text>
              <Text style={styles.settingValue}>
                {enhancementSettings.compression.enabled
                  ? `${enhancementSettings.compression.ratio}:1`
                  : 'Off'}
              </Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>EQ Preset:</Text>
              <Text style={styles.settingValue}>
                {enhancementSettings.eq.preset.charAt(0).toUpperCase() +
                  enhancementSettings.eq.preset.slice(1)}
              </Text>
            </View>
          </View>

          <Button
            title={
              isEnhancing
                ? `Enhancing... ${Math.round(enhancementProgress)}%`
                : 'Apply Enhancement'
            }
            onPress={handleApplyEnhancement}
            disabled={isEnhancing}
            variant="secondary"
          />
        </View>

        {/* Active Effects List */}
        {editor.effects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Active Effects ({editor.effects.length})
            </Text>
            {editor.effects.map((effect) => (
              <View key={effect.id} style={styles.effectItem}>
                <View>
                  <Text style={styles.effectType}>
                    {effect.type.toUpperCase()}
                  </Text>
                  <Text style={styles.effectParams}>
                    {JSON.stringify(effect.params)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleClearEffect(effect.id)}
                >
                  <Text style={styles.removeButton}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Export Button */}
        <View style={styles.section}>
          <Button
            title={
              editor.isProcessing
                ? `Processing... ${Math.round(editor.processingProgress)}%`
                : 'Export with Effects'
            }
            onPress={handleExport}
            disabled={editor.isProcessing || editor.effects.length === 0}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
    backgroundColor: theme.colors.background,
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
  undoRedoContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  undoRedoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  disabledText: {
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
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  timeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  effectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: theme.spacing.xs,
  },
  effectType: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  effectParams: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  removeButton: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.error,
  },
  presetContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  presetButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  presetButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  presetButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  presetButtonTextActive: {
    color: '#FFFFFF',
  },
  enhancementSettings: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  settingValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
});
