// Firebase Authentication Test Utility
import { auth } from '../config/firebase';

export const testFirebaseAuth = async (): Promise<boolean> => {
  try {
    console.log('🔐 Testing Firebase Authentication...');
    
    if (!auth) {
      console.error('❌ Firebase auth is not initialized');
      return false;
    }
    
    console.log('✅ Firebase auth is initialized');
    console.log('📱 Auth app:', auth.app?.name);
    console.log('🔑 Current user:', auth.currentUser?.email || 'No user signed in');
    
    return true;
  } catch (error: any) {
    console.error('❌ Firebase auth test failed:', error);
    return false;
  }
};

export const getCurrentUser = () => {
  if (!auth) {
    console.error('❌ Firebase auth is not initialized');
    return null;
  }
  
  return auth.currentUser;
};

export const isUserSignedIn = (): boolean => {
  const user = getCurrentUser();
  return !!user;
};
