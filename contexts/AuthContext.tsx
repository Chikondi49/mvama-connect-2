import { User } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authService, UserProfile } from '../services/authService';
import { testFirebaseConnection } from '../utils/firebaseTest';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    console.log('🔐 Setting up auth state listener...');
    
    // Test Firebase connection first
    testFirebaseConnection().then((isConnected) => {
      if (!isConnected) {
        console.error('❌ Firebase connection test failed');
        setLoading(false);
        return;
      }
    });
    
    let unsubscribe: (() => void) | null = null;
    
    try {
      unsubscribe = authService.onAuthStateChanged(async (user) => {
        console.log('🔐 Auth state changed:', !!user);
        console.log('👤 User details:', user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        } : 'No user');
        
        setUser(user);
        
        if (user) {
          try {
            const profile = await authService.getUserProfile(user.uid);
            setUserProfile(profile);
            console.log('👤 User profile loaded:', profile?.displayName);
            
            // Check admin status
            console.log('🔍 User profile role:', profile.role);
            console.log('🔍 Role type:', typeof profile.role);
            console.log('🔍 Role comparison - admin:', profile.role === 'admin');
            console.log('🔍 Role comparison - super_admin:', profile.role === 'super_admin');
            
            const adminStatus = profile.role === 'admin' || profile.role === 'super_admin';
            const superAdminStatus = profile.role === 'super_admin';
            setIsAdmin(adminStatus);
            setIsSuperAdmin(superAdminStatus);
            console.log('🔐 Admin status:', { isAdmin: adminStatus, isSuperAdmin: superAdminStatus });
            
            console.log('✅ User is now authenticated and will be redirected');
            console.log('🔄 Auth state updated - user should be redirected to main app');
          } catch (error) {
            console.error('❌ Error loading user profile:', error);
            setUserProfile(null);
            setIsAdmin(false);
            setIsSuperAdmin(false);
          }
        } else {
          setUserProfile(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          console.log('🔐 No user - will redirect to login');
          console.log('🔄 User state cleared - should trigger redirect');
        }
        
        setLoading(false);
      });
    } catch (error) {
      console.error('❌ Error setting up auth listener:', error);
      setLoading(false);
    }

    // Add timeout fallback
    const timeout = setTimeout(() => {
      console.log('⚠️ Auth context timeout - setting loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout

    return () => {
      console.log('🔐 Cleaning up auth state listener...');
      clearTimeout(timeout);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      console.log('🔐 AuthContext: Starting sign up process...');
      console.log('📧 Email:', email);
      console.log('👤 Display Name:', displayName);
      
      await authService.signUp(email, password, displayName);
      console.log('✅ AuthContext: Sign up successful');
      
      // The auth state listener will automatically update the user state
      // Don't set loading to false here - let the auth state listener handle it
    } catch (error) {
      console.error('❌ AuthContext: Sign up failed:', error);
      setLoading(false); // Only set loading to false on error
      throw error;
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔐 AuthContext: Starting sign in process...');
      console.log('📧 Email:', email);
      
      const result = await authService.signIn(email, password);
      console.log('✅ AuthContext: Sign in successful');
      console.log('👤 User ID:', result.uid);
      console.log('📧 User Email:', result.email);
      
      // The auth state listener will automatically update the user state
      // Don't set loading to false here - let the auth state listener handle it
    } catch (error) {
      console.error('❌ AuthContext: Sign in failed:', error);
      setLoading(false); // Only set loading to false on error
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('🔐 AuthContext: Starting sign out process...');
      console.log('👤 Current user before logout:', user?.uid);
      setLoading(true);
      
      // Clear user state immediately
      console.log('🧹 Clearing user state...');
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      
      // Try to sign out from Firebase
      try {
        await authService.signOut();
        console.log('✅ AuthContext: Firebase sign out successful');
      } catch (firebaseError) {
        console.error('❌ Firebase sign out failed:', firebaseError);
        // Continue with logout even if Firebase fails
      }
      
      console.log('✅ AuthContext: Sign out process completed');
      
      // Ensure loading is set to false after logout
      setLoading(false);
      
      // Force a small delay to ensure state is updated
      setTimeout(() => {
        console.log('🔄 AuthContext: Final state check after logout');
        console.log('👤 User after logout:', user);
        console.log('👤 UserProfile after logout:', userProfile);
        console.log('👤 IsAdmin after logout:', isAdmin);
        console.log('👤 IsSuperAdmin after logout:', isSuperAdmin);
      }, 100);
      
    } catch (error) {
      console.error('❌ AuthContext: Sign out failed:', error);
      console.error('❌ Error details:', error);
      
      // Even if there's an error, clear the state
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setLoading(false);
      
      // Don't throw the error, just log it
      console.log('🔄 AuthContext: State cleared despite error');
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (user) {
      try {
        const profile = await authService.getUserProfile(user.uid);
        setUserProfile(profile);
        console.log('👤 User profile refreshed:', profile?.displayName);
      } catch (error) {
        console.error('❌ Error refreshing user profile:', error);
      }
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
    try {
      console.log('🔐 AuthContext: Updating user profile...');
      console.log('📝 Profile data:', profileData);
      
      await authService.updateProfile(profileData);
      console.log('✅ AuthContext: Profile updated successfully');
      
      // Refresh the user profile after update
      console.log('🔄 AuthContext: Refreshing user profile...');
      await refreshUserProfile();
      console.log('✅ AuthContext: User profile refreshed');
    } catch (error) {
      console.error('❌ AuthContext: Error updating profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAdmin,
    isSuperAdmin,
    signUp,
    signIn,
    signOut,
    refreshUserProfile,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
