// Event Service for Firebase Firestore
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string; // "10:00 AM" or "14:30"
  location: string;
  category: string; // "Sunday Service", "Youth Event", "Prayer Meeting", "Special Event", etc.
  imageUrl?: string;
  registrationRequired: boolean;
  registrationUrl?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  maxAttendees?: number;
  currentAttendees?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

class EventService {
  private readonly COLLECTION = 'events';

  // Get all events
  async getAllEvents(): Promise<Event[]> {
    try {
      console.log('📅 Fetching events from Firestore...');
      const eventsRef = collection(db, this.COLLECTION);
      const q = query(eventsRef, orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle Firestore Timestamp conversion for date fields
        if (data.date && typeof data.date.toDate === 'function') {
          data.date = data.date.toDate().toISOString();
        }
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          data.createdAt = data.createdAt.toDate().toISOString();
        }
        if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
          data.updatedAt = data.updatedAt.toDate().toISOString();
        }
        
        events.push({
          id: doc.id,
          ...data
        } as Event);
      });
      
      console.log(`✅ Fetched ${events.length} events`);
      return events;
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      return [];
    }
  }

  // Get upcoming events
  async getUpcomingEvents(): Promise<Event[]> {
    try {
      console.log('📅 Fetching upcoming events from Firestore...');
      const eventsRef = collection(db, this.COLLECTION);
      const q = query(
        eventsRef, 
        where('status', '==', 'upcoming'),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      console.log('📅 Query snapshot size:', querySnapshot.size);
      
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle Firestore Timestamp conversion for date fields
        if (data.date && typeof data.date.toDate === 'function') {
          data.date = data.date.toDate().toISOString();
        }
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          data.createdAt = data.createdAt.toDate().toISOString();
        }
        if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
          data.updatedAt = data.updatedAt.toDate().toISOString();
        }
        
        events.push({
          id: doc.id,
          ...data
        } as Event);
      });
      
      console.log(`✅ Fetched ${events.length} upcoming events`);
      
      // If no events found, return Events tab data for development
      if (events.length === 0) {
        console.log('📅 No events found, returning Events tab data for development');
        return this.getEventsTabData();
      }
      
      return events;
    } catch (error) {
      console.error('❌ Error fetching upcoming events:', error);
      console.log('📅 Returning Events tab data as fallback');
      return this.getEventsTabData();
    }
  }

  // Get events by category
  async getEventsByCategory(category: string): Promise<Event[]> {
    try {
      console.log(`📅 Fetching events for category: ${category}`);
      const eventsRef = collection(db, this.COLLECTION);
      const q = query(
        eventsRef, 
        where('category', '==', category),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle Firestore Timestamp conversion for date fields
        if (data.date && typeof data.date.toDate === 'function') {
          data.date = data.date.toDate().toISOString();
        }
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          data.createdAt = data.createdAt.toDate().toISOString();
        }
        if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
          data.updatedAt = data.updatedAt.toDate().toISOString();
        }
        
        events.push({
          id: doc.id,
          ...data
        } as Event);
      });
      
      console.log(`✅ Fetched ${events.length} events for ${category}`);
      return events;
    } catch (error) {
      console.error('❌ Error fetching events by category:', error);
      return [];
    }
  }

  // Get events by date range
  async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    try {
      console.log(`📅 Fetching events from ${startDate} to ${endDate}`);
      const eventsRef = collection(db, this.COLLECTION);
      const q = query(
        eventsRef, 
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle Firestore Timestamp conversion for date fields
        if (data.date && typeof data.date.toDate === 'function') {
          data.date = data.date.toDate().toISOString();
        }
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          data.createdAt = data.createdAt.toDate().toISOString();
        }
        if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
          data.updatedAt = data.updatedAt.toDate().toISOString();
        }
        
        events.push({
          id: doc.id,
          ...data
        } as Event);
      });
      
      console.log(`✅ Fetched ${events.length} events in date range`);
      return events;
    } catch (error) {
      console.error('❌ Error fetching events by date range:', error);
      return [];
    }
  }

  // Get a single event
  async getEventById(id: string): Promise<Event | null> {
    try {
      console.log(`📅 Fetching event: ${id}`);
      const eventRef = doc(db, this.COLLECTION, id);
      const eventSnap = await getDoc(eventRef);
      
      if (eventSnap.exists()) {
        const event = {
          id: eventSnap.id,
          ...eventSnap.data()
        } as Event;
        console.log(`✅ Fetched event: ${event.title}`);
        return event;
      } else {
        console.log('❌ Event not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching event by ID:', error);
      return null;
    }
  }

  // Get events requiring registration
  async getEventsRequiringRegistration(): Promise<Event[]> {
    try {
      console.log('📅 Fetching events requiring registration...');
      const eventsRef = collection(db, this.COLLECTION);
      const q = query(
        eventsRef, 
        where('registrationRequired', '==', true),
        where('status', '==', 'upcoming'),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle Firestore Timestamp conversion for date fields
        if (data.date && typeof data.date.toDate === 'function') {
          data.date = data.date.toDate().toISOString();
        }
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          data.createdAt = data.createdAt.toDate().toISOString();
        }
        if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
          data.updatedAt = data.updatedAt.toDate().toISOString();
        }
        
        events.push({
          id: doc.id,
          ...data
        } as Event);
      });
      
      console.log(`✅ Fetched ${events.length} events requiring registration`);
      return events;
    } catch (error) {
      console.error('❌ Error fetching events requiring registration:', error);
      return [];
    }
  }

  // Events tab data for development
  private getEventsTabData(): Event[] {
    return [
      {
        id: 'events-tab-001',
        title: 'Youth Night Worship',
        description: 'An evening of powerful worship, testimonies, and fellowship designed for young adults and teens.',
        date: new Date('2024-11-15').toISOString(),
        time: '7:00 PM - 9:30 PM',
        location: 'Main Sanctuary',
        category: 'Youth',
        imageUrl: 'https://images.pexels.com/photos/5935205/pexels-photo-5935205.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        registrationRequired: false,
        status: 'upcoming',
        tags: ['youth', 'worship', 'fellowship'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'events-tab-002',
        title: 'Community Outreach',
        description: 'Join us as we serve our local community through food distribution and community support.',
        date: new Date('2024-11-22').toISOString(),
        time: '9:00 AM - 1:00 PM',
        location: 'Community Center',
        category: 'Service',
        imageUrl: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        registrationRequired: true,
        status: 'upcoming',
        tags: ['outreach', 'community', 'service'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'events-tab-003',
        title: 'Thanksgiving Service',
        description: 'A special service of gratitude and celebration with worship, testimonies, and fellowship.',
        date: new Date('2024-11-28').toISOString(),
        time: '10:00 AM - 12:00 PM',
        location: 'Main Sanctuary',
        category: 'Service',
        imageUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        registrationRequired: false,
        status: 'upcoming',
        tags: ['thanksgiving', 'worship', 'celebration'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'events-tab-004',
        title: 'Christmas Choir Rehearsal',
        description: 'Practice sessions for our annual Christmas musical performance. All voices welcome.',
        date: new Date('2024-12-01').toISOString(),
        time: '6:00 PM - 8:00 PM',
        location: 'Music Room',
        category: 'Music',
        imageUrl: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        registrationRequired: true,
        status: 'upcoming',
        tags: ['choir', 'christmas', 'music'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'events-tab-005',
        title: 'Advent Study Group',
        description: 'A four-week study exploring the themes of Advent and preparing our hearts for Christmas.',
        date: new Date('2024-12-08').toISOString(),
        time: '7:00 PM - 8:30 PM',
        location: 'Fellowship Hall',
        category: 'Study',
        imageUrl: 'https://images.pexels.com/photos/8468012/pexels-photo-8468012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        registrationRequired: true,
        status: 'upcoming',
        tags: ['advent', 'study', 'christmas'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
  }

  // Mock events for development
  private getMockEvents(): Event[] {
    return [
      {
        id: 'mock-event-001',
        title: 'Sunday Service',
        description: 'Join us for our weekly Sunday worship service with inspiring messages, fellowship, and community.',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        time: '10:00 AM',
        location: 'MVAMA CCAP NKHOMA SYNOD Church',
        category: 'Sunday Service',
        imageUrl: 'https://images.pexels.com/photos/8468012/pexels-photo-8468012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        registrationRequired: false,
        status: 'upcoming',
        tags: ['worship', 'sunday', 'service'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mock-event-002',
        title: 'Youth Fellowship Meeting',
        description: 'Monthly youth fellowship gathering with games, discussions, and spiritual growth activities.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        time: '6:00 PM',
        location: 'Church Youth Hall',
        category: 'Youth Event',
        imageUrl: 'https://images.pexels.com/photos/8828591/pexels-photo-8828591.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        registrationRequired: true,
        status: 'upcoming',
        tags: ['youth', 'fellowship', 'meeting'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mock-event-003',
        title: 'Prayer and Fasting Week',
        description: 'A week of prayer and fasting for spiritual renewal and community strengthening.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        time: 'All Day',
        location: 'Church and Online',
        category: 'Prayer Meeting',
        imageUrl: 'https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        registrationRequired: false,
        status: 'upcoming',
        tags: ['prayer', 'fasting', 'spiritual'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mock-event-004',
        title: 'Women\'s Fellowship Breakfast',
        description: 'Monthly women\'s fellowship breakfast with guest speaker and community building.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        time: '8:00 AM',
        location: 'Church Fellowship Hall',
        category: 'Women\'s Event',
        imageUrl: 'https://images.pexels.com/photos/8940091/pexels-photo-8940091.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        registrationRequired: true,
        maxAttendees: 50,
        currentAttendees: 23,
        status: 'upcoming',
        tags: ['women', 'fellowship', 'breakfast'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mock-event-005',
        title: 'Community Outreach Program',
        description: 'Join us in serving our community through various outreach activities and programs.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        time: '9:00 AM',
        location: 'Various Community Locations',
        category: 'Special Event',
        imageUrl: 'https://images.pexels.com/photos/8468068/pexels-photo-8468068.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        registrationRequired: true,
        contactPerson: 'Rev. Yassin Gammah',
        contactPhone: '+265-XXX-XXXX',
        status: 'upcoming',
        tags: ['outreach', 'community', 'service'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
  }
}

export const eventService = new EventService();
