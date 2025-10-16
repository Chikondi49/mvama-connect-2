import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Edit, Eye, MapPin, Plus, Search, Trash2, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SimpleImageUploader } from '../../components/SimpleImageUploader';
import { Event, eventService } from '../../services/eventService';

interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  recentEvents: Event[];
}

export default function EventManagement() {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    imageUrl: '',
    registrationRequired: false,
    registrationUrl: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    maxAttendees: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    tags: ''
  });

  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [viewEvent, setViewEvent] = useState<Event | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Test Firebase connection on component mount
    const testConnection = async () => {
      try {
        console.log('🔌 Testing Firebase connection on Events page load...');
        const isConnected = await eventService.testFirebaseConnection();
        if (!isConnected) {
          console.warn('⚠️ Firebase connection test failed on Events page');
          Alert.alert(
            'Connection Warning', 
            'Firebase connection test failed. Events may not save properly. Please check your internet connection.',
            [{ text: 'OK' }]
          );
        } else {
          console.log('✅ Firebase connection test passed on Events page');
        }
      } catch (error) {
        console.error('❌ Error testing Firebase connection:', error);
      }
    };
    
    testConnection();
    loadEventData();
  }, []);

  useEffect(() => {
    if (stats?.recentEvents) {
      const filtered = stats.recentEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchQuery, stats?.recentEvents]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      
      // Test Firebase connection first
      console.log('🧪 Testing Firebase connection before loading events...');
      const connectionTest = await eventService.testFirebaseConnection();
      console.log('🔗 Firebase connection test result:', connectionTest);
      
      const events = await eventService.getAllEvents();
      console.log('📅 Loaded events:', events.length);
      
      const upcoming = events.filter(event => 
        new Date(event.date) >= new Date()
      );

      setStats({
        totalEvents: events.length,
        upcomingEvents: upcoming.length,
        recentEvents: events
      });

      setFilteredEvents(events);
    } catch (error: any) {
      console.error('❌ Error loading event data:', error);
      Alert.alert('Error', `Failed to load event data: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: '',
      imageUrl: '',
      registrationRequired: false,
      registrationUrl: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      maxAttendees: '',
      status: 'upcoming',
      tags: ''
    });
    setShowAddModal(true);
  };

  const handleCreateEvent = async () => {
    try {
      console.log('🔄 Starting event creation process...');
      console.log('📝 Form data:', formData);
      
      setIsCreating(true);
      
      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim() || !formData.date.trim() || !formData.time.trim() || !formData.location.trim()) {
        console.log('❌ Validation failed: Missing required fields');
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      console.log('✅ Validation passed, testing Firebase connection...');
      
      // Test Firebase connection first
      const connectionTest = await eventService.testFirebaseConnection();
      if (!connectionTest) {
        throw new Error('Firebase connection failed. Please check your internet connection and try again.');
      }
      
      console.log('✅ Firebase connection test passed, preparing event data...');
      
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date.trim(),
        time: formData.time.trim(),
        location: formData.location.trim(),
        category: formData.category.trim() || 'General',
        imageUrl: formData.imageUrl.trim() || undefined,
        registrationRequired: formData.registrationRequired,
        registrationUrl: formData.registrationUrl.trim() || undefined,
        contactPerson: formData.contactPerson.trim() || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        contactEmail: formData.contactEmail.trim() || undefined,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        status: formData.status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        currentAttendees: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Clean up undefined values to avoid Firestore issues
      const cleanedEventData = Object.fromEntries(
        Object.entries(eventData).filter(([_, value]) => value !== undefined && value !== '')
      );
      
      console.log('📝 Cleaned event data:', cleanedEventData);
      console.log('🔄 Calling eventService.createEvent...');

      const eventId = await eventService.createEvent(cleanedEventData);
      console.log('✅ Event created with ID:', eventId);
      
      Alert.alert('Success', 'Event created successfully!');
      setShowAddModal(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: '',
        imageUrl: '',
        registrationRequired: false,
        registrationUrl: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        maxAttendees: '',
        status: 'upcoming',
        tags: ''
      });
      
      // Reload data
      await loadEventData();
    } catch (error: any) {
      console.error('❌ Error creating event:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });
      Alert.alert('Error', `Failed to create event: ${error?.message || 'Unknown error'}`);
    } finally {
      console.log('🔄 Creation process completed, setting isCreating to false');
      setIsCreating(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      imageUrl: event.imageUrl || '',
      registrationRequired: event.registrationRequired,
      registrationUrl: event.registrationUrl || '',
      contactPerson: event.contactPerson || '',
      contactPhone: event.contactPhone || '',
      contactEmail: event.contactEmail || '',
      maxAttendees: event.maxAttendees?.toString() || '',
      status: event.status,
      tags: event.tags?.join(', ') || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateEvent = async () => {
    try {
      console.log('🔄 Starting event update process...');
      console.log('📋 Edit event:', editEvent);
      console.log('📝 Form data:', formData);
      
      setIsUpdating(true);
      
      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim() || !formData.date.trim() || !formData.time.trim() || !formData.location.trim()) {
        console.log('❌ Validation failed: Missing required fields');
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      console.log('✅ Validation passed, preparing update data...');

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date.trim(),
        time: formData.time.trim(),
        location: formData.location.trim(),
        category: formData.category.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        registrationRequired: formData.registrationRequired,
        registrationUrl: formData.registrationUrl.trim() || undefined,
        contactPerson: formData.contactPerson.trim() || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        contactEmail: formData.contactEmail.trim() || undefined,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        status: formData.status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: new Date().toISOString()
      };

      // Clean up undefined values to avoid Firestore issues
      const cleanedUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== '')
      );

      console.log('📝 Cleaned update data:', cleanedUpdateData);
      console.log('📝 Event ID:', editEvent!.id);
      console.log('🔄 Calling eventService.updateEvent...');

      await eventService.updateEvent(editEvent!.id, cleanedUpdateData);
      
      console.log('✅ Event update successful!');
      Alert.alert('Success', 'Event updated successfully!');
      setShowEditModal(false);
      loadEventData();
    } catch (error) {
      console.error('❌ Error updating event:', error);
      console.error('❌ Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      Alert.alert('Error', `Failed to update event: ${(error as any)?.message || 'Unknown error'}`);
    } finally {
      console.log('🔄 Update process completed, setting isUpdating to false');
      setIsUpdating(false);
    }
  };

  const handleViewEvent = (event: Event) => {
    setViewEvent(event);
    setShowViewModal(true);
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    console.log('🗑️ Delete event button clicked!');
    console.log('📋 Delete event details:', { eventId, eventTitle });
    
    console.log('⚠️ Showing delete confirmation dialog...');
    
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => console.log('❌ Delete cancelled by user') },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('✅ Delete confirmed by user, proceeding with deletion...');
            try {
              setDeleteStatus('Deleting event from Firestore...');
              console.log(`🔄 Starting deletion of event with ID: ${eventId}`);
              
              console.log('📅 Calling eventService.deleteEvent...');
              await eventService.deleteEvent(eventId);
              console.log('✅ Event deletion completed');
              setDeleteStatus('Event deleted successfully!');
              
              console.log('🔄 Reloading event data...');
              await loadEventData();
              console.log('✅ Event data reloaded');
              
              Alert.alert('Success', 'Event deleted successfully!');
              setTimeout(() => setDeleteStatus(''), 3000);
            } catch (error) {
              console.error('❌ Delete event operation failed:', error);
              console.error('❌ Error details:', {
                message: (error as any)?.message,
                code: (error as any)?.code,
                stack: (error as any)?.stack
              });
              setDeleteStatus(`Error: ${(error as any)?.message || 'Failed to delete'}`);
              Alert.alert('Error', `Failed to delete event: ${(error as any)?.message || 'Unknown error'}`);
              setTimeout(() => setDeleteStatus(''), 5000);
            }
          },
        },
      ]
    );
  };

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (event.status === 'cancelled') return 'cancelled';
    if (event.status === 'completed') return 'completed';
    if (eventDate < now) return 'past';
    if (eventDate.toDateString() === now.toDateString()) return 'today';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#4CAF50';
      case 'today': return '#FF9800';
      case 'past': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      case 'completed': return '#2196F3';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a961" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Event Management</Text>
          <Text style={styles.headerSubtitle}>Manage church events and activities</Text>
          
          {deleteStatus ? (
            <Text style={styles.deleteStatus}>{deleteStatus}</Text>
          ) : null}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.modernStatCard}>
            <LinearGradient colors={['#c9a961', '#b8941f']} style={styles.modernStatGradient}>
              <Calendar size={28} color="#ffffff" />
            </LinearGradient>
            <View style={styles.modernStatContent}>
              <Text style={styles.modernStatNumber}>{stats?.totalEvents || 0}</Text>
              <Text style={styles.modernStatLabel}>Total Events</Text>
              <Text style={styles.modernStatSubtext}>All events</Text>
            </View>
          </View>

          <View style={styles.modernStatCard}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.modernStatGradient}>
              <Users size={28} color="#ffffff" />
            </LinearGradient>
            <View style={styles.modernStatContent}>
              <Text style={styles.modernStatNumber}>{stats?.upcomingEvents || 0}</Text>
              <Text style={styles.modernStatLabel}>Upcoming</Text>
              <Text style={styles.modernStatSubtext}>Future events</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={styles.modernSearchContainer}>
          <Search size={22} color="#c9a961" style={styles.modernSearchIcon} />
          <TextInput
            style={styles.modernSearchInput}
            placeholder="Search events and activities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
          />
        </View>

        {/* Events List */}
        <View style={styles.eventsList}>
          {filteredEvents.map((event) => {
            const eventStatus = getEventStatus(event);
            return (
              <View key={event.id} style={styles.modernEventCard}>
                <LinearGradient
                  colors={['#1a1a1a', '#2a2a2a']}
                  style={styles.eventCardGradient}
                >
                  <View style={styles.modernEventHeader}>
                    <View style={styles.eventImageContainer}>
                      {event.imageUrl ? (
                        <Image source={{ uri: event.imageUrl }} style={styles.modernEventImage} />
                      ) : (
                        <View style={styles.eventPlaceholderImage}>
                          <Calendar size={32} color="#c9a961" />
                        </View>
                      )}
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(eventStatus) }]}>
                        <Text style={styles.statusText}>{eventStatus.toUpperCase()}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.modernEventInfo}>
                      <Text style={styles.modernEventTitle} numberOfLines={2}>
                        {event.title}
                      </Text>
                      <View style={styles.eventMetaContainer}>
                        <View style={styles.metaItem}>
                          <Calendar size={16} color="#c9a961" />
                          <Text style={styles.modernMetaText}>
                            {formatDate(event.date)} at {event.time}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <MapPin size={16} color="#c9a961" />
                          <Text style={styles.modernMetaText}>{event.location}</Text>
                        </View>
                        <View style={styles.categoryChip}>
                          <Text style={styles.categoryText}>{event.category}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.modernEventActions}>
                    <TouchableOpacity
                      style={[styles.modernActionButton, styles.viewAction]}
                      onPress={() => handleViewEvent(event)}
                    >
                      <Eye size={18} color="#4CAF50" />
                      <Text style={[styles.modernActionText, styles.viewActionText]}>View</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modernActionButton, styles.editAction]}
                      onPress={() => handleEditEvent(event)}
                    >
                      <Edit size={18} color="#c9a961" />
                      <Text style={[styles.modernActionText, styles.editActionText]}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modernActionButton, styles.deleteAction]}
                      onPress={() => handleDeleteEvent(event.id, event.title)}
                    >
                      <Trash2 size={18} color="#ff6b6b" />
                      <Text style={[styles.modernActionText, styles.deleteActionText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
        <LinearGradient colors={['#c9a961', '#b8941f']} style={styles.addButtonGradient}>
          <Plus size={24} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Event</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              placeholder="Enter event title"
            />

            <Text style={styles.fieldLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              placeholder="Enter event description"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.fieldLabel}>Date *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.date}
              onChangeText={(text) => setFormData({...formData, date: text})}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.fieldLabel}>Time *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.time}
              onChangeText={(text) => setFormData({...formData, time: text})}
              placeholder="HH:MM AM/PM"
            />

            <Text style={styles.fieldLabel}>Location *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.location}
              onChangeText={(text) => setFormData({...formData, location: text})}
              placeholder="Enter event location"
            />

            <Text style={styles.fieldLabel}>Category</Text>
            <TextInput
              style={styles.textInput}
              value={formData.category}
              onChangeText={(text) => setFormData({...formData, category: text})}
              placeholder="Enter event category"
            />

            <SimpleImageUploader
              currentImageUrl={formData.imageUrl}
              onImageSelected={(imageUrl) => setFormData({...formData, imageUrl: imageUrl})}
              placeholder="Upload event image or enter image URL"
            />
            
            {/* Fallback URL input */}
            <Text style={styles.fieldLabel}>Or enter image URL manually:</Text>
            <TextInput
              style={styles.textInput}
              value={formData.imageUrl}
              onChangeText={(text) => setFormData({...formData, imageUrl: text})}
              placeholder="Enter image URL manually"
              placeholderTextColor="#666666"
            />

            <View style={styles.switchContainer}>
              <Text style={styles.fieldLabel}>Registration Required</Text>
              <Switch
                value={formData.registrationRequired}
                onValueChange={(value) => setFormData({...formData, registrationRequired: value})}
                trackColor={{ false: '#767577', true: '#c9a961' }}
                thumbColor={formData.registrationRequired ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            {formData.registrationRequired && (
              <>
                <Text style={styles.fieldLabel}>Registration URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.registrationUrl}
                  onChangeText={(text) => setFormData({...formData, registrationUrl: text})}
                  placeholder="Enter registration URL"
                />
              </>
            )}

            <Text style={styles.fieldLabel}>Contact Person</Text>
            <TextInput
              style={styles.textInput}
              value={formData.contactPerson}
              onChangeText={(text) => setFormData({...formData, contactPerson: text})}
              placeholder="Enter contact person"
            />

            <Text style={styles.fieldLabel}>Contact Phone</Text>
            <TextInput
              style={styles.textInput}
              value={formData.contactPhone}
              onChangeText={(text) => setFormData({...formData, contactPhone: text})}
              placeholder="Enter contact phone"
            />

            <Text style={styles.fieldLabel}>Contact Email</Text>
            <TextInput
              style={styles.textInput}
              value={formData.contactEmail}
              onChangeText={(text) => setFormData({...formData, contactEmail: text})}
              placeholder="Enter contact email"
            />

            <Text style={styles.fieldLabel}>Max Attendees</Text>
            <TextInput
              style={styles.textInput}
              value={formData.maxAttendees}
              onChangeText={(text) => setFormData({...formData, maxAttendees: text})}
              placeholder="Enter max attendees"
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.statusContainer}>
              {['upcoming', 'ongoing', 'completed', 'cancelled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    formData.status === status && styles.activeStatusOption
                  ]}
                  onPress={() => setFormData({...formData, status: status as any})}
                >
                  <Text style={[
                    styles.statusOptionText,
                    formData.status === status && styles.activeStatusOptionText
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Tags</Text>
            <TextInput
              style={styles.textInput}
              value={formData.tags}
              onChangeText={(text) => setFormData({...formData, tags: text})}
              placeholder="Enter tags separated by commas"
            />

            <TouchableOpacity 
              style={[styles.createButton, isCreating && styles.disabledButton]} 
              onPress={handleCreateEvent}
              disabled={isCreating}
            >
              {isCreating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.createButtonText}>Creating...</Text>
                </View>
              ) : (
                <Text style={styles.createButtonText}>Create Event</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Event</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              placeholder="Enter event title"
              placeholderTextColor="#666666"
            />

            <Text style={styles.fieldLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              placeholder="Enter event description"
              placeholderTextColor="#666666"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.fieldLabel}>Date *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.date}
              onChangeText={(text) => setFormData({...formData, date: text})}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#666666"
            />

            <Text style={styles.fieldLabel}>Time *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.time}
              onChangeText={(text) => setFormData({...formData, time: text})}
              placeholder="HH:MM AM/PM"
              placeholderTextColor="#666666"
            />

            <Text style={styles.fieldLabel}>Location *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.location}
              onChangeText={(text) => setFormData({...formData, location: text})}
              placeholder="Enter event location"
              placeholderTextColor="#666666"
            />

            <Text style={styles.fieldLabel}>Category</Text>
            <TextInput
              style={styles.textInput}
              value={formData.category}
              onChangeText={(text) => setFormData({...formData, category: text})}
              placeholder="Enter event category"
              placeholderTextColor="#666666"
            />

            <SimpleImageUploader
              currentImageUrl={formData.imageUrl}
              onImageSelected={(imageUrl) => setFormData({...formData, imageUrl: imageUrl})}
              placeholder="Upload event image or enter image URL"
            />
            
            {/* Fallback URL input */}
            <Text style={styles.fieldLabel}>Or enter image URL manually:</Text>
            <TextInput
              style={styles.textInput}
              value={formData.imageUrl}
              onChangeText={(text) => setFormData({...formData, imageUrl: text})}
              placeholder="Enter image URL manually"
              placeholderTextColor="#666666"
            />

            <View style={styles.switchContainer}>
              <Text style={styles.fieldLabel}>Registration Required</Text>
              <Switch
                value={formData.registrationRequired}
                onValueChange={(value) => setFormData({...formData, registrationRequired: value})}
                trackColor={{ false: '#767577', true: '#c9a961' }}
                thumbColor={formData.registrationRequired ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            {formData.registrationRequired && (
              <>
                <Text style={styles.fieldLabel}>Registration URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.registrationUrl}
                  onChangeText={(text) => setFormData({...formData, registrationUrl: text})}
                  placeholder="Enter registration URL"
                  placeholderTextColor="#666666"
                />
              </>
            )}

            <Text style={styles.fieldLabel}>Contact Person</Text>
            <TextInput
              style={styles.textInput}
              value={formData.contactPerson}
              onChangeText={(text) => setFormData({...formData, contactPerson: text})}
              placeholder="Enter contact person"
              placeholderTextColor="#666666"
            />

            <Text style={styles.fieldLabel}>Contact Phone</Text>
            <TextInput
              style={styles.textInput}
              value={formData.contactPhone}
              onChangeText={(text) => setFormData({...formData, contactPhone: text})}
              placeholder="Enter contact phone"
              placeholderTextColor="#666666"
            />

            <Text style={styles.fieldLabel}>Contact Email</Text>
            <TextInput
              style={styles.textInput}
              value={formData.contactEmail}
              onChangeText={(text) => setFormData({...formData, contactEmail: text})}
              placeholder="Enter contact email"
              placeholderTextColor="#666666"
            />

            <Text style={styles.fieldLabel}>Max Attendees</Text>
            <TextInput
              style={styles.textInput}
              value={formData.maxAttendees}
              onChangeText={(text) => setFormData({...formData, maxAttendees: text})}
              placeholder="Enter max attendees"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.statusContainer}>
              {['upcoming', 'ongoing', 'completed', 'cancelled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    formData.status === status && styles.activeStatusOption
                  ]}
                  onPress={() => setFormData({...formData, status: status as any})}
                >
                  <Text style={[
                    styles.statusOptionText,
                    formData.status === status && styles.activeStatusOptionText
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Tags</Text>
            <TextInput
              style={styles.textInput}
              value={formData.tags}
              onChangeText={(text) => setFormData({...formData, tags: text})}
              placeholder="Enter tags separated by commas"
              placeholderTextColor="#666666"
            />

            <TouchableOpacity 
              style={[styles.createButton, isUpdating && styles.disabledButton]} 
              onPress={handleUpdateEvent}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.createButtonText}>Updating...</Text>
                </View>
              ) : (
                <Text style={styles.createButtonText}>Update Event</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* View Modal */}
      <Modal visible={showViewModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Event Details</Text>
            <TouchableOpacity onPress={() => setShowViewModal(false)}>
              <Text style={styles.modalCloseButton}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {viewEvent && (
              <>
                <Text style={styles.detailTitle}>{viewEvent.title}</Text>
                <Text style={styles.detailDescription}>{viewEvent.description}</Text>
                <Text style={styles.detailMeta}>Date: {formatDate(viewEvent.date)} at {viewEvent.time}</Text>
                <Text style={styles.detailMeta}>Location: {viewEvent.location}</Text>
                <Text style={styles.detailMeta}>Category: {viewEvent.category}</Text>
                {viewEvent.imageUrl && (
                  <Image source={{ uri: viewEvent.imageUrl }} style={styles.detailImage} />
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
  },
  deleteStatus: {
    color: '#4CAF50',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  statGradient: {
    width: 48,
    height: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
    marginTop: 2,
  },
  modernStatCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modernStatGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modernStatContent: {
    flex: 1,
  },
  modernStatNumber: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  modernStatLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
    marginBottom: 2,
  },
  modernStatSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
  },
  modernSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#333333',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modernSearchIcon: {
    marginRight: 16,
  },
  modernSearchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  eventHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  eventMeta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
  },
  eventCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
    marginTop: 4,
  },
  eventActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderColor: 'rgba(201, 169, 97, 0.2)',
  },
  viewButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  editButton: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderColor: 'rgba(201, 169, 97, 0.2)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  viewText: {
    color: '#4CAF50',
  },
  deleteText: {
    color: '#ff6b6b',
  },
  // Modern Event Card Styles
  modernEventCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  eventCardGradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modernEventHeader: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 16,
  },
  eventImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  modernEventImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
  },
  eventPlaceholderImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#c9a961',
    borderStyle: 'dashed',
  },
  modernEventInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  modernEventTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 24,
  },
  eventMetaContainer: {
    gap: 8,
  },
  modernMetaText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  categoryChip: {
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.3)',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  modernEventActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  modernActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
  },
  viewAction: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  editAction: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderColor: 'rgba(201, 169, 97, 0.3)',
  },
  deleteAction: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  modernActionText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  viewActionText: {
    color: '#4CAF50',
  },
  editActionText: {
    color: '#c9a961',
  },
  deleteActionText: {
    color: '#ff6b6b',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#c9a961',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  modalCloseButton: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1a1a1a',
  },
  activeStatusOption: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
  },
  statusOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#cccccc',
  },
  activeStatusOptionText: {
    color: '#ffffff',
  },
  createButton: {
    backgroundColor: '#c9a961',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  disabledButton: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  detailTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
    marginBottom: 8,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 16,
  },
});