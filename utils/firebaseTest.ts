import { auth, db } from '../config/firebase';

export const testFirebaseConnection = async () => {
  console.log('🧪 Testing Firebase connection...');
  
  try {
    // Test if auth is available
    if (!auth) {
      console.error('❌ Firebase auth is not initialized');
      return false;
    }
    
    console.log('✅ Firebase auth is available');
    
    // Test if db is available
    if (!db) {
      console.error('❌ Firebase db is not initialized');
      return false;
    }
    
    console.log('✅ Firebase db is available');
    
    // Test auth state
    console.log('🔐 Current auth state:', auth.currentUser ? 'User logged in' : 'No user');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
};
