// Firebase Storage Service for Image Uploads
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

class StorageService {
  private readonly STORAGE_PATHS = {
    PROFILE_IMAGES: 'profile-images',
    CONTENT_IMAGES: 'content-images',
    THUMBNAILS: 'thumbnails',
  };

  // Upload profile image
  async uploadProfileImage(userId: string, imageUri: string, fileName?: string): Promise<UploadResult> {
    try {
      console.log('📤 Starting profile image upload...');
      console.log('👤 User ID:', userId);
      console.log('📷 Image URI:', imageUri);

      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create storage reference
      const fileNameToUse = fileName || `profile_${userId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `${this.STORAGE_PATHS.PROFILE_IMAGES}/${fileNameToUse}`);
      
      // Upload the blob
      console.log('📤 Uploading to Firebase Storage...');
      const uploadResult = await uploadBytes(storageRef, blob);
      console.log('✅ Upload successful:', uploadResult.metadata.name);
      
      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('🔗 Download URL:', downloadURL);
      
      return {
        success: true,
        url: downloadURL,
      };
    } catch (error: any) {
      console.error('❌ Profile image upload failed:', error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  // Delete profile image
  async deleteProfileImage(imageUrl: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting profile image:', imageUrl);
      
      // Extract path from URL
      const url = new URL(imageUrl);
      const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
      const imageRef = ref(storage, path);
      
      await deleteObject(imageRef);
      console.log('✅ Profile image deleted successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to delete profile image:', error);
      return false;
    }
  }

  // Upload content image
  async uploadContentImage(contentType: string, imageUri: string, fileName?: string): Promise<UploadResult> {
    try {
      console.log('📤 Starting content image upload...');
      console.log('📝 Content type:', contentType);
      console.log('📷 Image URI:', imageUri);

      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create storage reference
      const fileNameToUse = fileName || `${contentType}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `${this.STORAGE_PATHS.CONTENT_IMAGES}/${contentType}/${fileNameToUse}`);
      
      // Upload the blob
      console.log('📤 Uploading to Firebase Storage...');
      const uploadResult = await uploadBytes(storageRef, blob);
      console.log('✅ Upload successful:', uploadResult.metadata.name);
      
      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('🔗 Download URL:', downloadURL);
      
      return {
        success: true,
        url: downloadURL,
      };
    } catch (error: any) {
      console.error('❌ Content image upload failed:', error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  // Upload thumbnail
  async uploadThumbnail(contentId: string, imageUri: string, fileName?: string): Promise<UploadResult> {
    try {
      console.log('📤 Starting thumbnail upload...');
      console.log('🆔 Content ID:', contentId);
      console.log('📷 Image URI:', imageUri);

      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create storage reference
      const fileNameToUse = fileName || `thumb_${contentId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `${this.STORAGE_PATHS.THUMBNAILS}/${fileNameToUse}`);
      
      // Upload the blob
      console.log('📤 Uploading to Firebase Storage...');
      const uploadResult = await uploadBytes(storageRef, blob);
      console.log('✅ Upload successful:', uploadResult.metadata.name);
      
      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('🔗 Download URL:', downloadURL);
      
      return {
        success: true,
        url: downloadURL,
      };
    } catch (error: any) {
      console.error('❌ Thumbnail upload failed:', error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  // Get storage paths
  getStoragePaths() {
    return this.STORAGE_PATHS;
  }
}

export const storageService = new StorageService();
