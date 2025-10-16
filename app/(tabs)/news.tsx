import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Calendar, ChevronRight, Clock, Filter, Search, Star, TrendingUp, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ImageBackground, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NewsArticle, newsService } from '../../services/newsService';

const { width } = Dimensions.get('window');

export default function NewsScreen() {
  const router = useRouter();
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'featured'>('date');
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    filterAndSortArticles();
  }, [newsArticles, searchQuery, selectedCategory, sortBy]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const articles = await newsService.getAllNews();
      setNewsArticles(articles);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortArticles = () => {
    let filtered = [...newsArticles];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'featured':
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        default:
          return 0;
      }
    });

    setFilteredArticles(filtered);
  };

  const handleImageLoad = (imageId: string) => {
    setImageLoading(prev => ({ ...prev, [imageId]: false }));
  };

  const handleImageError = (imageId: string) => {
    setImageLoading(prev => ({ ...prev, [imageId]: false }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const featuredNews = filteredArticles.find(item => item.featured);
  const regularNews = filteredArticles.filter(item => !item.featured);
  
  const categories = ['All', ...Array.from(new Set(newsArticles.map(article => article.category)))];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/church-background.jpg')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}>
        <LinearGradient
          colors={['rgba(15,15,15,0.85)', 'rgba(15,15,15,0.95)']}
          style={styles.gradient}>
          
          {/* New Modern Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>News & Updates</Text>
                <Text style={styles.headerSubtitle}>Stay connected with our community</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.searchButton}
                  onPress={() => setShowFilters(true)}>
                  <Search size={20} color="#c9a961" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.filterButton}
                  onPress={() => setShowFilters(true)}>
                  <Filter size={20} color="#c9a961" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <TrendingUp size={18} color="#c9a961" strokeWidth={2} />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{filteredArticles.length}</Text>
                  <Text style={styles.statLabel}>Articles</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Star size={18} color="#c9a961" strokeWidth={2} />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{featuredNews ? '1' : '0'}</Text>
                  <Text style={styles.statLabel}>Featured</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Clock size={18} color="#c9a961" strokeWidth={2} />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{categories.length - 1}</Text>
                  <Text style={styles.statLabel}>Categories</Text>
                </View>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <Search size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search articles, categories, or content..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                    <X size={16} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Category Pills */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryContent}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryPill,
                    selectedCategory === category && styles.categoryPillActive
                  ]}
                  onPress={() => setSelectedCategory(category)}>
                  <Text style={[
                    styles.categoryPillText,
                    selectedCategory === category && styles.categoryPillTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#c9a961" />
              <Text style={styles.loadingText}>Loading latest news...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#c9a961', '#b8941f']}
                  tintColor="#c9a961"
                  title="Pull to refresh"
                  titleColor="#c9a961"
                  progressBackgroundColor="#1a1a1a"
                />
              }>
              
              {/* Featured News Section - New Design */}
              {featuredNews && (
                <View style={styles.featuredSection}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                      <Star size={24} color="#c9a961" strokeWidth={2} />
                      <Text style={styles.sectionTitle}>Featured Story</Text>
                    </View>
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>HIGHLIGHT</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.featuredCard}
                    onPress={() => router.push(`/news/${featuredNews.id}`)}>
                    <View style={styles.featuredImageContainer}>
                      <ImageBackground
                        source={{ uri: featuredNews.imageUrl }}
                        style={styles.featuredImage}
                        imageStyle={styles.featuredImageStyle}>
                        <LinearGradient
                          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                          style={styles.featuredGradient}
                        />
                        <View style={styles.featuredOverlay}>
                          <View style={styles.featuredCategoryBadge}>
                            <Text style={styles.featuredCategoryText}>{featuredNews.category}</Text>
                          </View>
                        </View>
                      </ImageBackground>
                    </View>
                    
                    <View style={styles.featuredContent}>
                      <Text style={styles.featuredTitle}>{featuredNews.title}</Text>
                      <Text style={styles.featuredExcerpt} numberOfLines={3}>{featuredNews.excerpt}</Text>
                      
                      <View style={styles.featuredFooter}>
                        <View style={styles.featuredMeta}>
                          <View style={styles.featuredMetaItem}>
                            <Calendar size={14} color="#c9a961" strokeWidth={2} />
                            <Text style={styles.featuredMetaText}>{featuredNews.date}</Text>
                          </View>
                          <View style={styles.featuredMetaItem}>
                            <Clock size={14} color="#c9a961" strokeWidth={2} />
                            <Text style={styles.featuredMetaText}>{featuredNews.readTime}</Text>
                          </View>
                        </View>
                        <View style={styles.readMoreButton}>
                          <Text style={styles.readMoreText}>Read More</Text>
                          <ChevronRight size={16} color="#c9a961" strokeWidth={2} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* News Grid Section - New Design */}
              <View style={styles.newsSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <TrendingUp size={24} color="#c9a961" strokeWidth={2} />
                    <Text style={styles.sectionTitle}>Latest Updates</Text>
                  </View>
                  <View style={styles.articleCount}>
                    <Text style={styles.articleCountText}>{regularNews.length} Articles</Text>
                  </View>
                </View>

                {regularNews.length === 0 ? (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      <TrendingUp size={64} color="#666666" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.emptyTitle}>
                      {searchQuery || selectedCategory !== 'All' 
                        ? 'No articles found' 
                        : 'No news available'
                      }
                    </Text>
                    <Text style={styles.emptyDescription}>
                      {searchQuery || selectedCategory !== 'All'
                        ? 'Try adjusting your search terms or filters'
                        : 'Check back later for the latest updates'
                      }
                    </Text>
                    {(searchQuery || selectedCategory !== 'All') && (
                      <TouchableOpacity 
                        style={styles.clearFiltersButton}
                        onPress={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                        }}>
                        <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View style={styles.newsGrid}>
                    {regularNews.map((item, index) => (
                      <TouchableOpacity 
                        key={item.id} 
                        style={[
                          styles.newsCard,
                          index === 0 && styles.newsCardFirst
                        ]}
                        onPress={() => router.push(`/news/${item.id}`)}>
                        
                        <View style={styles.newsImageContainer}>
                          <ImageBackground
                            source={{ uri: item.imageUrl }}
                            style={styles.newsImage}
                            imageStyle={styles.newsImageStyle}
                            onLoad={() => handleImageLoad(item.id)}
                            onError={() => handleImageError(item.id)}>
                            <LinearGradient
                              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
                              style={styles.newsImageGradient}
                            />
                            {imageLoading[item.id] && (
                              <View style={styles.imageLoadingContainer}>
                                <ActivityIndicator size="small" color="#c9a961" />
                              </View>
                            )}
                            <View style={styles.newsCategoryBadge}>
                              <Text style={styles.newsCategoryText}>{item.category}</Text>
                            </View>
                          </ImageBackground>
                        </View>
                        
                        <View style={styles.newsContent}>
                          <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                          <Text style={styles.newsExcerpt} numberOfLines={3}>{item.excerpt}</Text>
                          
                          <View style={styles.newsFooter}>
                            <View style={styles.newsMeta}>
                              <View style={styles.newsMetaItem}>
                                <Clock size={12} color="#999" strokeWidth={2} />
                                <Text style={styles.newsMetaText}>{item.readTime}</Text>
                              </View>
                              <View style={styles.newsMetaItem}>
                                <Calendar size={12} color="#999" strokeWidth={2} />
                                <Text style={styles.newsMetaText}>{item.date}</Text>
                              </View>
                            </View>
                            <View style={styles.readMoreIndicator}>
                              <ChevronRight size={16} color="#c9a961" strokeWidth={2} />
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </LinearGradient>
      </ImageBackground>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowFilters(true)}>
        <LinearGradient
          colors={['#c9a961', '#b8941f']}
          style={styles.fabGradient}>
          <Search size={24} color="#ffffff" strokeWidth={2} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color="#c9a961" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              {['date', 'title', 'featured'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sortOption,
                    sortBy === option && styles.sortOptionActive
                  ]}
                  onPress={() => setSortBy(option as 'date' | 'title' | 'featured')}>
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === option && styles.sortOptionTextActive
                  ]}>
                    {option === 'date' ? 'Date (Newest First)' : 
                     option === 'title' ? 'Title (A-Z)' : 
                     'Featured First'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    selectedCategory === category && styles.categoryOptionActive
                  ]}
                  onPress={() => setSelectedCategory(category)}>
                  <Text style={[
                    styles.categoryOptionText,
                    selectedCategory === category && styles.categoryOptionTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.2,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#0f0f0f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    backgroundColor: 'rgba(201, 169, 97, 0.15)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.4)',
    shadowColor: '#c9a961',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 169, 97, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#c9a961',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999999',
  },
  searchSection: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter-Regular',
  },
  clearButton: {
    padding: 4,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryContent: {
    paddingRight: 20,
  },
  categoryPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryPillActive: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
  },
  categoryPillText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  categoryPillTextActive: {
    color: '#000000',
  },
  headerTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: width < 400 ? 28 : 32,
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#c9a961',
    lineHeight: 22,
  },
  filterButton: {
    backgroundColor: 'rgba(201, 169, 97, 0.15)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.4)',
    shadowColor: '#c9a961',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
  },
  featuredBadge: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.3)',
  },
  featuredBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#c9a961',
    letterSpacing: 1,
  },
  featuredCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  featuredImageContainer: {
    height: 200,
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
  },
  featuredOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  featuredCategoryBadge: {
    backgroundColor: 'rgba(201, 169, 97, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featuredCategoryText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#000000',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  featuredContent: {
    padding: 24,
  },
  featuredTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  featuredExcerpt: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#cccccc',
    lineHeight: 22,
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredMetaText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#999999',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readMoreText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#c9a961',
  },
  newsSection: {
    paddingHorizontal: 20,
  },
  articleCount: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.3)',
  },
  articleCountText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#c9a961',
  },
  newsGrid: {
    gap: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  newsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  newsCardFirst: {
    borderColor: 'rgba(201, 169, 97, 0.4)',
    borderWidth: 2,
    shadowColor: '#c9a961',
    shadowOpacity: 0.15,
  },
  newsImageContainer: {
    height: 160,
  },
  newsImage: {
    flex: 1,
    width: '100%',
  },
  newsImageStyle: {
    resizeMode: 'cover',
  },
  newsImageGradient: {
    flex: 1,
  },
  newsCategoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(201, 169, 97, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newsCategoryText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#000000',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  newsContent: {
    padding: 20,
  },
  newsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  newsExcerpt: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  newsMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newsMetaText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#999999',
  },
  readMoreIndicator: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  clearFiltersButton: {
    backgroundColor: '#c9a961',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  clearFiltersText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#000000',
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
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
  },
  sortOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortOptionActive: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderColor: '#c9a961',
  },
  sortOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
  },
  sortOptionTextActive: {
    color: '#c9a961',
    fontFamily: 'Inter-SemiBold',
  },
  categoryOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryOptionActive: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderColor: '#c9a961',
  },
  categoryOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
  },
  categoryOptionTextActive: {
    color: '#c9a961',
    fontFamily: 'Inter-SemiBold',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#c9a961',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
