// YouTube Configuration
// To get a YouTube Data API key:
// 1. Go to Google Cloud Console (https://console.cloud.google.com/)
// 2. Create a new project or select existing one
// 3. Enable YouTube Data API v3
// 4. Create credentials (API Key)
// 5. Replace the placeholder below with your actual API key

export const YOUTUBE_CONFIG = {
  // Replace with your actual YouTube Data API key
  API_KEY: 'AIzaSyAYwvgYJ8mfszmtFKk4wnxJIBwvXZYZVVA',
  
  // MVAMA CCAP NKHOMA SYNOD channel information
  CHANNEL: {
    HANDLE: '@mvamaccapnkhomasynod',
    NAME: 'Mvama CCAP Nkhoma Synod',
    // You can find the channel ID by visiting the channel and looking at the URL
    // or by using the YouTube API to search for the channel
    ID: '', // Will be fetched dynamically if not provided
  },
  
  // API Configuration
  BASE_URL: 'https://www.googleapis.com/youtube/v3',
  MAX_RESULTS: 20,
  
  // Development settings
  USE_MOCK_DATA: false, // Set to false to use real YouTube data
};

