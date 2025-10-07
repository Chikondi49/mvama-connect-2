# 🔧 Episode-Series Troubleshooting Guide

## Problem: Episodes Not Showing Under Series

If episodes are not appearing under their respective series in the sermons screen, follow this troubleshooting guide.

## 🔍 **Step 1: Check Console Logs**

The enhanced service now includes comprehensive debugging. Check your console for these logs:

### **Expected Debug Output:**
```
🔍 DEBUG: Checking all episodes and series...
📊 Total episodes in database: X
📊 Total series in database: Y
📊 Episodes with seriesId: Z
📊 Episodes without seriesId: W
📊 Episodes grouped by series:
  Series [seriesId]: X episodes
    - Episode Title (Episode 1)
    - Episode Title (Episode 2)
🔍 Series [seriesId] exists: true/false
```

## 🛠️ **Step 2: Common Issues & Solutions**

### **Issue 1: No Episodes in Database**
**Symptoms:** `Total episodes in database: 0`
**Solution:** 
```typescript
// Create sample data
await audioSermonService.createSampleData();
```

### **Issue 2: Episodes Without SeriesId**
**Symptoms:** `Episodes without seriesId: X` (where X > 0)
**Solution:**
```typescript
// Get orphaned episodes
const orphaned = await audioSermonService.getOrphanedEpisodes();

// Assign them to a series
for (const episode of orphaned) {
  await audioSermonService.assignEpisodeToSeries(episode.id, targetSeriesId);
}
```

### **Issue 3: Series Don't Exist**
**Symptoms:** `Series [seriesId] exists: false`
**Solution:**
```typescript
// Create the missing series first
const newSeries = {
  title: "Series Title",
  description: "Series description",
  coverImage: "https://...",
  speaker: "Speaker Name",
  totalEpisodes: 0,
  category: "Sunday Service",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const seriesRef = collection(db, 'audioSeries');
const seriesDoc = await addDoc(seriesRef, newSeries);
```

### **Issue 4: Episodes Have Wrong SeriesId**
**Symptoms:** Episodes exist but don't match any series
**Solution:**
```typescript
// Update episode seriesId
const episodeRef = doc(db, 'audioSermons', episodeId);
await updateDoc(episodeRef, {
  seriesId: correctSeriesId,
  updatedAt: new Date().toISOString()
});
```

## 🔧 **Step 3: Manual Data Verification**

### **Check Firestore Console:**
1. Go to Firebase Console → Firestore Database
2. Check `audioSermons` collection
3. Verify episodes have `seriesId` field
4. Check `audioSeries` collection
5. Verify series documents exist

### **Verify Data Structure:**
```typescript
// Episode should have:
{
  title: "Episode Title",
  seriesId: "actual-series-id", // Must match series document ID
  episodeNumber: 1,
  // ... other fields
}

// Series should have:
{
  title: "Series Title",
  totalEpisodes: 2, // Should match actual episode count
  // ... other fields
}
```

## 🚀 **Step 4: Quick Fixes**

### **Fix 1: Create Sample Data**
```typescript
// In your app, call this once
await audioSermonService.createSampleData();
```

### **Fix 2: Reassign All Episodes**
```typescript
// Get all episodes and series
const episodes = await audioSermonService.getAllAudioSermons();
const series = await audioSermonService.getAllAudioSeries();

// Assign episodes to first available series
if (series.length > 0 && episodes.length > 0) {
  const targetSeries = series[0];
  for (const episode of episodes) {
    if (!episode.seriesId) {
      await audioSermonService.assignEpisodeToSeries(episode.id, targetSeries.id);
    }
  }
}
```

### **Fix 3: Reset and Recreate**
```typescript
// Delete all episodes and series, then recreate
// (Use Firebase Console or Admin SDK)
```

## 📊 **Step 5: Data Validation**

### **Validate Series-Episode Relationships:**
```typescript
const debugData = async () => {
  const series = await audioSermonService.getAllAudioSeries();
  const episodes = await audioSermonService.getAllAudioSermons();
  
  console.log('Series:', series.map(s => ({ id: s.id, title: s.title })));
  console.log('Episodes:', episodes.map(e => ({ 
    id: e.id, 
    title: e.title, 
    seriesId: e.seriesId 
  })));
  
  // Check for mismatched seriesId
  const episodeSeriesIds = [...new Set(episodes.map(e => e.seriesId).filter(Boolean))];
  const seriesIds = series.map(s => s.id);
  
  const orphanedSeriesIds = episodeSeriesIds.filter(id => !seriesIds.includes(id));
  console.log('Orphaned seriesIds:', orphanedSeriesIds);
};
```

## 🎯 **Step 6: Prevention**

### **Always Use Service Methods:**
```typescript
// ✅ Good: Use service methods
await audioSermonService.createAudioEpisode(episodeData);
await audioSermonService.assignEpisodeToSeries(episodeId, seriesId);

// ❌ Bad: Direct Firestore operations without validation
```

### **Validate Before Creating:**
```typescript
// Always validate series exists
const seriesExists = await audioSermonService.validateSeriesExists(seriesId);
if (!seriesExists) {
  console.error('Series does not exist');
  return;
}
```

## 🔍 **Step 7: Advanced Debugging**

### **Check Firestore Indexes:**
Ensure these indexes exist in Firebase Console:
- `audioSermons`: `seriesId` (Ascending) + `episodeNumber` (Ascending)
- `audioSermons`: `category` (Ascending) + `publishedAt` (Descending)

### **Check Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /audioSermons/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /audioSeries/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 📱 **Step 8: Test the Fix**

### **Expected Behavior:**
1. Series appear in the sermons screen
2. Clicking on a series shows its episodes
3. Episodes are properly numbered and ordered
4. Console shows successful data loading

### **Test Commands:**
```typescript
// Test data loading
await audioSermonService.debugEpisodesAndSeries();

// Test episode retrieval
const series = await audioSermonService.getAllAudioSeries();
const episodes = await audioSermonService.getEpisodesBySeries(series[0].id);
console.log('Episodes for first series:', episodes.length);
```

## 🎉 **Success Indicators**

You'll know the fix worked when:
- ✅ Console shows episodes grouped by series
- ✅ Series display with correct episode counts
- ✅ Episodes appear when clicking on a series
- ✅ No orphaned episodes in debug output
- ✅ All series exist and are valid

## 🆘 **Still Having Issues?**

If episodes still don't show:
1. Check Firebase Console for actual data
2. Verify Firestore security rules
3. Check network connectivity
4. Ensure proper authentication
5. Review console for error messages

The enhanced debugging will show exactly what's happening with your data! 🎵✨
