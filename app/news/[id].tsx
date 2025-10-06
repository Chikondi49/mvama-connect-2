import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Share2, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { NewsArticle, newsService } from '../../services/newsService';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      if (id) {
        const articleData = await newsService.getNewsById(id);
        setArticle(articleData);
      }
    } catch (error) {
      console.error('Error loading article:', error);
      Alert.alert('Error', 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!article) return;
    
    try {
      await Share.share({
        message: `Check out this news: ${article.title}\n\n${article.excerpt}`,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a961" />
        <Text style={styles.loadingText}>Loading article...</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Article not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Image */}
        <ImageBackground
          source={{ uri: article.imageUrl }}
          style={styles.featuredImage}
          imageStyle={styles.featuredImageStyle}>
          <LinearGradient
            colors={['rgba(15,15,15,0.3)', 'rgba(15,15,15,0.8)']}
            style={styles.imageGradient}>
            <View style={styles.imageContent}>
              <Text style={styles.category}>{article.category}</Text>
              <Text style={styles.title}>{article.title}</Text>
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <User size={14} color="#cccccc" strokeWidth={2} />
                  <Text style={styles.metaText}>{article.author}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Calendar size={14} color="#cccccc" strokeWidth={2} />
                  <Text style={styles.metaText}>{article.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#cccccc" strokeWidth={2} />
                  <Text style={styles.metaText}>{article.readTime}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Article Content */}
        <View style={styles.articleContent}>
          <Text style={styles.excerpt}>{article.excerpt}</Text>
          
          <View style={styles.contentDivider} />
          
          <Text style={styles.contentText}>{article.content}</Text>
          
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Tags:</Text>
              <View style={styles.tagsList}>
                {article.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
  },
  content: {
    flex: 1,
  },
  featuredImage: {
    width: '100%',
    height: 300,
    marginTop: 100, // Account for header
  },
  featuredImageStyle: {
    resizeMode: 'cover',
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageContent: {
    padding: 24,
  },
  category: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#c9a961',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Playfair-Bold',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 16,
    lineHeight: 36,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#cccccc',
  },
  articleContent: {
    padding: 24,
  },
  excerpt: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#ffffff',
    lineHeight: 28,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  contentDivider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginVertical: 24,
  },
  contentText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 26,
    marginBottom: 32,
  },
  tagsContainer: {
    marginTop: 24,
  },
  tagsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#c9a961',
    marginBottom: 12,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999999',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    padding: 24,
  },
  errorText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
});
