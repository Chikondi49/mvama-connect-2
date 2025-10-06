// YouTube Data API v3 Service
import { MOCK_SERMONS, YOUTUBE_CONFIG } from '../config/youtube';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  channelTitle: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
}

class YouTubeService {
  private readonly API_KEY = YOUTUBE_CONFIG.API_KEY;
  private readonly BASE_URL = YOUTUBE_CONFIG.BASE_URL;
  private readonly CHANNEL_HANDLE = YOUTUBE_CONFIG.CHANNEL.HANDLE;
  private readonly USE_MOCK_DATA = YOUTUBE_CONFIG.USE_MOCK_DATA;

  // Get channel information by handle
  async getChannelByHandle(handle: string): Promise<YouTubeChannel | null> {
    try {
      // First, search for the channel by handle
      const searchUrl = `${this.BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${this.API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (searchData.items && searchData.items.length > 0) {
        const channelId = searchData.items[0].snippet.channelId;
        
        // Get detailed channel information
        const channelUrl = `${this.BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${this.API_KEY}`;
        const channelResponse = await fetch(channelUrl);
        const channelData = await channelResponse.json();

        if (channelData.items && channelData.items.length > 0) {
          const channel = channelData.items[0];
          return {
            id: channel.id,
            title: channel.snippet.title,
            description: channel.snippet.description,
            subscriberCount: channel.statistics.subscriberCount,
            videoCount: channel.statistics.videoCount,
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching channel:', error);
      return null;
    }
  }

  // Get videos from the channel (with mock data fallback)
  async getChannelVideos(channelId: string = '', maxResults: number = 20): Promise<YouTubeVideo[]> {
    console.log('🔧 YouTube Service Configuration:');
    console.log('   - USE_MOCK_DATA:', this.USE_MOCK_DATA);
    console.log('   - API_KEY:', this.API_KEY.substring(0, 10) + '...');
    console.log('   - CHANNEL_HANDLE:', this.CHANNEL_HANDLE);
    
    // Use mock data if configured or if no API key is provided
    if (this.USE_MOCK_DATA || this.API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
      console.log('📱 Using mock data - configuration set to use mock data');
      return this.getMockVideos(maxResults);
    }
    
    console.log('🌐 Attempting to fetch real YouTube data...');
    
    try {
      let actualChannelId = channelId;
      
      // If no channelId provided, find it using the handle
      if (!actualChannelId) {
        console.log('🔍 Finding channel ID for:', this.CHANNEL_HANDLE);
        const searchUrl = `${this.BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(this.CHANNEL_HANDLE)}&key=${this.API_KEY}`;
        console.log('🔗 Search URL:', searchUrl);
        
        const searchResponse = await fetch(searchUrl);
        console.log('📡 Search response status:', searchResponse.status);
        
        const searchData = await searchResponse.json();
        console.log('📊 Search response data:', JSON.stringify(searchData, null, 2));
        
        if (searchData.error) {
          console.error('❌ YouTube API Error:', searchData.error.message);
          console.error('❌ Error details:', searchData.error);
          return [];
        }
        
        if (searchData.items && searchData.items.length > 0) {
          actualChannelId = searchData.items[0].snippet.channelId;
          console.log('✅ Found channel ID:', actualChannelId);
          console.log('✅ Channel title:', searchData.items[0].snippet.title);
        } else {
          console.error('❌ Channel not found:', this.CHANNEL_HANDLE);
          console.log('🔍 Trying alternative search terms...');
          
          // Try alternative search terms
          const alternatives = ['MVAMA CCAP NKHOMA SYNOD', 'Rev. Yassin Gammah', 'CCAP NKHOMA'];
          for (const term of alternatives) {
            console.log('🔍 Trying alternative search:', term);
            const altSearchUrl = `${this.BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(term)}&key=${this.API_KEY}`;
            const altResponse = await fetch(altSearchUrl);
            const altData = await altResponse.json();
            
            if (altData.items && altData.items.length > 0) {
              actualChannelId = altData.items[0].snippet.channelId;
              console.log('✅ Found channel with alternative search:', actualChannelId);
              console.log('✅ Channel title:', altData.items[0].snippet.title);
              break;
            }
          }
          
          if (!actualChannelId) {
            console.error('❌ No channel found with any search term');
            return [];
          }
        }
      }
      
      // Get uploads playlist ID
      console.log('🔍 Getting channel details for ID:', actualChannelId);
      const channelUrl = `${this.BASE_URL}/channels?part=contentDetails&id=${actualChannelId}&key=${this.API_KEY}`;
      console.log('🔗 Channel URL:', channelUrl);
      
      const channelResponse = await fetch(channelUrl);
      console.log('📡 Channel response status:', channelResponse.status);
      
      const channelData = await channelResponse.json();
      console.log('📊 Channel data:', JSON.stringify(channelData, null, 2));

      if (!channelData.items || channelData.items.length === 0) {
        console.error('❌ No channel data found');
        return [];
      }

      const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
      console.log('📺 Uploads playlist ID:', uploadsPlaylistId);

      // Get videos from uploads playlist
      console.log('📺 Getting videos from playlist:', uploadsPlaylistId);
      const playlistUrl = `${this.BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${this.API_KEY}`;
      console.log('🔗 Playlist URL:', playlistUrl);
      
      const playlistResponse = await fetch(playlistUrl);
      console.log('📡 Playlist response status:', playlistResponse.status);
      
      const playlistData = await playlistResponse.json();
      console.log('📊 Playlist data:', JSON.stringify(playlistData, null, 2));
      
      if (playlistData.error) {
        console.error('❌ Playlist API Error:', playlistData.error.message);
        console.error('❌ Error details:', playlistData.error);
        return [];
      }

      if (!playlistData.items) {
        console.log('📭 No playlist items found');
        return [];
      }
      
      console.log('✅ Found', playlistData.items.length, 'videos in playlist');

      // Get video details including duration
      const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
      console.log('🎬 Getting details for', playlistData.items.length, 'videos');
      console.log('🎬 Video IDs:', videoIds);
      
      const videosUrl = `${this.BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${this.API_KEY}`;
      console.log('🔗 Videos URL:', videosUrl);
      
      const videosResponse = await fetch(videosUrl);
      console.log('📡 Videos response status:', videosResponse.status);
      
      const videosData = await videosResponse.json();
      console.log('📊 Videos data:', JSON.stringify(videosData, null, 2));
      
      if (videosData.error) {
        console.error('❌ Videos API Error:', videosData.error.message);
        console.error('❌ Error details:', videosData.error);
        return [];
      }

      if (!videosData.items || videosData.items.length === 0) {
        console.log('📭 No video details found');
        return [];
      }

      const videos = videosData.items.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
        publishedAt: video.snippet.publishedAt,
        duration: this.formatDuration(video.contentDetails.duration),
        viewCount: this.formatViewCount(video.statistics.viewCount),
        channelTitle: video.snippet.channelTitle,
      }));
      
      console.log('✅ Successfully fetched', videos.length, 'videos');
      console.log('📋 Video titles:', videos.map((v: any) => v.title));
      return videos;
    } catch (error) {
      console.error('❌ Error fetching videos:', error);
      return [];
    }
  }

  // Get mock videos for development/demo
  private getMockVideos(maxResults: number): YouTubeVideo[] {
    return MOCK_SERMONS.slice(0, maxResults).map(sermon => ({
      ...sermon,
      publishedAt: sermon.publishedAt,
    }));
  }

  // Format ISO 8601 duration to readable format
  private formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0 min';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes} min`;
    } else {
      return `${seconds}s`;
    }
  }

  // Format view count to readable format
  private formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    } else {
      return count.toString();
    }
  }

  // Format published date to readable format
  formatPublishedDate(isoDate: string): string {
    const date = new Date(isoDate);
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
  }

  // Get YouTube video embed URL
  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0&controls=1`;
  }

  // Get YouTube video watch URL
  getWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}

export const youtubeService = new YouTubeService();
