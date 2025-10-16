// Audio Sermon Service for Firebase Firestore
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AudioSermon {
  id: string;
  title: string;
  speaker: string;
  description: string;
  audioUrl: string;
  duration: string; // Format: "42:15" or "1:23:45"
  publishedAt: string; // ISO date string
  category: string; // "Sunday Service", "Morning Devotion", "Evening Devotion", etc.
  thumbnailUrl?: string;
  downloadUrl?: string;
  viewCount?: number;
  tags?: string[];
  seriesId?: string; // Reference to series/podcast collection
  episodeNumber?: number;
}

export interface AudioSeries {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  speaker: string;
  totalEpisodes: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

class AudioSermonService {
  private readonly COLLECTIONS = {
    SERMONS: 'audioSermons',
    SERIES: 'audioSeries',
  };

  // Get all audio sermons
  async getAllAudioSermons(): Promise<AudioSermon[]> {
    try {
      console.log('🎵 Fetching audio sermons from Firestore...');
      const sermonsRef = collection(db, this.COLLECTIONS.SERMONS);
      const q = query(sermonsRef, orderBy('publishedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const sermons: AudioSermon[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle Firestore Timestamp conversion
        if (data.publishedAt && typeof data.publishedAt.toDate === 'function') {
          data.publishedAt = data.publishedAt.toDate().toISOString();
        }
        
        sermons.push({
          id: doc.id,
          ...data
        } as AudioSermon);
      });
      
      console.log(`✅ Fetched ${sermons.length} audio sermons`);
      console.log('📋 All sermons seriesId mapping:', sermons.map(s => ({ 
        id: s.id, 
        title: s.title, 
        seriesId: s.seriesId, 
        episodeNumber: s.episodeNumber 
      })));
      return sermons;
    } catch (error) {
      console.error('❌ Error fetching audio sermons:', error);
      return [];
    }
  }

  // Get audio sermons by category
  async getAudioSermonsByCategory(category: string): Promise<AudioSermon[]> {
    try {
      console.log(`🎵 Fetching audio sermons for category: ${category}`);
      const sermonsRef = collection(db, this.COLLECTIONS.SERMONS);
      const q = query(
        sermonsRef, 
        where('category', '==', category),
        orderBy('publishedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const sermons: AudioSermon[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle Firestore Timestamp conversion
        if (data.publishedAt && typeof data.publishedAt.toDate === 'function') {
          data.publishedAt = data.publishedAt.toDate().toISOString();
        }
        
        sermons.push({
          id: doc.id,
          ...data
        } as AudioSermon);
      });
      
      console.log(`✅ Fetched ${sermons.length} audio sermons for ${category}`);
      return sermons;
    } catch (error) {
      console.error('❌ Error fetching audio sermons by category:', error);
      return [];
    }
  }

  // Get audio series
  async getAllAudioSeries(): Promise<AudioSeries[]> {
    try {
      console.log('🎵 Fetching audio series from Firestore...');
      const seriesRef = collection(db, this.COLLECTIONS.SERIES);
      const q = query(seriesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const series: AudioSeries[] = [];
      querySnapshot.forEach((doc) => {
        series.push({
          id: doc.id,
          ...doc.data()
        } as AudioSeries);
      });
      
      console.log(`✅ Fetched ${series.length} audio series`);
      return series;
    } catch (error) {
      console.error('❌ Error fetching audio series:', error);
      return [];
    }
  }

  // Get episodes for a specific series
  async getEpisodesBySeries(seriesId: string): Promise<AudioSermon[]> {
    try {
      console.log(`🎵 Fetching episodes for series: ${seriesId}`);
      const sermonsRef = collection(db, this.COLLECTIONS.SERMONS);
      const q = query(
        sermonsRef, 
        where('seriesId', '==', seriesId),
        orderBy('episodeNumber', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      console.log(`🔍 Query executed for seriesId: ${seriesId}`);
      console.log(`📊 Query snapshot size: ${querySnapshot.size}`);
      
      const episodes: AudioSermon[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📋 Episode found: ${doc.id}`, { 
          title: data.title, 
          seriesId: data.seriesId, 
          episodeNumber: data.episodeNumber 
        });
        episodes.push({
          id: doc.id,
          ...data
        } as AudioSermon);
      });
      
      console.log(`✅ Fetched ${episodes.length} episodes for series ${seriesId}`);
      console.log(`📋 Episodes details:`, episodes.map(e => ({ 
        id: e.id, 
        title: e.title, 
        seriesId: e.seriesId, 
        episodeNumber: e.episodeNumber 
      })));
      
      return episodes;
    } catch (error) {
      console.error('❌ Error fetching episodes by series:', error);
      console.error('❌ Error details:', error);
      return [];
    }
  }

  // Get a single audio sermon
  async getAudioSermonById(id: string): Promise<AudioSermon | null> {
    try {
      console.log(`🎵 Fetching audio sermon: ${id}`);
      const sermonRef = doc(db, this.COLLECTIONS.SERMONS, id);
      const sermonSnap = await getDoc(sermonRef);
      
      if (sermonSnap.exists()) {
        const sermon = {
          id: sermonSnap.id,
          ...sermonSnap.data()
        } as AudioSermon;
        console.log(`✅ Fetched audio sermon: ${sermon.title}`);
        return sermon;
      } else {
        console.log('❌ Audio sermon not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching audio sermon by ID:', error);
      return null;
    }
  }

  // Validate that a series exists before linking episodes
  async validateSeriesExists(seriesId: string): Promise<boolean> {
    try {
      console.log(`🔍 Validating series exists: ${seriesId}`);
      const seriesRef = doc(db, this.COLLECTIONS.SERIES, seriesId);
      const seriesSnap = await getDoc(seriesRef);
      
      if (seriesSnap.exists()) {
        console.log(`✅ Series exists: ${seriesId}`);
        return true;
      } else {
        console.log(`❌ Series not found: ${seriesId}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error validating series:', error);
      return false;
    }
  }

  // Create a new audio episode with series validation
  async createAudioEpisode(episodeData: Omit<AudioSermon, 'id'>): Promise<string | null> {
    try {
      console.log(`🎵 Creating new audio episode: ${episodeData.title}`);
      
      // Validate series exists if seriesId is provided
      if (episodeData.seriesId) {
        const seriesExists = await this.validateSeriesExists(episodeData.seriesId);
        if (!seriesExists) {
          console.error(`❌ Cannot create episode: Series ${episodeData.seriesId} does not exist`);
          return null;
        }
      }

      // Add the episode to Firestore
      const episodesRef = collection(db, this.COLLECTIONS.SERMONS);
      const docRef = await addDoc(episodesRef, episodeData);
      
      console.log(`✅ Created audio episode with ID: ${docRef.id}`);
      
      // Update series totalEpisodes count if this episode is part of a series
      if (episodeData.seriesId) {
        await this.updateSeriesEpisodeCount(episodeData.seriesId);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating audio episode:', error);
      return null;
    }
  }

  // Update series episode count
  private async updateSeriesEpisodeCount(seriesId: string): Promise<void> {
    try {
      console.log(`📊 Updating episode count for series: ${seriesId}`);
      const seriesRef = doc(db, this.COLLECTIONS.SERIES, seriesId);
      await updateDoc(seriesRef, {
        totalEpisodes: increment(1),
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Updated episode count for series: ${seriesId}`);
    } catch (error) {
      console.error('❌ Error updating series episode count:', error);
    }
  }

  // Get all available series for episode assignment
  async getAvailableSeries(): Promise<AudioSeries[]> {
    try {
      console.log('🎵 Fetching available series for episode assignment...');
      const series = await this.getAllAudioSeries();
      console.log(`✅ Found ${series.length} available series`);
      return series;
    } catch (error) {
      console.error('❌ Error fetching available series:', error);
      return [];
    }
  }

  // Get episodes without series (orphaned episodes)
  async getOrphanedEpisodes(): Promise<AudioSermon[]> {
    try {
      console.log('🎵 Fetching orphaned episodes (no series)...');
      const sermonsRef = collection(db, this.COLLECTIONS.SERMONS);
      const q = query(
        sermonsRef,
        where('seriesId', '==', null)
      );
      const querySnapshot = await getDocs(q);
      
      const orphanedEpisodes: AudioSermon[] = [];
      querySnapshot.forEach((doc) => {
        orphanedEpisodes.push({
          id: doc.id,
          ...doc.data()
        } as AudioSermon);
      });
      
      console.log(`✅ Found ${orphanedEpisodes.length} orphaned episodes`);
      return orphanedEpisodes;
    } catch (error) {
      console.error('❌ Error fetching orphaned episodes:', error);
      return [];
    }
  }

  // Assign episode to series
  async assignEpisodeToSeries(episodeId: string, seriesId: string): Promise<boolean> {
    try {
      console.log(`🔗 Assigning episode ${episodeId} to series ${seriesId}`);
      
      // Validate series exists
      const seriesExists = await this.validateSeriesExists(seriesId);
      if (!seriesExists) {
        console.error(`❌ Cannot assign episode: Series ${seriesId} does not exist`);
        return false;
      }

      // Update episode with seriesId
      const episodeRef = doc(db, this.COLLECTIONS.SERMONS, episodeId);
      await updateDoc(episodeRef, {
        seriesId: seriesId,
        updatedAt: new Date().toISOString()
      });

      // Update series episode count
      await this.updateSeriesEpisodeCount(seriesId);
      
      console.log(`✅ Successfully assigned episode ${episodeId} to series ${seriesId}`);
      return true;
    } catch (error) {
      console.error('❌ Error assigning episode to series:', error);
      return false;
    }
  }

  // Debug method to check all episodes and their series assignments
  async debugEpisodesAndSeries(): Promise<void> {
    try {
      console.log('🔍 DEBUG: Checking all episodes and series...');
      
      // Get all episodes
      const allEpisodes = await this.getAllAudioSermons();
      console.log(`📊 Total episodes in database: ${allEpisodes.length}`);
      
      // Get all series
      const allSeries = await this.getAllAudioSeries();
      console.log(`📊 Total series in database: ${allSeries.length}`);
      
      // Check episodes with seriesId
      const episodesWithSeries = allEpisodes.filter(ep => ep.seriesId);
      const episodesWithoutSeries = allEpisodes.filter(ep => !ep.seriesId);
      
      console.log(`📊 Episodes with seriesId: ${episodesWithSeries.length}`);
      console.log(`📊 Episodes without seriesId: ${episodesWithoutSeries.length}`);
      
      // Group episodes by seriesId
      const episodesBySeries: { [seriesId: string]: AudioSermon[] } = {};
      episodesWithSeries.forEach(episode => {
        if (!episodesBySeries[episode.seriesId!]) {
          episodesBySeries[episode.seriesId!] = [];
        }
        episodesBySeries[episode.seriesId!].push(episode);
      });
      
      console.log('📊 Episodes grouped by series:');
      Object.keys(episodesBySeries).forEach(seriesId => {
        console.log(`  Series ${seriesId}: ${episodesBySeries[seriesId].length} episodes`);
        episodesBySeries[seriesId].forEach(ep => {
          console.log(`    - ${ep.title} (Episode ${ep.episodeNumber})`);
        });
      });
      
      // Check if series exist for each seriesId
      for (const seriesId of Object.keys(episodesBySeries)) {
        const seriesExists = await this.validateSeriesExists(seriesId);
        console.log(`🔍 Series ${seriesId} exists: ${seriesExists}`);
      }
      
    } catch (error) {
      console.error('❌ Error in debug method:', error);
    }
  }

  // Create sample data for testing if none exists
  async createSampleData(): Promise<void> {
    try {
      console.log('🎵 Creating sample data...');
      
      // Check if we already have data
      const existingSeries = await this.getAllAudioSeries();
      const existingEpisodes = await this.getAllAudioSermons();
      
      if (existingSeries.length > 0 || existingEpisodes.length > 0) {
        console.log('📊 Sample data already exists, skipping creation');
        return;
      }
      
      console.log('📊 No existing data found, creating sample data...');
      
      // Create sample series
      const sampleSeries = {
        title: "Sunday Service Messages",
        description: "Weekly Sunday service messages from MVAMA CCAP Nkhoma Synod, delivering powerful biblical teachings and spiritual guidance.",
        coverImage: "https://images.pexels.com/photos/8468012/pexels-photo-8468012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750",
        speaker: "Rev. Yassin Gammah",
        totalEpisodes: 0,
        category: "Sunday Service",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const seriesRef = collection(db, this.COLLECTIONS.SERIES);
      const seriesDoc = await addDoc(seriesRef, sampleSeries);
      console.log(`✅ Created sample series: ${seriesDoc.id}`);
      
      // Create sample episodes
      const sampleEpisodes = [
        {
          title: "The Power of Faith in Difficult Times",
          speaker: "Rev. Yassin Gammah",
          description: "A powerful message about maintaining faith during challenging seasons of life.",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          duration: "42:15",
          publishedAt: "2024-11-10T10:00:00Z",
          category: "Sunday Service",
          seriesId: seriesDoc.id,
          episodeNumber: 1
        },
        {
          title: "Walking in God's Purpose",
          speaker: "Rev. Yassin Gammah",
          description: "Discover your divine calling and learn how to align your life with God's perfect plan.",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          duration: "38:30",
          publishedAt: "2024-11-03T10:00:00Z",
          category: "Sunday Service",
          seriesId: seriesDoc.id,
          episodeNumber: 2
        }
      ];
      
      const episodesRef = collection(db, this.COLLECTIONS.SERMONS);
      for (const episode of sampleEpisodes) {
        await addDoc(episodesRef, episode);
      }
      
      // Update series episode count
      await this.updateSeriesEpisodeCount(seriesDoc.id);
      
      console.log(`✅ Created ${sampleEpisodes.length} sample episodes`);
      
    } catch (error) {
      console.error('❌ Error creating sample data:', error);
    }
  }

  // Create a new audio sermon
  async createAudioSermon(sermonData: Omit<AudioSermon, 'id'>): Promise<string> {
    try {
      console.log('🎵 Creating new audio sermon:', sermonData.title);
      
      const docRef = await addDoc(collection(db, this.COLLECTIONS.SERMONS), sermonData);
      console.log(`✅ Audio sermon created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating audio sermon:', error);
      throw error;
    }
  }

  // Update an existing audio sermon
  async updateAudioSermon(sermonId: string, updateData: Partial<AudioSermon>): Promise<void> {
    try {
      console.log('🎵 Updating audio sermon:', sermonId);
      console.log('📝 Update data received:', updateData);
      console.log('📝 Database reference:', this.COLLECTIONS.SERMONS);
      
      const sermonRef = doc(db, this.COLLECTIONS.SERMONS, sermonId);
      console.log('📝 Document reference created:', sermonRef.path);
      
      // Check if document exists before updating
      console.log('🔍 Checking if document exists...');
      const docSnap = await getDoc(sermonRef);
      if (!docSnap.exists()) {
        console.error('❌ Document does not exist:', sermonId);
        throw new Error(`Sermon with ID ${sermonId} does not exist`);
      }
      console.log('✅ Document exists, proceeding with update...');
      
      console.log('🔄 Calling updateDoc...');
      await updateDoc(sermonRef, updateData);
      console.log(`✅ Audio sermon updated successfully: ${sermonId}`);
    } catch (error) {
      console.error('❌ Error updating audio sermon:', error);
      console.error('❌ Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      throw error;
    }
  }

  // Delete an audio sermon
  async deleteAudioSermon(sermonId: string): Promise<void> {
    try {
      console.log('🎵 [SERVICE] Deleting audio sermon:', sermonId);
      console.log('🎵 [SERVICE] Database object:', !!db);
      console.log('🎵 [SERVICE] Collection name:', this.COLLECTIONS.SERMONS);
      
      const sermonRef = doc(db, this.COLLECTIONS.SERMONS, sermonId);
      console.log('🎵 [SERVICE] Document reference created:', !!sermonRef);
      console.log('🎵 [SERVICE] Document path:', sermonRef.path);
      
      console.log('🎵 [SERVICE] Calling deleteDoc...');
      await deleteDoc(sermonRef);
      console.log(`✅ [SERVICE] Audio sermon deleted successfully: ${sermonId}`);
    } catch (error) {
      console.error('❌ [SERVICE] Error deleting audio sermon:', error);
      console.error('❌ [SERVICE] Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      throw error;
    }
  }

  // Create a new audio series
  async createAudioSeries(seriesData: Omit<AudioSeries, 'id'>): Promise<string> {
    try {
      console.log('🎵 Creating new audio series:', seriesData.title);
      
      const docRef = await addDoc(collection(db, this.COLLECTIONS.SERIES), seriesData);
      console.log(`✅ Audio series created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating audio series:', error);
      throw error;
    }
  }

  // Update an existing audio series
  async updateAudioSeries(seriesId: string, updateData: Partial<AudioSeries>): Promise<void> {
    try {
      console.log('🎵 Updating audio series:', seriesId);
      
      const seriesRef = doc(db, this.COLLECTIONS.SERIES, seriesId);
      await updateDoc(seriesRef, updateData);
      console.log(`✅ Audio series updated: ${seriesId}`);
    } catch (error) {
      console.error('❌ Error updating audio series:', error);
      throw error;
    }
  }

  // Delete an audio series
  async deleteAudioSeries(seriesId: string): Promise<void> {
    try {
      console.log('🎵 [SERVICE] Deleting audio series:', seriesId);
      console.log('🎵 [SERVICE] Database object:', !!db);
      console.log('🎵 [SERVICE] Collection name:', this.COLLECTIONS.SERIES);
      
      const seriesRef = doc(db, this.COLLECTIONS.SERIES, seriesId);
      console.log('🎵 [SERVICE] Document reference created:', !!seriesRef);
      console.log('🎵 [SERVICE] Document path:', seriesRef.path);
      
      console.log('🎵 [SERVICE] Calling deleteDoc...');
      await deleteDoc(seriesRef);
      console.log(`✅ [SERVICE] Audio series deleted successfully: ${seriesId}`);
    } catch (error) {
      console.error('❌ [SERVICE] Error deleting audio series:', error);
      console.error('❌ [SERVICE] Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      throw error;
    }
  }
}

export const audioSermonService = new AudioSermonService();
