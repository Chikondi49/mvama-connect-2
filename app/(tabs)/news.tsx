import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NewsArticle, newsService } from '../../services/newsService';

export default function NewsScreen() {
  const router = useRouter();
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const featuredNews = newsArticles.find(item => item.featured);
  const regularNews = newsArticles.filter(item => !item.featured);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>News</Text>
        <Text style={styles.headerSubtitle}>Stay connected with our community</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c9a961" />
          <Text style={styles.loadingText}>Loading news...</Text>
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
              colors={['#c9a961']}
              tintColor="#c9a961"
            />
          }>
          

          {featuredNews && (
            <TouchableOpacity 
              style={styles.featuredCard}
              onPress={() => router.push(`/news/${featuredNews.id}`)}>
              <ImageBackground
                source={{ uri: featuredNews.imageUrl }}
                style={styles.featuredImage}
                imageStyle={styles.featuredImageStyle}>
                <LinearGradient
                  colors={['rgba(15,15,15,0)', 'rgba(15,15,15,0.9)']}
                  style={styles.featuredGradient}>
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredCategory}>{featuredNews.category}</Text>
                    <Text style={styles.featuredTitle}>{featuredNews.title}</Text>
                    <View style={styles.featuredMeta}>
                      <Text style={styles.featuredDate}>{featuredNews.date}</Text>
                      <Text style={styles.featuredDivider}>•</Text>
                      <Text style={styles.featuredTime}>{featuredNews.time}</Text>
                      <Text style={styles.featuredDivider}>•</Text>
                      <Text style={styles.featuredReadTime}>{featuredNews.readTime}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Updates</Text>

            {regularNews.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No news articles available</Text>
                <Text style={styles.emptySubtext}>Check back later for updates</Text>
              </View>
            ) : (
              regularNews.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.newsCard}
                  onPress={() => router.push(`/news/${item.id}`)}>
                  <ImageBackground
                    source={{ uri: item.imageUrl }}
                    style={styles.newsImage}
                    imageStyle={styles.newsImageStyle}>
                    <LinearGradient
                      colors={['rgba(15,15,15,0.3)', 'rgba(15,15,15,0.8)']}
                      style={styles.newsImageGradient}
                    />
                  </ImageBackground>
                  <View style={styles.newsInfo}>
                    <Text style={styles.newsCategory}>{item.category}</Text>
                    <Text style={styles.newsTitle}>{item.title}</Text>
                    <Text style={styles.newsExcerpt}>{item.excerpt}</Text>
                    <View style={styles.newsMeta}>
                      <Clock size={14} color="#666666" strokeWidth={2} />
                      <Text style={styles.newsMetaText}>{item.readTime}</Text>
                      <Text style={styles.newsMetaDivider}>•</Text>
                      <Text style={styles.newsMetaText}>{item.date}</Text>
                      <Text style={styles.newsMetaDivider}>•</Text>
                      <Text style={styles.newsMetaText}>{item.time}</Text>
                      <ChevronRight size={16} color="#c9a961" style={styles.newsArrow} strokeWidth={2} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}
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
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
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
    height: 320,
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
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 24,
  },
  featuredCategory: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#c9a961',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 26,
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 34,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#cccccc',
  },
  featuredDivider: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#cccccc',
  },
  featuredReadTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#cccccc',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 16,
  },
  newsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  newsImage: {
    width: '100%',
    height: 140,
  },
  newsImageStyle: {
    resizeMode: 'cover',
  },
  newsImageGradient: {
    flex: 1,
  },
  newsInfo: {
    padding: 16,
  },
  newsCategory: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#c9a961',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  newsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsExcerpt: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newsMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#666666',
  },
  newsMetaDivider: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#666666',
  },
  newsArrow: {
    marginLeft: 'auto',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999999',
    marginTop: 12,
  },
  featuredTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#cccccc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
