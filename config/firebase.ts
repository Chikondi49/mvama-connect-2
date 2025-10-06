// Firebase Configuration
// To set up Firebase:
// 1. Go to Firebase Console (https://console.firebase.google.com/)
// 2. Create a new project or select existing one
// 3. Add a web app to your project
// 4. Copy the configuration object and replace the placeholder below
// 5. Enable Firestore Database in the Firebase Console

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Updated from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyBSnX8Lw6IpA52exNCPpR5RfrzHuRNvm2s",
  authDomain: "mvama-connect.firebaseapp.com",
  projectId: "mvama-connect",
  storageBucket: "mvama-connect.firebasestorage.app",
  messagingSenderId: "554586476755",
  appId: "1:554586476755:web:f8304dfccce4e4ae0cc426"
};

// Check if Firebase is properly configured
const isConfigured = firebaseConfig.apiKey !== "your-api-key-here" && 
                    firebaseConfig.projectId !== "your-project-id";

console.log('🔧 Firebase Config Check:');
console.log('📋 API Key starts with:', firebaseConfig.apiKey.substring(0, 10) + '...');
console.log('🏷️ Project ID:', firebaseConfig.projectId);
console.log('✅ Is Configured:', isConfigured);

let app: any = null;
let db: any = null;
let storage: any = null;
let auth: any = null;

if (isConfigured) {
  try {
    console.log('🚀 Initializing Firebase...');
    
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    console.log('📱 Firebase app initialized:', !!app);
    
    // Initialize Firestore
    db = getFirestore(app);
    console.log('🗄️ Firestore initialized:', !!db);
    
    // Initialize Storage
    storage = getStorage(app);
    console.log('💾 Storage initialized:', !!storage);
    
    // Initialize Auth
    auth = getAuth(app);
    console.log('🔐 Auth initialized:', !!auth);
    
    console.log('✅ Firebase initialization completed successfully');
  } catch (error: any) {
    console.error('❌ Firebase initialization failed:', error);
    console.error('❌ Error details:', error?.message);
  }
} else {
  console.warn('⚠️ Firebase not configured. Using mock data. Please update config/firebase.ts');
}

export { auth, db, storage };

// For development, you can use the Firestore emulator
// Uncomment the lines below if you want to use the emulator
// if (__DEV__) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectStorageEmulator(storage, 'localhost', 9199);
// }

export default app;
