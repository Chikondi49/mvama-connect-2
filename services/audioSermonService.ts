// Audio Sermon Service for Firebase Firestore
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
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
        sermons.push({
          id: doc.id,
          ...doc.data()
        } as AudioSermon);
      });
      
      console.log(`✅ Fetched ${sermons.length} audio sermons`);
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
        sermons.push({
          id: doc.id,
          ...doc.data()
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
      
      const episodes: AudioSermon[] = [];
      querySnapshot.forEach((doc) => {
        episodes.push({
          id: doc.id,
          ...doc.data()
        } as AudioSermon);
      });
      
      console.log(`✅ Fetched ${episodes.length} episodes for series ${seriesId}`);
      return episodes;
    } catch (error) {
      console.error('❌ Error fetching episodes by series:', error);
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
}

export const audioSermonService = new AudioSermonService();
