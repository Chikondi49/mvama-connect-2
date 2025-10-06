import { useRouter } from 'expo-router';
import { Bell, ChevronRight, Download, Globe, Heart, Circle as HelpCircle, LogOut, Moon, Share2, Shield, User } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, userProfile, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [downloadOverWifi, setDownloadOverWifi] = useState(true);



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your preferences</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        nestedScrollEnabled={true}>
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <User size={32} color="#c9a961" strokeWidth={2} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile?.displayName || user?.displayName || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileEditButton}
            onPress={() => router.push('/profile/edit')}>
            <Text style={styles.profileEditText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Bell size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>Receive updates and reminders</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#2a2a2a', true: '#c9a961' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#999999'}
              ios_backgroundColor="#2a2a2a"
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Moon size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#2a2a2a', true: '#c9a961' }}
              thumbColor={darkModeEnabled ? '#ffffff' : '#999999'}
              ios_backgroundColor="#2a2a2a"
            />
          </View>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Globe size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingDescription}>English</Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media & Downloads</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Download size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Download over Wi-Fi only</Text>
              <Text style={styles.settingDescription}>Save mobile data</Text>
            </View>
            <Switch
              value={downloadOverWifi}
              onValueChange={setDownloadOverWifi}
              trackColor={{ false: '#2a2a2a', true: '#c9a961' }}
              thumbColor={downloadOverWifi ? '#ffffff' : '#999999'}
              ios_backgroundColor="#2a2a2a"
            />
          </View>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Download size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Downloaded Content</Text>
              <Text style={styles.settingDescription}>Manage offline sermons</Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Heart size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Give</Text>
              <Text style={styles.settingDescription}>Support our mission</Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <HelpCircle size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Help & Support</Text>
              <Text style={styles.settingDescription}>Get assistance</Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Share2 size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Share App</Text>
              <Text style={styles.settingDescription}>Invite others to join</Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Shield size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Privacy Policy</Text>
              <Text style={styles.settingDescription}>How we protect your data</Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Shield size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Terms of Service</Text>
              <Text style={styles.settingDescription}>App usage terms</Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={async () => {
            try {
              console.log('🔐 LOGOUT BUTTON PRESSED');
              await signOut();
              console.log('✅ SignOut completed');
              console.log('🔄 Redirecting to login...');
              router.replace('/auth/login');
        } catch (error: any) {
          console.error('❌ Logout error:', error);
          Alert.alert('Error', 'Logout failed: ' + error.message);
            }
          }}>
          <LogOut size={20} color="#ff4444" strokeWidth={2} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  profileEditButton: {
    backgroundColor: '#c9a961',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  profileEditText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#999999',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#666666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 20,
  },
  logoutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#ff4444',
  },
  version: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
  },
});
