import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Audio export formats
 */
export type ExportFormat = 'mp3' | 'wav' | 'm4a';

/**
 * Quality preset names
 */
export type QualityPreset = 'low' | 'medium' | 'high' | 'lossless' | 'custom';

/**
 * Export quality configuration
 */
export interface ExportQuality {
  format: ExportFormat;
  bitRate: number | null; // null for lossless
  sampleRate: 22050 | 44100 | 48000;
}

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  quality: QualityPreset;
  customQuality?: ExportQuality;
  filename?: string;
  metadata?: AudioMetadata;
}

/**
 * Audio metadata for ID3 tags
 */
export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  comment?: string;
  genre?: string;
}

/**
 * Export result
 */
export interface ExportResult {
  uri: string;
  filename: string;
  format: ExportFormat;
  sizeBytes: number;
  duration: number;
}

/**
 * AudioExporter service handles audio format conversion,
 * quality presets, metadata tagging, and sharing.
 *
 * For MVP, we provide the service structure with placeholder implementations.
 * In production, these would use FFmpeg for format conversion and metadata handling.
 */
class AudioExporter {
  /**
   * Predefined quality presets
   */
  private readonly QUALITY_PRESETS: Record<QualityPreset, ExportQuality> = {
    low: { format: 'mp3', bitRate: 64, sampleRate: 22050 },
    medium: { format: 'mp3', bitRate: 128, sampleRate: 44100 },
    high: { format: 'mp3', bitRate: 192, sampleRate: 48000 },
    lossless: { format: 'wav', bitRate: null, sampleRate: 48000 },
    custom: { format: 'm4a', bitRate: 128, sampleRate: 44100 },
  };

  /**
   * Export directory path
   */
  private get exportDirectory(): string {
    return `${FileSystem.documentDirectory}exports/`;
  }

  /**
   * Ensure export directory exists
   */
  private async ensureExportDirectory(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.exportDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.exportDirectory, { intermediates: true });
    }
  }

  /**
   * Generate export filename
   */
  private generateFilename(customFilename?: string, format: ExportFormat = 'mp3'): string {
    if (customFilename) {
      // Ensure correct extension
      const baseName = customFilename.replace(/\.[^/.]+$/, '');
      return `${baseName}.${format}`;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `podcast_export_${timestamp}.${format}`;
  }

  /**
   * Get quality configuration
   */
  getQualityConfig(preset: QualityPreset): ExportQuality {
    return this.QUALITY_PRESETS[preset];
  }

  /**
   * Get all quality presets
   */
  getQualityPresets(): Record<QualityPreset, ExportQuality> {
    return this.QUALITY_PRESETS;
  }

  /**
   * Export audio with specified format and quality
   */
  async exportAudio(
    inputUri: string,
    options: ExportOptions,
    onProgress?: (progress: number) => void
  ): Promise<ExportResult> {
    try {
      await this.ensureExportDirectory();

      onProgress?.(10);

      // Get quality configuration
      const quality = options.customQuality || this.QUALITY_PRESETS[options.quality];

      // Generate output filename
      const filename = this.generateFilename(options.filename, quality.format);
      const outputUri = `${this.exportDirectory}${filename}`;

      onProgress?.(30);

      // For MVP, we'll copy/convert the file
      // In production, use FFmpeg for actual format conversion
      if (quality.format === 'mp3') {
        await this.convertToMp3(inputUri, outputUri, quality, options.metadata, onProgress);
      } else if (quality.format === 'wav') {
        await this.convertToWav(inputUri, outputUri, quality, options.metadata, onProgress);
      } else {
        // M4A - just copy for now since input is likely M4A
        await FileSystem.copyAsync({
          from: inputUri,
          to: outputUri,
        });
        onProgress?.(90);
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(outputUri);
      const sizeBytes = 'size' in fileInfo ? fileInfo.size : 0;

      onProgress?.(100);

      return {
        uri: outputUri,
        filename,
        format: quality.format,
        sizeBytes,
        duration: 0, // Would be populated from actual conversion
      };
    } catch (error) {
      console.error('Error exporting audio:', error);
      throw new Error('Failed to export audio');
    }
  }

  /**
   * Convert audio to MP3 format
   */
  private async convertToMp3(
    inputUri: string,
    outputUri: string,
    quality: ExportQuality,
    metadata?: AudioMetadata,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      onProgress?.(40);

      // TODO: Implement with FFmpeg
      // Command: ffmpeg -i input.m4a -codec:a libmp3lame -b:a ${bitRate}k -ar ${sampleRate} output.mp3
      //
      // With metadata:
      // ffmpeg -i input.m4a -codec:a libmp3lame -b:a 128k \
      //   -metadata title="${title}" \
      //   -metadata artist="${artist}" \
      //   -metadata album="${album}" \
      //   -metadata date="${year}" \
      //   -metadata comment="${comment}" \
      //   -metadata genre="${genre}" \
      //   output.mp3

      // For MVP, copy the file
      await FileSystem.copyAsync({
        from: inputUri,
        to: outputUri,
      });

      onProgress?.(80);

      console.log(
        `MP3 conversion: ${quality.bitRate}kbps @ ${quality.sampleRate}Hz`,
        metadata
      );
    } catch (error) {
      console.error('Error converting to MP3:', error);
      throw new Error('Failed to convert to MP3');
    }
  }

  /**
   * Convert audio to WAV format (lossless)
   */
  private async convertToWav(
    inputUri: string,
    outputUri: string,
    quality: ExportQuality,
    metadata?: AudioMetadata,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      onProgress?.(40);

      // TODO: Implement with FFmpeg
      // Command: ffmpeg -i input.m4a -codec:a pcm_s16le -ar ${sampleRate} output.wav
      //
      // WAV doesn't support metadata tags directly, but can use RIFF INFO tags

      // For MVP, copy the file
      await FileSystem.copyAsync({
        from: inputUri,
        to: outputUri,
      });

      onProgress?.(80);

      console.log(`WAV conversion: PCM 16-bit @ ${quality.sampleRate}Hz`, metadata);
    } catch (error) {
      console.error('Error converting to WAV:', error);
      throw new Error('Failed to convert to WAV');
    }
  }

  /**
   * Share exported audio file using native share sheet
   */
  async shareAudio(uri: string, message?: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(uri, {
        mimeType: this.getMimeType(uri),
        dialogTitle: message || 'Share Audio',
        UTI: this.getUTI(uri),
      });
    } catch (error) {
      console.error('Error sharing audio:', error);
      throw new Error('Failed to share audio');
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      m4a: 'audio/mp4',
    };
    return mimeTypes[extension || 'mp3'] || 'audio/mpeg';
  }

  /**
   * Get UTI (Uniform Type Identifier) for iOS
   */
  private getUTI(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    const utis: Record<string, string> = {
      mp3: 'public.mp3',
      wav: 'public.wav',
      m4a: 'public.mpeg-4-audio',
    };
    return utis[extension || 'mp3'] || 'public.audio';
  }

  /**
   * List all exported files
   */
  async listExports(): Promise<ExportResult[]> {
    try {
      await this.ensureExportDirectory();

      const files = await FileSystem.readDirectoryAsync(this.exportDirectory);
      const exports: ExportResult[] = [];

      for (const filename of files) {
        const uri = `${this.exportDirectory}${filename}`;
        const fileInfo = await FileSystem.getInfoAsync(uri);

        if ('size' in fileInfo) {
          const extension = filename.split('.').pop() as ExportFormat;
          exports.push({
            uri,
            filename,
            format: extension,
            sizeBytes: fileInfo.size,
            duration: 0,
          });
        }
      }

      // Sort by most recent first
      return exports.sort((a, b) => b.filename.localeCompare(a.filename));
    } catch (error) {
      console.error('Error listing exports:', error);
      return [];
    }
  }

  /**
   * Delete an exported file
   */
  async deleteExport(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error('Error deleting export:', error);
      throw new Error('Failed to delete export');
    }
  }

  /**
   * Get storage used by exports
   */
  async getExportsStorageUsed(): Promise<number> {
    try {
      const exports = await this.listExports();
      return exports.reduce((total, exp) => total + exp.sizeBytes, 0);
    } catch (error) {
      console.error('Error calculating storage:', error);
      return 0;
    }
  }

  /**
   * Clear all exports
   */
  async clearAllExports(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.exportDirectory);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.exportDirectory, { idempotent: true });
        await this.ensureExportDirectory();
      }
    } catch (error) {
      console.error('Error clearing exports:', error);
      throw new Error('Failed to clear exports');
    }
  }

  /**
   * Estimate file size for quality preset
   * Returns estimated size in bytes for a given duration
   */
  estimateFileSize(durationSeconds: number, preset: QualityPreset): number {
    const quality = this.QUALITY_PRESETS[preset];

    if (quality.format === 'wav') {
      // WAV: sample_rate * bit_depth * channels * duration / 8
      // Assuming 16-bit stereo
      return quality.sampleRate * 16 * 2 * durationSeconds / 8;
    } else {
      // Compressed formats (MP3, M4A): bitrate * duration / 8
      const bitRate = quality.bitRate || 128;
      return (bitRate * 1000 * durationSeconds) / 8;
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

export default new AudioExporter();
