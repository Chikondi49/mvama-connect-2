import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Calendar as CalendarIcon, ChevronRight, Clock, MapPin, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Event, eventService } from '../../services/eventService';

const upcomingEvents = [
  {
    id: 1,
    title: 'Youth Night Worship',
    description: 'An evening of powerful worship, testimonies, and fellowship designed for young adults and teens.',
    date: 'Nov 15, 2024',
    time: '7:00 PM - 9:30 PM',
    location: 'Main Sanctuary',
    attendees: 85,
    category: 'Youth',
    image: 'https://images.pexels.com/photos/5935205/pexels-photo-5935205.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    featured: true,
  },
  {
    id: 2,
    title: 'Community Outreach',
    description: 'Join us as we serve our local community through food distribution and community support.',
    date: 'Nov 22, 2024',
    time: '9:00 AM - 1:00 PM',
    location: 'Community Center',
    attendees: 45,
    category: 'Service',
    image: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  },
  {
    id: 3,
    title: 'Thanksgiving Service',
    description: 'A special service of gratitude and celebration with worship, testimonies, and fellowship.',
    date: 'Nov 28, 2024',
    time: '10:00 AM - 12:00 PM',
    location: 'Main Sanctuary',
    attendees: 250,
    category: 'Service',
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  },
  {
    id: 4,
    title: 'Christmas Choir Rehearsal',
    description: 'Practice sessions for our annual Christmas musical performance. All voices welcome.',
    date: 'Dec 1, 2024',
    time: '6:00 PM - 8:00 PM',
    location: 'Music Room',
    attendees: 32,
    category: 'Worship',
    image: 'https://images.pexels.com/photos/8468068/pexels-photo-8468068.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  },
  {
    id: 5,
    title: 'Men\'s Prayer Breakfast',
    description: 'Monthly gathering for men to connect, pray, and encourage one another in faith.',
    date: 'Dec 5, 2024',
    time: '7:00 AM - 9:00 AM',
    location: 'Fellowship Hall',
    attendees: 28,
    category: 'Fellowship',
    image: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function EventsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const filters = ['All', 'Youth', 'Service', 'Worship', 'Fellowship'];

  // Load events from Firebase
  const loadEvents = async () => {
    try {
      setLoading(true);
      console.log('📅 Loading events from Firestore...');
      const eventsData = await eventService.getAllEvents();
      console.log(`✅ Loaded ${eventsData.length} events from Firestore`);
      setEvents(eventsData);
    } catch (error) {
      console.error('❌ Error loading events:', error);
      // Fallback to mock data if Firebase fails
      setEvents(upcomingEvents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleViewFullCalendar = () => {
    Alert.alert(
      'Full Calendar',
      'This would open a full calendar view showing all upcoming events. In a real app, this would integrate with a calendar library or open the device calendar.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Calendar', onPress: () => {
          // In a real app, you would integrate with a calendar library
          // or open the device's default calendar app
          console.log('Opening full calendar...');
        }}
      ]
    );
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const featuredEvent = events.find(event => event.category === 'Sunday Service');
  const regularEvents = events.filter(event => event.category !== 'Sunday Service');

  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <Text style={styles.headerSubtitle}>Connect and grow together</Text>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c9a961" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      )}

      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.categoryButton,
                selectedFilter === filter && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}>
              <Text
                style={[
                  styles.categoryText,
                  selectedFilter === filter && styles.categoryTextActive,
                ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        {featuredEvent && (
          <TouchableOpacity style={styles.featuredCard}>
            <ImageBackground
              source={{ uri: featuredEvent.image }}
              style={styles.featuredImage}
              imageStyle={styles.featuredImageStyle}>
              <LinearGradient
                colors={['rgba(15,15,15,0.2)', 'rgba(15,15,15,0.95)']}
                style={styles.featuredGradient}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>Featured</Text>
                </View>
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredCategory}>{featuredEvent.category}</Text>
                  <Text style={styles.featuredTitle}>{featuredEvent.title}</Text>
                  <Text style={styles.featuredDescription}>{featuredEvent.description}</Text>
                  <View style={styles.featuredDetails}>
                    <View style={styles.featuredDetailItem}>
                      <CalendarIcon size={16} color="#c9a961" strokeWidth={2} />
                      <Text style={styles.featuredDetailText}>{featuredEvent.date}</Text>
                    </View>
                    <View style={styles.featuredDetailItem}>
                      <Clock size={16} color="#c9a961" strokeWidth={2} />
                      <Text style={styles.featuredDetailText}>{featuredEvent.time}</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>

          {regularEvents.map((event) => {
            const { day, month } = parseDate(event.date);
            return (
              <TouchableOpacity 
                key={event.id} 
                style={styles.eventCard}
                onPress={() => handleEventPress(event.id)}>
                <View style={styles.eventDate}>
                  <Text style={styles.eventDay}>{day}</Text>
                  <Text style={styles.eventMonth}>{month}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventCategory}>{event.category}</Text>
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetail}>
                      <Clock size={14} color="#666666" strokeWidth={2} />
                      <Text style={styles.eventDetailText}>{event.time}</Text>
                    </View>
                    <View style={styles.eventDetail}>
                      <MapPin size={14} color="#666666" strokeWidth={2} />
                      <Text style={styles.eventDetailText}>{event.location}</Text>
                    </View>
                  </View>
                  <View style={styles.eventFooter}>
                    <View style={styles.eventAttendees}>
                      <Users size={14} color="#c9a961" strokeWidth={2} />
                      <Text style={styles.eventAttendeesText}>
                        {event.attendees} attending
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.eventRsvpButton}>
                      <Text style={styles.eventRsvpText}>RSVP</Text>
                      <ChevronRight size={16} color="#ffffff" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.calendarButton} onPress={handleViewFullCalendar}>
          <CalendarIcon size={20} color="#ffffff" strokeWidth={2} />
          <Text style={styles.calendarButtonText}>View Full Calendar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#c9a961',
    fontFamily: 'Inter-Medium',
    marginTop: 12,
  },
  categoriesWrapper: {
    marginBottom: 20,
    paddingBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  categoryButtonActive: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
    shadowColor: '#c9a961',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  featuredCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    height: 380,
  },
  featuredImage: {
    flex: 1,
    width: '100%',
  },
  featuredImageStyle: {
    resizeMode: 'cover',
  },
  featuredGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#c9a961',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  featuredBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#ffffff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  featuredContent: {
    gap: 8,
  },
  featuredCategory: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#c9a961',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 28,
    color: '#ffffff',
    lineHeight: 36,
  },
  featuredDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
  featuredDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  featuredDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredDetailText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  eventDate: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  eventDay: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#c9a961',
  },
  eventMonth: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#999999',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventCategory: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#c9a961',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 6,
  },
  eventDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#999999',
    lineHeight: 18,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#666666',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  eventAttendees: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventAttendeesText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#c9a961',
  },
  eventRsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c9a961',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  eventRsvpText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#ffffff',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  calendarButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#ffffff',
  },
});
