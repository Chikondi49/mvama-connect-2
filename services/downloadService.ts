/**
 * Download Service for handling file downloads
 * Handles downloading audio files and managing download states
 */

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export interface DownloadProgress {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
  progress: number;
}

export interface DownloadResult {
  success: boolean;
  fileUri?: string;
  error?: string;
}

class DownloadService {
  private downloadDirectory: string;

  constructor() {
    this.downloadDirectory = FileSystem.documentDirectory + 'downloads/';
  }

  /**
   * Download an audio file from URL
   * @param url - The URL of the file to download
   * @param filename - The filename to save as
   * @param onProgress - Optional progress callback
   * @returns Promise<DownloadResult>
   */
  async downloadFile(
    url: string,
    filename: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<DownloadResult> {
    try {
      // Ensure downloads directory exists
      await this.ensureDownloadDirectory();

      const fileUri = this.downloadDirectory + filename;
      
      console.log('📥 Starting download:', url);
      console.log('📁 Saving to:', fileUri);

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) {
            onProgress({
              totalBytesWritten: downloadProgress.totalBytesWritten,
              totalBytesExpectedToWrite: downloadProgress.totalBytesExpectedToWrite,
              progress: progress
            });
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result) {
        console.log('✅ Download completed:', result.uri);
        return {
          success: true,
          fileUri: result.uri
        };
      } else {
        throw new Error('Download failed - no result');
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Save file to device's media library (for audio files)
   * @param fileUri - The local file URI
   * @param filename - The filename
   * @returns Promise<boolean>
   */
  async saveToMediaLibrary(fileUri: string, filename: string): Promise<boolean> {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to save files to your device.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Create asset from file
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      
      // Create album if it doesn't exist
      const albumName = 'MvamaConnect Sermons';
      let album = await MediaLibrary.getAlbumAsync(albumName);
      
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      console.log('✅ File saved to media library:', filename);
      return true;
    } catch (error) {
      console.error('❌ Error saving to media library:', error);
      return false;
    }
  }

  /**
   * Share a downloaded file
   * @param fileUri - The local file URI
   * @param filename - The filename
   * @returns Promise<boolean>
   */
  async shareFile(fileUri: string, filename: string): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available on this device');
        return false;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'audio/mpeg',
        dialogTitle: `Share ${filename}`
      });

      return true;
    } catch (error) {
      console.error('❌ Error sharing file:', error);
      return false;
    }
  }

  /**
   * Get download progress as percentage
   * @param progress - Download progress object
   * @returns number (0-100)
   */
  getProgressPercentage(progress: DownloadProgress): number {
    return Math.round(progress.progress * 100);
  }

  /**
   * Format file size in bytes to human readable format
   * @param bytes - File size in bytes
   * @returns string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file extension from URL
   * @param url - The file URL
   * @returns string
   */
  getFileExtension(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || 'mp3';
  }

  /**
   * Generate filename from title and URL
   * @param title - The sermon title
   * @param url - The file URL
   * @returns string
   */
  generateFilename(title: string, url: string): string {
    const extension = this.getFileExtension(url);
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 50); // Limit length
    
    return `${cleanTitle}.${extension}`;
  }

  /**
   * Ensure downloads directory exists
   * @private
   */
  private async ensureDownloadDirectory(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.downloadDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.downloadDirectory, { intermediates: true });
    }
  }

  /**
   * Check if file already exists locally
   * @param filename - The filename to check
   * @returns Promise<boolean>
   */
  async fileExists(filename: string): Promise<boolean> {
    try {
      const fileUri = this.downloadDirectory + filename;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      return fileInfo.exists;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get local file URI if it exists
   * @param filename - The filename
   * @returns Promise<string | null>
   */
  async getLocalFileUri(filename: string): Promise<string | null> {
    try {
      const fileUri = this.downloadDirectory + filename;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      return fileInfo.exists ? fileUri : null;
    } catch (error) {
      return null;
    }
  }
}

export const downloadService = new DownloadService();
