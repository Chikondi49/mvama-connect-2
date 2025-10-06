import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Clock, Download, Headphones, ListMusic, Pause, Play, Search, SkipBack, SkipForward, Users, Video } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { audioSermonService } from '../../services/audioSermonService';
import { youtubeService, YouTubeVideo } from '../../services/youtubeService';

const categories = ['All', 'Recent', 'Sunday Service', 'Morning Devotion', 'Evening Devotion'];

// Podcast Episode Interface
interface PodcastEpisode {
  id: string;
  title: string;
  speaker: string;
  duration: string;
  audioUrl: string;
  publishedAt: string;
  description: string;
  episodeNumber: number;
  downloadUrl?: string;
}

// Podcast Series Interface
interface PodcastSeries {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  speaker: string;
  totalEpisodes: number;
  category: string;
  episodes: PodcastEpisode[];
}

// Mock Podcast Series Data
const mockPodcastSeries: PodcastSeries[] = [
  {
    id: 'series-1',
    title: 'Sunday Service Messages',
    description: 'Weekly Sunday service messages from MVAMA CCAP Nkhoma Synod, delivering powerful biblical teachings and spiritual guidance.',
    coverImage: 'https://images.pexels.com/photos/8468012/pexels-photo-8468012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    speaker: 'Rev. Yassin Gammah',
    totalEpisodes: 4,
    category: 'Sunday Service',
    episodes: [
      {
        id: 'episode-1-1',
        title: 'The Power of Faith in Difficult Times',
        speaker: 'Rev. Yassin Gammah',
        duration: '42:15',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        publishedAt: '2024-11-10T10:00:00Z',
        description: 'A powerful message about maintaining faith during challenging seasons of life.',
        episodeNumber: 1,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      },
      {
        id: 'episode-1-2',
        title: 'Walking in God\'s Purpose',
        speaker: 'Rev. Yassin Gammah',
        duration: '38:30',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        publishedAt: '2024-11-03T10:00:00Z',
        description: 'Discover your divine calling and learn how to align your life with God\'s perfect plan.',
        episodeNumber: 2,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
      },
      {
        id: 'episode-1-3',
        title: 'The Grace That Transforms',
        speaker: 'Rev. Yassin Gammah',
        duration: '45:20',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        publishedAt: '2024-10-27T10:00:00Z',
        description: 'An inspiring message about the transformative power of God\'s grace in our daily lives.',
        episodeNumber: 3,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
      },
      {
        id: 'episode-1-4',
        title: 'Building Strong Christian Families',
        speaker: 'Rev. Yassin Gammah',
        duration: '40:15',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        publishedAt: '2024-10-20T10:00:00Z',
        description: 'Biblical principles for building and maintaining strong, Christ-centered families.',
        episodeNumber: 4,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
      }
    ]
  },
  {
    id: 'series-2',
    title: 'Morning Devotions',
    description: 'Daily morning devotions to start your day with God\'s word and spiritual encouragement.',
    coverImage: 'https://images.pexels.com/photos/8828591/pexels-photo-8828591.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    speaker: 'Rev. Yassin Gammah',
    totalEpisodes: 3,
    category: 'Morning Devotion',
    episodes: [
      {
        id: 'episode-2-1',
        title: 'Trusting God\'s Timing',
        speaker: 'Rev. Yassin Gammah',
        duration: '25:30',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        publishedAt: '2024-11-08T06:00:00Z',
        description: 'Learning to trust in God\'s perfect timing for your life.',
        episodeNumber: 1,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
      },
      {
        id: 'episode-2-2',
        title: 'The Joy of the Lord',
        speaker: 'Rev. Yassin Gammah',
        duration: '22:45',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        publishedAt: '2024-11-05T06:00:00Z',
        description: 'Finding joy in the Lord as your strength for each day.',
        episodeNumber: 2,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
      },
      {
        id: 'episode-2-3',
        title: 'Walking in Victory',
        speaker: 'Rev. Yassin Gammah',
        duration: '28:15',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        publishedAt: '2024-11-01T06:00:00Z',
        description: 'Understanding your victory in Christ and living it out daily.',
        episodeNumber: 3,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
      }
    ]
  },
  {
    id: 'series-3',
    title: 'Evening Reflections',
    description: 'Peaceful evening reflections to end your day with God\'s peace and wisdom.',
    coverImage: 'https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    speaker: 'Rev. Yassin Gammah',
    totalEpisodes: 2,
    category: 'Evening Devotion',
    episodes: [
      {
        id: 'episode-3-1',
        title: 'Finding Peace in Chaos',
        speaker: 'Rev. Yassin Gammah',
        duration: '20:30',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        publishedAt: '2024-11-07T18:00:00Z',
        description: 'Finding God\'s peace in the midst of life\'s storms.',
        episodeNumber: 1,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
      },
      {
        id: 'episode-3-2',
        title: 'Rest in His Presence',
        speaker: 'Rev. Yassin Gammah',
        duration: '18:45',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        publishedAt: '2024-11-04T18:00:00Z',
        description: 'Learning to rest in God\'s presence and find true peace.',
        episodeNumber: 2,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
      }
    ]
  }
];

export default function SermonsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'audio' | 'video'>('audio');
  const [sermons, setSermons] = useState<YouTubeVideo[]>([]);
  const [podcastSeries, setPodcastSeries] = useState<PodcastSeries[]>([]);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<PodcastSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const [showGlobalPlayer, setShowGlobalPlayer] = useState(false);

  useEffect(() => {
    loadSermons();
    loadAudioSermons();
    return () => {
      // Cleanup audio when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadSermons = async () => {
    try {
      setLoading(true);
      console.log('📺 Loading video sermons...');
      const videos = await youtubeService.getChannelVideos();
      console.log('📊 Loaded video sermons:', videos.length);
      setSermons(videos);
    } catch (error) {
      console.error('❌ Error loading video sermons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAudioSermons = async () => {
    try {
      setLoadingAudio(true);
      console.log('🎵 Loading audio sermons from Firestore...');
      
      // Load audio series from Firestore
      const series = await audioSermonService.getAllAudioSeries();
      console.log(`✅ Loaded ${series.length} audio series from Firestore`);
      
      // Convert AudioSeries to PodcastSeries format
      const podcastSeriesData: PodcastSeries[] = await Promise.all(
        series.map(async (audioSeries) => {
          // Get episodes for this series
          const episodes = await audioSermonService.getEpisodesBySeries(audioSeries.id);
          
          return {
            id: audioSeries.id,
            title: audioSeries.title,
            description: audioSeries.description,
            coverImage: audioSeries.coverImage,
            speaker: audioSeries.speaker,
            totalEpisodes: audioSeries.totalEpisodes,
            category: audioSeries.category,
            episodes: episodes.map(episode => ({
              id: episode.id,
              title: episode.title,
              speaker: episode.speaker,
              duration: episode.duration,
              audioUrl: episode.audioUrl,
              publishedAt: episode.publishedAt,
              description: episode.description,
              episodeNumber: episode.episodeNumber || 1,
              downloadUrl: episode.downloadUrl,
            }))
          };
        })
      );
      
      setPodcastSeries(podcastSeriesData);
      console.log(`✅ Converted ${podcastSeriesData.length} series to podcast format`);
      
    } catch (error) {
      console.error('❌ Error loading audio sermons:', error);
      // Fallback to mock data if Firestore fails
      setPodcastSeries(mockPodcastSeries);
    } finally {
      setLoadingAudio(false);
    }
  };

  // Generate mock waveform data
  const generateWaveformData = (duration: number) => {
    const data = [];
    const points = 100; // Number of waveform points
    for (let i = 0; i < points; i++) {
      data.push(Math.random() * 0.8 + 0.1); // Random amplitude between 0.1 and 0.9
    }
    return data;
  };

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio Player Functions
  const playAudio = async (episode: PodcastEpisode) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      if (playingAudio === episode.id) {
        // Pause if currently playing
        await sound?.pauseAsync();
        setPlayingAudio(null);
        setIsPlaying(false);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: episode.audioUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setPlayingAudio(episode.id);
      setCurrentEpisode(episode);
      setIsPlaying(true);
      setShowGlobalPlayer(true);
      setIsPlayerMinimized(false);

      // Generate waveform data
      const episodeDuration = parseFloat(episode.duration.replace(':', '.')) * 60; // Convert MM:SS to seconds
      setDuration(episodeDuration);
      setWaveformData(generateWaveformData(episodeDuration));

      newSound.setOnPlaybackStatusUpdate((status) => {
        setPlaybackStatus(status);
        if (status.isLoaded) {
          setCurrentTime(status.positionMillis / 1000);
          setIsPlaying(status.isPlaying);
          
          if (status.didJustFinish) {
            setPlayingAudio(null);
            setCurrentEpisode(null);
            setIsPlaying(false);
            setCurrentTime(0);
          }
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const seekTo = async (position: number) => {
    if (sound && playbackStatus?.isLoaded) {
      await sound.setPositionAsync(position * 1000); // Convert to milliseconds
    }
  };

  const skipForward = async () => {
    if (sound && playbackStatus?.isLoaded) {
      const newPosition = Math.min(currentTime + 15, duration); // Skip 15 seconds
      await seekTo(newPosition);
    }
  };

  const skipBackward = async () => {
    if (sound && playbackStatus?.isLoaded) {
      const newPosition = Math.max(currentTime - 15, 0); // Skip back 15 seconds
      await seekTo(newPosition);
    }
  };

  const downloadAudio = async (episode: PodcastEpisode) => {
    // This would implement actual download functionality
    console.log('Downloading audio:', episode.title);
    // In a real app, you'd use expo-file-system to download the file
  };

  const openSeries = (series: PodcastSeries) => {
    setSelectedSeries(series);
  };

  const goBackToSeries = () => {
    setSelectedSeries(null);
  };

  const minimizePlayer = () => {
    setIsPlayerMinimized(true);
  };

  const expandPlayer = () => {
    setIsPlayerMinimized(false);
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setPlayingAudio(null);
    setCurrentEpisode(null);
    setIsPlaying(false);
    setShowGlobalPlayer(false);
    setIsPlayerMinimized(false);
    setCurrentTime(0);
  };

  // Global Minimizable Player Component
  const GlobalPlayer = () => {
    if (!showGlobalPlayer || !currentEpisode) return null;

    return (
      <View style={styles.globalPlayerContainer}>
        <View style={styles.globalPlayerContent}>
          <View style={styles.globalPlayerInfo}>
            <Text style={styles.globalPlayerTitle} numberOfLines={1}>
              {currentEpisode.title}
            </Text>
            <Text style={styles.globalPlayerSeries} numberOfLines={1}>
              {selectedSeries?.title}
            </Text>
          </View>
          
          <View style={styles.globalPlayerControls}>
            <TouchableOpacity style={styles.globalControlButton} onPress={skipBackward}>
              <SkipBack size={16} color="#c9a961" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.globalPlayButton} 
              onPress={() => currentEpisode && playAudio(currentEpisode)}>
              {isPlaying ? (
                <Pause size={20} color="#ffffff" fill="#ffffff" />
              ) : (
                <Play size={20} color="#ffffff" fill="#ffffff" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.globalControlButton} onPress={skipForward}>
              <SkipForward size={16} color="#c9a961" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.globalPlayerActions}>
            <TouchableOpacity 
              style={styles.globalActionButton} 
              onPress={isPlayerMinimized ? expandPlayer : minimizePlayer}>
              {isPlayerMinimized ? (
                <Text style={styles.globalActionText}>↑</Text>
              ) : (
                <Text style={styles.globalActionText}>↓</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.globalActionButton} 
              onPress={stopAudio}>
              <Text style={styles.globalActionText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {!isPlayerMinimized && (
          <View style={styles.globalPlayerExpanded}>
            <View style={styles.globalWaveformSection}>
              <View style={styles.waveformWithTime}>
                <Text style={styles.waveformTimeText}>{formatTime(currentTime)}</Text>
                <WaveformComponent 
                  data={waveformData} 
                  progress={currentTime} 
                  onSeek={seekTo} 
                />
                <Text style={styles.waveformTimeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Waveform Component
  const WaveformComponent = ({ data, progress, onSeek }: { data: number[], progress: number, onSeek: (position: number) => void }) => {
    const width = 300;
    const height = 24;
    const barWidth = width / data.length;
    
    const handlePress = (event: any) => {
      const { locationX } = event.nativeEvent;
      const position = (locationX / width) * duration;
      onSeek(position);
    };

    return (
      <TouchableOpacity onPress={handlePress} style={styles.waveformContainer}>
        <Svg width={width} height={height}>
          {data.map((amplitude, index) => {
            const barHeight = amplitude * height;
            const x = index * barWidth;
            const y = (height - barHeight) / 2;
            const isPlayed = (index / data.length) < (progress / duration);
            
            return (
              <Path
                key={index}
                d={`M${x} ${y} L${x} ${y + barHeight}`}
                stroke={isPlayed ? '#c9a961' : '#333333'}
                strokeWidth={1}
                strokeLinecap="round"
              />
            );
          })}
          {/* Progress indicator */}
          <Circle
            cx={(progress / duration) * width}
            cy={height / 2}
            r={3}
            fill="#c9a961"
          />
        </Svg>
      </TouchableOpacity>
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSermons();
    setRefreshing(false);
  };

  const isRecent = (publishedAt: string): boolean => {
    const publishDate = new Date(publishedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - publishDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30; // Consider videos from last 30 days as recent
  };

  // Filter podcast series
  const filteredPodcastSeries = podcastSeries.filter(series => {
    const matchesSearch = series.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         series.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = false;
    
    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else if (selectedCategory === 'Recent') {
      // Check if any episode in the series is recent
      matchesCategory = series.episodes.some(episode => isRecent(episode.publishedAt));
    } else {
      matchesCategory = series.category === selectedCategory;
    }
    
    return matchesSearch && matchesCategory;
  });

  // Filter episodes within a series
  const filteredEpisodes = selectedSeries ? selectedSeries.episodes.filter(episode => {
    const matchesSearch = episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         episode.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = false;
    
    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else if (selectedCategory === 'Recent') {
      matchesCategory = isRecent(episode.publishedAt);
    } else {
      matchesCategory = selectedSeries.category === selectedCategory;
    }
    
    return matchesSearch && matchesCategory;
  }) : [];

  // Filter video sermons
  const filteredVideoSermons = sermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sermon.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = false;
    
    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else if (selectedCategory === 'Recent') {
      matchesCategory = isRecent(sermon.publishedAt);
    } else if (selectedCategory === 'Sunday Service') {
      const content = (sermon.title + ' ' + sermon.description).toLowerCase();
      matchesCategory = content.includes('sunday') || content.includes('service') || 
                       content.includes('worship') || content.includes('morning');
    } else if (selectedCategory === 'Morning Devotion') {
      const content = (sermon.title + ' ' + sermon.description).toLowerCase();
      matchesCategory = content.includes('morning') || content.includes('devotion') || 
                       content.includes('daily') || content.includes('meditation') ||
                       content.includes('quiet time') || content.includes('dawn');
    } else if (selectedCategory === 'Evening Devotion') {
      const content = (sermon.title + ' ' + sermon.description).toLowerCase();
      matchesCategory = content.includes('evening') || content.includes('night') || 
                       content.includes('vespers') || content.includes('twilight') ||
                       content.includes('sunset') || content.includes('dusk');
    }
    
    return matchesSearch && matchesCategory;
  });

  const handleSermonPress = (sermon: YouTubeVideo) => {
    router.push(`/sermon/${sermon.id}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Global Player */}
      <GlobalPlayer />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sermons</Text>
        <Text style={styles.headerSubtitle}>Messages from MVAMA CCAP Nkhoma Synod</Text>
        <View style={styles.channelInfo}>
          <Users size={16} color="#c9a961" strokeWidth={2} />
          <Text style={styles.channelText}>Rev. Yassin Gammah</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'audio' && styles.activeTab]}
          onPress={() => setActiveTab('audio')}>
          <Headphones size={20} color={activeTab === 'audio' ? '#c9a961' : '#666666'} strokeWidth={2} />
          <Text style={[styles.tabText, activeTab === 'audio' && styles.activeTabText]}>
            Audio Sermons
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'video' && styles.activeTab]}
          onPress={() => setActiveTab('video')}>
          <Video size={20} color={activeTab === 'video' ? '#c9a961' : '#666666'} strokeWidth={2} />
          <Text style={[styles.tabText, activeTab === 'video' && styles.activeTabText]}>
            Video Sermons
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters Section - Hidden when viewing series */}
      {!selectedSeries && (
        <View style={styles.filtersSection}>
          {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#666666" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
              placeholder={`Search ${activeTab} sermons...`}
          placeholderTextColor="#666666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

          {/* Category Filters */}
          <View style={styles.categoriesWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
          </View>
        </View>
      )}

      {loading && activeTab === 'video' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c9a961" />
          <Text style={styles.loadingText}>Loading video sermons...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sermonsContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#c9a961']}
              tintColor="#c9a961"
            />
          }>
          
          {activeTab === 'audio' ? (
            // Audio Sermons Section
            <>
              {selectedSeries ? (
                // Episode List View
                <>
                  <View style={styles.seriesHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={goBackToSeries}>
                      <Text style={styles.backButtonText}>← Back to Series</Text>
                    </TouchableOpacity>
                    <View style={styles.seriesInfo}>
                      <ImageBackground
                        source={{ uri: selectedSeries.coverImage }}
                        style={styles.seriesCover}
                        imageStyle={styles.seriesCoverStyle}>
                        <LinearGradient
                          colors={['rgba(15,15,15,0.3)', 'rgba(15,15,15,0.8)']}
                          style={styles.seriesCoverGradient}>
                        </LinearGradient>
                      </ImageBackground>
                      <View style={styles.seriesDetails}>
                        <Text style={styles.seriesTitle}>{selectedSeries.title}</Text>
                        <Text style={styles.seriesSpeaker}>{selectedSeries.speaker}</Text>
                        <Text style={styles.seriesDescription}>{selectedSeries.description}</Text>
                        <Text style={styles.seriesEpisodeCount}>{selectedSeries.totalEpisodes} episodes</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.episodesList}>
                    {filteredEpisodes.map((episode) => (
                      <View key={episode.id} style={[styles.episodeCard, styles.episodeCardIndented]}>
                        <View style={styles.episodeContent}>
                          <View style={styles.episodeBanner}>
                            <Text style={styles.episodeBannerText}>EPISODE {episode.episodeNumber}</Text>
                          </View>
                          <View style={styles.episodeDetails}>
                            <Text style={styles.episodeTitle} numberOfLines={2}>{episode.title}</Text>
                            <Text style={styles.episodeDescription} numberOfLines={2}>{episode.description}</Text>
                            <View style={styles.episodeMeta}>
                              <View style={styles.metaItem}>
                                <Clock size={14} color="#666666" strokeWidth={2} />
                                <Text style={styles.metaText}>{episode.duration}</Text>
                              </View>
                              <Text style={styles.metaDivider}>•</Text>
                              <Text style={styles.metaText}>
                                {youtubeService.formatPublishedDate(episode.publishedAt)}
                              </Text>
                              <TouchableOpacity 
                                style={styles.downloadButton}
                                onPress={() => downloadAudio(episode)}>
                                <Download size={16} color="#c9a961" strokeWidth={2} />
                              </TouchableOpacity>
                            </View>
                          </View>
                            <TouchableOpacity 
                              style={styles.episodePlayButton}
                              onPress={() => playAudio(episode)}>
                              {playingAudio === episode.id ? (
                                <Pause size={20} color="#c9a961" fill="#c9a961" />
                              ) : (
                                <Play size={20} color="#c9a961" fill="#c9a961" />
                              )}
                            </TouchableOpacity>
                        </View>
                        
                        {/* Audio Progress Indicator */}
                        {playingAudio === episode.id && currentEpisode && (
                          <View style={styles.audioProgressIndicator}>
                            <View style={styles.progressBar}>
                              <View 
                                style={[
                                  styles.progressFill, 
                                  { width: `${(currentTime / duration) * 100}%` }
                                ]} 
                              />
                            </View>
                            <Text style={styles.progressText}>
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                // Series List View
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      {selectedCategory === 'All' ? 'Podcast Series' : selectedCategory}
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      {filteredPodcastSeries.length} {filteredPodcastSeries.length === 1 ? 'series' : 'series'} found
                    </Text>
                  </View>
                  
                  {filteredPodcastSeries.length === 0 ? (
            <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No podcast series found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new content'}
              </Text>
            </View>
          ) : (
                    filteredPodcastSeries.map((series) => (
                      <TouchableOpacity 
                        key={series.id} 
                        style={styles.podcastSeriesCard}
                        onPress={() => openSeries(series)}>
                        <ImageBackground
                          source={{ uri: series.coverImage }}
                          style={styles.podcastSeriesCover}
                          imageStyle={styles.podcastSeriesCoverStyle}>
                          <LinearGradient
                            colors={['rgba(15,15,15,0.3)', 'rgba(15,15,15,0.8)']}
                            style={styles.podcastSeriesGradient}>
                             <View style={styles.podcastPlayIconContainer}>
                               <ListMusic size={32} color="#ffffff" fill="#ffffff" />
                             </View>
                          </LinearGradient>
                        </ImageBackground>
                        <View style={styles.podcastSeriesInfo}>
                          <Text style={styles.podcastSeriesCategory}>{series.category}</Text>
                          <Text style={styles.podcastSeriesTitle} numberOfLines={2}>{series.title}</Text>
                          <Text style={styles.podcastSeriesSpeaker}>{series.speaker}</Text>
                          <Text style={styles.podcastSeriesDescription} numberOfLines={3}>
                            {series.description}
                          </Text>
                          <View style={styles.podcastSeriesMeta}>
                            <Text style={styles.podcastEpisodeCount}>{series.totalEpisodes} episodes</Text>
                            <Text style={styles.metaDivider}>•</Text>
                            <Text style={styles.podcastSeriesTap}>Tap to view episodes</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </>
              )}
            </>
          ) : (
            // Video Sermons Section
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'All' ? 'Video Sermons' : selectedCategory}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {filteredVideoSermons.length} {filteredVideoSermons.length === 1 ? 'sermon' : 'sermons'} found
                </Text>
              </View>
              
              {filteredVideoSermons.length === 0 ? (
            <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No video sermons found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new content'}
              </Text>
            </View>
          ) : (
                filteredVideoSermons.map((sermon) => (
              <TouchableOpacity 
                key={sermon.id} 
                style={styles.sermonCard}
                    onPress={() => handleSermonPress(sermon)}>
                <ImageBackground
                  source={{ uri: sermon.thumbnail }}
                  style={styles.sermonImage}
                  imageStyle={styles.sermonImageStyle}>
                  <LinearGradient
                    colors={['rgba(15,15,15,0)', 'rgba(15,15,15,0.95)']}
                    style={styles.sermonGradient}>
                    <View style={styles.playIconContainer}>
                      <Play size={20} color="#ffffff" fill="#ffffff" />
                    </View>
                  </LinearGradient>
                </ImageBackground>
                <View style={styles.sermonInfo}>
                  <Text style={styles.sermonCategory}>Sunday Service</Text>
                  <Text style={styles.sermonTitle} numberOfLines={2}>{sermon.title}</Text>
                  <Text style={styles.sermonPastor}>{sermon.channelTitle}</Text>
                  <Text style={styles.sermonDescription} numberOfLines={2}>
                    {sermon.description}
                  </Text>
                  <View style={styles.sermonMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color="#666666" strokeWidth={2} />
                      <Text style={styles.metaText}>{sermon.duration}</Text>
                    </View>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.metaText}>
                      {youtubeService.formatPublishedDate(sermon.publishedAt)}
                    </Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.metaText}>{sermon.viewCount} views</Text>
                    <TouchableOpacity style={styles.downloadButton}>
                      <Download size={16} color="#c9a961" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
              )}
            </>
          )}
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
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#c9a961',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#c9a961',
  },
  tabText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#666666',
  },
  activeTabText: {
    color: '#ffffff',
  },
  filtersSection: {
    backgroundColor: '#0f0f0f',
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#ffffff',
  },
  categoriesWrapper: {
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  categoryButtonActive: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
    shadowColor: '#c9a961',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  sermonsContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  // Podcast Series Styles
  podcastSeriesCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  podcastSeriesCover: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  podcastSeriesCoverStyle: {
    resizeMode: 'cover',
  },
  podcastSeriesGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podcastPlayIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podcastSeriesInfo: {
    padding: 20,
  },
  podcastSeriesCategory: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#c9a961',
    marginBottom: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  podcastSeriesTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 28,
  },
  podcastSeriesSpeaker: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#c9a961',
    marginBottom: 12,
  },
  podcastSeriesDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999999',
    marginBottom: 16,
    lineHeight: 20,
  },
  podcastSeriesMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  podcastEpisodeCount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  podcastSeriesTap: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#666666',
  },
  
  // Series Header Styles
  seriesHeader: {
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#c9a961',
  },
  seriesInfo: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  seriesCover: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
  },
  seriesCoverStyle: {
    resizeMode: 'cover',
    borderRadius: 12,
  },
  seriesCoverGradient: {
    flex: 1,
    borderRadius: 12,
  },
  seriesDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  seriesTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 6,
  },
  seriesSpeaker: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#c9a961',
    marginBottom: 8,
  },
  seriesDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#999999',
    marginBottom: 8,
    lineHeight: 18,
  },
  seriesEpisodeCount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#c9a961',
  },
  
  // Episodes List Styles
  episodesList: {
    gap: 12,
    alignItems: 'flex-end',
  },
  episodeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  episodeCardIndented: {
    marginLeft: 16,
    marginRight: 16,
  },
  episodeContent: {
    flexDirection: 'row',
    padding: 16,
    paddingLeft: 56, // Space for the banner
    alignItems: 'center',
  },
  episodeBanner: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: '#c9a961',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  episodeBannerText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#000000',
    transform: [{ rotate: '270deg' }],
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  episodeNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#c9a961',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  episodeNumberText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#ffffff',
  },
  episodeDetails: {
    flex: 1,
  },
  episodeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 20,
  },
  episodeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
    lineHeight: 16,
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  episodePlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  
  // Audio Progress Indicator Styles
  audioProgressIndicator: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#c9a961',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#c9a961',
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  
  // Audio Player Styles (for global player)
  audioPlayerContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#c9a961',
  },
  audioPlayerHeader: {
    marginBottom: 16,
  },
  audioPlayerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#c9a961',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  audioPlayerEpisode: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  waveformSection: {
    alignItems: 'center',
    marginBottom: 6,
  },
  waveformContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformWithTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waveformTimeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#999999',
    minWidth: 35,
    textAlign: 'center',
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#999999',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#c9a961',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#c9a961',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Global Player Styles
  globalPlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#c9a961',
    zIndex: 1000,
  },
  globalPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  globalPlayerInfo: {
    flex: 1,
    minWidth: 0,
  },
  globalPlayerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 2,
  },
  globalPlayerSeries: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999999',
  },
  globalPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  globalControlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  globalPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#c9a961',
    alignItems: 'center',
    justifyContent: 'center',
  },
  globalPlayerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  globalActionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  globalActionText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#ffffff',
  },
  globalPlayerExpanded: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  globalWaveformSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  // Video Sermon Styles (existing)
  sermonCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sermonImage: {
    width: '100%',
    height: 180,
  },
  sermonImageStyle: {
    resizeMode: 'cover',
  },
  sermonGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 16,
  },
  playIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(201, 169, 97, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sermonInfo: {
    padding: 18,
  },
  sermonCategory: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#c9a961',
    marginBottom: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sermonTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 10,
    lineHeight: 26,
  },
  sermonPastor: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#c9a961',
    marginBottom: 12,
  },
  sermonDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#999999',
    marginBottom: 12,
    lineHeight: 18,
  },
  sermonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  downloadButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999999',
    marginTop: 12,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
