# 🎯 Episode Debug Guide

## Problem: Episodes Not Showing Under Series

Even when series reference IDs match correctly, episodes aren't displaying with the vertical gold banner under the series.

## 🔍 **What We've Added**

### **1. Console Debugging**
The app now logs detailed information when:
- Loading audio sermons from Firestore
- Processing each series
- Opening a series
- Filtering episodes

### **2. Visual Debug Information**
When episodes don't show, you'll see:
```
No Episodes Found
This series doesn't have any episodes yet.
Debug: Series has 0 episodes, 0 after filtering
```

Or:
```
No Episodes Found
No episodes match your current filter.
Debug: Series has 3 episodes, 0 after filtering
```

## 🎯 **How to Debug**

### **Step 1: Check Console Logs**
Look for these logs in your console:

```
🎵 Loading audio sermons from Firestore...
✅ Loaded X audio series from Firestore
🔍 Processing series: "Series Title" (ID: series-id)
📺 Found Y episodes for series "Series Title"
✅ Created podcast series "Series Title" with Y episodes

🎯 Opening series: "Series Title"
📊 Series episodes count: Y
📋 Episodes in series: [episode data]

🔍 DEBUG: Selected series "Series Title"
📊 Series episodes count: Y
🔍 Filtered episodes count: Z
📋 Filtered episodes: [filtered episode data]
```

### **Step 2: Identify the Issue**

#### **Issue A: No Episodes in Series**
If you see: `📊 Series episodes count: 0`
**Problem:** Episodes aren't linked to the series
**Solution:** Check Firestore data and ensure episodes have correct `seriesId`

#### **Issue B: Episodes Filtered Out**
If you see: `📊 Series episodes count: 3` but `🔍 Filtered episodes count: 0`
**Problem:** Episodes exist but are being filtered out
**Solution:** Check search query and category filters

#### **Issue C: No Series Data**
If you see: `✅ Loaded 0 audio series from Firestore`
**Problem:** No series in database
**Solution:** Create series data in Firestore

### **Step 3: Check Data Structure**

#### **Verify Episode Structure:**
```typescript
// Episode should have:
{
  id: "episode-id",
  title: "Episode Title",
  seriesId: "series-id", // Must match series document ID
  episodeNumber: 1,
  // ... other fields
}
```

#### **Verify Series Structure:**
```typescript
// Series should have:
{
  id: "series-id",
  title: "Series Title",
  episodes: [episode1, episode2, ...], // Must contain episodes
  // ... other fields
}
```

## 🛠️ **Quick Fixes**

### **Fix 1: Clear Filters**
```typescript
// Clear search and set category to "All"
setSearchQuery('');
setSelectedCategory('All');
```

### **Fix 2: Check Firestore Data**
1. Go to Firebase Console
2. Check `audioSermons` collection
3. Verify episodes have correct `seriesId`
4. Check `audioSeries` collection
5. Verify series documents exist

### **Fix 3: Create Sample Data**
```typescript
// In your app, call this once
await audioSermonService.createSampleData();
```

## 🎯 **Expected Behavior**

After the fix:
1. **Series List:** Shows available series
2. **Series Selection:** Clicking a series shows episodes with gold banners
3. **Episode Display:** Episodes appear with "EPISODE X" in vertical gold banner
4. **Console Logs:** Show successful data loading
5. **No Debug Messages:** No "No Episodes Found" messages

## 🔍 **Debugging Checklist**

- [ ] Check console for debug output
- [ ] Verify episodes exist in Firestore
- [ ] Check series-episode relationships
- [ ] Clear search and category filters
- [ ] Check Firestore data structure
- [ ] Verify authentication and permissions
- [ ] Check network connectivity

The enhanced debugging will show you exactly what's happening with your data, making it easy to identify and fix the issue! 🎵✨
