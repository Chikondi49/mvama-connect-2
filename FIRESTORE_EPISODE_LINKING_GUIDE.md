# 🔗 Firestore Episode Linking Guide

## How Episodes Are Linked to Series in Firestore

This guide explains how the app fetches and displays episodes from Firestore collections based on the series reference.

## 📊 **Data Structure**

### **Collections:**
- **`audioSermons`** - Individual episodes
- **`audioSeries`** - Series/podcast collections

### **Linking Logic:**
- Episodes in `audioSermons` have a `seriesId` field
- This `seriesId` must match the document ID in `audioSeries`
- The app queries episodes where `seriesId == audioSeries.documentId`

## 🔄 **Data Flow Process**

### **Step 1: Load Series**
```typescript
// 1. Fetch all series from audioSeries collection
const series = await audioSermonService.getAllAudioSeries();
```

### **Step 2: Load Episodes for Each Series**
```typescript
// 2. For each series, fetch episodes where seriesId matches series document ID
const episodes = await audioSermonService.getEpisodesBySeries(audioSeries.id);
```

### **Step 3: Query Logic**
```typescript
// 3. Firestore query in getEpisodesBySeries()
const q = query(
  sermonsRef, 
  where('seriesId', '==', seriesId),  // seriesId must match series document ID
  orderBy('episodeNumber', 'asc')
);
```

### **Step 4: Display Episodes**
```typescript
// 4. Episodes are displayed with vertical gold banner
{filteredEpisodes.map((episode) => (
  <View key={episode.id}>
    <View style={styles.episodeBanner}>
      <Text>EPISODE {episode.episodeNumber}</Text>
    </View>
    // ... episode content
  </View>
))}
```

## 🎯 **Required Data Setup**

### **1. Create Series Document**
```javascript
// In Firebase Console or via code
// Collection: audioSeries
// Document ID: "series-sunday-service-2024" (this becomes the seriesId)
{
  title: "Sunday Service Messages",
  description: "Weekly Sunday service messages",
  coverImage: "https://...",
  speaker: "Rev. Yassin Gammah",
  category: "Sunday Service",
  totalEpisodes: 0,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-11-10T10:00:00Z"
}
```

### **2. Create Episode Documents**
```javascript
// In Firebase Console or via code
// Collection: audioSermons
// seriesId must match the series document ID
{
  title: "The Power of Faith",
  speaker: "Rev. Yassin Gammah",
  description: "A powerful message about faith",
  audioUrl: "https://...",
  duration: "42:15",
  publishedAt: "2024-11-10T10:00:00Z",
  category: "Sunday Service",
  seriesId: "series-sunday-service-2024", // Must match series document ID
  episodeNumber: 1
}
```

## 🔍 **Debugging the Link**

### **Console Logs to Check:**
```
🎵 Loading audio sermons from Firestore...
✅ Loaded X audio series from Firestore
🔍 Processing series: "Series Title" (ID: series-id)
📺 Found Y episodes for series "Series Title"
🎯 Opening series: "Series Title"
📊 Series episodes count: Y
🔍 Filtered episodes count: Z
```

### **What Each Log Means:**
- **"Loaded X audio series"** - Number of series found
- **"Found Y episodes"** - Episodes linked to that series
- **"Series episodes count: Y"** - Episodes in the selected series
- **"Filtered episodes count: Z"** - Episodes after filtering

## 🛠️ **Common Issues & Solutions**

### **Issue 1: No Episodes Found**
**Symptoms:** `📺 Found 0 episodes for series`
**Causes:**
- Episodes don't have `seriesId` field
- `seriesId` doesn't match series document ID
- Episodes are in wrong collection

**Solution:**
```javascript
// Check episode document in Firestore
// Ensure seriesId field exists and matches series document ID
{
  seriesId: "exact-series-document-id" // Must be exact match
}
```

### **Issue 2: Episodes Exist But Don't Show**
**Symptoms:** `📊 Series episodes count: 3` but `🔍 Filtered episodes count: 0`
**Causes:**
- Search query filtering out episodes
- Category filter not matching
- Date filter excluding episodes

**Solution:**
```typescript
// Clear filters
setSearchQuery('');
setSelectedCategory('All');
```

### **Issue 3: Series Not Found**
**Symptoms:** `✅ Loaded 0 audio series from Firestore`
**Causes:**
- No documents in `audioSeries` collection
- Authentication issues
- Firestore rules blocking access

**Solution:**
```javascript
// Check Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /audioSeries/{document} {
      allow read: if request.auth != null;
    }
    match /audioSermons/{document} {
      allow read: if request.auth != null;
    }
  }
}
```

## 🎯 **Verification Steps**

### **1. Check Firestore Console**
1. Go to Firebase Console → Firestore Database
2. Check `audioSeries` collection - should have series documents
3. Check `audioSermons` collection - should have episodes with `seriesId`
4. Verify `seriesId` values match series document IDs

### **2. Check Console Logs**
1. Look for successful data loading logs
2. Verify episode counts are > 0
3. Check for any error messages

### **3. Check Visual Debug**
1. If episodes don't show, look for debug message:
   ```
   Debug: Series has X episodes, Y after filtering
   ```
2. This tells you if episodes exist but are being filtered out

## 🚀 **Quick Test**

### **Create Test Data:**
```typescript
// Use the service method to create sample data
await audioSermonService.createSampleData();
```

### **Expected Result:**
- Series appear in the list
- Clicking a series shows episodes with gold banners
- Episodes display with "EPISODE X" in vertical banner
- Console shows successful data loading

## 🎉 **Success Indicators**

You'll know it's working when:
- ✅ Console shows episodes being loaded for each series
- ✅ Series display with correct episode counts
- ✅ Episodes appear with vertical gold banners
- ✅ No "No Episodes Found" messages
- ✅ Episodes are properly numbered and ordered

The key is ensuring the `seriesId` field in episodes exactly matches the document ID in the `audioSeries` collection! 🎵✨
