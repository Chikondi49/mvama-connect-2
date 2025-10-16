import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BarChart3, Calendar, FileText, Headphones, TrendingUp, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AudioSermon, audioSermonService } from '../../services/audioSermonService';
import { Event, eventService } from '../../services/eventService';
import { NewsArticle, newsService } from '../../services/newsService';

interface DashboardStats {
  totalSermons: number;
  totalSeries: number;
  totalEvents: number;
  totalNews: number;
  recentSermons: AudioSermon[];
  recentEvents: Event[];
  recentNews: NewsArticle[];
  totalViews: number;
  totalDownloads: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [sermons, series, events, news] = await Promise.all([
        audioSermonService.getAllAudioSermons(),
        audioSermonService.getAllAudioSeries(),
        eventService.getAllEvents(),
        newsService.getAllNews()
      ]);

      // Calculate stats
      const totalViews = sermons.reduce((sum, sermon) => sum + (sermon.viewCount || 0), 0);
      const totalDownloads = sermons.reduce((sum, sermon) => sum + (sermon.downloadCount || 0), 0);

      setStats({
        totalSermons: sermons.length,
        totalSeries: series.length,
        totalEvents: events.length,
        totalNews: news.length,
        recentSermons: sermons.slice(0, 5),
        recentEvents: events.slice(0, 5),
        recentNews: news.slice(0, 5),
        totalViews,
        totalDownloads,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Set fallback data if services fail
      setStats({
        totalSermons: 0,
        totalSeries: 0,
        totalEvents: 0,
        totalNews: 0,
        recentSermons: [],
        recentEvents: [],
        recentNews: [],
        totalViews: 0,
        totalDownloads: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a961" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load dashboard data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.modernHeader}>
        <LinearGradient
          colors={['#1a1a1a', '#0f0f0f']}
          style={styles.headerGradient}>
          <Text style={styles.modernHeaderTitle}>Admin Dashboard</Text>
          <Text style={styles.modernHeaderSubtitle}>Content Management System</Text>
        </LinearGradient>
      </View>

      {/* Stats Grid */}
      <View style={styles.modernStatsContainer}>
        <View style={styles.modernStatCard}>
          <LinearGradient
            colors={['#c9a961', '#b8941f']}
            style={styles.modernStatGradient}>
            <View style={styles.modernStatIconContainer}>
              <Headphones size={28} color="#ffffff" />
            </View>
            <View style={styles.modernStatTextContainer}>
              <Text style={styles.modernStatNumber}>{stats.totalSermons}</Text>
              <Text style={styles.modernStatLabel}>Audio Sermons</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.modernStatCard}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.modernStatGradient}>
            <View style={styles.modernStatIconContainer}>
              <FileText size={28} color="#ffffff" />
            </View>
            <View style={styles.modernStatTextContainer}>
              <Text style={styles.modernStatNumber}>{stats.totalSeries}</Text>
              <Text style={styles.modernStatLabel}>Podcast Series</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.modernStatCard}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.modernStatGradient}>
            <View style={styles.modernStatIconContainer}>
              <Calendar size={28} color="#ffffff" />
            </View>
            <View style={styles.modernStatTextContainer}>
              <Text style={styles.modernStatNumber}>{stats.totalEvents}</Text>
              <Text style={styles.modernStatLabel}>Events</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.modernStatCard}>
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.modernStatGradient}>
            <View style={styles.modernStatIconContainer}>
              <Users size={28} color="#ffffff" />
            </View>
            <View style={styles.modernStatTextContainer}>
              <Text style={styles.modernStatNumber}>{stats.totalNews}</Text>
              <Text style={styles.modernStatLabel}>News Articles</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Analytics */}
      <View style={styles.modernAnalyticsSection}>
        <Text style={styles.modernSectionTitle}>Analytics</Text>
        <View style={styles.modernAnalyticsGrid}>
          <View style={styles.modernAnalyticsCard}>
            <LinearGradient
              colors={['#1a1a1a', '#2a2a2a']}
              style={styles.modernAnalyticsGradient}>
              <View style={styles.modernAnalyticsIconContainer}>
                <TrendingUp size={24} color="#c9a961" />
              </View>
              <View style={styles.modernAnalyticsTextContainer}>
                <Text style={styles.modernAnalyticsNumber}>{stats.totalViews.toLocaleString()}</Text>
                <Text style={styles.modernAnalyticsLabel}>Total Views</Text>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.modernAnalyticsCard}>
            <LinearGradient
              colors={['#1a1a1a', '#2a2a2a']}
              style={styles.modernAnalyticsGradient}>
              <View style={styles.modernAnalyticsIconContainer}>
                <BarChart3 size={24} color="#c9a961" />
              </View>
              <View style={styles.modernAnalyticsTextContainer}>
                <Text style={styles.modernAnalyticsNumber}>{stats.totalDownloads.toLocaleString()}</Text>
                <Text style={styles.modernAnalyticsLabel}>Downloads</Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Recent Content */}
      <View style={styles.modernRecentSection}>
        <Text style={styles.modernSectionTitle}>Recent Content</Text>
        
        {/* Recent Sermons */}
        <View style={styles.modernRecentCard}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.modernRecentGradient}>
            <Text style={styles.modernRecentCardTitle}>Latest Sermons</Text>
            {stats.recentSermons.map((sermon, index) => (
              <View key={sermon.id} style={styles.modernRecentItem}>
                <Text style={styles.modernRecentItemTitle} numberOfLines={1}>
                  {sermon.title}
                </Text>
                <Text style={styles.modernRecentItemMeta}>
                  {sermon.speaker} • {sermon.duration}
                </Text>
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* Recent Events */}
        <View style={styles.modernRecentCard}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.modernRecentGradient}>
            <Text style={styles.modernRecentCardTitle}>Upcoming Events</Text>
            {stats.recentEvents.map((event, index) => (
              <View key={event.id} style={styles.modernRecentItem}>
                <Text style={styles.modernRecentItemTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={styles.modernRecentItemMeta}>
                  {event.date} • {event.time}
                </Text>
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* Recent News */}
        <View style={styles.modernRecentCard}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.modernRecentGradient}>
            <Text style={styles.modernRecentCardTitle}>Latest News</Text>
            {stats.recentNews.map((article, index) => (
              <View key={article.id} style={styles.modernRecentItem}>
                <Text style={styles.modernRecentItemTitle} numberOfLines={1}>
                  {article.title}
                </Text>
                <Text style={styles.modernRecentItemMeta}>
                  {article.author} • {new Date(article.publishedAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </LinearGradient>
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
  // Modern Header Styles
  modernHeader: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#c9a961',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  modernHeaderTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  modernHeaderSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
    textAlign: 'center',
  },
  // Modern Stats Styles
  modernStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  modernStatCard: {
    width: '47%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernStatGradient: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernStatIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modernStatTextContainer: {
    flex: 1,
  },
  modernStatNumber: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  modernStatLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    opacity: 0.9,
  },
  // Modern Analytics Styles
  modernAnalyticsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  modernSectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modernAnalyticsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  modernAnalyticsCard: {
    flex: 1,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernAnalyticsGradient: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernAnalyticsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modernAnalyticsTextContainer: {
    flex: 1,
  },
  modernAnalyticsNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  modernAnalyticsLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  // Modern Recent Content Styles
  modernRecentSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modernRecentCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernRecentGradient: {
    padding: 20,
  },
  modernRecentCardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modernRecentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 97, 0.2)',
  },
  modernRecentItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 6,
  },
  modernRecentItemMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: '47%',
    height: 120,
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
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginTop: 4,
    textAlign: 'center',
  },
  analyticsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  analyticsNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginTop: 8,
  },
  analyticsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
    marginTop: 4,
  },
  recentSection: {
    padding: 20,
    paddingTop: 0,
  },
  recentCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  recentCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  recentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  recentItemTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 4,
  },
  recentItemMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
  },
});
