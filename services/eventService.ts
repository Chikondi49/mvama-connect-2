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
        events.push({
          id: doc.id,
          ...doc.data()
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
      
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data()
        } as Event);
      });
      
      console.log(`✅ Fetched ${events.length} upcoming events`);
      return events;
    } catch (error) {
      console.error('❌ Error fetching upcoming events:', error);
      return [];
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
        events.push({
          id: doc.id,
          ...doc.data()
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
        events.push({
          id: doc.id,
          ...doc.data()
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
        events.push({
          id: doc.id,
          ...doc.data()
        } as Event);
      });
      
      console.log(`✅ Fetched ${events.length} events requiring registration`);
      return events;
    } catch (error) {
      console.error('❌ Error fetching events requiring registration:', error);
      return [];
    }
  }
}

export const eventService = new EventService();
