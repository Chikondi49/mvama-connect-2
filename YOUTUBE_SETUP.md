# YouTube Integration Setup Guide

This guide will help you set up the YouTube Data API integration for the MVAMA Connect app to fetch real sermon videos from the church's YouTube channel.

## Prerequisites

1. Google Cloud Console account
2. YouTube channel: `@mvamaccapnkhomasynod`

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give your project a name (e.g., "MVAMA Connect")
4. Click "Create"

## Step 2: Enable YouTube Data API v3

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

## Step 3: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key:
   - Click on the API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Under "Application restrictions", you can restrict by HTTP referrers, IP addresses, etc.

## Step 4: Configure the App

1. Open `config/youtube.ts`
2. Replace `YOUR_YOUTUBE_API_KEY_HERE` with your actual API key:
   ```typescript
   export const YOUTUBE_CONFIG = {
     API_KEY: 'your_actual_api_key_here',
     // ... rest of config
   };
   ```
3. Set `USE_MOCK_DATA` to `false`:
   ```typescript
   USE_MOCK_DATA: false,
   ```

## Step 5: Find the Channel ID (Optional)

The app will automatically find the channel ID using the handle `@mvamaccapnkhomasynod`, but you can also manually set it:

1. Visit the YouTube channel
2. Copy the channel ID from the URL or use the YouTube API
3. Update the `CHANNEL.ID` in `config/youtube.ts`

## Step 6: Test the Integration

1. Start your development server: `npx expo start`
2. Navigate to the Sermons tab
3. You should see real videos from the MVAMA CCAP Nkhoma Synod channel

## API Quotas and Limits

- YouTube Data API v3 has daily quotas
- Each API call consumes quota units
- Monitor your usage in Google Cloud Console
- Consider implementing caching for production use

## Troubleshooting

### Common Issues:

1. **"API key not valid"**
   - Check that you copied the API key correctly
   - Ensure the YouTube Data API v3 is enabled
   - Check API key restrictions

2. **"Channel not found"**
   - Verify the channel handle `@mvamaccapnkhomasynod` is correct
   - The channel might be private or not exist

3. **"Quota exceeded"**
   - You've hit the daily API quota limit
   - Wait for the quota to reset (usually at midnight Pacific Time)
   - Consider optimizing API calls

### Development Mode

If you don't have an API key yet, the app will use mock data automatically. Set `USE_MOCK_DATA: true` in the config to use sample sermon data for development.

## Security Notes

- Never commit your API key to version control
- Consider using environment variables for production
- Implement proper error handling for API failures
- Add rate limiting to prevent quota exhaustion

## Features Included

✅ **Real YouTube Data Integration**
- Fetches videos from MVAMA CCAP Nkhoma Synod channel
- Displays video titles, descriptions, thumbnails
- Shows publish dates, duration, and view counts

✅ **Video Player**
- Embedded YouTube player using WebView
- Full-screen video playback
- Native mobile controls

✅ **Search and Filtering**
- Search sermons by title and description
- Filter by categories (All, Recent, etc.)
- Pull-to-refresh functionality

✅ **Sermon Details**
- Full sermon descriptions
- Share functionality
- Open in YouTube app option

✅ **Responsive Design**
- Maintains the app's dark theme
- Optimized for mobile viewing
- Loading states and error handling
