import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Check, Edit, Eye, Filter, MoreVertical, Plus, Search, Star, Trash2, User, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NewsArticle, newsService } from '../../services/newsService';

interface NewsStats {
  totalNews: number;
  featuredNews: number;
  recentNews: NewsArticle[];
}

export default function NewsManagement() {
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  
  // Modal and form state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editNews, setEditNews] = useState<NewsArticle | null>(null);
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Advanced filtering and sorting
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFeatured, setSelectedFeatured] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'featured'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Bulk operations
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  
  // Image preview
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    tags: '',
    readTime: '',
    imageUrl: '',
    isFeatured: false
  });

  const loadNewsData = async () => {
    try {
      console.log('🔄 Loading news data...');
      setLoading(true);
      
      // Use advanced filtering if filters are applied
      const filterOptions: any = {};
      if (selectedCategory !== 'all') filterOptions.category = selectedCategory;
      if (selectedFeatured !== 'all') filterOptions.featured = selectedFeatured === 'featured';
      filterOptions.sortBy = sortBy;
      filterOptions.sortOrder = sortOrder;
      
      const allNews = Object.keys(filterOptions).length > 2 
        ? await newsService.getNewsWithFilters(filterOptions)
        : await newsService.getAllNews();
      
      const featuredNews = allNews.filter(news => news.featured);

      setStats({
        totalNews: allNews.length,
        featuredNews: featuredNews.length,
        recentNews: allNews,
      });
    } catch (error) {
      console.error('❌ Error loading news data:', error);
      
      setStats({
        totalNews: 0,
        featuredNews: 0,
        recentNews: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewNews = (news: NewsArticle) => {
    console.log('👁️ View news clicked:', news.title);
    Alert.alert(
      'News Article Details',
      `Title: ${news.title}\n\nAuthor: ${news.author}\n\nCategory: ${news.category}\n\nExcerpt: ${news.excerpt}\n\nRead Time: ${news.readTime}\n\nFeatured: ${news.featured ? 'Yes' : 'No'}\n\nTags: ${news.tags?.join(', ') || 'None'}`,
      [{ text: 'Close', style: 'default' }]
    );
  };

  const handleEditNews = (news: NewsArticle) => {
    console.log('✏️ Edit news clicked:', news.title);
    setEditNews(news);
    setFormData({
      title: news.title,
      content: news.content,
      excerpt: news.excerpt,
      author: news.author || '',
      category: news.category,
      tags: news.tags?.join(', ') || '',
      readTime: news.readTime,
      imageUrl: news.imageUrl,
      isFeatured: news.featured
    });
    setSelectedImage(null);
    setSelectedImageDataUrl(null);
    setShowEditModal(true);
  };

  // Image picker functions
  const pickImage = async () => {
    try {
      console.log('📸 Starting image picker...');
      // Request permission first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        console.log('❌ Permission denied for photo library');
        Alert.alert('Permission Required', 'Permission to access photo library is required to select images.');
        return;
      }

      console.log('✅ Permission granted, launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      console.log('📷 Image picker result:', result);
      if (!result.canceled && result.assets[0]) {
        console.log('✅ Image selected:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
        if ((result.assets[0] as any).base64) {
          const mime = (result.assets[0] as any).mimeType || 'image/jpeg';
          setSelectedImageDataUrl(`data:${mime};base64,${(result.assets[0] as any).base64}`);
        } else {
          setSelectedImageDataUrl(null);
        }
        setFormData({...formData, imageUrl: ''}); // Clear URL when image is selected
      } else {
        console.log('❌ Image selection canceled or failed');
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      console.log('📸 Starting camera...');
      // Request permission first
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        console.log('❌ Permission denied for camera');
        Alert.alert('Permission Required', 'Permission to access camera is required to take photos.');
        return;
      }

      console.log('✅ Camera permission granted, launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      console.log('📷 Camera result:', result);
      if (!result.canceled && result.assets[0]) {
        console.log('✅ Photo taken:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
        if ((result.assets[0] as any).base64) {
          const mime = (result.assets[0] as any).mimeType || 'image/jpeg';
          setSelectedImageDataUrl(`data:${mime};base64,${(result.assets[0] as any).base64}`);
        } else {
          setSelectedImageDataUrl(null);
        }
        setFormData({...formData, imageUrl: ''}); // Clear URL when image is selected
      } else {
        console.log('❌ Photo capture canceled or failed');
      }
    } catch (error) {
      console.error('❌ Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    console.log('📷 Image options dialog opened');
    Alert.alert(
      'Select Image',
      'Choose how you want to add an image',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setSelectedImageDataUrl(null);
  };

  const handleUpdateNews = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert('Error', 'Please fill in required fields (title and content)');
      return;
    }

    if (!editNews) return;

    try {
      setImageUploading(true);
      
      const updateData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        author: formData.author,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        readTime: formData.readTime,
        imageUrl: formData.imageUrl,
        featured: formData.isFeatured
      };
      
      // Use the new updateNewsWithImage method for proper Firebase Storage integration
      const imageSource = selectedImageDataUrl || selectedImage || undefined;
      await newsService.updateNewsWithImage(editNews.id, updateData, imageSource);
      Alert.alert('Success', 'News article updated successfully!');
      setShowEditModal(false);
      setSelectedImage(null);
      loadNewsData();
    } catch (error: any) {
      console.error('❌ Error updating news:', error);
      Alert.alert('Error', `Failed to update news: ${error?.message || 'Unknown error'}`);
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteNews = async (newsId: string, newsTitle: string) => {
    console.log('🗑️ Delete news clicked:', newsTitle);
    Alert.alert(
      'Delete News Article',
      `Are you sure you want to delete "${newsTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Use the new deleteNewsWithImage method for proper Firebase Storage cleanup
              await newsService.deleteNewsWithImage(newsId);
              Alert.alert('Success', 'News article deleted successfully!');
              loadNewsData();
            } catch (error: any) {
              console.error('❌ Delete news error:', error);
              Alert.alert('Error', `Failed to delete news: ${error?.message || 'Unknown error'}`);
            }
          },
        },
      ]
    );
  };

  const handleAddNews = () => {
    console.log('➕ Add news clicked');
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      author: '',
      category: '',
      tags: '',
      readTime: '',
      imageUrl: '',
      isFeatured: false
    });
    setSelectedImage(null);
    setShowAddModal(true);
  };

  const handleCreateNews = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert('Error', 'Please fill in required fields (title and content)');
      return;
    }

    try {
      console.log('📝 Starting news creation...');
      console.log('📷 Selected image:', selectedImage);
      console.log('📝 Form data:', formData);
      
      setImageUploading(true);
      
      const createData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        author: formData.author || 'MVAMA CCAP Nkhoma Synod',
        category: formData.category || 'General',
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        readTime: formData.readTime || '2 min read',
        imageUrl: formData.imageUrl || 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
        featured: formData.isFeatured
      };
      
      console.log('📤 Creating news with data:', createData);
      console.log('📷 Image to upload:', selectedImage);
      
      // Use the new createNewsWithImage method for proper Firebase Storage integration
      const imageSource = selectedImageDataUrl || selectedImage || undefined;
      const newsId = await newsService.createNewsWithImage(createData, imageSource);
      console.log('✅ News created successfully with ID:', newsId);
      
      Alert.alert('Success', 'News article created successfully!');
      setShowAddModal(false);
      setSelectedImage(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        author: '',
        category: '',
        tags: '',
        readTime: '',
        imageUrl: '',
        isFeatured: false
      });
      loadNewsData();
    } catch (error: any) {
      console.error('❌ Error creating news:', error);
      Alert.alert('Error', `Failed to create news: ${error?.message || 'Unknown error'}`);
    } finally {
      setImageUploading(false);
    }
  };

  // Bulk operations handlers
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredNews.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredNews.map(news => news.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    
    Alert.alert(
      'Bulk Delete',
      `Are you sure you want to delete ${selectedItems.length} articles? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await newsService.bulkDeleteNews(selectedItems);
              Alert.alert('Success', `${selectedItems.length} articles deleted successfully!`);
              setSelectedItems([]);
              setBulkMode(false);
              loadNewsData();
            } catch (error: any) {
              Alert.alert('Error', `Failed to delete articles: ${error?.message || 'Unknown error'}`);
            }
          },
        },
      ]
    );
  };

  const handleBulkFeature = (featured: boolean) => {
    if (selectedItems.length === 0) return;
    
    Alert.alert(
      `Bulk ${featured ? 'Feature' : 'Unfeature'}`,
      `${featured ? 'Feature' : 'Unfeature'} ${selectedItems.length} articles?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: featured ? 'Feature' : 'Unfeature',
          onPress: async () => {
            try {
              await newsService.bulkUpdateFeatured(selectedItems, featured);
              Alert.alert('Success', `${selectedItems.length} articles ${featured ? 'featured' : 'unfeatured'} successfully!`);
              setSelectedItems([]);
              setBulkMode(false);
              loadNewsData();
            } catch (error: any) {
              Alert.alert('Error', `Failed to update articles: ${error?.message || 'Unknown error'}`);
            }
          },
        },
      ]
    );
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      await newsService.toggleFeatured(id, !currentFeatured);
      loadNewsData();
    } catch (error: any) {
      Alert.alert('Error', `Failed to update featured status: ${error?.message || 'Unknown error'}`);
    }
  };

  const applyFilters = () => {
    loadNewsData();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedFeatured('all');
    setSortBy('date');
    setSortOrder('desc');
    loadNewsData();
    setShowFilters(false);
  };

  useEffect(() => {
    loadNewsData();
  }, []);

  useEffect(() => {
    if (stats?.recentNews) {
      const filtered = stats.recentNews.filter(news =>
        news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNews(filtered);
    }
  }, [searchQuery, stats]);

  useEffect(() => {
    loadNewsData();
  }, [selectedCategory, selectedFeatured, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a961" />
        <Text style={styles.loadingText}>Loading news articles...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load news data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>News Management</Text>
        <Text style={styles.headerSubtitle}>Manage news articles and announcements</Text>
        <View style={styles.headerActionsRow}>
          <TouchableOpacity style={styles.primaryAction} onPress={handleAddNews}>
            <Plus size={18} color="#0f0f0f" />
            <Text style={styles.primaryActionText}>New Article</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={() => setShowFilters(true)}>
            <Filter size={18} color="#c9a961" />
            <Text style={styles.secondaryActionText}>Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalNews}</Text>
          <Text style={styles.statLabel}>Total Articles</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.featuredNews}</Text>
          <Text style={styles.statLabel}>Featured</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search news articles..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}>
          <Filter size={20} color="#c9a961" />
        </TouchableOpacity>
      </View>

      {/* Bulk Operations Bar */}
      {bulkMode && (
        <View style={styles.bulkBar}>
          <TouchableOpacity 
            style={styles.bulkSelectAll}
            onPress={handleSelectAll}>
            <Text style={styles.bulkText}>
              {selectedItems.length === filteredNews.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
          <View style={styles.bulkActions}>
            <TouchableOpacity 
              style={[styles.bulkActionButton, styles.featureButton]}
              onPress={() => handleBulkFeature(true)}>
              <Star size={16} color="#4CAF50" />
              <Text style={[styles.bulkActionText, {color: '#4CAF50'}]}>Feature</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkActionButton, styles.unfeatureButton]}
              onPress={() => handleBulkFeature(false)}>
              <Star size={16} color="#666666" />
              <Text style={[styles.bulkActionText, {color: '#666666'}]}>Unfeature</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkActionButton, styles.deleteButton]}
              onPress={handleBulkDelete}>
              <Trash2 size={16} color="#ff6b6b" />
              <Text style={[styles.bulkActionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.bulkCancel}
            onPress={() => {
              setBulkMode(false);
              setSelectedItems([]);
            }}>
            <X size={20} color="#666666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Toggle Bulk Mode */}
      <View style={styles.bulkToggleContainer}>
        <TouchableOpacity 
          style={styles.bulkToggle}
          onPress={() => setBulkMode(!bulkMode)}>
          <Text style={styles.bulkToggleText}>
            {bulkMode ? 'Exit Bulk Mode' : 'Bulk Operations'}
          </Text>
        </TouchableOpacity>
        {selectedItems.length > 0 && (
          <Text style={styles.selectedCount}>{selectedItems.length} selected</Text>
        )}
      </View>

      {/* News List */}
      <View style={styles.newsList}>
        {filteredNews.map((news) => (
          <View key={news.id} style={[styles.newsCard, selectedItems.includes(news.id) && styles.selectedCard]}>
            {bulkMode && (
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => handleSelectItem(news.id)}>
                <View style={[styles.checkboxInner, selectedItems.includes(news.id) && styles.checkboxSelected]}>
                  {selectedItems.includes(news.id) && <Check size={16} color="#ffffff" />}
                </View>
              </TouchableOpacity>
            )}
            
            <View style={styles.newsHeader}>
              {news.imageUrl && (
              <View style={styles.imagePreviewContainer}>
                <Text style={styles.imagePreviewLabel}>Image Preview:</Text>
                <Image
                  source={{ uri: news.imageUrl }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                  onError={() => console.log('Image failed to load')}
                />
              </View>
            )}
            <View style={styles.newsInfo}>
                <Text style={styles.newsTitle} numberOfLines={2}>
                  {news.title}
                </Text>
                <View style={styles.newsMeta}>
                  <View style={styles.metaItem}>
                    <User size={12} color="#c9a961" />
                    <Text style={styles.metaText}>{news.author}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Calendar size={12} color="#c9a961" />
                    <Text style={styles.metaText}>{formatDate(news.date)}</Text>
                  </View>
                </View>
                <Text style={styles.newsExcerpt} numberOfLines={2}>
                  {news.excerpt}
                </Text>
                <View style={styles.newsFooter}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{news.category}</Text>
                  </View>
                  {news.featured && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredText}>Featured</Text>
                    </View>
                  )}
                  <View style={styles.readTimeBadge}>
                    <Text style={styles.readTimeText}>{news.readTime}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.featuredToggle}
                  onPress={() => handleToggleFeatured(news.id, news.featured)}>
                  <Star size={16} color={news.featured ? '#4CAF50' : '#666666'} fill={news.featured ? '#4CAF50' : 'none'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreButton}>
                  <MoreVertical size={20} color="#666666" />
                </TouchableOpacity>
              </View>
            </View>
            
            {!bulkMode && (
              <View style={styles.newsActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleViewNews(news)}>
                  <Eye size={16} color="#c9a961" />
                  <Text style={styles.actionText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEditNews(news)}>
                  <Edit size={16} color="#c9a961" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteNews(news.id, news.title)}>
                  <Trash2 size={16} color="#ff6b6b" />
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddNews}>
        <LinearGradient
          colors={['#c9a961', '#b8941f']}
          style={styles.addButtonGradient}>
          <Plus size={24} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit News Article</Text>
            
            <TextInput
              style={styles.modalInput}
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              placeholder="Article Title *"
              placeholderTextColor="#666666"
            />
            
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData({...formData, content: text})}
              placeholder="Article Content *"
              placeholderTextColor="#666666"
              multiline
              numberOfLines={4}
            />
            
            <TextInput
              style={styles.modalInput}
              value={formData.excerpt}
              onChangeText={(text) => setFormData({...formData, excerpt: text})}
              placeholder="Article Excerpt"
              placeholderTextColor="#666666"
            />
            
            <TextInput
              style={styles.modalInput}
              value={formData.author}
              onChangeText={(text) => setFormData({...formData, author: text})}
              placeholder="Author Name"
              placeholderTextColor="#666666"
            />
            
            <TextInput
              style={styles.modalInput}
              value={formData.category}
              onChangeText={(text) => setFormData({...formData, category: text})}
              placeholder="Category"
              placeholderTextColor="#666666"
            />
            
            <TextInput
              style={styles.modalInput}
              value={formData.tags}
              onChangeText={(text) => setFormData({...formData, tags: text})}
              placeholder="Tags (comma separated)"
              placeholderTextColor="#666666"
            />
            
            <TextInput
              style={styles.modalInput}
              value={formData.readTime}
              onChangeText={(text) => setFormData({...formData, readTime: text})}
              placeholder="Read Time (e.g., 5 min read)"
              placeholderTextColor="#666666"
            />
            
            <View style={styles.imageInputContainer}>
              <Text style={styles.imageInputLabel}>Article Image</Text>
              
              {/* Selected Image Preview */}
              {selectedImage && (
                <View style={styles.imagePreviewCard}>
                  <View style={styles.formImagePreviewWrapper}>
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.formImagePreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={clearSelectedImage}>
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.formImagePreviewLabel}>Selected Image</Text>
                </View>
              )}

              {/* Current Image Preview (for editing) */}
              {!selectedImage && formData.imageUrl && (
                <View style={styles.imagePreviewCard}>
                  <View style={styles.formImagePreviewWrapper}>
                    <Image
                      source={{ uri: formData.imageUrl }}
                      style={styles.formImagePreview}
                      resizeMode="cover"
                      onError={() => console.log('Image failed to load')}
                    />
                  </View>
                  <Text style={styles.formImagePreviewLabel}>Current Image</Text>
                </View>
              )}

              {/* Image Upload Options */}
              <View style={styles.imageUploadContainer}>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={showImageOptions}
                  disabled={imageUploading}>
                  <View style={styles.uploadButtonContent}>
                    <Text style={styles.uploadButtonText}>📷 Upload Image</Text>
                    <Text style={styles.uploadButtonSubtext}>Camera or Gallery</Text>
                  </View>
                </TouchableOpacity>
                
                <Text style={styles.orText}>OR</Text>
                
                <TextInput
                  style={styles.modalInput}
                  value={formData.imageUrl}
                  onChangeText={(text) => {
                    setFormData({...formData, imageUrl: text});
                    if (text.trim()) setSelectedImage(null); // Clear selected image when URL is entered
                  }}
                  placeholder="Paste image URL here"
                  placeholderTextColor="#666666"
                />
              </View>

              {/* Upload Status */}
              {imageUploading && (
                <View style={styles.uploadStatusContainer}>
                  <ActivityIndicator size="small" color="#c9a961" />
                  <Text style={styles.uploadStatusText}>Uploading image...</Text>
                </View>
              )}
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Featured Article</Text>
              <Switch
                value={formData.isFeatured}
                onValueChange={(value) => setFormData({...formData, isFeatured: value})}
                trackColor={{ false: '#333333', true: '#c9a961' }}
                thumbColor={formData.isFeatured ? '#ffffff' : '#666666'}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateNews}>
                <Text style={styles.saveButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New News Article</Text>
            
            <TextInput
              style={styles.modalInput}
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              placeholder="Article Title *"
              placeholderTextColor="#666666"
            />
            
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData({...formData, content: text})}
              placeholder="Article Content *"
              placeholderTextColor="#666666"
              multiline
              numberOfLines={4}
            />
            
            <TextInput
              style={styles.modalInput}
              value={formData.excerpt}
              onChangeText={(text) => setFormData({...formData, excerpt: text})}
              placeholder="Article Excerpt"
              placeholderTextColor="#666666"
            />
            
            <TextInput
              style={styles.modalInput}
              value={formData.author}
              onChangeText={(text) => setFormData({...formData, author: text})}
              placeholder="Author Name"
              placeholderTextColor="#666666"
            />
            
            <TextInput
              style={styles.modalInput}
              value={formData.category}
              onChangeText={(text) => setFormData({...formData, category: text})}
              placeholder="Category"
              placeholderTextColor="#666666"
            />
            
            <TextInput
              style={styles.modalInput}
              value={formData.tags}
              onChangeText={(text) => setFormData({...formData, tags: text})}
              placeholder="Tags (comma separated)"
              placeholderTextColor="#666666"
            />
            
            <TextInput
              style={styles.modalInput}
              value={formData.readTime}
              onChangeText={(text) => setFormData({...formData, readTime: text})}
              placeholder="Read Time (e.g., 5 min read)"
              placeholderTextColor="#666666"
            />
            
            <TextInput
              style={styles.modalInput}
              value={formData.imageUrl}
              onChangeText={(text) => setFormData({...formData, imageUrl: text})}
              placeholder="Image URL"
              placeholderTextColor="#666666"
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Featured Article</Text>
              <Switch
                value={formData.isFeatured}
                onValueChange={(value) => setFormData({...formData, isFeatured: value})}
                trackColor={{ false: '#333333', true: '#c9a961' }}
                thumbColor={formData.isFeatured ? '#ffffff' : '#666666'}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreateNews}>
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter & Sort News</Text>
            
            {/* Category Filter */}
            <Text style={styles.filterLabel}>Category</Text>
            <View style={styles.filterOptions}>
              {['all', ...newsService.getCategories()].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    selectedCategory === category && styles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedCategory(category)}>
                  <Text style={[
                    styles.filterOptionText,
                    selectedCategory === category && styles.filterOptionTextSelected
                  ]}>
                    {category === 'all' ? 'All Categories' : category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Featured Filter */}
            <Text style={styles.filterLabel}>Featured Status</Text>
            <View style={styles.filterOptions}>
              {[
                { key: 'all', label: 'All Articles' },
                { key: 'featured', label: 'Featured Only' },
                { key: 'regular', label: 'Regular Only' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOption,
                    selectedFeatured === option.key && styles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedFeatured(option.key)}>
                  <Text style={[
                    styles.filterOptionText,
                    selectedFeatured === option.key && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Sort Options */}
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.filterOptions}>
              {[
                { key: 'date', label: 'Date' },
                { key: 'title', label: 'Title' },
                { key: 'featured', label: 'Featured Status' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOption,
                    sortBy === option.key && styles.filterOptionSelected
                  ]}
                  onPress={() => setSortBy(option.key as 'date' | 'title' | 'featured')}>
                  <Text style={[
                    styles.filterOptionText,
                    sortBy === option.key && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Sort Order */}
            <Text style={styles.filterLabel}>Sort Order</Text>
            <View style={styles.filterOptions}>
              {[
                { key: 'desc', label: 'Descending' },
                { key: 'asc', label: 'Ascending' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOption,
                    sortOrder === option.key && styles.filterOptionSelected
                  ]}
                  onPress={() => setSortOrder(option.key as 'asc' | 'desc')}>
                  <Text style={[
                    styles.filterOptionText,
                    sortOrder === option.key && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={clearFilters}>
                <Text style={styles.cancelButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={applyFilters}>
                <Text style={styles.saveButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 12,
  },
  headerActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryAction: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#c9a961',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#0f0f0f',
    fontFamily: 'Inter-SemiBold',
  },
  secondaryAction: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#c9a961',
    fontFamily: 'Inter-SemiBold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#c9a961',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginTop: 4,
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
  newsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  newsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  newsHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  newsImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  newsInfo: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  newsMeta: {
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
    marginLeft: 6,
  },
  newsExcerpt: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#cccccc',
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.2)',
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  featuredBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  featuredText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
  },
  readTimeBadge: {
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(102, 102, 102, 0.2)',
  },
  readTimeText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  moreButton: {
    padding: 8,
  },
  newsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.2)',
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  deleteText: {
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  saveButton: {
    backgroundColor: '#c9a961',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  // New styles for enhanced functionality
  filterButton: {
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginLeft: 12,
  },
  bulkBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  bulkSelectAll: {
    marginRight: 16,
  },
  bulkText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  bulkActions: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.2)',
  },
  bulkActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  featureButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  unfeatureButton: {
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    borderColor: 'rgba(102, 102, 102, 0.2)',
  },
  bulkCancel: {
    padding: 8,
  },
  bulkToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  bulkToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  bulkToggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  selectedCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
  },
  selectedCard: {
    borderColor: '#c9a961',
    backgroundColor: 'rgba(201, 169, 97, 0.05)',
  },
  checkbox: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666666',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  checkboxSelected: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
  },
  cardActions: {
    flexDirection: 'column',
    gap: 8,
  },
  featuredToggle: {
    padding: 8,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreviewLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  // Filter modal styles
  filterLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 12,
    marginTop: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterOptionSelected: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  filterOptionTextSelected: {
    color: '#000000',
  },
  // Image input styles
  imageInputContainer: {
    marginBottom: 16,
  },
  imageInputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 8,
  },
  imageUploadContainer: {
    marginBottom: 20,
    padding: 4,
  },
  uploadButton: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderWidth: 2,
    borderColor: '#c9a961',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 80,
    justifyContent: 'center',
  },
  uploadButtonContent: {
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#c9a961',
    marginBottom: 6,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#cccccc',
  },
  orText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#999999',
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  imagePreviewCard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formImagePreviewLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#cccccc',
    marginTop: 12,
    textAlign: 'center',
  },
  formImagePreviewWrapper: {
    position: 'relative',
    width: '100%',
  },
  formImagePreview: {
    width: '100%',
    aspectRatio: 16/9,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  removeImageText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    lineHeight: 20,
  },
  uploadStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.3)',
  },
  uploadStatusText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#c9a961',
    marginLeft: 10,
  },
});
