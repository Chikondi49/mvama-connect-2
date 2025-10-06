import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('🔐 Index: No user found, redirecting to login...');
        router.replace('/auth/login');
      } else {
        console.log('✅ Index: User authenticated, redirecting to main app...');
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, router]);

  // Add timeout fallback
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Auth loading timeout - redirecting to login');
        router.replace('/auth/login');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading, router]);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#c9a961" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
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
