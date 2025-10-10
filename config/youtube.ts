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

// Mock data for development (represents real MVAMA CCAP NKHOMA SYNOD videos)
export const MOCK_SERMONS = [
  {
    id: 'mvama-sermon-001',
    title: 'Sunday Service: The Power of Faith in Difficult Times',
    description: 'Rev. Yassin Gammah delivers a powerful message about maintaining faith during challenging seasons of life. This sermon explores biblical principles for overcoming adversity and finding strength in God\'s promises.',
    thumbnail: 'https://images.pexels.com/photos/8468012/pexels-photo-8468012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    publishedAt: '2024-11-10T10:00:00Z',
    duration: '42 min',
    viewCount: '1,234',
    channelTitle: 'MVAMA CCAP NKHOMA SYNOD',
  },
  {
    id: 'mvama-sermon-002',
    title: 'Sunday Service: Walking in God\'s Purpose',
    description: 'Discover your divine calling and learn how to align your life with God\'s perfect plan. Rev. Yassin Gammah shares insights on finding and fulfilling your purpose in Christ.',
    thumbnail: 'https://images.pexels.com/photos/8828591/pexels-photo-8828591.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    publishedAt: '2024-11-03T10:00:00Z',
    duration: '38 min',
    viewCount: '987',
    channelTitle: 'MVAMA CCAP NKHOMA SYNOD',
  },
  {
    id: 'dQw4w9WgXcS',
    title: 'The Grace That Transforms',
    description: 'An inspiring message about the transformative power of God\'s grace in our daily lives. Learn how grace not only saves us but continues to shape us into Christ\'s likeness.',
    thumbnail: 'https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    publishedAt: '2024-10-27T10:00:00Z',
    duration: '45 min',
    viewCount: '1,567',
    channelTitle: 'MVAMA CCAP NKHOMA SYNOD',
  },
  {
    id: 'dQw4w9WgXcT',
    title: 'Building Strong Christian Families',
    description: 'Rev. Yassin Gammah shares biblical principles for building and maintaining strong, Christ-centered families. Practical wisdom for parents, spouses, and children.',
    thumbnail: 'https://images.pexels.com/photos/8940091/pexels-photo-8940091.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    publishedAt: '2024-10-20T10:00:00Z',
    duration: '40 min',
    viewCount: '2,103',
    channelTitle: 'MVAMA CCAP NKHOMA SYNOD',
  },
  {
    id: 'dQw4w9WgXcU',
    title: 'The Heart of Worship',
    description: 'Understanding true worship that goes beyond songs and rituals. Discover what it means to worship God in spirit and truth in every aspect of your life.',
    thumbnail: 'https://images.pexels.com/photos/8468068/pexels-photo-8468068.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    publishedAt: '2024-10-13T10:00:00Z',
    duration: '36 min',
    viewCount: '1,789',
    channelTitle: 'MVAMA CCAP NKHOMA SYNOD',
  },
  {
    id: 'dQw4w9WgXcV',
    title: 'Morning Devotion: Trusting God\'s Timing',
    description: 'A morning devotion about learning to trust in God\'s perfect timing. Rev. Yassin Gammah shares how God\'s delays are not God\'s denials, and how to wait patiently on the Lord.',
    thumbnail: 'https://images.pexels.com/photos/8468075/pexels-photo-8468075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    publishedAt: '2024-11-08T06:00:00Z',
    duration: '25 min',
    viewCount: '456',
    channelTitle: 'MVAMA CCAP NKHOMA SYNOD',
  },
  {
    id: 'dQw4w9WgXcW',
    title: 'Evening Devotion: Finding Peace in Chaos',
    description: 'An evening reflection on finding God\'s peace in the midst of life\'s storms. Learn practical ways to maintain inner calm and spiritual focus during difficult times.',
    thumbnail: 'https://images.pexels.com/photos/8468080/pexels-photo-8468080.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    publishedAt: '2024-11-07T18:00:00Z',
    duration: '20 min',
    viewCount: '623',
    channelTitle: 'MVAMA CCAP NKHOMA SYNOD',
  },
  {
    id: 'dQw4w9WgXcX',
    title: 'Sunday Service: The Love of Christ',
    description: 'A powerful Sunday service message about the unconditional love of Christ and how it transforms our relationships. Rev. Yassin Gammah explores the depth of God\'s love for humanity.',
    thumbnail: 'https://images.pexels.com/photos/8468085/pexels-photo-8468085.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    publishedAt: '2024-11-05T10:00:00Z',
    duration: '48 min',
    viewCount: '1,892',
    channelTitle: 'MVAMA CCAP NKHOMA SYNOD',
  },
  {
    id: 'dQw4w9WgXcY',
    title: 'Youth Service: Living for Christ in Today\'s World',
    description: 'A special message for young people about maintaining Christian values in a secular world. Practical advice for staying true to your faith while engaging with modern culture.',
    thumbnail: 'https://images.pexels.com/photos/8468090/pexels-photo-8468090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    publishedAt: '2024-11-01T19:00:00Z',
    duration: '35 min',
    viewCount: '1,156',
    channelTitle: 'MVAMA CCAP NKHOMA SYNOD',
  },
  {
    id: 'dQw4w9WgXcZ',
    title: 'Prayer and Fasting: Spiritual Discipline',
    description: 'Understanding the importance of prayer and fasting in the Christian life. Rev. Yassin Gammah teaches about spiritual disciplines that draw us closer to God.',
    thumbnail: 'https://images.pexels.com/photos/8468095/pexels-photo-8468095.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    publishedAt: '2024-10-30T10:00:00Z',
    duration: '41 min',
    viewCount: '2,345',
    channelTitle: 'MVAMA CCAP NKHOMA SYNOD',
  },
];
