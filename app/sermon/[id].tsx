import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Share2, Download, ExternalLink } from 'lucide-react-native';
import YouTubePlayer from '../../components/YouTubePlayer';
import { youtubeService, YouTubeVideo } from '../../services/youtubeService';

export default function SermonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sermon, setSermon] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSermon();
  }, [id]);

  const loadSermon = async () => {
    try {
      setLoading(true);
      // Get all videos and find the one with matching ID
      const videos = await youtubeService.getChannelVideos();
      const foundSermon = videos.find(video => video.id === id);
      setSermon(foundSermon || null);
    } catch (error) {
      console.error('Error loading sermon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!sermon) return;
    
    try {
      const watchUrl = youtubeService.getWatchUrl(sermon.id);
      await Share.share({
        message: `Check out this sermon: "${sermon.title}" - ${watchUrl}`,
        url: watchUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOpenInYouTube = () => {
    if (!sermon) return;
    
    const watchUrl = youtubeService.getWatchUrl(sermon.id);
    Alert.alert(
      'Open in YouTube',
      'This will open the video in your YouTube app or browser.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => {
          // In a real app, you would use Linking.openURL(watchUrl)
          console.log('Opening:', watchUrl);
        }},
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading sermon...</Text>
      </View>
    );
  }

  if (!sermon) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Sermon not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Share2 size={20} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleOpenInYouTube}>
            <ExternalLink size={20} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.videoContainer}>
          <YouTubePlayer videoId={sermon.id} height={220} />
        </View>

        <View style={styles.sermonInfo}>
          <Text style={styles.category}>Sunday Service</Text>
          <Text style={styles.title}>{sermon.title}</Text>
          <Text style={styles.pastor}>{sermon.channelTitle}</Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              {youtubeService.formatPublishedDate(sermon.publishedAt)}
            </Text>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={styles.metaText}>{sermon.duration}</Text>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={styles.metaText}>{sermon.viewCount} views</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Download size={18} color="#c9a961" strokeWidth={2} />
              <Text style={styles.actionText}>Download</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About this sermon</Text>
            <Text style={styles.description}>{sermon.description}</Text>
          </View>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sermonInfo: {
    paddingHorizontal: 20,
  },
  category: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#c9a961',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 32,
  },
  pastor: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999999',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#666666',
  },
  metaDivider: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#666666',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 8,
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#c9a961',
  },
  descriptionContainer: {
    marginBottom: 40,
  },
  descriptionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#cccccc',
    lineHeight: 24,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999999',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ff6b6b',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#c9a961',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
});
