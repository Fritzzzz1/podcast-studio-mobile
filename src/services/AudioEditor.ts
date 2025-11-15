import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { TrimMarkers, VolumeEffect, FadeEffect, EditorEffect } from '../store/editorSlice';

/**
 * AudioEditor service handles audio processing operations
 * including trimming, volume adjustment, and fade effects.
 *
 * For MVP, we'll use basic Web Audio API capabilities through expo-av.
 * For advanced processing, FFmpeg can be integrated in the future.
 */
class AudioEditor {
  /**
   * Generate a unique filename for processed audio
   */
  private generateOutputFilename(originalUri: string): string {
    const timestamp = Date.now();
    const extension = originalUri.split('.').pop() || 'm4a';
    return `${FileSystem.cacheDirectory}processed_${timestamp}.${extension}`;
  }

  /**
   * Trim audio file - cut from start and/or end
   * For MVP: This creates a new audio file with trimmed content
   *
   * Note: Real trimming requires FFmpeg or native modules.
   * This implementation provides the service structure.
   */
  async trimAudio(
    inputUri: string,
    trimMarkers: TrimMarkers,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(10);

      // For MVP, we'll copy the file and store trim metadata
      // In production, this would use FFmpeg to actually trim the audio
      const outputUri = this.generateOutputFilename(inputUri);

      onProgress?.(50);

      // Copy the file for now (placeholder for actual trim operation)
      await FileSystem.copyAsync({
        from: inputUri,
        to: outputUri,
      });

      onProgress?.(100);

      // TODO: Implement actual trimming with FFmpeg
      // Command would be: ffmpeg -i input.m4a -ss startTime -to endTime -c copy output.m4a
      console.log(`Trim markers: ${trimMarkers.start}s to ${trimMarkers.end}s`);

      return outputUri;
    } catch (error) {
      console.error('Error trimming audio:', error);
      throw new Error('Failed to trim audio');
    }
  }

  /**
   * Adjust volume of audio file
   * @param volumeLevel - Volume adjustment in dB (-20 to +20)
   */
  async adjustVolume(
    inputUri: string,
    volumeEffect: VolumeEffect,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(10);

      if (!volumeEffect.enabled) {
        return inputUri;
      }

      const outputUri = this.generateOutputFilename(inputUri);

      onProgress?.(50);

      // Copy the file for now (placeholder for actual volume adjustment)
      await FileSystem.copyAsync({
        from: inputUri,
        to: outputUri,
      });

      onProgress?.(100);

      // TODO: Implement actual volume adjustment with FFmpeg
      // Command: ffmpeg -i input.m4a -filter:a "volume=${volumeLevel}dB" output.m4a
      console.log(`Volume adjustment: ${volumeEffect.level}dB`);

      return outputUri;
    } catch (error) {
      console.error('Error adjusting volume:', error);
      throw new Error('Failed to adjust volume');
    }
  }

  /**
   * Apply fade in/out effects
   */
  async applyFade(
    inputUri: string,
    fadeEffect: FadeEffect,
    duration: number,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(10);

      if (fadeEffect.fadeIn === 0 && fadeEffect.fadeOut === 0) {
        return inputUri;
      }

      const outputUri = this.generateOutputFilename(inputUri);

      onProgress?.(50);

      // Copy the file for now (placeholder for actual fade application)
      await FileSystem.copyAsync({
        from: inputUri,
        to: outputUri,
      });

      onProgress?.(100);

      // TODO: Implement actual fade with FFmpeg
      // Fade in: ffmpeg -i input.m4a -filter:a "afade=t=in:st=0:d=${fadeIn}" output.m4a
      // Fade out: ffmpeg -i input.m4a -filter:a "afade=t=out:st=${duration - fadeOut}:d=${fadeOut}" output.m4a
      console.log(`Fade in: ${fadeEffect.fadeIn}s, Fade out: ${fadeEffect.fadeOut}s`);

      return outputUri;
    } catch (error) {
      console.error('Error applying fade:', error);
      throw new Error('Failed to apply fade effect');
    }
  }

  /**
   * Apply all effects in the queue and export the final audio
   * This processes effects in sequence: trim -> volume -> fade
   */
  async exportWithEffects(
    inputUri: string,
    effects: EditorEffect[],
    duration: number,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      let currentUri = inputUri;
      const totalSteps = effects.length;
      let completedSteps = 0;

      // Sort effects by type priority: trim first, then volume, then fade
      const sortedEffects = this.sortEffects(effects);

      for (const effect of sortedEffects) {
        const stepProgress = (completedSteps / totalSteps) * 100;

        switch (effect.type) {
          case 'trim':
            currentUri = await this.trimAudio(currentUri, effect.params as TrimMarkers, (p) => {
              const overallProgress = stepProgress + (p / totalSteps);
              onProgress?.(overallProgress);
            });
            break;

          case 'volume':
            currentUri = await this.adjustVolume(currentUri, effect.params as VolumeEffect, (p) => {
              const overallProgress = stepProgress + (p / totalSteps);
              onProgress?.(overallProgress);
            });
            break;

          case 'fade':
            currentUri = await this.applyFade(
              currentUri,
              effect.params as FadeEffect,
              duration,
              (p) => {
                const overallProgress = stepProgress + (p / totalSteps);
                onProgress?.(overallProgress);
              }
            );
            break;
        }

        completedSteps++;
      }

      // Move the final processed file to exports directory
      const exportUri = `${FileSystem.documentDirectory}exports/export_${Date.now()}.m4a`;
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}exports/`, {
        intermediates: true,
      });
      await FileSystem.copyAsync({
        from: currentUri,
        to: exportUri,
      });

      // Clean up intermediate files
      if (currentUri !== inputUri) {
        await this.cleanup(currentUri);
      }

      onProgress?.(100);

      return exportUri;
    } catch (error) {
      console.error('Error exporting with effects:', error);
      throw new Error('Failed to export audio with effects');
    }
  }

  /**
   * Sort effects by processing priority
   */
  private sortEffects(effects: EditorEffect[]): EditorEffect[] {
    const priority: Record<string, number> = {
      trim: 1,
      volume: 2,
      fade: 3,
    };

    return [...effects].sort((a, b) => priority[a.type] - priority[b.type]);
  }

  /**
   * Generate waveform data from audio file
   * Returns array of amplitude values for visualization
   */
  async generateWaveform(audioUri: string, samples: number = 100): Promise<number[]> {
    try {
      // For MVP, return mock waveform data
      // In production, this would analyze the actual audio file
      const waveform: number[] = [];

      for (let i = 0; i < samples; i++) {
        // Generate semi-random waveform data for visualization
        const baseAmplitude = 0.3 + Math.random() * 0.4;
        const variation = Math.sin((i / samples) * Math.PI * 2) * 0.3;
        waveform.push(Math.min(1, Math.max(0, baseAmplitude + variation)));
      }

      return waveform;
    } catch (error) {
      console.error('Error generating waveform:', error);
      throw new Error('Failed to generate waveform');
    }
  }

  /**
   * Get audio file duration
   */
  async getDuration(audioUri: string): Promise<number> {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      const status = await sound.getStatusAsync();

      if (status.isLoaded) {
        const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
        await sound.unloadAsync();
        return duration;
      }

      await sound.unloadAsync();
      return 0;
    } catch (error) {
      console.error('Error getting duration:', error);
      return 0;
    }
  }

  /**
   * Clean up temporary files
   */
  private async cleanup(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}

export default new AudioEditor();
