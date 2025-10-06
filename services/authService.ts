import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    updateProfile,
    User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  bio?: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  private constructor() {
    // Wait for auth to be initialized before setting up listener
    if (auth) {
      console.log('🔐 Setting up auth state listener...');
      onAuthStateChanged(auth, (user) => {
        console.log('🔐 Auth state changed:', !!user);
        this.currentUser = user;
        this.authStateListeners.forEach(listener => listener(user));
      });
    } else {
      console.warn('⚠️ Firebase auth not initialized, setting up fallback');
      // Set up a fallback that immediately calls listeners with null
      setTimeout(() => {
        this.currentUser = null;
        this.authStateListeners.forEach(listener => listener(null));
      }, 100);
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Subscribe to auth state changes
  public onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Get current user
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Sign up with email and password
  public async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      console.log('🔐 Creating user account...');
      
      if (!auth) {
        throw new Error('Firebase auth is not initialized. Please check your Firebase configuration.');
      }
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, {
        displayName: displayName
      });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: displayName,
        photoURL: user.photoURL || undefined,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      console.log('✅ User account created successfully');
      return user;
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Sign in with email and password
  public async signIn(email: string, password: string): Promise<User> {
    try {
      console.log('🔐 Signing in user...');
      
      if (!auth) {
        throw new Error('Firebase auth is not initialized. Please check your Firebase configuration.');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last login time
      await setDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date().toISOString()
      }, { merge: true });
      
      console.log('✅ User signed in successfully');
      return user;
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  public async signOut(): Promise<void> {
    try {
      console.log('🔐 Signing out user...');
      
      if (!auth) {
        throw new Error('Firebase auth is not initialized. Please check your Firebase configuration.');
      }
      
      await firebaseSignOut(auth);
      console.log('✅ User signed out successfully');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Get user profile from Firestore
  public async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error: any) {
      console.error('❌ Error getting user profile:', error);
      throw error;
    }
  }

  // Update user profile in Firestore
  public async updateProfile(profileData: Partial<UserProfile>): Promise<void> {
    try {
      console.log('🔐 AuthService: Starting profile update...');
      console.log('📝 Profile data received:', profileData);
      
      if (!auth || !db) {
        throw new Error('Firebase not initialized');
      }

      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

      console.log('👤 Current user:', user.uid);
      console.log('📁 Updating document in collection: users, document: ', user.uid);

      const updateData = {
        ...profileData,
        lastLoginAt: new Date().toISOString(),
      };

      console.log('📝 Final update data:', updateData);

      await setDoc(doc(db, 'users', user.uid), updateData, { merge: true });
      
      console.log('✅ User profile updated successfully in Firestore');
    } catch (error: any) {
      console.error('❌ Error updating user profile:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  }

  // Handle authentication errors
  private handleAuthError(error: any): Error {
    let message = 'An error occurred during authentication';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered. Please use a different email or sign in.';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters long.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection.';
        break;
      default:
        message = error.message || message;
    }
    
    return new Error(message);
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
