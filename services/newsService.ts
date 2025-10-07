// News Service - Firebase Integration
import {
    collection,
    getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

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
