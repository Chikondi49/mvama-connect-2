# 🔥 Firebase Data Setup Guide

## 📊 **Data Structure Overview**

The app uses two main Firestore collections:

### **1. `audioSeries` Collection**
Contains podcast-style series information:
```javascript
{
  id: "series-doc-id",           // Document ID (used for seriesId in episodes)
  title: "Sunday Service Messages",
  description: "Weekly Sunday service messages...",
  coverImage: "https://...",
  speaker: "Rev. Yassin Gammah",
  totalEpisodes: 4,
  category: "Sunday Service",
  createdAt: "2024-11-10T10:00:00Z",
  updatedAt: "2024-11-10T10:00:00Z"
}
```

### **2. `audioSermons` Collection**
Contains individual episodes with series linking:
```javascript
{
  id: "episode-doc-id",
  title: "The Power of Faith in Difficult Times",
  speaker: "Rev. Yassin Gammah",
  description: "A powerful message about maintaining faith...",
  audioUrl: "https://...",
  duration: "42:15",
  publishedAt: "2024-11-10T10:00:00Z",
  category: "Sunday Service",
  seriesId: "series-doc-id",        // 🔗 Links to audioSeries document ID
  episodeNumber: 1,
  downloadUrl: "https://..."
}
```

## 🔗 **Series-Episode Linking**

**Critical:** Episodes are linked to series by matching:
- `audioSermons.seriesId` = `audioSeries.id` (document ID)

## 🛠️ **Setup Steps**

### **Step 1: Create Collections**
1. Go to Firebase Console → Firestore Database
2. Create collection: `audioSeries`
3. Create collection: `audioSermons`

### **Step 2: Add Sample Data**
You can either:

#### **Option A: Use the App's Sample Data Creator**
1. Uncomment the sample data creation code in `sermons.tsx`
2. The app will automatically create sample data in Firestore

#### **Option B: Manual Setup**
1. Add documents to `audioSeries` collection
2. Add documents to `audioSermons` collection
3. Ensure `seriesId` in episodes matches series document IDs

### **Step 3: Verify Data Structure**
The app includes debugging that will show:
- How many series and episodes are found
- Which episodes are linked to which series
- Any orphaned episodes (episodes without matching series)

## 📋 **Sample Data Structure**

### **Series Document Example:**
```javascript
// Document ID: "sunday-service-series"
{
  title: "Sunday Service Messages",
  description: "Weekly Sunday service messages from MVAMA CCAP Nkhoma Synod",
  coverImage: "https://images.pexels.com/photos/8468012/pexels-photo-8468012.jpeg",
  speaker: "Rev. Yassin Gammah",
  totalEpisodes: 4,
  category: "Sunday Service",
  createdAt: "2024-11-10T10:00:00Z",
  updatedAt: "2024-11-10T10:00:00Z"
}
```

### **Episode Document Example:**
```javascript
// Document ID: "episode-1"
{
  title: "The Power of Faith in Difficult Times",
  speaker: "Rev. Yassin Gammah",
  description: "A powerful message about maintaining faith during challenging seasons",
  audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  duration: "42:15",
  publishedAt: "2024-11-10T10:00:00Z",
  category: "Sunday Service",
  seriesId: "sunday-service-series",  // 🔗 Links to series document ID
  episodeNumber: 1,
  downloadUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
}
```

## 🔍 **Debugging & Verification**

The app includes comprehensive debugging that shows:

### **Console Output:**
```
🎵 Loading audio sermons...
📊 Found 2 series in Firestore
🔍 Processing series: "Sunday Service Messages" (ID: sunday-service-series)
📺 Found 3 episodes for series "Sunday Service Messages"
📋 Episodes for "Sunday Service Messages": [
  { id: "episode-1", title: "The Power of Faith...", seriesId: "sunday-service-series", episodeNumber: 1 }
]
```

### **What to Look For:**
- ✅ Series are loaded from Firestore
- ✅ Episodes are found for each series
- ✅ `seriesId` in episodes matches series document IDs
- ✅ No orphaned episodes (episodes without matching series)

## 🚨 **Common Issues & Solutions**

### **Issue 1: No Episodes Found**
**Symptoms:** `📺 Found 0 episodes for series "Series Name"`
**Solution:** Check that `seriesId` in episodes exactly matches series document IDs

### **Issue 2: Orphaned Episodes**
**Symptoms:** Episodes exist but don't appear under any series
**Solution:** Update `seriesId` field in episodes to match series document IDs

### **Issue 3: Wrong Series-Episode Linking**
**Symptoms:** Episodes appear under wrong series
**Solution:** Verify `seriesId` values are correct

## 🎯 **Success Indicators**

You'll know it's working when you see:
- ✅ Series loaded from Firestore
- ✅ Episodes found for each series
- ✅ Episodes display with vertical gold banners
- ✅ Proper series-episode relationships
- ✅ No "No Episodes Found" messages

The app will automatically fall back to local sample data if no Firestore data is found, ensuring it always works! 🎵✨
