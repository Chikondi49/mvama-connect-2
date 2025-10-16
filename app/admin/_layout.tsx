import { Tabs, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, CreditCard, FileText, Image, Settings, Shield, Users } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function AdminLayout() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#c9a961',
          tabBarInactiveTintColor: '#666666',
          tabBarLabelStyle: styles.tabLabel,
          headerStyle: styles.header,
          headerTintColor: '#ffffff',
          headerTitleStyle: styles.headerTitle,
        }}>
        
        <Tabs.Screen
          name="index"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Shield size={size} color={color} />,
            headerLeft: () => (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push('/(tabs)/settings')}>
                <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
              </TouchableOpacity>
            ),
          }}
        />
        
        <Tabs.Screen
          name="content"
          options={{
            title: 'Content',
            tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
            headerLeft: () => (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push('/admin/dashboard')}>
                <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
              </TouchableOpacity>
            ),
          }}
        />
        
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
            headerLeft: () => (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push('/admin/dashboard')}>
                <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
              </TouchableOpacity>
            ),
          }}
        />
        
        <Tabs.Screen
          name="media"
          options={{
            title: 'Media',
            tabBarIcon: ({ color, size }) => <Image size={size} color={color} />,
            headerLeft: () => (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push('/admin/dashboard')}>
                <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
              </TouchableOpacity>
            ),
          }}
        />
        
        <Tabs.Screen
          name="giving"
          options={{
            title: 'Giving',
            tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
            headerLeft: () => (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push('/admin/dashboard')}>
                <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
              </TouchableOpacity>
            ),
          }}
        />
        
        <Tabs.Screen
          name="users"
          options={{
            title: 'Users',
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
            headerLeft: () => (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push('/admin/dashboard')}>
                <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
              </TouchableOpacity>
            ),
          }}
        />
        
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
            headerLeft: () => (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push('/admin/dashboard')}>
                <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
              </TouchableOpacity>
            ),
          }}
        />
        
        
        <Tabs.Screen
          name="news"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        
        <Tabs.Screen
          name="setup"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        
        <Tabs.Screen
          name="firebase-test"
          options={{
            href: null, // Hide from tab bar
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  tabBar: {
    backgroundColor: '#1a1a1a',
    borderTopColor: '#2a2a2a',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  header: {
    backgroundColor: '#1a1a1a',
    borderBottomColor: '#2a2a2a',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  backButton: {
    marginLeft: 16,
    padding: 8,
  },
});
