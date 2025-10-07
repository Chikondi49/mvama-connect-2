import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Clock, Download, Headphones, ListMusic, Pause, Play, Search, SkipBack, SkipForward, Users, Video } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { audioSermonService } from '../../services/audioSermonService';
import { downloadService } from '../../services/downloadService';
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

// Sample Audio Data
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
        description: 'Understanding the transforming power of God\'s grace in our daily lives.',
        episodeNumber: 3,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
      },
      {
        id: 'episode-1-4',
        title: 'Building Strong Foundations',
        speaker: 'Rev. Yassin Gammah',
        duration: '40:10',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        publishedAt: '2024-10-20T10:00:00Z',
        description: 'Learning to build our lives on the solid foundation of Christ.',
        episodeNumber: 4,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
      }
    ]
  },
  {
    id: 'series-2',
    title: 'Morning Devotion',
    description: 'Daily morning devotionals to start your day with God\'s word and prayer.',
    coverImage: 'https://images.pexels.com/photos/8468012/pexels-photo-8468012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    speaker: 'Rev. Yassin Gammah',
    totalEpisodes: 3,
    category: 'Morning Devotion',
    episodes: [
      {
        id: 'episode-2-1',
        title: 'Starting the Day with God',
        speaker: 'Rev. Yassin Gammah',
        duration: '15:30',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        publishedAt: '2024-11-09T06:00:00Z',
        description: 'A short devotional to begin your day in God\'s presence.',
        episodeNumber: 1,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
      },
      {
        id: 'episode-2-2',
        title: 'Prayer and Meditation',
        speaker: 'Rev. Yassin Gammah',
        duration: '18:45',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        publishedAt: '2024-11-08T06:00:00Z',
        description: 'Learning the importance of prayer and meditation in our daily walk.',
        episodeNumber: 2,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
      },
      {
        id: 'episode-2-3',
        title: 'God\'s Promises for Today',
        speaker: 'Rev. Yassin Gammah',
        duration: '16:20',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        publishedAt: '2024-11-07T06:00:00Z',
        description: 'Claiming God\'s promises for strength and guidance throughout the day.',
        episodeNumber: 3,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
      }
    ]
  },
  {
    id: 'series-3',
    title: 'Evening Devotion',
    description: 'Peaceful evening devotionals to end your day with God\'s word and reflection.',
    coverImage: 'https://images.pexels.com/photos/8468012/pexels-photo-8468012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    speaker: 'Rev. Yassin Gammah',
    totalEpisodes: 2,
    category: 'Evening Devotion',
    episodes: [
      {
        id: 'episode-3-1',
        title: 'Reflecting on God\'s Goodness',
        speaker: 'Rev. Yassin Gammah',
        duration: '20:15',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        publishedAt: '2024-11-09T18:00:00Z',
        description: 'Taking time to reflect on God\'s goodness and faithfulness throughout the day.',
        episodeNumber: 1,
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
      },
      {
        id: 'episode-3-2',
        title: 'Finding Peace in God',
        speaker: 'Rev. Yassin Gammah',
        duration: '22:30',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        publishedAt: '2024-11-08T18:00:00Z',
        description: 'Learning to find peace and rest in God\'s presence at the end of the day.',
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
  const [currentPlayingSeries, setCurrentPlayingSeries] = useState<string | null>(null);

  // Helper function to format sermon dates safely
  const formatSermonDate = (dateString: string): string => {
    try {
      if (!dateString) return 'Date not available';
      
      // Try YouTube service first
      const formatted = youtubeService.formatPublishedDate(dateString);
      if (formatted !== 'Date not available') {
        return formatted;
      }
      
      // Fallback: try to parse and format manually
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date not available';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      console.error('Error formatting sermon date:', error, 'Input:', dateString);
      return 'Date not available';
    }
  };

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

  // Debug: Log podcastSeries changes
  useEffect(() => {
    console.log('📊 PodcastSeries state updated:', podcastSeries.length, 'series');
    if (podcastSeries.length > 0) {
      console.log('📋 Series titles:', podcastSeries.map(s => s.title));
    }
  }, [podcastSeries]);

  // Handle global player visibility based on current view
  useEffect(() => {
    if (currentEpisode && currentPlayingSeries) {
      // Show global player if user is not viewing the series containing the current episode
      if (selectedSeries && selectedSeries.id !== currentPlayingSeries) {
        setShowGlobalPlayer(true);
      } else if (!selectedSeries) {
        // Show global player when viewing series list
        setShowGlobalPlayer(true);
      } else {
        // Hide global player when viewing the series containing the current episode
        setShowGlobalPlayer(false);
      }
    }
  }, [selectedSeries, currentEpisode, currentPlayingSeries]);

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
      console.log('🎵 Loading audio sermons...');
      
      // Try to load from Firestore first
      console.log('🔍 Testing Firestore access...');
      
      // Load all audio sermons (episodes) from the audioSermons collection
      console.log('🎵 Loading all audio sermons from audioSermons collection...');
      const allSermons = await audioSermonService.getAllAudioSermons();
      console.log(`📊 Found ${allSermons.length} audio sermons in Firestore`);
      
      // Group sermons by seriesId to create series
      const seriesMap = new Map<string, any>();
      
      allSermons.forEach(sermon => {
        if (sermon.seriesId) {
          if (!seriesMap.has(sermon.seriesId)) {
            // Create series from first sermon with this seriesId
            // Try to extract a better title from the seriesId
            let seriesTitle = sermon.seriesId;
            if (sermon.seriesId.includes('-')) {
              // Convert "31-fundamental-questions" to "31 Fundamental Questions"
              seriesTitle = sermon.seriesId
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            }
            
            seriesMap.set(sermon.seriesId, {
              id: sermon.seriesId,
              title: seriesTitle,
              description: `Sermons from ${seriesTitle}`,
              coverImage: sermon.thumbnailUrl || 'https://images.pexels.com/photos/8468012/pexels-photo-8468012.jpeg',
              speaker: sermon.speaker,
              totalEpisodes: 0,
              category: sermon.category,
              episodes: []
            });
          }
          
          // Add sermon to series
          const series = seriesMap.get(sermon.seriesId);
          series.episodes.push({
            id: sermon.id,
            title: sermon.title,
            speaker: sermon.speaker,
            duration: sermon.duration,
            audioUrl: sermon.audioUrl,
            publishedAt: sermon.publishedAt,
            description: sermon.description,
            episodeNumber: sermon.episodeNumber || 1,
            downloadUrl: sermon.downloadUrl,
          });
          series.totalEpisodes = series.episodes.length;
        }
      });
      
      const series = Array.from(seriesMap.values());
      console.log(`📊 Created ${series.length} series from sermons`);
      
      // Debug: Show sermons without seriesId
      const orphanedSermons = allSermons.filter(sermon => !sermon.seriesId);
      if (orphanedSermons.length > 0) {
        console.log(`⚠️ Found ${orphanedSermons.length} sermons without seriesId:`, orphanedSermons.map(s => ({
          id: s.id,
          title: s.title,
          seriesId: s.seriesId
        })));
      }
      
      // Debug: Log all series found
      if (series.length > 0) {
        console.log('📋 All series found:');
        series.forEach((s, index) => {
          console.log(`  ${index + 1}. "${s.title}" (ID: ${s.id}, Episodes: ${s.episodes.length})`);
        });
      }
      
      // Debug: Show comprehensive data analysis
      console.log('🔍 Running comprehensive data analysis...');
      await audioSermonService.debugEpisodesAndSeries();
      
      // Additional debugging for the specific series
      console.log('🔍 Checking specific series: "31-fundamental-questions"');
      try {
        const specificEpisodes = await audioSermonService.getEpisodesBySeries('31-fundamental-questions');
        console.log(`📺 Episodes found for "31-fundamental-questions": ${specificEpisodes.length}`);
        if (specificEpisodes.length > 0) {
          console.log('📋 Episode details:', specificEpisodes.map(e => ({
            id: e.id,
            title: e.title,
            seriesId: e.seriesId,
            episodeNumber: e.episodeNumber
          })));
        }
      } catch (error) {
        console.error('❌ Error fetching episodes for specific series:', error);
      }
      
      if (series.length > 0) {
        console.log('✅ Using Firestore data from audioSermons collection');
        
        // Convert the series created from sermons to PodcastSeries format
        const podcastSeriesData: PodcastSeries[] = series.map(seriesData => {
          console.log(`🔍 Processing series: "${seriesData.title}" (ID: ${seriesData.id})`);
          console.log(`📺 Found ${seriesData.episodes.length} episodes for series "${seriesData.title}"`);
          
          // Log episode details for debugging
          if (seriesData.episodes.length > 0) {
            console.log(`📋 Episodes for "${seriesData.title}":`, seriesData.episodes.map((e: any) => ({
              id: e.id,
              title: e.title,
              episodeNumber: e.episodeNumber
            })));
          } else {
            console.log(`⚠️ No episodes found for series "${seriesData.title}"`);
          }
          
          return {
            id: seriesData.id,
            title: seriesData.title,
            description: seriesData.description,
            coverImage: seriesData.coverImage,
            speaker: seriesData.speaker,
            totalEpisodes: seriesData.totalEpisodes,
            category: seriesData.category,
            episodes: seriesData.episodes
          };
        });
        
        setPodcastSeries(podcastSeriesData);
        console.log(`✅ Converted ${podcastSeriesData.length} series to podcast format`);
        
        // Debug: Log the final podcast series data
        console.log('📊 Final podcast series data:');
        podcastSeriesData.forEach((series, index) => {
          console.log(`  Series ${index + 1}: "${series.title}" (${series.episodes.length} episodes)`);
          series.episodes.forEach((episode, epIndex) => {
            console.log(`    Episode ${epIndex + 1}: "${episode.title}" (Episode #${episode.episodeNumber})`);
          });
        });
      } else {
        console.log('📝 No Firestore data found');
        console.log('💡 You can create sample data in Firestore or use local sample data');
        
        // Option 1: Use local sample data (current behavior)
        console.log('📊 Using local sample data');
        setPodcastSeries(mockPodcastSeries);
        
        // Option 2: Create sample data in Firestore (uncomment to enable)
        // console.log('📝 Creating sample data in Firestore...');
        // await audioSermonService.createSampleData();
        // console.log('✅ Sample data created in Firestore');
        // // Reload data after creating sample data
        // const newSeries = await audioSermonService.getAllAudioSeries();
        // if (newSeries.length > 0) {
        //   // Process the newly created data
        //   const podcastSeriesData: PodcastSeries[] = await Promise.all(
        //     newSeries.map(async (audioSeries) => {
        //       const episodes = await audioSermonService.getEpisodesBySeries(audioSeries.id);
        //       return {
        //         id: audioSeries.id,
        //         title: audioSeries.title,
        //         description: audioSeries.description,
        //         coverImage: audioSeries.coverImage,
        //         speaker: audioSeries.speaker,
        //         totalEpisodes: audioSeries.totalEpisodes,
        //         category: audioSeries.category,
        //         episodes: episodes.map(episode => ({
        //           id: episode.id,
        //           title: episode.title,
        //           speaker: episode.speaker,
        //           duration: episode.duration,
        //           audioUrl: episode.audioUrl,
        //           publishedAt: episode.publishedAt,
        //           description: episode.description,
        //           episodeNumber: episode.episodeNumber || 1,
        //           downloadUrl: episode.downloadUrl,
        //         }))
        //       };
        //     })
        //   );
        //   setPodcastSeries(podcastSeriesData);
        // }
      }
      
    } catch (error) {
      console.error('❌ Error loading audio sermons:', error);
      console.log('📝 Falling back to sample data due to error');
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

  // Helper function to parse duration string to seconds
  const parseDurationToSeconds = (durationStr: string): number => {
    if (!durationStr) return 0;
    
    // Handle different duration formats: "42:15", "1:23:45", "42.15"
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      // MM:SS format
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      return minutes * 60 + seconds;
    } else if (parts.length === 3) {
      // HH:MM:SS format
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);
      return hours * 3600 + minutes * 60 + seconds;
    } else {
      // Try to parse as decimal seconds
      return parseFloat(durationStr) || 0;
    }
  };

  // Audio Player Functions
  const playAudio = async (episode: PodcastEpisode) => {
    try {
      console.log('🎵 Play audio requested for:', episode.title);
      
      // If the same episode is already playing, toggle pause/play
      if (playingAudio === episode.id && sound) {
        if (isPlaying) {
          console.log('⏸️ Pausing audio');
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          console.log('▶️ Resuming audio');
          await sound.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      // If a different episode is playing, stop it first
      if (sound) {
        console.log('🛑 Stopping previous audio');
        await sound.unloadAsync();
      }

      console.log('🎵 Loading new audio:', episode.audioUrl);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: episode.audioUrl },
        { 
          shouldPlay: true,
          progressUpdateIntervalMillis: 1000 // Update every second for better responsiveness
        }
      );
      
      setSound(newSound);
      setPlayingAudio(episode.id);
      setCurrentEpisode(episode);
      setIsPlaying(true);
      setCurrentPlayingSeries(selectedSeries?.id || null);
      setShowGlobalPlayer(true);
      setIsPlayerMinimized(false);

      // Parse duration correctly
      const episodeDuration = parseDurationToSeconds(episode.duration);
      console.log(`⏱️ Episode duration: ${episode.duration} -> ${episodeDuration} seconds`);
      setDuration(episodeDuration);
      setWaveformData(generateWaveformData(episodeDuration));

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackStatus(status);
          setCurrentTime(status.positionMillis / 1000);
          setIsPlaying(status.isPlaying);
          
          if (status.didJustFinish) {
            console.log('✅ Audio finished playing');
            setPlayingAudio(null);
            setCurrentEpisode(null);
            setIsPlaying(false);
            setCurrentTime(0);
            setShowGlobalPlayer(false);
          }
        }
      });
      
      console.log('✅ Audio loaded and playing');
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      setPlayingAudio(null);
      setCurrentEpisode(null);
      setIsPlaying(false);
    }
  };

  const seekTo = async (position: number) => {
    if (sound && playbackStatus?.isLoaded) {
      // Ensure position is a valid number and within bounds
      const validPosition = Math.max(0, Math.min(position, duration));
      if (isFinite(validPosition) && validPosition >= 0) {
        try {
          await sound.setPositionAsync(validPosition * 1000); // Convert to milliseconds
          setCurrentTime(validPosition);
        } catch (error) {
          console.error('❌ Error seeking to position:', error);
        }
      }
    }
  };

  // Global player controls
  const togglePlayPause = async () => {
    if (!currentEpisode) return;
    
    try {
      if (isPlaying) {
        console.log('⏸️ Global pause');
        await sound?.pauseAsync();
        setIsPlaying(false);
      } else {
        console.log('▶️ Global play/resume');
        if (sound) {
          await sound.playAsync();
          setIsPlaying(true);
        } else {
          // If no sound object, start playing the current episode
          await playAudio(currentEpisode);
        }
      }
    } catch (error) {
      console.error('❌ Error toggling play/pause:', error);
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
    try {
      console.log('📥 Starting download for:', episode.title);
      
      // Generate filename
      const filename = downloadService.generateFilename(episode.title, episode.audioUrl);
      
      // Check if file already exists
      const fileExists = await downloadService.fileExists(filename);
      if (fileExists) {
        Alert.alert(
          'File Already Downloaded',
          'This sermon has already been downloaded to your device.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show download progress
      Alert.alert(
        'Download Started',
        `Downloading "${episode.title}"...`,
        [{ text: 'OK' }]
      );

      // Download the file
      const result = await downloadService.downloadFile(
        episode.audioUrl,
        filename,
        (progress) => {
          const percentage = downloadService.getProgressPercentage(progress);
          console.log(`📊 Download progress: ${percentage}%`);
        }
      );

      if (result.success && result.fileUri) {
        // Save to media library
        const saved = await downloadService.saveToMediaLibrary(result.fileUri, filename);
        
        if (saved) {
          Alert.alert(
            'Download Complete',
            `"${episode.title}" has been saved to your device's media library.`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Download Complete',
            `"${episode.title}" has been downloaded but couldn't be saved to media library.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Download Failed',
          result.error || 'Failed to download the sermon. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      Alert.alert(
        'Download Error',
        'Failed to download the sermon. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleVideoDownload = async (sermon: YouTubeVideo) => {
    try {
      console.log('📥 Starting download for video sermon:', sermon.title);
      
      // For YouTube videos, we can't directly download the video file
      // Instead, we'll show a message about using YouTube's download feature
      Alert.alert(
        'Download Not Available',
        'Video sermons cannot be downloaded directly. You can use YouTube\'s download feature or save the video to your YouTube library.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open in YouTube', onPress: () => {
            const watchUrl = youtubeService.getWatchUrl(sermon.id);
            console.log('Opening in YouTube:', watchUrl);
            // In a real app, you would use Linking.openURL(watchUrl)
          }}
        ]
      );
    } catch (error) {
      console.error('❌ Download error:', error);
      Alert.alert(
        'Download Error',
        'Unable to download this video sermon.',
        [{ text: 'OK' }]
      );
    }
  };

  const openSeries = (series: PodcastSeries) => {
    setSelectedSeries(series);
    // Hide global player if user is viewing the series that contains the currently playing episode
    if (currentPlayingSeries === series.id && currentEpisode) {
      setShowGlobalPlayer(false);
    } else if (currentEpisode) {
      // Show global player if user is viewing a different series while audio is playing
      setShowGlobalPlayer(true);
    }
  };

  const goBackToSeries = () => {
    setSelectedSeries(null);
    // Show global player when going back to series list if audio is playing
    if (currentEpisode) {
      setShowGlobalPlayer(true);
    }
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
    setCurrentPlayingSeries(null);
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
              style={[
                styles.globalPlayButton,
                isPlaying && styles.globalPlayButtonActive
              ]} 
              onPress={togglePlayPause}
              activeOpacity={0.8}>
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
      
      // Ensure locationX is a valid number
      if (typeof locationX !== 'number' || !isFinite(locationX)) {
        console.warn('Invalid locationX:', locationX);
        return;
      }
      
      // Calculate position safely
      const clickRatio = Math.max(0, Math.min(1, locationX / width));
      const position = clickRatio * duration;
      
      // Ensure position is valid
      if (isFinite(position) && position >= 0 && position <= duration) {
        console.log(`🎯 Seeking to: ${position.toFixed(2)}s (${(clickRatio * 100).toFixed(1)}%)`);
        onSeek(position);
      } else {
        console.warn('Invalid seek position:', position);
      }
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
    
    console.log(`🔍 Filtering series "${series.title}":`, {
      matchesSearch,
      matchesCategory,
      selectedCategory,
      seriesCategory: series.category,
      finalMatch: matchesSearch && matchesCategory
    });
    
    return matchesSearch && matchesCategory;
  });

  // Debug: Log filtering results
  console.log(`📊 Filtering results: ${filteredPodcastSeries.length} of ${podcastSeries.length} series match filters`);
  console.log(`🔍 Selected category: "${selectedCategory}", Search query: "${searchQuery}"`);
  
  // Debug: Check if "31-fundamental-questions" series is being filtered
  const fundamentalSeries = podcastSeries.find(s => s.title.includes('31') || s.title.includes('FUNDAMENTAL'));
  if (fundamentalSeries) {
    console.log(`🔍 Found "31 Fundamental Questions" series:`, {
      title: fundamentalSeries.title,
      category: fundamentalSeries.category,
      episodes: fundamentalSeries.episodes.length,
      isFiltered: filteredPodcastSeries.includes(fundamentalSeries)
    });
  } else {
    console.log('⚠️ "31 Fundamental Questions" series not found in podcastSeries');
  }
  
  // TEMPORARY: Force show all series for debugging
  console.log('🧪 TEMPORARY: Forcing all series to show for debugging');
  const forcedFilteredPodcastSeries = [...podcastSeries];
  console.log(`🧪 Forced filtered series count: ${forcedFilteredPodcastSeries.length}`);

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
              {console.log('🎵 Rendering audio tab, podcastSeries:', podcastSeries.length, 'loadingAudio:', loadingAudio, 'filteredPodcastSeries:', filteredPodcastSeries.length)}
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
                              style={[
                                styles.episodePlayButton,
                                playingAudio === episode.id && isPlaying && styles.episodePlayButtonActive
                              ]}
                              onPress={() => playAudio(episode)}
                              activeOpacity={0.7}>
                              {playingAudio === episode.id && isPlaying ? (
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
                  
                  {(forcedFilteredPodcastSeries.length === 0 ? filteredPodcastSeries : forcedFilteredPodcastSeries).length === 0 ? (
            <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No podcast series found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new content'}
              </Text>
            </View>
          ) : (
                    (forcedFilteredPodcastSeries.length === 0 ? filteredPodcastSeries : forcedFilteredPodcastSeries).map((series) => (
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
                      {formatSermonDate(sermon.publishedAt)}
                    </Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.metaText}>{sermon.viewCount} views</Text>
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={() => handleVideoDownload(sermon)}>
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
    shadowColor: '#c9a961',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  categoryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  categoryTextActive: {
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  sermonsContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Extra space for global player
  },
  sectionHeader: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2a2a2a',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#999999',
    letterSpacing: 0.3,
  },
  // Podcast Series Styles
  podcastSeriesCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    marginBottom: 24,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
  },
  podcastSeriesCover: {
    width: '100%',
    height: 220,
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
    padding: 24,
    paddingTop: 20,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 8,
  },
  episodeCardIndented: {
    marginLeft: 20,
    marginRight: 20,
  },
  episodeContent: {
    flexDirection: 'row',
    padding: 20,
    paddingLeft: 60, // Space for the banner
    alignItems: 'center',
  },
  episodeBanner: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 48,
    backgroundColor: '#c9a961',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    shadowColor: '#c9a961',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  episodeBannerText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#000000',
    transform: [{ rotate: '270deg' }],
    textAlign: 'center',
    letterSpacing: 0.8,
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
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 6,
    lineHeight: 22,
  },
  episodeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#999999',
    marginBottom: 10,
    lineHeight: 18,
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  episodePlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.2)',
  },
  episodePlayButtonActive: {
    backgroundColor: 'rgba(201, 169, 97, 0.25)',
    borderColor: 'rgba(201, 169, 97, 0.4)',
    transform: [{ scale: 1.08 }],
    shadowColor: '#c9a961',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
  globalPlayButtonActive: {
    backgroundColor: '#b89a4a',
    transform: [{ scale: 1.05 }],
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
    paddingVertical: 80,
    paddingHorizontal: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  emptyText: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  emptySubtext: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
  },
});
