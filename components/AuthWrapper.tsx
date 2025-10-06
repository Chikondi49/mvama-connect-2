import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Auth loading timeout - redirecting to login');
        router.replace('/auth/login');
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [loading, router]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('🔐 AuthWrapper: No user found, redirecting to login...');
        router.replace('/auth/login');
      } else {
        console.log('✅ AuthWrapper: User authenticated:', user.email);
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a961" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a961" />
        <Text style={styles.loadingText}>Redirecting to login...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999999',
    marginTop: 12,
  },
});
