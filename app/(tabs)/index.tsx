import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight, BookOpen, Calendar, Heart, Play, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { AudioSermon, audioSermonService } from '../../services/audioSermonService';
import { BibleSearchResult, bibleService } from '../../services/bibleService';
import { Event, eventService } from '../../services/eventService';
import { liveService, LiveVideo } from '../../services/liveService';
import { youtubeService, YouTubeVideo } from '../../services/youtubeService';

export default function HomeScreen() {
  const { user, userProfile } = useAuth();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [audioSermons, setAudioSermons] = useState<AudioSermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveVideo, setLiveVideo] = useState<LiveVideo | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [dailyVerse, setDailyVerse] = useState<BibleSearchResult | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

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
        
        // Fetch videos, events, live status, daily verse, and audio sermons in parallel
        const [videosData, eventsData, liveVideoData, dailyVerseData, audioSermonsData] = await Promise.all([
          youtubeService.getChannelVideos(),
          eventService.getAllEvents(),
          liveService.getCurrentLiveVideo(),
          bibleService.getVerseOfTheDay(),
          audioSermonService.getAllAudioSermons()
        ]);
        
        setVideos(videosData);
        setEvents(eventsData);
        setLiveVideo(liveVideoData);
        setDailyVerse(dailyVerseData);
        setAudioSermons(audioSermonsData);
        
        // Debug logging
        console.log('📊 Home data loaded:');
        console.log('📹 Videos:', videosData.length, videosData);
        console.log('📅 Events:', eventsData.length, eventsData);
        console.log('🔴 Live Video:', liveVideoData);
        console.log('📖 Daily Verse:', dailyVerseData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
        setEventsLoading(false);
        setLiveLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-rotate events every 60 seconds
  useEffect(() => {
    console.log('🔄 Events rotation effect - events.length:', events.length);
    if (events.length > 1) {
      const interval = setInterval(() => {
        setCurrentEventIndex((prevIndex) => (prevIndex + 1) % events.length);
        console.log('🔄 Rotating to event index:', (currentEventIndex + 1) % events.length);
      }, 60000); // 60 seconds

      return () => clearInterval(interval);
    }
  }, [events, currentEventIndex]);


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

  const handleWatchLive = () => {
    if (liveVideo) {
      // Navigate to video sermons with live video
      router.push('/(tabs)/sermons');
    } else {
      // Show alert that there's no live video
      Alert.alert(
        'No Live Video',
        'There is no live video at the moment. Please check back during service times.',
        [{ text: 'OK' }]
      );
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
            <TouchableOpacity 
              style={[
                styles.liveButton,
                liveVideo ? styles.liveButtonActive : styles.liveButtonInactive
              ]}
              onPress={handleWatchLive}
              disabled={liveLoading}>
              {liveLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Play size={16} color="#ffffff" fill="#ffffff" />
                  <Text style={styles.liveButtonText}>
                    {liveVideo ? 'Watch Live' : 'No Live Video'}
                  </Text>
                </>
              )}
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
              {events.length > 0 && (
                <TouchableOpacity
                  key={events[currentEventIndex]?.id}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(events[currentEventIndex].id)}>
                  
                  {/* Event Image */}
                  <ImageBackground
                    source={{ uri: events[currentEventIndex].imageUrl || 'https://images.pexels.com/photos/8468012/pexels-photo-8468012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750' }}
                    style={styles.eventImage}
                    imageStyle={styles.eventImageStyle}>
                    <LinearGradient
                      colors={['rgba(15,15,15,0.3)', 'rgba(15,15,15,0.8)']}
                      style={styles.eventImageGradient}>
                      
                      {/* Event Category Badge */}
                      <View style={styles.eventCategoryBadge}>
                        <Text style={styles.eventCategoryText}>{events[currentEventIndex].category}</Text>
                      </View>
                      
                      {/* Event Date Overlay */}
                      <View style={styles.eventDateOverlay}>
                        <Text style={styles.eventDateDay}>
                          {new Date(events[currentEventIndex].date).getDate()}
                        </Text>
                        <Text style={styles.eventDateMonth}>
                          {new Date(events[currentEventIndex].date).toLocaleDateString('en-US', { month: 'short' })}
                        </Text>
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                  
                  {/* Event Content */}
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle} numberOfLines={2}>{events[currentEventIndex].title}</Text>
                      <View style={styles.eventMetaRow}>
                        <Text style={styles.eventTime}>{events[currentEventIndex].time}</Text>
                        <Text style={styles.eventLocation} numberOfLines={1}>{events[currentEventIndex].location}</Text>
                      </View>
                    </View>
                    
                    {/* Event Details */}
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetailItem}>
                        <Calendar size={14} color="#c9a961" strokeWidth={2} />
                        <Text style={styles.eventDetailText}>
                          {new Date(events[currentEventIndex].date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </View>
                      
                      {events[currentEventIndex].registrationRequired && (
                        <View style={styles.registrationBadge}>
                          <Text style={styles.registrationText}>Registration Required</Text>
                        </View>
                      )}
                    </View>
                    
                    {events.length > 1 && (
                      <View style={styles.rotationIndicator}>
                        <Text style={styles.rotationText}>
                          {currentEventIndex + 1} of {events.length} events
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              {events.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No events available</Text>
                  <Text style={styles.emptySubtext}>Check back later for new events</Text>
                </View>
              )}
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
          ) : audioSermons.length > 0 ? (
            <TouchableOpacity 
              style={styles.audioSermonCard}
              onPress={() => router.push('/sermons')}>
              {/* Audio Sermon Image */}
              <ImageBackground
                source={{ 
                  uri: audioSermons[0].thumbnailUrl || 'https://images.pexels.com/photos/8468012/pexels-photo-8468012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750' 
                }}
                style={styles.audioSermonImage}
                imageStyle={styles.audioSermonImageStyle}>
                <LinearGradient
                  colors={['rgba(15,15,15,0.3)', 'rgba(15,15,15,0.8)']}
                  style={styles.audioSermonGradient}>
                  
                  {/* Audio Badge */}
                  <View style={styles.audioBadge}>
                    <Text style={styles.audioBadgeText}>AUDIO</Text>
                  </View>
                  
                  {/* Play Button Overlay */}
                  <View style={styles.audioPlayOverlay}>
                    <TouchableOpacity style={styles.audioPlayButton}>
                      <Play size={24} color="#ffffff" fill="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </ImageBackground>
              
              {/* Audio Sermon Content */}
              <View style={styles.audioSermonContent}>
                <View style={styles.audioSermonHeader}>
                  <Text style={styles.audioSermonTitle}>{audioSermons[0].title}</Text>
                  <View style={styles.audioSermonMeta}>
                    <Text style={styles.audioSermonSpeaker}>{audioSermons[0].speaker}</Text>
                    <Text style={styles.audioSermonDuration}>{audioSermons[0].duration}</Text>
                  </View>
                </View>
                
                <Text style={styles.audioSermonDescription} numberOfLines={2}>
                  {audioSermons[0].description}
                </Text>
                
                <View style={styles.audioSermonFooter}>
                  <View style={styles.audioSermonStats}>
                    <Text style={styles.audioSermonStatText}>{audioSermons.length} Episodes</Text>
                    <Text style={styles.audioSermonStatText}>•</Text>
                    <Text style={styles.audioSermonStatText}>
                      {new Date(audioSermons[0].publishedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.audioListenButton}>
                    <Text style={styles.audioListenButtonText}>Listen Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No audio sermons available</Text>
              <Text style={styles.emptySubtext}>Check back later for new content</Text>
            </View>
          )}
        </View>


        <View style={styles.section}>
          <Text style={styles.verseLabel}>Verse of the Day</Text>
          <View style={styles.verseCard}>
            <Text style={styles.verseText}>
              "{dailyVerse?.text || 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.'}"
            </Text>
            <Text style={styles.verseReference}>
              {dailyVerse ? `${dailyVerse.bookName} ${dailyVerse.chapterNumber}:${dailyVerse.verseNumber}` : 'Jeremiah 29:11'}
            </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  liveButtonActive: {
    backgroundColor: '#c9a961',
  },
  liveButtonInactive: {
    backgroundColor: '#666666',
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
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 16,
  },
  eventImage: {
    height: 200,
    width: '100%',
  },
  eventImageStyle: {
    resizeMode: 'cover',
  },
  eventImageGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  eventCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201, 169, 97, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eventCategoryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#000000',
  },
  eventDateOverlay: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  eventDateDay: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    lineHeight: 22,
  },
  eventDateMonth: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#c9a961',
    textTransform: 'uppercase',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    marginBottom: 16,
  },
  eventTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 24,
  },
  eventMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTime: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#c9a961',
  },
  eventLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#999999',
    flex: 1,
    textAlign: 'right',
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#c9a961',
  },
  registrationBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  registrationText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#ffc107',
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
  rotationIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  rotationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#c9a961',
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999999',
  },
  audioSermonCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  audioSermonImage: {
    height: 200,
    width: '100%',
  },
  audioSermonImageStyle: {
    resizeMode: 'cover',
  },
  audioSermonGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  audioBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201, 169, 97, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  audioBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#000000',
    letterSpacing: 1,
  },
  audioPlayOverlay: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPlayButton: {
    backgroundColor: 'rgba(201, 169, 97, 0.9)',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  audioSermonContent: {
    padding: 16,
  },
  audioSermonHeader: {
    marginBottom: 12,
  },
  audioSermonTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 24,
  },
  audioSermonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioSermonSpeaker: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#c9a961',
  },
  audioSermonDuration: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#999999',
  },
  audioSermonDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  audioSermonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioSermonStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioSermonStatText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999999',
  },
  audioListenButton: {
    backgroundColor: '#c9a961',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  audioListenButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#000000',
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
