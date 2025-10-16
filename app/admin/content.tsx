import { LinearGradient } from 'expo-linear-gradient';
import { Edit, Eye, Headphones, Plus, Search, Trash2, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SimpleImageUploader } from '../../components/SimpleImageUploader';
import { AudioSeries, AudioSermon, audioSermonService } from '../../services/audioSermonService';

interface ContentStats {
  totalSermons: number;
  totalSeries: number;
  recentSermons: AudioSermon[];
  allSeries: AudioSeries[];
}

export default function ContentManagement() {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'sermons' | 'series'>('sermons');
  const [filteredSermons, setFilteredSermons] = useState<AudioSermon[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<AudioSeries[]>([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [addType, setAddType] = useState<'sermon' | 'series'>('sermon');

  // Form data states
  const [sermonFormData, setSermonFormData] = useState({
    title: '',
    speaker: '',
    description: '',
    audioUrl: '',
    duration: '',
    category: '',
    seriesId: '',
    episodeNumber: '',
    tags: '',
    thumbnailUrl: ''
  });

  const [seriesFormData, setSeriesFormData] = useState({
    title: '',
    speaker: '',
    description: '',
    category: '',
    coverImage: '',
    totalEpisodes: ''
  });

  const [editContent, setEditContent] = useState<AudioSermon | AudioSeries | null>(null);
  const [viewContent, setViewContent] = useState<AudioSermon | AudioSeries | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Test Firebase connection first
    const testConnection = async () => {
      try {
        console.log('🧪 Testing Firebase connection...');
        const { testFirebaseConnection } = await import('../../config/firebase');
        const isConnected = await testFirebaseConnection();
        console.log('🔗 Firebase connection test result:', isConnected);
      } catch (error) {
        console.error('❌ Firebase connection test failed:', error);
      }
    };
    
    testConnection();
    loadContentData();
  }, []);

  useEffect(() => {
    if (stats?.recentSermons) {
      const filtered = stats.recentSermons.filter(sermon =>
        sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sermon.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sermon.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSermons(filtered);
    }
  }, [searchQuery, stats?.recentSermons]);

  useEffect(() => {
    if (stats?.allSeries) {
      const filtered = stats.allSeries.filter(series =>
        series.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        series.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        series.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSeries(filtered);
    }
  }, [searchQuery, stats?.allSeries]);

  const loadContentData = async () => {
    try {
      console.log('🔄 Loading content data...');
      setLoading(true);
      
      console.log('🔄 Fetching sermons...');
      const sermons = await audioSermonService.getAllAudioSermons();
      console.log('📊 Sermons loaded:', sermons.length);
      
      console.log('🔄 Fetching series...');
      const series = await audioSermonService.getAllAudioSeries();
      console.log('📊 Series loaded:', series.length);

      setStats({
        totalSermons: sermons.length,
        totalSeries: series.length,
        recentSermons: sermons,
        allSeries: series
      });

      setFilteredSermons(sermons);
      setFilteredSeries(series);
      console.log('✅ Content data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading content data:', error);
      Alert.alert('Error', 'Failed to load content data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = () => {
    setAddType('sermon');
    setSermonFormData({
      title: '',
      speaker: '',
      description: '',
      audioUrl: '',
      duration: '',
      category: '',
      seriesId: '',
      episodeNumber: '',
      tags: '',
      thumbnailUrl: ''
    });
    setShowAddModal(true);
  };

  const handleCreateContent = async () => {
    try {
      if (addType === 'sermon') {
        if (!sermonFormData.title.trim() || !sermonFormData.speaker.trim()) {
          Alert.alert('Error', 'Please fill in required fields (title and speaker)');
          return;
        }

        const sermonData = {
          title: sermonFormData.title.trim(),
          speaker: sermonFormData.speaker.trim(),
          description: sermonFormData.description.trim(),
          audioUrl: sermonFormData.audioUrl.trim(),
          duration: sermonFormData.duration.trim(),
          category: sermonFormData.category.trim(),
          seriesId: sermonFormData.seriesId.trim() || undefined,
          episodeNumber: sermonFormData.episodeNumber ? parseInt(sermonFormData.episodeNumber) : undefined,
          tags: sermonFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          thumbnailUrl: sermonFormData.thumbnailUrl.trim(),
          viewCount: 0,
          downloadCount: 0,
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await audioSermonService.createAudioSermon(sermonData);
        Alert.alert('Success', 'Sermon created successfully!');
      } else {
        if (!seriesFormData.title.trim() || !seriesFormData.speaker.trim()) {
          Alert.alert('Error', 'Please fill in required fields (title and speaker)');
          return;
        }

        const seriesData = {
          title: seriesFormData.title.trim(),
          speaker: seriesFormData.speaker.trim(),
          description: seriesFormData.description.trim(),
          category: seriesFormData.category.trim(),
          coverImage: seriesFormData.coverImage.trim(),
          totalEpisodes: seriesFormData.totalEpisodes ? parseInt(seriesFormData.totalEpisodes) : 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await audioSermonService.createAudioSeries(seriesData);
        Alert.alert('Success', 'Series created successfully!');
      }

      setShowAddModal(false);
      loadContentData();
    } catch (error) {
      Alert.alert('Error', `Failed to create ${addType}: ${(error as any)?.message || 'Unknown error'}`);
    }
  };

  const handleEditContent = (content: AudioSermon | AudioSeries, type: 'sermon' | 'series') => {
    setEditContent(content);
    setAddType(type); // Set the type so the modal knows what we're editing
    if (type === 'sermon') {
      const sermon = content as AudioSermon;
      setSermonFormData({
        title: sermon.title,
        speaker: sermon.speaker,
        description: sermon.description,
        audioUrl: sermon.audioUrl,
        duration: sermon.duration || '',
        category: sermon.category,
        seriesId: sermon.seriesId || '',
        episodeNumber: sermon.episodeNumber?.toString() || '',
        tags: sermon.tags?.join(', ') || '',
        thumbnailUrl: sermon.thumbnailUrl || ''
      });
    } else {
      const series = content as AudioSeries;
      setSeriesFormData({
        title: series.title,
        speaker: series.speaker,
        description: series.description,
        category: series.category,
        coverImage: series.coverImage || '',
        totalEpisodes: series.totalEpisodes?.toString() || ''
      });
    }
    setShowEditModal(true);
  };

  const handleUpdateContent = async () => {
    try {
      console.log('🔄 Starting content update process...');
      console.log('📋 Update type:', addType);
      console.log('📋 Edit content:', editContent);
      
      setIsUpdating(true);
      
      if (addType === 'sermon' && editContent) {
        console.log('📝 Updating sermon...');
        console.log('📝 Form data:', sermonFormData);
        
        // Validate required fields for sermon
        if (!sermonFormData.title.trim() || !sermonFormData.speaker.trim()) {
          console.log('❌ Validation failed: Missing required fields');
          Alert.alert('Error', 'Please fill in required fields (title and speaker)');
          return;
        }

        const sermon = editContent as AudioSermon;
        console.log('📝 Sermon ID:', sermon.id);
        
        const updateData = {
          title: sermonFormData.title.trim(),
          speaker: sermonFormData.speaker.trim(),
          description: sermonFormData.description.trim(),
          audioUrl: sermonFormData.audioUrl.trim(),
          duration: sermonFormData.duration.trim(),
          category: sermonFormData.category.trim(),
          seriesId: sermonFormData.seriesId.trim() || undefined,
          episodeNumber: sermonFormData.episodeNumber ? parseInt(sermonFormData.episodeNumber) : undefined,
          tags: sermonFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          thumbnailUrl: sermonFormData.thumbnailUrl.trim() || undefined,
          updatedAt: new Date().toISOString()
        };

        // Clean up undefined values to avoid Firestore issues
        const cleanedUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== '')
        );
        
        console.log('📝 Cleaned update data:', cleanedUpdateData);

        console.log('📝 Update data being sent:', cleanedUpdateData);
        console.log('🔄 Calling audioSermonService.updateAudioSermon...');
        
        await audioSermonService.updateAudioSermon(sermon.id, cleanedUpdateData);
        
        console.log('✅ Sermon update successful!');
        Alert.alert('Success', 'Sermon updated successfully!');
      } else if (addType === 'series' && editContent) {
        console.log('📝 Updating series...');
        console.log('📝 Form data:', seriesFormData);
        
        // Validate required fields for series
        if (!seriesFormData.title.trim() || !seriesFormData.speaker.trim()) {
          console.log('❌ Validation failed: Missing required fields');
          Alert.alert('Error', 'Please fill in required fields (title and speaker)');
          return;
        }

        const series = editContent as AudioSeries;
        console.log('📝 Series ID:', series.id);
        
        const updateData = {
          title: seriesFormData.title.trim(),
          speaker: seriesFormData.speaker.trim(),
          description: seriesFormData.description.trim(),
          category: seriesFormData.category.trim(),
          coverImage: seriesFormData.coverImage.trim() || undefined,
          totalEpisodes: seriesFormData.totalEpisodes ? parseInt(seriesFormData.totalEpisodes) : 0,
          updatedAt: new Date().toISOString()
        };

        // Clean up undefined values to avoid Firestore issues
        const cleanedUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== '')
        );

        console.log('📝 Cleaned update data:', cleanedUpdateData);
        console.log('📝 Update data being sent:', cleanedUpdateData);
        console.log('🔄 Calling audioSermonService.updateAudioSeries...');
        
        await audioSermonService.updateAudioSeries(series.id, cleanedUpdateData);
        
        console.log('✅ Series update successful!');
        Alert.alert('Success', 'Series updated successfully!');
      }

      console.log('🔄 Closing modal and reloading data...');
      setShowEditModal(false);
      loadContentData();
    } catch (error) {
      console.error('❌ Error updating content:', error);
      console.error('❌ Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      Alert.alert('Error', `Failed to update ${addType}: ${(error as any)?.message || 'Unknown error'}`);
    } finally {
      console.log('🔄 Update process completed, setting isUpdating to false');
      setIsUpdating(false);
    }
  };

  const handleViewContent = (content: AudioSermon | AudioSeries, type: 'sermon' | 'series') => {
    setViewContent(content);
    setShowViewModal(true);
  };

  const handleDeleteContent = async (contentId: string, contentTitle: string, type: 'sermon' | 'series') => {
    console.log('🗑️ Delete button clicked!');
    console.log('📋 Delete details:', { contentId, contentTitle, type });
    
    const contentType = type === 'sermon' ? 'Sermon' : 'Series';
    const warningMessage = type === 'sermon' 
      ? `Are you sure you want to delete the sermon "${contentTitle}"? This action cannot be undone.`
      : `Are you sure you want to delete the series "${contentTitle}"? This will also remove all episodes in this series. This action cannot be undone.`;
    
    console.log('⚠️ Showing delete confirmation dialog...');
    
    Alert.alert(
      `Delete ${contentType}`,
      warningMessage,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => console.log('❌ Delete cancelled by user') },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('✅ Delete confirmed by user, proceeding with deletion...');
            try {
              setDeleteStatus(`Deleting ${type} from Firestore...`);
              console.log(`🔄 Starting deletion of ${type} with ID: ${contentId}`);
              
              if (type === 'sermon') {
                console.log('🎵 Calling audioSermonService.deleteAudioSermon...');
                await audioSermonService.deleteAudioSermon(contentId);
                console.log('✅ Sermon deletion completed');
                setDeleteStatus('Sermon deleted successfully!');
              } else {
                console.log('🎵 Calling audioSermonService.deleteAudioSeries...');
                await audioSermonService.deleteAudioSeries(contentId);
                console.log('✅ Series deletion completed');
                setDeleteStatus('Series deleted successfully!');
              }
              
              console.log('🔄 Reloading content data...');
              await loadContentData();
              console.log('✅ Content data reloaded');
              
              Alert.alert('Success', `${contentType} deleted successfully!`);
              
              setTimeout(() => setDeleteStatus(''), 3000);
            } catch (error) {
              console.error('❌ Delete operation failed:', error);
              console.error('❌ Error details:', {
                message: (error as any)?.message,
                code: (error as any)?.code,
                stack: (error as any)?.stack
              });
              setDeleteStatus(`Error: ${(error as any)?.message || 'Failed to delete'}`);
              Alert.alert('Error', `Failed to delete ${contentType.toLowerCase()}: ${(error as any)?.message || 'Unknown error'}`);
              setTimeout(() => setDeleteStatus(''), 5000);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a961" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Content Management</Text>
          <Text style={styles.headerSubtitle}>Manage sermons and series</Text>
          
          {deleteStatus ? (
            <Text style={styles.deleteStatus}>{deleteStatus}</Text>
          ) : null}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.modernStatCard}>
            <LinearGradient colors={['#c9a961', '#b8941f']} style={styles.modernStatGradient}>
              <Headphones size={28} color="#ffffff" />
            </LinearGradient>
            <View style={styles.modernStatContent}>
              <Text style={styles.modernStatNumber}>{stats?.totalSermons || 0}</Text>
              <Text style={styles.modernStatLabel}>Total Sermons</Text>
              <Text style={styles.modernStatSubtext}>Audio content</Text>
            </View>
          </View>

          <View style={styles.modernStatCard}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.modernStatGradient}>
              <Users size={28} color="#ffffff" />
            </LinearGradient>
            <View style={styles.modernStatContent}>
              <Text style={styles.modernStatNumber}>{stats?.totalSeries || 0}</Text>
              <Text style={styles.modernStatLabel}>Total Series</Text>
              <Text style={styles.modernStatSubtext}>Collections</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={styles.modernSearchContainer}>
          <Search size={22} color="#c9a961" style={styles.modernSearchIcon} />
          <TextInput
            style={styles.modernSearchInput}
            placeholder="Search sermons and series..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
          />
        </View>

        {/* Tabs */}
        <View style={styles.modernTabContainer}>
          <TouchableOpacity
            style={[styles.modernTab, selectedTab === 'sermons' && styles.modernActiveTab]}
            onPress={() => setSelectedTab('sermons')}
          >
            <Headphones size={20} color={selectedTab === 'sermons' ? '#ffffff' : '#c9a961'} />
            <Text style={[styles.modernTabText, selectedTab === 'sermons' && styles.modernActiveTabText]}>
              Sermons ({filteredSermons.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modernTab, selectedTab === 'series' && styles.modernActiveTab]}
            onPress={() => setSelectedTab('series')}
          >
            <Users size={20} color={selectedTab === 'series' ? '#ffffff' : '#c9a961'} />
            <Text style={[styles.modernTabText, selectedTab === 'series' && styles.modernActiveTabText]}>
              Series ({filteredSeries.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content List */}
        <View style={styles.contentList}>
          {selectedTab === 'sermons' ? (
            filteredSermons.map((sermon) => (
              <View key={sermon.id} style={styles.modernCard}>
                <LinearGradient
                  colors={['#1a1a1a', '#2a2a2a']}
                  style={styles.cardGradient}
                >
                  <View style={styles.modernCardHeader}>
                    <View style={styles.imageContainer}>
                      {sermon.thumbnailUrl ? (
                        <Image source={{ uri: sermon.thumbnailUrl }} style={styles.modernImage} />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <Headphones size={32} color="#c9a961" />
                        </View>
                      )}
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{sermon.duration}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.modernContentInfo}>
                      <Text style={styles.modernTitle} numberOfLines={2}>{sermon.title}</Text>
                      <Text style={styles.modernSpeaker}>{sermon.speaker}</Text>
                      <View style={styles.metaContainer}>
                        <View style={styles.categoryChip}>
                          <Text style={styles.categoryText}>{sermon.category}</Text>
                        </View>
                        {sermon.seriesId && (
                          <View style={styles.seriesChip}>
                            <Text style={styles.seriesText}>Series</Text>
                          </View>
                        )}
                      </View>
                      {sermon.tags && sermon.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                          {sermon.tags.slice(0, 3).map((tag, index) => (
                            <Text key={index} style={styles.tagText}>#{tag}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.modernActions}>
                    <TouchableOpacity
                      style={[styles.modernActionButton, styles.viewAction]}
                      onPress={() => handleViewContent(sermon, 'sermon')}
                    >
                      <Eye size={18} color="#4CAF50" />
                      <Text style={[styles.modernActionText, styles.viewActionText]}>View</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modernActionButton, styles.editAction]}
                      onPress={() => handleEditContent(sermon, 'sermon')}
                    >
                      <Edit size={18} color="#c9a961" />
                      <Text style={[styles.modernActionText, styles.editActionText]}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modernActionButton, styles.deleteAction]}
                      onPress={() => handleDeleteContent(sermon.id, sermon.title, 'sermon')}
                    >
                      <Trash2 size={18} color="#ff6b6b" />
                      <Text style={[styles.modernActionText, styles.deleteActionText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ))
          ) : (
            filteredSeries.map((series) => (
              <View key={series.id} style={styles.modernCard}>
                <LinearGradient
                  colors={['#1a1a1a', '#2a2a2a']}
                  style={styles.cardGradient}
                >
                  <View style={styles.modernCardHeader}>
                    <View style={styles.imageContainer}>
                      {series.coverImage ? (
                        <Image source={{ uri: series.coverImage }} style={styles.modernImage} />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <Users size={32} color="#c9a961" />
                        </View>
                      )}
                      <View style={styles.episodeBadge}>
                        <Text style={styles.episodeText}>{series.totalEpisodes} episodes</Text>
                      </View>
                    </View>
                    
                    <View style={styles.modernContentInfo}>
                      <Text style={styles.modernTitle} numberOfLines={2}>{series.title}</Text>
                      <Text style={styles.modernSpeaker}>{series.speaker}</Text>
                      <View style={styles.metaContainer}>
                        <View style={styles.categoryChip}>
                          <Text style={styles.categoryText}>{series.category}</Text>
                        </View>
                        <View style={styles.seriesChip}>
                          <Text style={styles.seriesText}>Series</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.modernActions}>
                    <TouchableOpacity
                      style={[styles.modernActionButton, styles.viewAction]}
                      onPress={() => handleViewContent(series, 'series')}
                    >
                      <Eye size={18} color="#4CAF50" />
                      <Text style={[styles.modernActionText, styles.viewActionText]}>View</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modernActionButton, styles.editAction]}
                      onPress={() => handleEditContent(series, 'series')}
                    >
                      <Edit size={18} color="#c9a961" />
                      <Text style={[styles.modernActionText, styles.editActionText]}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modernActionButton, styles.deleteAction]}
                      onPress={() => handleDeleteContent(series.id, series.title, 'series')}
                    >
                      <Trash2 size={18} color="#ff6b6b" />
                      <Text style={[styles.modernActionText, styles.deleteActionText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddContent}>
        <LinearGradient colors={['#c9a961', '#b8941f']} style={styles.addButtonGradient}>
          <Plus size={24} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add {addType === 'sermon' ? 'Sermon' : 'Series'}</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {addType === 'sermon' ? (
              <>
                <Text style={styles.fieldLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.title}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, title: text})}
                  placeholder="Enter sermon title"
                />

                <Text style={styles.fieldLabel}>Speaker *</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.speaker}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, speaker: text})}
                  placeholder="Enter speaker name"
                />

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={sermonFormData.description}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, description: text})}
                  placeholder="Enter sermon description"
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.fieldLabel}>Audio URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.audioUrl}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, audioUrl: text})}
                  placeholder="Enter audio file URL"
                />

                <Text style={styles.fieldLabel}>Duration</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.duration}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, duration: text})}
                  placeholder="e.g., 45:30"
                />

                <Text style={styles.fieldLabel}>Category</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.category}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, category: text})}
                  placeholder="Enter category"
                />

                <Text style={styles.fieldLabel}>Series ID</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.seriesId}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, seriesId: text})}
                  placeholder="Enter series ID (optional)"
                />

                <Text style={styles.fieldLabel}>Episode Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.episodeNumber}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, episodeNumber: text})}
                  placeholder="Enter episode number"
                  keyboardType="numeric"
                />

                <Text style={styles.fieldLabel}>Tags</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.tags}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, tags: text})}
                  placeholder="Enter tags separated by commas"
                />

                <SimpleImageUploader
                  currentImageUrl={sermonFormData.thumbnailUrl}
                  onImageSelected={(imageUrl) => setSermonFormData({...sermonFormData, thumbnailUrl: imageUrl})}
                  placeholder="Upload thumbnail image or enter image URL"
                />
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={seriesFormData.title}
                  onChangeText={(text) => setSeriesFormData({...seriesFormData, title: text})}
                  placeholder="Enter series title"
                />

                <Text style={styles.fieldLabel}>Speaker *</Text>
                <TextInput
                  style={styles.textInput}
                  value={seriesFormData.speaker}
                  onChangeText={(text) => setSeriesFormData({...seriesFormData, speaker: text})}
                  placeholder="Enter speaker name"
                />

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={seriesFormData.description}
                  onChangeText={(text) => setSeriesFormData({...seriesFormData, description: text})}
                  placeholder="Enter series description"
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.fieldLabel}>Category</Text>
                <TextInput
                  style={styles.textInput}
                  value={seriesFormData.category}
                  onChangeText={(text) => setSeriesFormData({...seriesFormData, category: text})}
                  placeholder="Enter category"
                />

                <Text style={styles.fieldLabel}>Total Episodes</Text>
                <TextInput
                  style={styles.textInput}
                  value={seriesFormData.totalEpisodes}
                  onChangeText={(text) => setSeriesFormData({...seriesFormData, totalEpisodes: text})}
                  placeholder="Enter total episodes"
                  keyboardType="numeric"
                />

                <Text style={styles.fieldLabel}>Cover Image URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={seriesFormData.coverImage}
                  onChangeText={(text) => setSeriesFormData({...seriesFormData, coverImage: text})}
                  placeholder="Enter cover image URL"
                />
              </>
            )}

            <TouchableOpacity style={styles.createButton} onPress={handleCreateContent}>
              <Text style={styles.createButtonText}>Create {addType === 'sermon' ? 'Sermon' : 'Series'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit {addType === 'sermon' ? 'Sermon' : 'Series'}</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {addType === 'sermon' ? (
              <>
                <Text style={styles.fieldLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.title}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, title: text})}
                  placeholder="Enter sermon title"
                  placeholderTextColor="#666666"
                />

                <Text style={styles.fieldLabel}>Speaker *</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.speaker}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, speaker: text})}
                  placeholder="Enter speaker name"
                  placeholderTextColor="#666666"
                />

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={sermonFormData.description}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, description: text})}
                  placeholder="Enter sermon description"
                  placeholderTextColor="#666666"
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.fieldLabel}>Audio URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.audioUrl}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, audioUrl: text})}
                  placeholder="Enter audio file URL"
                  placeholderTextColor="#666666"
                />

                <Text style={styles.fieldLabel}>Duration</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.duration}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, duration: text})}
                  placeholder="e.g., 45:30"
                  placeholderTextColor="#666666"
                />

                <Text style={styles.fieldLabel}>Category</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.category}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, category: text})}
                  placeholder="Enter category"
                  placeholderTextColor="#666666"
                />

                <Text style={styles.fieldLabel}>Series ID</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.seriesId}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, seriesId: text})}
                  placeholder="Enter series ID (optional)"
                  placeholderTextColor="#666666"
                />

                <Text style={styles.fieldLabel}>Episode Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.episodeNumber}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, episodeNumber: text})}
                  placeholder="Enter episode number"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                />

                <Text style={styles.fieldLabel}>Tags</Text>
                <TextInput
                  style={styles.textInput}
                  value={sermonFormData.tags}
                  onChangeText={(text) => setSermonFormData({...sermonFormData, tags: text})}
                  placeholder="Enter tags separated by commas"
                  placeholderTextColor="#666666"
                />

                <SimpleImageUploader
                  currentImageUrl={sermonFormData.thumbnailUrl}
                  onImageSelected={(imageUrl) => setSermonFormData({...sermonFormData, thumbnailUrl: imageUrl})}
                  placeholder="Upload thumbnail image or enter image URL"
                />
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={seriesFormData.title}
                  onChangeText={(text) => setSeriesFormData({...seriesFormData, title: text})}
                  placeholder="Enter series title"
                  placeholderTextColor="#666666"
                />

                <Text style={styles.fieldLabel}>Speaker *</Text>
                <TextInput
                  style={styles.textInput}
                  value={seriesFormData.speaker}
                  onChangeText={(text) => setSeriesFormData({...seriesFormData, speaker: text})}
                  placeholder="Enter speaker name"
                  placeholderTextColor="#666666"
                />

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={seriesFormData.description}
                  onChangeText={(text) => setSeriesFormData({...seriesFormData, description: text})}
                  placeholder="Enter series description"
                  placeholderTextColor="#666666"
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.fieldLabel}>Category</Text>
                <TextInput
                  style={styles.textInput}
                  value={seriesFormData.category}
                  onChangeText={(text) => setSeriesFormData({...seriesFormData, category: text})}
                  placeholder="Enter category"
                  placeholderTextColor="#666666"
                />

                <Text style={styles.fieldLabel}>Total Episodes</Text>
                <TextInput
                  style={styles.textInput}
                  value={seriesFormData.totalEpisodes}
                  onChangeText={(text) => setSeriesFormData({...seriesFormData, totalEpisodes: text})}
                  placeholder="Enter total episodes"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                />

                <Text style={styles.fieldLabel}>Cover Image URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={seriesFormData.coverImage}
                  onChangeText={(text) => setSeriesFormData({...seriesFormData, coverImage: text})}
                  placeholder="Enter cover image URL"
                  placeholderTextColor="#666666"
                />
              </>
            )}

            <TouchableOpacity 
              style={[styles.createButton, isUpdating && styles.disabledButton]} 
              onPress={handleUpdateContent}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.createButtonText}>Updating...</Text>
                </View>
              ) : (
                <Text style={styles.createButtonText}>Update {addType === 'sermon' ? 'Sermon' : 'Series'}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* View Modal */}
      <Modal visible={showViewModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Content Details</Text>
            <TouchableOpacity onPress={() => setShowViewModal(false)}>
              <Text style={styles.modalCloseButton}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {viewContent && (
              <>
                <Text style={styles.detailTitle}>{viewContent.title}</Text>
                <Text style={styles.detailSpeaker}>{viewContent.speaker}</Text>
                <Text style={styles.detailDescription}>{viewContent.description}</Text>
                <Text style={styles.detailCategory}>Category: {viewContent.category}</Text>
                {('coverImage' in viewContent && (viewContent as AudioSeries).coverImage) && (
                  <Image source={{ uri: (viewContent as AudioSeries).coverImage }} style={styles.detailImage} />
                )}
                {('thumbnailUrl' in viewContent && (viewContent as AudioSermon).thumbnailUrl) && (
                  <Image source={{ uri: (viewContent as AudioSermon).thumbnailUrl }} style={styles.detailImage} />
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#c9a961',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  activeTabText: {
    color: '#ffffff',
  },
  modernTabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#333333',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modernTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  modernActiveTab: {
    backgroundColor: '#c9a961',
    elevation: 4,
    shadowColor: '#c9a961',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modernTabText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  modernActiveTabText: {
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  contentList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Modern Card Styles
  modernCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modernCardHeader: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  modernImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
  },
  placeholderImage: {
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
  durationBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#c9a961',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  episodeBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  episodeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  modernContentInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  modernTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 6,
    lineHeight: 24,
  },
  modernSpeaker: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.3)',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  seriesChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  seriesText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  modernActions: {
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
  detailSpeaker: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailCategory: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
    marginBottom: 16,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});