import * as FileSystem from 'expo-file-system';
import { EffectSettings } from '../store/templatesSlice';

/**
 * Enhancement preset levels for quick application
 */
export type EnhancementPreset = 'light' | 'medium' | 'heavy' | 'custom';

export interface EnhancementPresetConfig {
  noiseReduction: { level: number };
  normalization: { targetLevel: number };
  compression: { threshold: number; ratio: number };
  eq: { preset: 'voice' | 'bass' | 'flat' | 'custom' };
}

/**
 * AudioEnhancer service handles automated audio enhancement
 * including noise reduction, normalization, compression, and EQ.
 *
 * For MVP, we provide the service structure with placeholder implementations.
 * In production, these would use FFmpeg filters or native audio processing.
 */
class AudioEnhancer {
  /**
   * Predefined enhancement presets
   */
  private readonly PRESETS: Record<EnhancementPreset, EnhancementPresetConfig> = {
    light: {
      noiseReduction: { level: 0.3 },
      normalization: { targetLevel: -16 },
      compression: { threshold: -20, ratio: 2 },
      eq: { preset: 'voice' },
    },
    medium: {
      noiseReduction: { level: 0.5 },
      normalization: { targetLevel: -14 },
      compression: { threshold: -18, ratio: 3 },
      eq: { preset: 'voice' },
    },
    heavy: {
      noiseReduction: { level: 0.7 },
      normalization: { targetLevel: -12 },
      compression: { threshold: -16, ratio: 4 },
      eq: { preset: 'voice' },
    },
    custom: {
      noiseReduction: { level: 0.5 },
      normalization: { targetLevel: -16 },
      compression: { threshold: -18, ratio: 3 },
      eq: { preset: 'custom' },
    },
  };

  /**
   * Generate a unique filename for enhanced audio
   */
  private generateOutputFilename(originalUri: string): string {
    const timestamp = Date.now();
    const extension = originalUri.split('.').pop() || 'm4a';
    return `${FileSystem.cacheDirectory}enhanced_${timestamp}.${extension}`;
  }

  /**
   * Apply noise reduction filter
   * Removes background noise and hiss from audio
   *
   * @param level - Noise reduction intensity (0.0 to 1.0)
   */
  async applyNoiseReduction(
    inputUri: string,
    level: number,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(10);

      if (level === 0) {
        return inputUri;
      }

      const outputUri = this.generateOutputFilename(inputUri);

      onProgress?.(50);

      // Copy the file for now (placeholder for actual noise reduction)
      await FileSystem.copyAsync({
        from: inputUri,
        to: outputUri,
      });

      onProgress?.(100);

      // TODO: Implement with FFmpeg afftdn (audio FFT denoise) filter
      // Command: ffmpeg -i input.m4a -af "afftdn=nf=${level * 100}" output.m4a
      // Or use highpass/lowpass filters: -af "highpass=f=80,lowpass=f=10000"
      console.log(`Noise reduction applied at level: ${level}`);

      return outputUri;
    } catch (error) {
      console.error('Error applying noise reduction:', error);
      throw new Error('Failed to apply noise reduction');
    }
  }

  /**
   * Apply normalization to ensure consistent volume levels
   * Normalizes audio to a target loudness level
   *
   * @param targetLevel - Target LUFS level (e.g., -16 for podcasts)
   */
  async applyNormalization(
    inputUri: string,
    targetLevel: number,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(10);

      const outputUri = this.generateOutputFilename(inputUri);

      onProgress?.(50);

      // Copy the file for now (placeholder for actual normalization)
      await FileSystem.copyAsync({
        from: inputUri,
        to: outputUri,
      });

      onProgress?.(100);

      // TODO: Implement with FFmpeg loudnorm filter
      // Two-pass normalization for best results:
      // Pass 1: ffmpeg -i input.m4a -af loudnorm=I=${targetLevel}:print_format=json -f null -
      // Pass 2: ffmpeg -i input.m4a -af loudnorm=I=${targetLevel}:measured_I=...:measured_TP=... output.m4a
      console.log(`Normalization applied to target level: ${targetLevel} LUFS`);

      return outputUri;
    } catch (error) {
      console.error('Error applying normalization:', error);
      throw new Error('Failed to apply normalization');
    }
  }

  /**
   * Apply dynamic range compression
   * Reduces the difference between loud and quiet parts
   *
   * @param threshold - Compression threshold in dB
   * @param ratio - Compression ratio (2:1, 3:1, 4:1, etc.)
   */
  async applyCompression(
    inputUri: string,
    threshold: number,
    ratio: number,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(10);

      const outputUri = this.generateOutputFilename(inputUri);

      onProgress?.(50);

      // Copy the file for now (placeholder for actual compression)
      await FileSystem.copyAsync({
        from: inputUri,
        to: outputUri,
      });

      onProgress?.(100);

      // TODO: Implement with FFmpeg acompressor filter
      // Command: ffmpeg -i input.m4a -af "acompressor=threshold=${threshold}dB:ratio=${ratio}:attack=5:release=50" output.m4a
      // attack and release times in milliseconds
      console.log(`Compression applied: threshold ${threshold}dB, ratio ${ratio}:1`);

      return outputUri;
    } catch (error) {
      console.error('Error applying compression:', error);
      throw new Error('Failed to apply compression');
    }
  }

  /**
   * Apply EQ preset for audio enhancement
   *
   * @param preset - EQ preset type
   */
  async applyEQ(
    inputUri: string,
    preset: 'voice' | 'bass' | 'flat' | 'custom',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(10);

      if (preset === 'flat') {
        return inputUri;
      }

      const outputUri = this.generateOutputFilename(inputUri);

      onProgress?.(50);

      // Copy the file for now (placeholder for actual EQ)
      await FileSystem.copyAsync({
        from: inputUri,
        to: outputUri,
      });

      onProgress?.(100);

      // TODO: Implement with FFmpeg equalizer filter
      // Voice preset: boost presence (2-5kHz), reduce low rumble (<80Hz)
      // Command: ffmpeg -i input.m4a -af "equalizer=f=80:t=h:w=100:g=-6,equalizer=f=3000:t=h:w=1000:g=3" output.m4a
      //
      // Bass preset: boost low frequencies
      // Command: ffmpeg -i input.m4a -af "equalizer=f=100:t=h:w=200:g=5,equalizer=f=200:t=h:w=100:g=3" output.m4a
      console.log(`EQ preset applied: ${preset}`);

      return outputUri;
    } catch (error) {
      console.error('Error applying EQ:', error);
      throw new Error('Failed to apply EQ');
    }
  }

  /**
   * Apply all enhancement effects based on settings
   * Processes in optimal order: noise reduction -> compression -> EQ -> normalization
   */
  async enhanceAudio(
    inputUri: string,
    settings: EffectSettings,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      let currentUri = inputUri;
      const steps: string[] = [];

      // Determine which steps to apply
      if (settings.noiseReduction.enabled) steps.push('noise');
      if (settings.compression.enabled) steps.push('compression');
      steps.push('eq'); // Always apply EQ (even if 'flat')
      if (settings.normalization.enabled) steps.push('normalization');

      const totalSteps = steps.length;
      let completedSteps = 0;

      // Step 1: Noise Reduction (always first to clean the signal)
      if (settings.noiseReduction.enabled) {
        const stepProgress = (completedSteps / totalSteps) * 100;
        currentUri = await this.applyNoiseReduction(
          currentUri,
          settings.noiseReduction.level,
          (p) => {
            const overallProgress = stepProgress + (p / totalSteps);
            onProgress?.(overallProgress);
          }
        );
        completedSteps++;
      }

      // Step 2: Compression (before EQ to shape dynamics)
      if (settings.compression.enabled) {
        const stepProgress = (completedSteps / totalSteps) * 100;
        currentUri = await this.applyCompression(
          currentUri,
          settings.compression.threshold,
          settings.compression.ratio,
          (p) => {
            const overallProgress = stepProgress + (p / totalSteps);
            onProgress?.(overallProgress);
          }
        );
        completedSteps++;
      }

      // Step 3: EQ (to shape frequency response)
      const stepProgress = (completedSteps / totalSteps) * 100;
      currentUri = await this.applyEQ(currentUri, settings.eq.preset, (p) => {
        const overallProgress = stepProgress + (p / totalSteps);
        onProgress?.(overallProgress);
      });
      completedSteps++;

      // Step 4: Normalization (last to ensure final loudness)
      if (settings.normalization.enabled) {
        const stepProgress = (completedSteps / totalSteps) * 100;
        currentUri = await this.applyNormalization(
          currentUri,
          settings.normalization.targetLevel,
          (p) => {
            const overallProgress = stepProgress + (p / totalSteps);
            onProgress?.(overallProgress);
          }
        );
        completedSteps++;
      }

      onProgress?.(100);

      return currentUri;
    } catch (error) {
      console.error('Error enhancing audio:', error);
      throw new Error('Failed to enhance audio');
    }
  }

  /**
   * Apply enhancement preset
   */
  async applyPreset(
    inputUri: string,
    preset: EnhancementPreset,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const presetConfig = this.PRESETS[preset];

    const effectSettings: EffectSettings = {
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
    };

    return this.enhanceAudio(inputUri, effectSettings, onProgress);
  }

  /**
   * Get available enhancement presets
   */
  getPresets(): Record<EnhancementPreset, EnhancementPresetConfig> {
    return this.PRESETS;
  }

  /**
   * Analyze audio and suggest enhancement settings
   * Returns recommended settings based on audio characteristics
   */
  async analyzeAndSuggest(audioUri: string): Promise<EffectSettings> {
    try {
      // TODO: Implement audio analysis
      // Could use FFmpeg to analyze:
      // - Noise floor (suggest noise reduction level)
      // - Dynamic range (suggest compression settings)
      // - Frequency spectrum (suggest EQ preset)
      // - Average loudness (suggest normalization target)

      // For now, return medium preset settings
      return {
        noiseReduction: { enabled: true, level: 0.5 },
        normalization: { enabled: true, targetLevel: -16 },
        compression: { enabled: true, threshold: -18, ratio: 3 },
        eq: { preset: 'voice' },
      };
    } catch (error) {
      console.error('Error analyzing audio:', error);
      throw new Error('Failed to analyze audio');
    }
  }

  /**
   * Clean up temporary enhanced files
   */
  async cleanup(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists && uri.includes('enhanced_')) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error('Error cleaning up enhanced file:', error);
    }
  }
}

export default new AudioEnhancer();
