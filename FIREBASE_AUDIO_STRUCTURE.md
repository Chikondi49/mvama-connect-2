# 🎵 Firebase Firestore Structure for Audio Sermons

## 📁 **Collection Structure**

### **1. Collection: `audioSermons`**
**Purpose:** Individual audio sermon episodes

#### **Document Fields:**
```typescript
{
  // Basic Information
  title: string;                    // "The Power of Faith in Difficult Times"
  speaker: string;                   // "Rev. Yassin Gammah"
  description: string;               // Full sermon description
  audioUrl: string;                  // "https://storage.googleapis.com/..."
  duration: string;                  // "42:15" or "1:23:45"
  publishedAt: string;              // "2024-11-10T10:00:00Z" (ISO date)
  
  // Categorization
  category: string;                 // "Sunday Service", "Morning Devotion", "Evening Devotion"
  
  // Optional Fields
  thumbnailUrl?: string;            // "https://storage.googleapis.com/..." (Recommended: 800x450px, 16:9 aspect ratio)
  downloadUrl?: string;             // "https://storage.googleapis.com/..."
  viewCount?: number;               // 1234
  tags?: string[];                  // ["faith", "difficult times", "encouragement"]
  
  // Series Information (if part of a series)
  seriesId?: string;                // Reference to audioSeries document
  episodeNumber?: number;           // 1, 2, 3, etc.
}
```

### **2. Collection: `audioSeries`**
**Purpose:** Podcast-style series/collections

#### **Document Fields:**
```typescript
{
  // Basic Information
  title: string;                    // "Sunday Service Messages"
  description: string;              // Series description
  coverImage: string;               // "https://storage.googleapis.com/..." (Recommended: 3000x3000px, 1:1 aspect ratio)
  speaker: string;                  // "Rev. Yassin Gammah"
  category: string;                 // "Sunday Service"
  
  // Statistics
  totalEpisodes: number;            // 4
  
  // Timestamps
  createdAt: string;               // "2024-01-01T00:00:00Z"
  updatedAt: string;                // "2024-11-10T10:00:00Z"
}
```

## 📝 **Sample Data Examples**

### **Sample Audio Sermon Document:**
```json
{
  "title": "The Power of Faith in Difficult Times",
  "speaker": "Rev. Yassin Gammah",
  "description": "A powerful message about maintaining faith during challenging seasons of life. This sermon explores biblical principles for overcoming adversity and finding strength in God's promises.",
  "audioUrl": "https://storage.googleapis.com/mvama-connect-audio/sermons/faith-difficult-times.mp3",
  "duration": "42:15",
  "publishedAt": "2024-11-10T10:00:00Z",
  "category": "Sunday Service",
  "thumbnailUrl": "https://storage.googleapis.com/mvama-connect-images/thumbnails/faith-difficult-times.jpg", // 800x450px, 16:9 aspect ratio
  "downloadUrl": "https://storage.googleapis.com/mvama-connect-audio/sermons/faith-difficult-times.mp3",
  "viewCount": 1234,
  "tags": ["faith", "difficult times", "encouragement", "biblical principles"],
  "seriesId": "series-sunday-service-2024",
  "episodeNumber": 1
}
```

### **Sample Audio Series Document:**
```json
{
  "title": "Sunday Service Messages",
  "description": "Weekly Sunday service messages from MVAMA CCAP Nkhoma Synod, delivering powerful biblical teachings and spiritual guidance.",
  "coverImage": "https://storage.googleapis.com/mvama-connect-images/series/sunday-service-cover.jpg", // 3000x3000px, 1:1 aspect ratio
  "speaker": "Rev. Yassin Gammah",
  "category": "Sunday Service",
  "totalEpisodes": 4,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-11-10T10:00:00Z"
}
```

## 🔧 **Firebase Console Setup**

### **Step 1: Create Collections**
1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Create collection: `audioSermons`
4. Create collection: `audioSeries`

### **Step 2: Add Sample Documents**
1. In `audioSermons` collection, click "Add document"
2. Use auto-generated ID or custom ID
3. Add the fields as shown above
4. Repeat for multiple sermons

### **Step 3: Set Up Indexes**
Create these composite indexes in Firebase Console:

**For `audioSermons` collection:**
- `category` (Ascending) + `publishedAt` (Descending)
- `seriesId` (Ascending) + `episodeNumber` (Ascending)
- `publishedAt` (Descending)

**For `audioSeries` collection:**
- `category` (Ascending) + `createdAt` (Descending)
- `createdAt` (Descending)

## 📱 **Integration with App**

### **Update Sermons Tab:**
The app will now fetch real data from Firestore instead of mock data:

```typescript
// In sermons.tsx
import { audioSermonService } from '../../services/audioSermonService';

// Replace mock data with real Firestore data
const [podcastSeries, setPodcastSeries] = useState<PodcastSeries[]>([]);

useEffect(() => {
  loadAudioSermons();
}, []);

const loadAudioSermons = async () => {
  try {
    const series = await audioSermonService.getAllAudioSeries();
    setPodcastSeries(series);
  } catch (error) {
    console.error('Error loading audio sermons:', error);
  }
};
```

## 🎯 **Categories to Use**

### **Suggested Categories:**
- `Sunday Service`
- `Morning Devotion`
- `Evening Devotion`
- `Youth Service`
- `Prayer Meeting`
- `Special Events`
- `Bible Study`

## 📊 **Data Migration**

### **From Mock Data to Firestore:**
1. Export your current mock data
2. Transform it to match the Firestore structure
3. Upload to Firestore using the Firebase Console or Admin SDK
4. Update the app to use the new service

## 🔐 **Security Rules**

Add these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Audio sermons - read only for authenticated users
    match /audioSermons/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Audio series - read only for authenticated users
    match /audioSeries/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## 🎉 **Benefits of This Structure**

1. **Scalable** - Easy to add more sermons and series
2. **Searchable** - Can filter by category, speaker, date
3. **Organized** - Clear separation between individual sermons and series
4. **Flexible** - Can add more fields as needed
5. **Real-time** - Updates automatically when data changes
6. **Offline Support** - Works with Firebase offline capabilities

This structure will allow your app to display real audio sermons from Firestore with proper categorization, series organization, and all the metadata needed for a professional audio sermon experience! 🎵✨
