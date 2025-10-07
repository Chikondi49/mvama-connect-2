# 📅 Firebase Firestore Structure for Events

## 📁 **Collection Structure**

### **Collection: `events`**
**Purpose:** Church events and activities

#### **Document Fields:**
```typescript
{
  // Basic Information
  title: string;                    // "Sunday Service - Faith and Hope"
  description: string;               // Full event description
  date: string;                      // "2024-11-15" (YYYY-MM-DD format)
  time: string;                      // "10:00 AM" or "14:30"
  location: string;                  // "MVAMA CCAP Nkhoma Synod Main Hall"
  
  // Categorization
  category: string;                 // "Sunday Service", "Youth Event", "Prayer Meeting", "Special Event"
  
  // Visual
  imageUrl?: string;                // "https://storage.googleapis.com/..." (Recommended: 1200x675px, 16:9 aspect ratio)
  
  // Registration Details
  registrationRequired: boolean;    // true/false
  registrationUrl?: string;         // "https://forms.google.com/..."
  maxAttendees?: number;            // 100
  currentAttendees?: number;        // 45
  
  // Contact Information
  contactPerson?: string;           // "Rev. Yassin Gammah"
  contactPhone?: string;            // "+265 123 456 789"
  contactEmail?: string;            // "events@mvama.org"
  
  // Status and Metadata
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  tags?: string[];                  // ["worship", "youth", "community"]
  createdAt: string;               // "2024-11-01T00:00:00Z"
  updatedAt: string;               // "2024-11-10T10:00:00Z"
}
```

## 📝 **Sample Data Examples**

### **Sample Event Document:**
```json
{
  "title": "Sunday Service - The Power of Faith",
  "description": "Join us for our weekly Sunday service as we explore the power of faith in our daily lives. This service will include worship, prayer, and a powerful message from Rev. Yassin Gammah.",
  "date": "2024-11-17",
  "time": "10:00 AM",
  "location": "MVAMA CCAP Nkhoma Synod Main Hall",
  "category": "Sunday Service",
  "imageUrl": "https://storage.googleapis.com/mvama-connect-images/events/sunday-service-nov17.jpg", // 1200x675px, 16:9 aspect ratio
  "registrationRequired": false,
  "contactPerson": "Rev. Yassin Gammah",
  "contactPhone": "+265 123 456 789",
  "contactEmail": "pastor@mvama.org",
  "status": "upcoming",
  "tags": ["worship", "sunday service", "faith"],
  "createdAt": "2024-11-01T00:00:00Z",
  "updatedAt": "2024-11-10T10:00:00Z"
}
```

### **Sample Youth Event Document:**
```json
{
  "title": "Youth Fellowship Night",
  "description": "A special evening for our youth community featuring games, music, fellowship, and spiritual discussions. All youth aged 13-25 are welcome!",
  "date": "2024-11-20",
  "time": "6:00 PM",
  "location": "MVAMA CCAP Nkhoma Synod Youth Hall",
  "category": "Youth Event",
  "imageUrl": "https://storage.googleapis.com/mvama-connect-images/events/youth-fellowship-nov20.jpg", // 1200x675px, 16:9 aspect ratio
  "registrationRequired": true,
  "registrationUrl": "https://forms.google.com/youth-fellowship-nov20",
  "maxAttendees": 50,
  "currentAttendees": 23,
  "contactPerson": "Youth Pastor John",
  "contactPhone": "+265 987 654 321",
  "contactEmail": "youth@mvama.org",
  "status": "upcoming",
  "tags": ["youth", "fellowship", "community"],
  "createdAt": "2024-11-05T00:00:00Z",
  "updatedAt": "2024-11-10T15:30:00Z"
}
```

### **Sample Prayer Meeting Document:**
```json
{
  "title": "Weekly Prayer Meeting",
  "description": "Join us for our weekly prayer meeting where we come together to pray for our community, nation, and personal needs. All are welcome to participate.",
  "date": "2024-11-14",
  "time": "7:00 PM",
  "location": "MVAMA CCAP Nkhoma Synod Prayer Room",
  "category": "Prayer Meeting",
  "registrationRequired": false,
  "contactPerson": "Prayer Coordinator Mary",
  "contactPhone": "+265 555 123 456",
  "contactEmail": "prayer@mvama.org",
  "status": "upcoming",
  "tags": ["prayer", "community", "spiritual"],
  "createdAt": "2024-11-01T00:00:00Z",
  "updatedAt": "2024-11-10T09:00:00Z"
}
```

## 🔧 **Firebase Console Setup**

### **Step 1: Create Collection**
1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Create collection: `events`

### **Step 2: Add Sample Documents**
1. In `events` collection, click "Add document"
2. Use auto-generated ID or custom ID
3. Add the fields as shown above
4. Repeat for multiple events

### **Step 3: Set Up Indexes**
Create these composite indexes in Firebase Console:

**For `events` collection:**
- `status` (Ascending) + `date` (Ascending)
- `category` (Ascending) + `date` (Ascending)
- `registrationRequired` (Ascending) + `status` (Ascending) + `date` (Ascending)
- `date` (Ascending) + `time` (Ascending)

## 📱 **Integration with App**

### **Update Events Tab:**
The app will now fetch real data from Firestore instead of mock data:

```typescript
// In events.tsx
import { eventService } from '../../services/eventService';

// Replace mock data with real Firestore data
const [events, setEvents] = useState<Event[]>([]);

useEffect(() => {
  loadEvents();
}, []);

const loadEvents = async () => {
  try {
    const eventsData = await eventService.getAllEvents();
    setEvents(eventsData);
  } catch (error) {
    console.error('Error loading events:', error);
  }
};
```

## 🎯 **Categories to Use**

### **Suggested Categories:**
- `Sunday Service`
- `Youth Event`
- `Prayer Meeting`
- `Special Event`
- `Bible Study`
- `Community Outreach`
- `Wedding`
- `Funeral`
- `Conference`
- `Workshop`

## 📊 **Event Status Management**

### **Status Values:**
- **`upcoming`** - Event is scheduled for the future
- **`ongoing`** - Event is currently happening
- **`completed`** - Event has finished
- **`cancelled`** - Event was cancelled

## 🔐 **Security Rules**

Add these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events - read only for authenticated users
    match /events/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## 🎉 **Benefits of This Structure**

1. **Organized** - Clear categorization and status tracking
2. **Flexible** - Easy to add new event types and fields
3. **Searchable** - Can filter by category, date, status
4. **Registration Support** - Built-in registration management
5. **Contact Integration** - Easy access to event contacts
6. **Real-time Updates** - Changes reflect immediately
7. **Scalable** - Handles any number of events

## 📋 **Sample Event Categories**

### **Regular Events:**
- Sunday Service (weekly)
- Prayer Meeting (weekly)
- Bible Study (weekly)
- Youth Fellowship (monthly)

### **Special Events:**
- Christmas Service
- Easter Celebration
- Church Anniversary
- Revival Meeting
- Conference
- Workshop

### **Community Events:**
- Community Outreach
- Charity Drive
- Health Screening
- Educational Seminar

This structure will allow your app to display real events from Firestore with proper categorization, registration management, and all the metadata needed for a comprehensive events system! 📅✨
