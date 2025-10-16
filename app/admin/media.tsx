import { LinearGradient } from 'expo-linear-gradient';
import { Download, Edit, Eye, Image as ImageIcon, MoreVertical, Search, Trash2, Upload, Video } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MediaFile, MediaStats, mediaService } from '../../services/mediaService';

export default function MediaManagement() {
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'images' | 'videos' | 'audio'>('all');
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);


  useEffect(() => {
    loadMediaData();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [searchQuery, selectedCategory, mediaFiles]);

  const loadMediaData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading media data from Firestore...');
      
      const [mediaFiles, stats] = await Promise.all([
        mediaService.getAllMediaFiles(),
        mediaService.getMediaStats()
      ]);

      console.log(`✅ Loaded ${mediaFiles.length} media files`);
      console.log('📊 Media stats:', stats);

      setStats(stats);
      setMediaFiles(mediaFiles);
    } catch (error) {
      console.error('❌ Error loading media data:', error);
      
      // Set fallback data if services fail
      setStats({
        totalFiles: 0,
        images: 0,
        videos: 0,
        audio: 0,
      });
      setMediaFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFiles = () => {
    let filtered = mediaFiles;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(file => file.type === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFiles(filtered);
  };

  const handleViewFile = (file: MediaFile) => {
    console.log('👁️ View file clicked:', file.name);
    Alert.alert(
      'File Details',
      `Name: ${file.name}\n\nType: ${file.type}\n\nSize: ${file.size}\n\nCategory: ${file.category}\n\nUploaded: ${new Date(file.uploadedAt).toLocaleDateString()}`,
      [{ text: 'Close', style: 'default' }]
    );
  };

  const handleEditFile = (file: MediaFile) => {
    console.log('✏️ Edit file clicked:', file.name);
    Alert.alert(
      'Edit Media File',
      `Edit functionality for "${file.name}" would open here.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: async () => {
          try {
            console.log('Editing file:', file.id);
            
            // Update the file with sample changes
            const updateData = {
              name: `${file.name} (Edited)`,
              category: file.category === 'Sermons' ? 'Worship' : 'Sermons',
            };

            await mediaService.updateMediaFile(file.id, updateData);
            console.log('✅ File updated successfully');
            Alert.alert('Success', 'File updated successfully!');
            
            // Reload data to show the updated file
            loadMediaData();
          } catch (error) {
            console.error('❌ Update file error:', error);
            Alert.alert('Error', `Failed to update file: ${error?.message || 'Unknown error'}`);
          }
        }}
      ]
    );
  };

  const handleDeleteFile = async (fileId: string) => {
    console.log('🗑️ Delete file clicked:', fileId);
    Alert.alert(
      'Delete Media File',
      'Are you sure you want to delete this file? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting file:', fileId);
              await mediaService.deleteMediaFile(fileId);
              console.log('✅ File deleted successfully');
              Alert.alert('Success', 'File deleted successfully!');
              // Reload data
              loadMediaData();
            } catch (error) {
              console.error('❌ Delete file error:', error);
              Alert.alert('Error', `Failed to delete file: ${error?.message || 'Unknown error'}`);
            }
          },
        },
      ]
    );
  };

  const handleUploadFile = () => {
    console.log('📤 Upload file clicked');
    Alert.alert(
      'Upload Media',
      'Upload new media files to the system.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upload', onPress: async () => {
          try {
            console.log('Creating sample media file...');
            
            // Create a sample media file for testing
            const newMediaFile = {
              name: 'sample-video.mp4',
              type: 'video' as const,
              url: 'https://example.com/sample-video.mp4',
              size: '25.5 MB',
              category: 'Sermons',
              description: 'Sample video file for testing',
              tags: ['sample', 'video', 'test'],
              uploadedBy: 'admin',
              isActive: true,
            };

            const fileId = await mediaService.createMediaFile(newMediaFile);
            console.log('✅ Media file created with ID:', fileId);
            Alert.alert('Success', 'Sample media file created successfully!');
            
            // Reload data to show the new file
            loadMediaData();
          } catch (error) {
            console.error('❌ Create media file error:', error);
            Alert.alert('Error', `Failed to create media file: ${error?.message || 'Unknown error'}`);
          }
        }}
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={20} color="#c9a961" />;
      case 'video':
        return <Video size={20} color="#c9a961" />;
      case 'audio':
        return <Download size={20} color="#c9a961" />;
      default:
        return <ImageIcon size={20} color="#c9a961" />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a961" />
        <Text style={styles.loadingText}>Loading media...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load media data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Media Management</Text>
        <Text style={styles.headerSubtitle}>Manage images, videos, and audio files</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={['#c9a961', '#b8941f']}
            style={styles.statGradient}>
            <ImageIcon size={24} color="#ffffff" />
            <Text style={styles.statNumber}>{stats.totalFiles}</Text>
            <Text style={styles.statLabel}>Total Files</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.statGradient}>
            <Download size={24} color="#ffffff" />
            <Text style={styles.statNumber}>{stats.totalSize}</Text>
            <Text style={styles.statLabel}>Total Size</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Category Stats */}
      <View style={styles.categoryStats}>
        <View style={styles.categoryItem}>
          <ImageIcon size={16} color="#c9a961" />
          <Text style={styles.categoryText}>{stats.images} Images</Text>
        </View>
        <View style={styles.categoryItem}>
          <Video size={16} color="#c9a961" />
          <Text style={styles.categoryText}>{stats.videos} Videos</Text>
        </View>
        <View style={styles.categoryItem}>
          <Download size={16} color="#c9a961" />
          <Text style={styles.categoryText}>{stats.audio} Audio</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search media files..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterTabs}>
            {[
              { key: 'all', label: 'All' },
              { key: 'images', label: 'Images' },
              { key: 'videos', label: 'Videos' },
              { key: 'audio', label: 'Audio' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  selectedCategory === tab.key && styles.activeFilterTab
                ]}
                onPress={() => setSelectedCategory(tab.key as any)}>
                <Text style={[
                  styles.filterTabText,
                  selectedCategory === tab.key && styles.activeFilterTabText
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Media Grid */}
      <View style={styles.mediaGrid}>
        {filteredFiles.map((file) => (
          <View key={file.id} style={styles.mediaCard}>
            <View style={styles.mediaHeader}>
              {file.type === 'image' ? (
                <Image
                  source={{ uri: file.url }}
                  style={styles.mediaThumbnail}
                  resizeMode="cover"
                />
              ) : file.thumbnail ? (
                <Image
                  source={{ uri: file.thumbnail }}
                  style={styles.mediaThumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.mediaPlaceholder}>
                  {getFileIcon(file.type)}
                </View>
              )}
              
              <TouchableOpacity style={styles.moreButton}>
                <MoreVertical size={16} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mediaInfo}>
              <Text style={styles.mediaName} numberOfLines={2}>
                {file.name}
              </Text>
              <Text style={styles.mediaMeta}>
                {file.size} • {formatDate(file.uploadedAt)}
              </Text>
              <Text style={styles.mediaCategory}>
                {file.category}
              </Text>
            </View>
            
            <View style={styles.mediaActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleViewFile(file)}>
                <Eye size={14} color="#c9a961" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditFile(file)}>
                <Edit size={14} color="#c9a961" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteFile(file.id)}>
                <Trash2 size={14} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.uploadButton, { flex: 1, marginRight: 8 }]}
          onPress={handleUploadFile}>
          <LinearGradient
            colors={['#c9a961', '#b8941f']}
            style={styles.uploadButtonGradient}>
            <Upload size={24} color="#ffffff" />
            <Text style={styles.uploadButtonText}>Upload Media</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.uploadButton, { flex: 1, marginLeft: 8 }]}
          onPress={async () => {
            try {
              console.log('📁 Adding sample media files...');
              await mediaService.addSampleMediaFiles();
              Alert.alert('Success', 'Sample media files added!');
              loadMediaData();
            } catch (error) {
              console.error('❌ Error adding sample files:', error);
              Alert.alert('Error', 'Failed to add sample files');
            }
          }}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.uploadButtonGradient}>
            <Video size={24} color="#ffffff" />
            <Text style={styles.uploadButtonText}>Add Sample Data</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    color: '#c9a961',
    fontFamily: 'Inter-Medium',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  errorText: {
    color: '#ff6b6b',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statGradient: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginTop: 2,
  },
  categoryStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
    marginLeft: 6,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  activeFilterTab: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  activeFilterTabText: {
    color: '#ffffff',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 12,
  },
  mediaCard: {
    width: '47%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  mediaHeader: {
    position: 'relative',
    marginBottom: 8,
  },
  mediaThumbnail: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  mediaPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    padding: 4,
  },
  mediaInfo: {
    marginBottom: 8,
  },
  mediaName: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  mediaMeta: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
    marginBottom: 4,
  },
  mediaCategory: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  mediaActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.2)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#c9a961',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginLeft: 8,
  },
});
