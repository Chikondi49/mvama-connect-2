// Media Service for Firebase Firestore
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  size: string;
  uploadedAt: string;
  category: string;
  thumbnail?: string;
  description?: string;
  tags?: string[];
  uploadedBy: string;
  isActive: boolean;
}

export interface MediaStats {
  totalFiles: number;
  images: number;
  videos: number;
  audio: number;
}

class MediaService {
  private readonly COLLECTION = 'media';

  // Get all media files
  async getAllMediaFiles(): Promise<MediaFile[]> {
    try {
      console.log('📁 Fetching media files from Firestore...');
      const mediaRef = collection(db, this.COLLECTION);
      const q = query(mediaRef, orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const mediaFiles: MediaFile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle Firestore Timestamp conversion for date fields
        if (data.uploadedAt && typeof data.uploadedAt.toDate === 'function') {
          data.uploadedAt = data.uploadedAt.toDate().toISOString();
        }
        
        mediaFiles.push({
          id: doc.id,
          ...data
        } as MediaFile);
      });
      
      console.log(`✅ Fetched ${mediaFiles.length} media files`);
      return mediaFiles;
    } catch (error) {
      console.error('❌ Error fetching media files:', error);
      return [];
    }
  }

  // Get media files by type
  async getMediaFilesByType(type: 'image' | 'video' | 'audio'): Promise<MediaFile[]> {
    try {
      console.log(`📁 Fetching ${type} files from Firestore...`);
      const mediaRef = collection(db, this.COLLECTION);
      const q = query(
        mediaRef, 
        where('type', '==', type),
        orderBy('uploadedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const mediaFiles: MediaFile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle Firestore Timestamp conversion for date fields
        if (data.uploadedAt && typeof data.uploadedAt.toDate === 'function') {
          data.uploadedAt = data.uploadedAt.toDate().toISOString();
        }
        
        mediaFiles.push({
          id: doc.id,
          ...data
        } as MediaFile);
      });
      
      console.log(`✅ Fetched ${mediaFiles.length} ${type} files`);
      return mediaFiles;
    } catch (error) {
      console.error(`❌ Error fetching ${type} files:`, error);
      return [];
    }
  }

  // Get media files by category
  async getMediaFilesByCategory(category: string): Promise<MediaFile[]> {
    try {
      console.log(`📁 Fetching media files for category: ${category}`);
      const mediaRef = collection(db, this.COLLECTION);
      const q = query(
        mediaRef, 
        where('category', '==', category),
        orderBy('uploadedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const mediaFiles: MediaFile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle Firestore Timestamp conversion for date fields
        if (data.uploadedAt && typeof data.uploadedAt.toDate === 'function') {
          data.uploadedAt = data.uploadedAt.toDate().toISOString();
        }
        
        mediaFiles.push({
          id: doc.id,
          ...data
        } as MediaFile);
      });
      
      console.log(`✅ Fetched ${mediaFiles.length} files for ${category}`);
      return mediaFiles;
    } catch (error) {
      console.error(`❌ Error fetching files for category ${category}:`, error);
      return [];
    }
  }

  // Get a single media file
  async getMediaFileById(id: string): Promise<MediaFile | null> {
    try {
      console.log(`📁 Fetching media file: ${id}`);
      const mediaRef = doc(db, this.COLLECTION, id);
      const mediaSnap = await getDoc(mediaRef);
      
      if (mediaSnap.exists()) {
        const mediaFile = {
          id: mediaSnap.id,
          ...mediaSnap.data()
        } as MediaFile;
        console.log(`✅ Fetched media file: ${mediaFile.name}`);
        return mediaFile;
      } else {
        console.log('❌ Media file not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching media file by ID:', error);
      return null;
    }
  }

  // Create a new media file
  async createMediaFile(mediaData: Omit<MediaFile, 'id' | 'uploadedAt'>): Promise<string> {
    try {
      console.log('📁 Creating new media file:', mediaData.name);
      
      const now = new Date().toISOString();
      const mediaToCreate = {
        ...mediaData,
        uploadedAt: now,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), mediaToCreate);
      console.log(`✅ Media file created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating media file:', error);
      throw error;
    }
  }

  // Update an existing media file
  async updateMediaFile(mediaId: string, updateData: Partial<MediaFile>): Promise<void> {
    try {
      console.log('📁 Updating media file:', mediaId);
      
      const mediaRef = doc(db, this.COLLECTION, mediaId);
      await updateDoc(mediaRef, updateData);
      console.log(`✅ Media file updated: ${mediaId}`);
    } catch (error) {
      console.error('❌ Error updating media file:', error);
      throw error;
    }
  }

  // Delete a media file
  async deleteMediaFile(mediaId: string): Promise<void> {
    try {
      console.log('📁 Deleting media file:', mediaId);
      
      const mediaRef = doc(db, this.COLLECTION, mediaId);
      await deleteDoc(mediaRef);
      console.log(`✅ Media file deleted: ${mediaId}`);
    } catch (error) {
      console.error('❌ Error deleting media file:', error);
      throw error;
    }
  }

  // Get media statistics
  async getMediaStats(): Promise<MediaStats> {
    try {
      console.log('📊 Fetching media statistics...');
      const mediaFiles = await this.getAllMediaFiles();
      
      const stats: MediaStats = {
        totalFiles: mediaFiles.length,
        images: mediaFiles.filter(file => file.type === 'image').length,
        videos: mediaFiles.filter(file => file.type === 'video').length,
        audio: mediaFiles.filter(file => file.type === 'audio').length,
      };
      
      console.log('✅ Media statistics:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error fetching media statistics:', error);
      return {
        totalFiles: 0,
        images: 0,
        videos: 0,
        audio: 0,
      };
    }
  }

  // Add sample media files for testing
  async addSampleMediaFiles(): Promise<void> {
    try {
      console.log('📁 Adding sample media files...');
      
      const sampleFiles = [
        {
          name: 'sermon-thumbnail.jpg',
          type: 'image' as const,
          url: 'https://images.pexels.com/photos/8468012/pexels-photo-8468012.jpeg',
          size: '2.4 MB',
          category: 'Sermons',
          description: 'Thumbnail for Sunday sermon',
          tags: ['sermon', 'thumbnail', 'worship'],
          uploadedBy: 'admin',
          isActive: true,
        },
        {
          name: 'event-banner.jpg',
          type: 'image' as const,
          url: 'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg',
          size: '1.8 MB',
          category: 'Events',
          description: 'Banner for upcoming event',
          tags: ['event', 'banner', 'announcement'],
          uploadedBy: 'admin',
          isActive: true,
        },
        {
          name: 'worship-video.mp4',
          type: 'video' as const,
          url: 'https://example.com/video.mp4',
          size: '45.2 MB',
          category: 'Worship',
          description: 'Worship service recording',
          thumbnail: 'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg',
          tags: ['worship', 'video', 'service'],
          uploadedBy: 'admin',
          isActive: true,
        },
        {
          name: 'prayer-audio.mp3',
          type: 'audio' as const,
          url: 'https://example.com/audio.mp3',
          size: '12.7 MB',
          category: 'Prayer',
          description: 'Prayer session recording',
          tags: ['prayer', 'audio', 'spiritual'],
          uploadedBy: 'admin',
          isActive: true,
        },
      ];

      for (const file of sampleFiles) {
        await this.createMediaFile(file);
      }
      
      console.log('✅ Sample media files added');
    } catch (error) {
      console.error('❌ Error adding sample media files:', error);
    }
  }
}

export const mediaService = new MediaService();
