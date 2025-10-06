# Firebase Setup Guide for MVAMA Connect News

This guide will help you set up Firebase to manage news articles for the MVAMA Connect app.

## 🚀 Quick Start

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `mvama-connect` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Add Web App to Project

1. In your Firebase project dashboard, click the web icon `</>`
2. Register app with nickname: `MVAMA Connect Web`
3. Copy the configuration object (you'll need this next)

### 3. Configure Firebase in App

1. Open `config/firebase.ts`
2. Replace the placeholder config with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

### 5. Create News Collection Structure

The app expects a collection called `news` with documents containing:

```javascript
{
  title: "Article Title",
  category: "Community", // Community, Youth, Groups, Events, etc.
  excerpt: "Brief description...",
  content: "Full article content...",
  imageUrl: "https://example.com/image.jpg",
  readTime: "3 min read",
  featured: false, // true for featured articles
  author: "Rev. Yassin Gammah",
  tags: ["community", "outreach"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 📝 Adding News Articles

### Option 1: Firebase Console (Manual)

1. Go to Firestore Database in Firebase Console
2. Click "Start collection" and name it `news`
3. Add documents with the structure above

### Option 2: Using the App Service (Programmatic)

```typescript
import { newsService } from './services/newsService';

// Add a news article
const articleId = await newsService.addNews({
  title: "New Community Program",
  category: "Community",
  excerpt: "Join our new outreach initiative...",
  content: "Full article content here...",
  imageUrl: "https://example.com/image.jpg",
  readTime: "3 min read",
  featured: true,
  author: "Rev. Yassin Gammah",
  tags: ["community", "outreach"]
});
```

## 🔧 Firebase Security Rules

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to news articles
    match /news/{document} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
```

## 📊 Available Categories

The news service supports these categories:
- Community
- Youth
- Groups
- Events
- Missions
- Worship
- Announcements
- Ministry
- Education
- Outreach

## 🎯 Features Included

### ✅ Real-time Data
- Fetches news from Firebase Firestore
- Automatic updates when data changes
- Offline support with cached data

### ✅ Rich Content Support
- **Title**: Article headline
- **Category**: Organized content types
- **Images**: High-quality article images
- **Date & Time**: Automatic timestamps
- **Read Time**: Estimated reading duration
- **Featured Articles**: Highlighted content
- **Author**: Content attribution
- **Tags**: Content categorization

### ✅ User Experience
- Loading states
- Pull-to-refresh functionality
- Online/offline indicators
- Error handling with fallbacks
- Responsive design

## 🔄 Mock Data Fallback

If Firebase is not configured or unavailable, the app automatically falls back to mock data to ensure the app continues working. This includes:

- Sample community news
- Youth ministry updates
- Small group announcements

## 🚨 Troubleshooting

### Firebase Not Connected
- Check your `config/firebase.ts` configuration
- Ensure Firestore is enabled in Firebase Console
- Verify your project ID is correct

### No News Showing
- Check if the `news` collection exists in Firestore
- Verify documents have the correct structure
- Check browser console for error messages

### Images Not Loading
- Ensure `imageUrl` fields contain valid URLs
- Check if images are publicly accessible
- Consider using Firebase Storage for image hosting

## 📱 Testing

1. Start the development server: `npm run dev`
2. Navigate to the News tab
3. You should see:
   - "Connected to Firebase" indicator (if online)
   - News articles from your Firestore database
   - Pull-to-refresh functionality
   - Loading states

## 🎉 You're All Set!

Your MVAMA Connect app now has a fully functional news system powered by Firebase! You can add, edit, and manage news articles through the Firebase Console or programmatically using the news service.
