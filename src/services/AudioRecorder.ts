import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Template } from '@store/templatesSlice';

export interface RecordingOptions {
  sampleRate: number;
  numberOfChannels: number;
  bitRate: number;
  extension: string;
}

export interface RecordingStatus {
  isRecording: boolean;
  isDoneRecording: boolean;
  durationMillis: number;
  metering?: number;
}

export class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private onStatusUpdate?: (status: RecordingStatus) => void;

  constructor(onStatusUpdate?: (status: RecordingStatus) => void) {
    this.onStatusUpdate = onStatusUpdate;
  }

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  /**
   * Get recording options based on template settings
   */
  private getRecordingOptions(template: Template): Audio.RecordingOptions {
    const { audioSettings } = template;

    return {
      isMeteringEnabled: true,
      android: {
        extension: `.${audioSettings.format}`,
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: audioSettings.sampleRate,
        numberOfChannels: audioSettings.channels,
        bitRate: audioSettings.bitRate * 1000,
      },
      ios: {
        extension: `.${audioSettings.format}`,
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: audioSettings.sampleRate,
        numberOfChannels: audioSettings.channels,
        bitRate: audioSettings.bitRate * 1000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: `audio/${audioSettings.format}`,
        bitsPerSecond: audioSettings.bitRate * 1000,
      },
    };
  }

  /**
   * Start a new recording
   */
  async startRecording(template: Template): Promise<void> {
    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Audio recording permission not granted');
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create recording with options
      const recordingOptions = this.getRecordingOptions(template);
      const { recording } = await Audio.Recording.createAsync(
        recordingOptions,
        this.handleStatusUpdate.bind(this),
        100 // Update interval in ms
      );

      this.recording = recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Pause the current recording
   */
  async pauseRecording(): Promise<void> {
    if (!this.recording) {
      throw new Error('No active recording to pause');
    }

    try {
      await this.recording.pauseAsync();
    } catch (error) {
      console.error('Failed to pause recording:', error);
      throw error;
    }
  }

  /**
   * Resume a paused recording
   */
  async resumeRecording(): Promise<void> {
    if (!this.recording) {
      throw new Error('No active recording to resume');
    }

    try {
      await this.recording.startAsync();
    } catch (error) {
      console.error('Failed to resume recording:', error);
      throw error;
    }
  }

  /**
   * Stop the current recording and return the URI
   */
  async stopRecording(): Promise<string> {
    if (!this.recording) {
      throw new Error('No active recording to stop');
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      this.recording = null;

      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  /**
   * Discard the current recording
   */
  async discardRecording(): Promise<void> {
    if (this.recording) {
      try {
        const uri = await this.stopRecording();
        // Delete the file
        if (uri) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      } catch (error) {
        console.error('Failed to discard recording:', error);
        throw error;
      }
    }
  }

  /**
   * Get current recording status
   */
  async getStatus(): Promise<Audio.RecordingStatus | null> {
    if (!this.recording) {
      return null;
    }

    try {
      return await this.recording.getStatusAsync();
    } catch (error) {
      console.error('Failed to get recording status:', error);
      return null;
    }
  }

  /**
   * Handle recording status updates
   */
  private handleStatusUpdate(status: Audio.RecordingStatus): void {
    if (this.onStatusUpdate) {
      this.onStatusUpdate({
        isRecording: status.isRecording,
        isDoneRecording: status.isDoneRecording,
        durationMillis: status.durationMillis,
        metering: status.metering,
      });
    }
  }

  /**
   * Save recording to permanent storage
   */
  async saveRecording(
    tempUri: string,
    projectId: string,
    episodeId: string,
    format: string
  ): Promise<string> {
    try {
      // Create project directory structure
      const projectDir = `${FileSystem.documentDirectory}recordings/${projectId}`;
      const episodeDir = `${projectDir}/${episodeId}`;

      // Ensure directories exist
      const projectDirInfo = await FileSystem.getInfoAsync(projectDir);
      if (!projectDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(projectDir, { intermediates: true });
      }

      const episodeDirInfo = await FileSystem.getInfoAsync(episodeDir);
      if (!episodeDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(episodeDir, { intermediates: true });
      }

      // Move file to permanent location
      const permanentUri = `${episodeDir}/raw.${format}`;
      await FileSystem.moveAsync({
        from: tempUri,
        to: permanentUri,
      });

      return permanentUri;
    } catch (error) {
      console.error('Failed to save recording:', error);
      throw error;
    }
  }

  /**
   * Get recording duration from file
   */
  async getRecordingDuration(uri: string): Promise<number> {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      const status = await sound.getStatusAsync();
      await sound.unloadAsync();

      if (status.isLoaded) {
        return status.durationMillis || 0;
      }

      return 0;
    } catch (error) {
      console.error('Failed to get recording duration:', error);
      return 0;
    }
  }
}

export default AudioRecorder;
