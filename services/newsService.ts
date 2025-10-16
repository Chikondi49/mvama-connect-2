// News Service - Firebase Integration
import * as FileSystem from 'expo-file-system';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
    uploadString
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  imageUrl: string; // Recommended: 800x450px, 16:9 aspect ratio
  date: string;
  time: string;
  readTime: string;
  featured: boolean;
  author?: string;
  tags?: string[];
}

export interface CreateNewsArticle {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  imageUrl: string; // Recommended: 800x450px, 16:9 aspect ratio
  readTime: string;
  featured?: boolean;
  author?: string;
  tags?: string[];
}

class NewsService {
  private readonly COLLECTION_NAME = 'News'; // Match your Firestore collection name

  // Test Firebase connection
  async testFirebaseConnection(): Promise<boolean> {
    console.log('🧪 Testing Firebase connection...');
    
    if (!db) {
      console.error('❌ Firebase db is not initialized');
      return false;
    }

    try {
      // Try to get any collection to test connection
      const testCollection = collection(db, this.COLLECTION_NAME);
      const testSnapshot = await getDocs(testCollection);
      console.log('✅ Firebase connection successful');
      console.log('📊 Collection size:', testSnapshot.size);
      return true;
    } catch (error: any) {
      console.error('❌ Firebase connection failed:', error);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error message:', error?.message);
      return false;
    }
  }

  // Get all news articles
  async getAllNews(): Promise<NewsArticle[]> {
    console.log('📰 Starting news fetch process...');
    console.log('🔧 Firebase db object:', db);
    console.log('🗂️ Collection name:', this.COLLECTION_NAME);
    
    // Check if Firebase is available
    if (!db) {
      console.warn('⚠️ Firebase db is null/undefined, using mock data');
      return this.getMockNews();
    }

    try {
      console.log('🔍 Attempting to query Firestore collection...');
      
      // Try a simple collection query first (without orderBy)
      const newsCollection = collection(db, this.COLLECTION_NAME);
      console.log('📁 Collection reference created:', newsCollection);
      console.log('🔗 Collection path:', newsCollection.path);
      
      const querySnapshot = await getDocs(newsCollection);
      console.log('📊 Query snapshot received, size:', querySnapshot.size);
      console.log('📊 Query snapshot empty:', querySnapshot.empty);
      
      const articles: NewsArticle[] = [];
      
      if (querySnapshot.empty) {
        console.log('📭 Collection is empty - no documents found');
        console.log('🔍 This could mean:');
        console.log('   - No data in the collection');
        console.log('   - Wrong collection name');
        console.log('   - Firestore security rules blocking access');
        console.log('   - Network connectivity issues');
        return this.getMockNews();
      }
      
      querySnapshot.forEach((doc) => {
        console.log('📄 Processing document:', doc.id);
        const data = doc.data();
        console.log('📋 Document data:', JSON.stringify(data, null, 2));
        articles.push(this.processNewsDocument(doc.id, data));
      });
      
      console.log(`✅ Successfully processed ${articles.length} articles from Firestore`);
      
      if (articles.length > 0) {
        console.log('🎉 Returning Firebase data');
        return articles;
      } else {
        console.log('📭 No articles found in Firestore, using mock data');
        return this.getMockNews();
      }
      
    } catch (error: any) {
      console.error('❌ Detailed Firestore error:', error);
      console.error('❌ Error name:', error?.name);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error stack:', error?.stack);
      console.log('📰 Falling back to mock data due to error');
      return this.getMockNews();
    }
  }

  // Process Firestore document into NewsArticle
  private processNewsDocument(id: string, data: any): NewsArticle {
    // Handle different timestamp formats
    let createdAt: Date;
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      createdAt = data.createdAt.toDate();
    } else if (data.createdAt) {
      createdAt = new Date(data.createdAt);
    } else {
      createdAt = new Date();
    }
    
    return {
      id,
      title: data.title || 'Untitled',
      category: data.category || 'General',
      excerpt: data.excerpt || '',
      content: data.content || '',
      imageUrl: data.imageUrl || 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      date: this.formatDate(createdAt),
      time: this.formatTime(createdAt),
      readTime: data.readTime || '2 min read',
      featured: data.featured || false,
      author: data.author || 'MVAMA CCAP Nkhoma Synod',
      tags: data.tags || []
    };
  }

  // Format date for display
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Format time for display
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Get featured news articles
  async getFeaturedNews(): Promise<NewsArticle[]> {
    const allNews = await this.getAllNews();
    return allNews.filter(news => news.featured);
  }

  // Get news by category
  async getNewsByCategory(category: string): Promise<NewsArticle[]> {
    const allNews = await this.getAllNews();
    return allNews.filter(news => news.category === category);
  }

  // Get single news article by ID
  async getNewsById(id: string): Promise<NewsArticle | null> {
    console.log('🔍 Getting news article by ID:', id);
    
    if (!db) {
      console.warn('⚠️ Firebase db is null/undefined, searching mock data');
      const mockNews = this.getMockNews();
      return mockNews.find(news => news.id === id) || null;
    }

    try {
      // Try to get the specific document from Firestore
      const newsCollection = collection(db, this.COLLECTION_NAME);
      const querySnapshot = await getDocs(newsCollection);
      
      for (const doc of querySnapshot.docs) {
        if (doc.id === id) {
          console.log('✅ Found article in Firestore:', doc.id);
          const data = doc.data();
          return this.processNewsDocument(doc.id, data);
        }
      }
      
      console.log('📭 Article not found in Firestore, checking mock data');
      const mockNews = this.getMockNews();
      return mockNews.find(news => news.id === id) || null;
      
    } catch (error: any) {
      console.error('❌ Error getting article by ID:', error);
      console.log('📰 Falling back to mock data');
      const mockNews = this.getMockNews();
      return mockNews.find(news => news.id === id) || null;
    }
  }

  // Create new news article
  async createNews(articleData: CreateNewsArticle): Promise<string> {
    console.log('📝 Creating new news article:', articleData.title);
    
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    try {
      const newsCollection = collection(db, this.COLLECTION_NAME);
      const docData = {
        ...articleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        featured: articleData.featured || false
      };
      
      const docRef = await addDoc(newsCollection, docData);
      console.log('✅ News article created with ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('❌ Error creating news article:', error);
      throw new Error(`Failed to create news article: ${error.message}`);
    }
  }

  // Update existing news article
  async updateNews(id: string, articleData: Partial<CreateNewsArticle>): Promise<void> {
    console.log('✏️ Updating news article:', id);
    
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const updateData = {
        ...articleData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      console.log('✅ News article updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating news article:', error);
      throw new Error(`Failed to update news article: ${error.message}`);
    }
  }

  // Delete news article
  async deleteNews(id: string): Promise<void> {
    console.log('🗑️ Deleting news article:', id);
    
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
      console.log('✅ News article deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting news article:', error);
      throw new Error(`Failed to delete news article: ${error.message}`);
    }
  }

  // Toggle featured status
  async toggleFeatured(id: string, featured: boolean): Promise<void> {
    console.log('⭐ Toggling featured status for article:', id, 'to:', featured);
    
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        featured,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Featured status updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating featured status:', error);
      throw new Error(`Failed to update featured status: ${error.message}`);
    }
  }

  // Bulk delete news articles
  async bulkDeleteNews(ids: string[]): Promise<void> {
    console.log('🗑️ Bulk deleting news articles:', ids.length, 'items');
    
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    try {
      const deletePromises = ids.map(id => {
        const docRef = doc(db, this.COLLECTION_NAME, id);
        return deleteDoc(docRef);
      });
      
      await Promise.all(deletePromises);
      console.log('✅ Bulk delete completed successfully');
    } catch (error: any) {
      console.error('❌ Error in bulk delete:', error);
      throw new Error(`Failed to delete articles: ${error.message}`);
    }
  }

  // Bulk update featured status
  async bulkUpdateFeatured(ids: string[], featured: boolean): Promise<void> {
    console.log('⭐ Bulk updating featured status:', ids.length, 'items to:', featured);
    
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    try {
      const updatePromises = ids.map(id => {
        const docRef = doc(db, this.COLLECTION_NAME, id);
        return updateDoc(docRef, {
          featured,
          updatedAt: serverTimestamp()
        });
      });
      
      await Promise.all(updatePromises);
      console.log('✅ Bulk featured update completed successfully');
    } catch (error: any) {
      console.error('❌ Error in bulk featured update:', error);
      throw new Error(`Failed to update featured status: ${error.message}`);
    }
  }

  // Get news with advanced filtering and sorting
  async getNewsWithFilters(options: {
    category?: string;
    featured?: boolean;
    sortBy?: 'date' | 'title' | 'featured';
    sortOrder?: 'asc' | 'desc';
    limitCount?: number;
  } = {}): Promise<NewsArticle[]> {
    console.log('🔍 Getting news with filters:', options);
    
    if (!db) {
      console.warn('⚠️ Firebase db is null/undefined, filtering mock data');
      return this.filterMockNews(options);
    }

    try {
      let newsQuery = collection(db, this.COLLECTION_NAME);
      let constraints: any[] = [];
      
      // Add where clauses
      if (options.category) {
        constraints.push(where('category', '==', options.category));
      }
      if (options.featured !== undefined) {
        constraints.push(where('featured', '==', options.featured));
      }
      
      // Add ordering
      if (options.sortBy) {
        const direction = options.sortOrder === 'desc' ? 'desc' : 'asc';
        if (options.sortBy === 'date') {
          constraints.push(orderBy('createdAt', direction));
        } else {
          constraints.push(orderBy(options.sortBy, direction));
        }
      } else {
        constraints.push(orderBy('createdAt', 'desc'));
      }
      
      // Add limit
      if (options.limitCount) {
        constraints.push(limit(options.limitCount));
      }
      
      const q = query(newsQuery, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const articles: NewsArticle[] = [];
      querySnapshot.forEach((doc) => {
        articles.push(this.processNewsDocument(doc.id, doc.data()));
      });
      
      console.log(`✅ Retrieved ${articles.length} filtered articles`);
      return articles;
      
    } catch (error: any) {
      console.error('❌ Error getting filtered news:', error);
      console.log('📰 Falling back to filtered mock data');
      return this.filterMockNews(options);
    }
  }

  // Filter mock news data
  private filterMockNews(options: {
    category?: string;
    featured?: boolean;
    sortBy?: 'date' | 'title' | 'featured';
    sortOrder?: 'asc' | 'desc';
    limitCount?: number;
  }): NewsArticle[] {
    let filtered = this.getMockNews();
    
    // Apply filters
    if (options.category) {
      filtered = filtered.filter(news => news.category === options.category);
    }
    if (options.featured !== undefined) {
      filtered = filtered.filter(news => news.featured === options.featured);
    }
    
    // Apply sorting
    if (options.sortBy) {
      filtered.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (options.sortBy) {
          case 'date':
            aVal = new Date(a.date);
            bVal = new Date(b.date);
            break;
          case 'title':
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
            break;
          case 'featured':
            aVal = a.featured ? 1 : 0;
            bVal = b.featured ? 1 : 0;
            break;
          default:
            return 0;
        }
        
        if (aVal < bVal) return options.sortOrder === 'desc' ? 1 : -1;
        if (aVal > bVal) return options.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }
    
    // Apply limit
    if (options.limitCount) {
      filtered = filtered.slice(0, options.limitCount);
    }
    
    return filtered;
  }

  // Upload image to Firebase Storage
  async uploadImage(imageUri: string, fileName?: string): Promise<string> {
    console.log('📸 Uploading image to Firebase Storage:', imageUri);
    
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }

    try {
      // Generate unique filename if not provided
      const timestamp = Date.now();
      const finalFileName = fileName || `news-image-${timestamp}.jpg`;
      
      // Create storage reference
      const imageRef = ref(storage, `news-images/${finalFileName}`);
      
      // If this is a local/content URI, prefer base64 upload for reliability
      if (imageUri.startsWith('file:') || imageUri.startsWith('content:')) {
        console.log('🔄 Reading file as base64 for upload...');
        const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
        console.log('⬆️ Uploading base64 image to storage...');
        const snapshot = await uploadString(imageRef, base64, 'base64');
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('✅ Image uploaded successfully (base64):', downloadURL);
        return downloadURL;
      }

      // Fallback: fetch as blob (for http/https URIs)
      const response = await fetch(imageUri);
      const blob = await response.blob();
      console.log('⬆️ Uploading image blob to storage...');
      const snapshot = await uploadBytes(imageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Image uploaded successfully:', downloadURL);
      
      return downloadURL;
    } catch (error: any) {
      console.error('❌ Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error?.message || 'Unknown error'}`);
    }
  }

  // Delete image from Firebase Storage
  async deleteImage(imageUrl: string): Promise<void> {
    console.log('🗑️ Deleting image from Firebase Storage:', imageUrl);
    
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }

    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/o\/(.*?)\?/);
      
      if (!pathMatch) {
        console.warn('⚠️ Could not extract file path from URL, skipping deletion');
        return;
      }
      
      const filePath = decodeURIComponent(pathMatch[1]);
      const imageRef = ref(storage, filePath);
      
      await deleteObject(imageRef);
      console.log('✅ Image deleted successfully from storage');
    } catch (error: any) {
      console.error('❌ Error deleting image:', error);
      // Don't throw error for image deletion failures
      console.warn('⚠️ Image deletion failed, but continuing with operation');
    }
  }

  // Create news with image upload
  async createNewsWithImage(articleData: CreateNewsArticle, imageUri?: string): Promise<string> {
    console.log('📝 Creating news article with image:', articleData.title);
    
    let finalImageUrl = articleData.imageUrl;
    
    // Upload image if provided
    if (imageUri && imageUri !== articleData.imageUrl) {
      try {
        finalImageUrl = await this.uploadImage(imageUri);
      } catch (error) {
        console.warn('⚠️ Image upload failed, using provided URL:', error);
        // Continue with provided URL if upload fails
      }
    }
    
    // Create article with final image URL
    const finalArticleData = {
      ...articleData,
      imageUrl: finalImageUrl
    };
    
    return await this.createNews(finalArticleData);
  }

  // Update news with image upload
  async updateNewsWithImage(id: string, articleData: Partial<CreateNewsArticle>, imageUri?: string): Promise<void> {
    console.log('✏️ Updating news article with image:', id);
    
    let finalImageUrl = articleData.imageUrl;
    
    // Upload new image if provided
    if (imageUri && imageUri !== articleData.imageUrl) {
      try {
        // Get current article to delete old image
        const currentArticle = await this.getNewsById(id);
        
        // Upload new image
        finalImageUrl = await this.uploadImage(imageUri);
        
        // Delete old image if it exists and is from Firebase Storage
        if (currentArticle?.imageUrl && currentArticle.imageUrl.includes('firebasestorage.googleapis.com')) {
          await this.deleteImage(currentArticle.imageUrl);
        }
      } catch (error) {
        console.warn('⚠️ Image upload failed, using provided URL:', error);
        // Continue with provided URL if upload fails
      }
    }
    
    // Update article with final image URL
    const finalArticleData = {
      ...articleData,
      imageUrl: finalImageUrl
    };
    
    return await this.updateNews(id, finalArticleData);
  }

  // Delete news with image cleanup
  async deleteNewsWithImage(id: string): Promise<void> {
    console.log('🗑️ Deleting news article with image cleanup:', id);
    
    try {
      // Get article to check for image
      const article = await this.getNewsById(id);
      
      // Delete the article first
      await this.deleteNews(id);
      
      // Delete associated image if it's from Firebase Storage
      if (article?.imageUrl && article.imageUrl.includes('firebasestorage.googleapis.com')) {
        await this.deleteImage(article.imageUrl);
      }
    } catch (error: any) {
      console.error('❌ Error deleting news with image:', error);
      throw new Error(`Failed to delete news article: ${error.message}`);
    }
  }

  // Get available categories
  getCategories(): string[] {
    return [
      'Community',
      'Youth',
      'Groups',
      'Events',
      'Missions',
      'Worship',
      'Announcements',
      'Ministry',
      'Education',
      'Outreach'
    ];
  }

  // Mock data for demonstration
  private getMockNews(): NewsArticle[] {
    return [
      {
        id: 'mock-1',
        title: 'New Community Outreach Program Launches',
        category: 'Community',
        excerpt: 'Join us as we serve our local community through food drives, tutoring programs, and neighborhood support initiatives.',
        content: 'Our church is excited to announce the launch of a comprehensive community outreach program designed to serve our neighbors and strengthen our local community bonds. This initiative includes weekly food drives, after-school tutoring programs for children, and neighborhood support services for elderly residents.',
        imageUrl: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        date: 'Dec 4, 2024',
        time: '10:30 AM',
        readTime: '3 min read',
        featured: true,
        author: 'Rev. Yassin Gammah',
        tags: ['community', 'outreach', 'service']
      },
      {
        id: 'mock-2',
        title: 'Youth Ministry Summer Camp Registration Open',
        category: 'Youth',
        excerpt: 'Sign up now for an unforgettable summer experience filled with worship, adventure, and spiritual growth.',
        content: 'Registration is now open for our annual Youth Ministry Summer Camp. This year\'s theme is "Growing in Faith" and will feature outdoor adventures, worship sessions, Bible studies, and fellowship activities designed to strengthen young people\'s relationship with God.',
        imageUrl: 'https://images.pexels.com/photos/5935205/pexels-photo-5935205.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        date: 'Dec 2, 2024',
        time: '2:15 PM',
        readTime: '2 min read',
        featured: false,
        author: 'Youth Ministry Team',
        tags: ['youth', 'camp', 'summer']
      },
      {
        id: 'mock-3',
        title: 'New Small Groups Starting This Month',
        category: 'Groups',
        excerpt: 'Connect with others through our new small group sessions focused on faith, fellowship, and personal growth.',
        content: 'We are launching several new small groups this month to help our congregation connect more deeply with one another and grow in their faith journey. Groups will meet weekly and focus on Bible study, prayer, and mutual support.',
        imageUrl: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        date: 'Nov 30, 2024',
        time: '7:00 PM',
        readTime: '4 min read',
        featured: false,
        author: 'Small Groups Coordinator',
        tags: ['groups', 'fellowship', 'bible study']
      },
      {
        id: 'mock-4',
        title: 'Christmas Service Celebration',
        category: 'Events',
        excerpt: 'Join us for a special Christmas service as we celebrate the birth of our Lord and Savior Jesus Christ.',
        content: 'Our Christmas service will be a beautiful celebration of the birth of Jesus Christ. We will have special music, readings, and a message of hope and joy. All are welcome to join us for this special time of worship and fellowship.',
        imageUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        date: 'Nov 28, 2024',
        time: '6:00 PM',
        readTime: '2 min read',
        featured: false,
        author: 'Worship Team',
        tags: ['christmas', 'celebration', 'worship']
      },
      {
        id: 'mock-5',
        title: 'Mission Trip to Malawi Announced',
        category: 'Missions',
        excerpt: 'Be part of our international missions team traveling to Malawi to build homes and share hope.',
        content: 'We are excited to announce our upcoming mission trip to Malawi. This will be an opportunity to serve our brothers and sisters in Christ by building homes, providing medical care, and sharing the Gospel. We are looking for volunteers to join our team.',
        imageUrl: 'https://images.pexels.com/photos/6646914/pexels-photo-6646914.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        date: 'Nov 25, 2024',
        time: '4:30 PM',
        readTime: '5 min read',
        featured: false,
        author: 'Missions Team',
        tags: ['missions', 'malawi', 'service']
      }
    ];
  }
}

export const newsService = new NewsService();
