// Live Service for checking live video status
import { youtubeService } from './youtubeService';

export interface LiveVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  isLive: boolean;
  liveViewers?: number;
  scheduledStartTime?: string;
  actualStartTime?: string;
}

class LiveService {
  // Check if there's a currently live video
  async getCurrentLiveVideo(): Promise<LiveVideo | null> {
    try {
      console.log('🔴 Checking for live videos...');
      
      // Get recent videos from the channel
      const videos = await youtubeService.getChannelVideos();
      
      // Look for live videos (this would need YouTube API integration for real live detection)
      // For now, we'll simulate checking for live content
      const liveVideo = this.simulateLiveCheck(videos);
      
      if (liveVideo) {
        console.log('✅ Live video found:', liveVideo.title);
        return liveVideo;
      } else {
        console.log('❌ No live video currently available');
        return null;
      }
    } catch (error) {
      console.error('❌ Error checking for live videos:', error);
      return null;
    }
  }

  // Simulate live video detection (in a real app, this would use YouTube Live API)
  private simulateLiveCheck(videos: any[]): LiveVideo | null {
    // Check if current time is during service hours (Sunday 10:00 AM - 11:30 AM or 6:00 PM - 7:30 PM)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;

    // Sunday service times (in minutes from midnight)
    const morningServiceStart = 10 * 60; // 10:00 AM
    const morningServiceEnd = 11 * 30; // 11:30 AM
    const eveningServiceStart = 18 * 60; // 6:00 PM
    const eveningServiceEnd = 19 * 30; // 7:30 PM

    const isSunday = dayOfWeek === 0;
    const isMorningService = isSunday && currentTime >= morningServiceStart && currentTime <= morningServiceEnd;
    const isEveningService = isSunday && currentTime >= eveningServiceStart && currentTime <= eveningServiceEnd;
    const isServiceTime = isMorningService || isEveningService;

    if (isServiceTime && videos.length > 0) {
      // Return the most recent video as "live" during service times
      const latestVideo = videos[0];
      return {
        id: latestVideo.id,
        title: latestVideo.title,
        thumbnail: latestVideo.thumbnail,
        channelTitle: latestVideo.channelTitle,
        isLive: true,
        liveViewers: Math.floor(Math.random() * 100) + 50, // Simulate viewer count
        actualStartTime: new Date().toISOString()
      };
    }

    return null;
  }

  // Check if there's a scheduled live event
  async getScheduledLiveEvents(): Promise<LiveVideo[]> {
    try {
      console.log('📅 Checking for scheduled live events...');
      
      // In a real implementation, this would check YouTube Live API for scheduled events
      // For now, we'll return empty array
      return [];
    } catch (error) {
      console.error('❌ Error checking scheduled events:', error);
      return [];
    }
  }

  // Get live video status message
  getLiveStatusMessage(liveVideo: LiveVideo | null): string {
    if (liveVideo) {
      return `Live Now: ${liveVideo.title}`;
    } else {
      return 'No live video at the moment';
    }
  }

  // Check if we should show live indicator
  shouldShowLiveIndicator(liveVideo: LiveVideo | null): boolean {
    return liveVideo !== null;
  }
}

export const liveService = new LiveService();
