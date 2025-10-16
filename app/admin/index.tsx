import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    console.log('🔄 Admin index loading, redirecting to dashboard...');
    // Use a small delay to ensure the component is mounted
    const timer = setTimeout(() => {
      router.replace('/admin/dashboard');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  console.log('🔄 Admin index rendering...');
  
  // Show loading screen while redirecting
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#c9a961" />
      <Text style={styles.loadingText}>Loading admin panel...</Text>
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
    color: '#c9a961',
    fontFamily: 'Inter-Medium',
    marginTop: 16,
    fontSize: 16,
  },
});

