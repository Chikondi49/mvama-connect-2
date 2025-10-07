import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight, BookOpen, Calendar, Heart, Play, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Event, eventService } from '../../services/eventService';
import { youtubeService, YouTubeVideo } from '../../services/youtubeService';

export default function HomeScreen() {
  const { user, userProfile } = useAuth();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's first name
  const getFirstName = () => {
    const displayName = userProfile?.displayName || user?.displayName || '';
    const firstName = displayName.split(' ')[0];
    return (firstName || 'Friend').toUpperCase();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setEventsLoading(true);
        setError(null);
        
        // Fetch videos and events in parallel
        const [videosData, eventsData] = await Promise.all([
          youtubeService.getChannelVideos(),
          eventService.getUpcomingEvents()
        ]);
        
        setVideos(videosData);
        setEvents(eventsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
        setEventsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSermonPress = (videoId: string) => {
    router.push(`/(tabs)/sermons`);
  };

  const handleSeeAllSermons = () => {
    router.push(`/(tabs)/sermons`);
  };

  const handleSeeAllEvents = () => {
    router.push(`/(tabs)/events`);
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleActionPress = (action: string) => {
    if (action === 'Give') {
      router.push('/give');
    } else if (action === 'Connect') {
      router.push('/connect');
    } else {
      console.log(`${action} action pressed`);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={require('../../assets/images/church-background.jpg')}
        style={styles.heroSection}
        imageStyle={styles.heroImage}>
        <LinearGradient
          colors={['rgba(15,15,15,0.4)', 'rgba(15,15,15,0.7)', 'rgba(15,15,15,0.9)', '#0f0f0f']}
          style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/images/mvama-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.heroWelcome}>Welcome {getFirstName()} to</Text>
            <Text style={styles.heroTitle}>Mvama CCAP Nkhoma Synod</Text>
            <Text style={styles.heroSubtitle}>Mvama Connect</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.content}>
        <View style={styles.serviceCard}>
          <View style={styles.serviceCardHeader}>
            <View>
              <Text style={styles.serviceCardLabel}>Join Us This Sunday</Text>
              <Text style={styles.serviceCardTime}>10:00 AM & 6:00 PM</Text>
            </View>
            <TouchableOpacity style={styles.liveButton}>
              <Play size={16} color="#ffffff" fill="#ffffff" />
              <Text style={styles.liveButtonText}>Watch Live</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.serviceCardDescription}>
            Experience worship, fellowship, and inspiring messages that transform lives.
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleActionPress('Give')}>
            <View style={styles.actionIconContainer}>
              <Heart size={24} color="#c9a961" strokeWidth={2} />
            </View>
            <Text style={styles.actionTitle}>Give</Text>
            <Text style={styles.actionSubtitle}>Support our mission</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => handleActionPress('Connect')}>
            <View style={styles.actionIconContainer}>
              <Users size={24} color="#c9a961" strokeWidth={2} />
            </View>
            <Text style={styles.actionTitle}>Connect</Text>
            <Text style={styles.actionSubtitle}>Join a group</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => handleActionPress('Bible')}>
            <View style={styles.actionIconContainer}>
              <BookOpen size={24} color="#c9a961" strokeWidth={2} />
            </View>
            <Text style={styles.actionTitle}>Bible</Text>
            <Text style={styles.actionSubtitle}>Daily reading</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllEvents}>
              <Text style={styles.seeAllText}>See All</Text>
              <ArrowRight size={16} color="#c9a961" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {eventsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#c9a961" />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Calendar size={48} color="#666666" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No Upcoming Events</Text>
              <Text style={styles.emptySubtitle}>Check back later for new events</Text>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {events.slice(0, 3).map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event.id)}>
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventCategory}>{event.category}</Text>
                    </View>
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventDate}>{event.date}</Text>
                      <Text style={styles.eventTime}>{event.time}</Text>
                      <Text style={styles.eventLocation}>{event.location}</Text>
                    </View>
                  </View>
                  <ArrowRight size={20} color="#666666" strokeWidth={2} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Sermon</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllSermons}>
              <Text style={styles.seeAllText}>See All</Text>
              <ArrowRight size={16} color="#c9a961" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#c9a961" />
              <Text style={styles.loadingText}>Loading latest sermon...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => {
                const fetchVideos = async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    const videos = await youtubeService.getChannelVideos();
                    setVideos(videos);
                  } catch (err) {
                    console.error('Error fetching videos:', err);
                    setError('Failed to load sermons');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchVideos();
              }}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : videos.length > 0 ? (
            <TouchableOpacity 
              style={styles.sermonCard}
              onPress={() => handleSermonPress(videos[0].id)}
            >
              <ImageBackground
                source={{ uri: videos[0].thumbnail }}
                style={styles.sermonImage}
                imageStyle={styles.sermonImageStyle}>
                <LinearGradient
                  colors={['rgba(15,15,15,0)', 'rgba(15,15,15,0.95)']}
                  style={styles.sermonGradient}>
                  <View style={styles.playIconContainer}>
                    <Play size={24} color="#ffffff" fill="#ffffff" />
                  </View>
                </LinearGradient>
              </ImageBackground>
              <View style={styles.sermonInfo}>
                <Text style={styles.sermonCategory}>Sunday Service</Text>
                <Text style={styles.sermonTitle} numberOfLines={2}>{videos[0].title}</Text>
                <Text style={styles.sermonMeta}>
                  {videos[0].channelTitle} • {videos[0].duration}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.noContentContainer}>
              <Text style={styles.noContentText}>No sermons available</Text>
              <Text style={styles.noContentSubtext}>Check back later for new content</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/(tabs)/events')}>
              <Text style={styles.seeAllText}>See All</Text>
              <ArrowRight size={16} color="#c9a961" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Text style={styles.eventDay}>15</Text>
              <Text style={styles.eventMonth}>NOV</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Youth Night Worship</Text>
              <Text style={styles.eventTime}>Friday, 7:00 PM</Text>
            </View>
          </View>

          <View style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Text style={styles.eventDay}>22</Text>
              <Text style={styles.eventMonth}>NOV</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Community Outreach</Text>
              <Text style={styles.eventTime}>Saturday, 9:00 AM</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.verseLabel}>Verse of the Day</Text>
          <View style={styles.verseCard}>
            <Text style={styles.verseText}>
              "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."
            </Text>
            <Text style={styles.verseReference}>Jeremiah 29:11</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  heroSection: {
    height: 400,
    width: '100%',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  heroWelcome: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#c9a961',
    marginBottom: 8,
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 36,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 44,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#cccccc',
  },
  content: {
    padding: 20,
  },
  serviceCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceCardLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
  },
  serviceCardTime: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    color: '#c9a961',
  },
  liveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c9a961',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  liveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  serviceCardDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  eventCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#c9a961',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#cccccc',
    lineHeight: 18,
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  eventDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#c9a961',
  },
  eventTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999999',
  },
  eventLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999999',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#c9a961',
  },
  sermonCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  sermonImage: {
    width: '100%',
    height: 200,
  },
  sermonImageStyle: {
    resizeMode: 'cover',
  },
  sermonGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 16,
  },
  playIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(201, 169, 97, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sermonInfo: {
    padding: 16,
  },
  sermonCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#c9a961',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sermonTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 24,
  },
  sermonMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#666666',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  eventDate: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
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
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  eventTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  verseLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 16,
  },
  verseCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderLeftWidth: 4,
    borderLeftColor: '#c9a961',
  },
  verseText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  verseReference: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#c9a961',
  },
  loadingContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999999',
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#c9a961',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  noContentContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  noContentText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  noContentSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
