import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, ChevronRight, Clock, Mail, MapPin, Phone, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Event, eventService } from '../../services/eventService';

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const eventData = await eventService.getEventById(id);
        setEvent(eventData);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = () => {
    if (event?.registrationUrl) {
      // Open registration URL
      Alert.alert('Registration', 'Opening registration link...');
    } else {
      Alert.alert('Registration', 'Contact the church office for registration details.');
    }
  };

  const handleContact = (type: 'phone' | 'email') => {
    if (type === 'phone' && event?.contactPhone) {
      Alert.alert('Call', `Call ${event.contactPhone}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Calling...') }
      ]);
    } else if (type === 'email' && event?.contactEmail) {
      Alert.alert('Email', `Send email to ${event.contactEmail}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => console.log('Opening email...') }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c9a961" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Event not found'}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        
        {/* Event Image */}
        {event.imageUrl && (
          <ImageBackground
            source={{ uri: event.imageUrl }}
            style={styles.eventImage}
            imageStyle={styles.eventImageStyle}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.eventImageGradient}>
              <View style={styles.eventImageContent}>
                <Text style={styles.eventCategory}>{event.category}</Text>
                <Text style={styles.eventTitle}>{event.title}</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        )}

        {/* Event Info */}
        <View style={styles.eventInfo}>
          {/* Basic Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailItem}>
              <Calendar size={20} color="#c9a961" strokeWidth={2} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{event.date}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Clock size={20} color="#c9a961" strokeWidth={2} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{event.time}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <MapPin size={20} color="#c9a961" strokeWidth={2} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>
            </View>

            {event.maxAttendees && (
              <View style={styles.detailItem}>
                <Users size={20} color="#c9a961" strokeWidth={2} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Capacity</Text>
                  <Text style={styles.detailValue}>
                    {event.currentAttendees || 0} / {event.maxAttendees} attendees
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Contact Information */}
          {(event.contactPerson || event.contactPhone || event.contactEmail) && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              {event.contactPerson && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactLabel}>Contact Person</Text>
                  <Text style={styles.contactValue}>{event.contactPerson}</Text>
                </View>
              )}

              {event.contactPhone && (
                <TouchableOpacity 
                  style={styles.contactAction}
                  onPress={() => handleContact('phone')}>
                  <Phone size={20} color="#c9a961" strokeWidth={2} />
                  <Text style={styles.contactActionText}>{event.contactPhone}</Text>
                  <ChevronRight size={16} color="#666666" strokeWidth={2} />
                </TouchableOpacity>
              )}

              {event.contactEmail && (
                <TouchableOpacity 
                  style={styles.contactAction}
                  onPress={() => handleContact('email')}>
                  <Mail size={20} color="#c9a961" strokeWidth={2} />
                  <Text style={styles.contactActionText}>{event.contactEmail}</Text>
                  <ChevronRight size={16} color="#666666" strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {event.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Registration Button */}
          {event.registrationRequired && (
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={handleRegister}>
              <Text style={styles.registerButtonText}>
                {event.registrationUrl ? 'Register Online' : 'Contact to Register'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 28,
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  eventImage: {
    height: 250,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventImageStyle: {
    resizeMode: 'cover',
  },
  eventImageGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  eventImageContent: {
    alignItems: 'flex-start',
  },
  eventCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#c9a961',
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 24,
    color: '#ffffff',
    lineHeight: 30,
  },
  eventInfo: {
    paddingHorizontal: 20,
  },
  detailsSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#c9a961',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#cccccc',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  contactItem: {
    marginBottom: 12,
  },
  contactLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#c9a961',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  contactAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 8,
  },
  contactActionText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 12,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#c9a961',
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#c9a961',
  },
  registerButton: {
    backgroundColor: '#c9a961',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#c9a961',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#c9a961',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#000000',
  },
});
