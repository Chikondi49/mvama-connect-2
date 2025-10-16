import { useRouter } from 'expo-router';
import { Bell, ChevronRight, Download, Globe, Circle as HelpCircle, Info, LogOut, Moon, Shield, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, userProfile, signOut, isAdmin, isSuperAdmin } = useAuth();

  // Direct logout function that bypasses auth service
  const directLogout = () => {
    console.log('🔐 DIRECT LOGOUT - Bypassing auth service');
    router.replace('/auth/login');
  };
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [downloadOverWifi, setDownloadOverWifi] = useState(true);
  const [hasSuperAdmin, setHasSuperAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    checkForSuperAdmin();
  }, []);

  const checkForSuperAdmin = async () => {
    try {
      setCheckingAdmin(true);
      console.log('🔍 Checking admin status...');
      
      // Check if current user is super admin
      if (isSuperAdmin) {
        console.log('✅ Current user is super admin');
        setHasSuperAdmin(true);
        return;
      }
      
      // Fallback: check if any super admin exists in system
      const adminUsers = await adminService.getAllAdminUsers();
      const superAdminExists = adminUsers.some(user => user.role === 'super_admin');
      console.log('🔍 Super admin exists in system:', superAdminExists);
      setHasSuperAdmin(superAdminExists);
    } catch (error) {
      console.error('❌ Error checking for super admin:', error);
      // If error, check if current user is super admin
      setHasSuperAdmin(isSuperAdmin);
    } finally {
      setCheckingAdmin(false);
    }
  };

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

        {/* Admin Management Section - Consolidated */}
        {!checkingAdmin && (isAdmin || isSuperAdmin || !hasSuperAdmin || true) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ADMIN MANAGEMENT</Text>
            
            <TouchableOpacity 
              style={styles.settingCard}
              onPress={() => router.push('/admin')}>
              <View style={styles.settingIcon}>
                <Shield size={20} color="#c9a961" strokeWidth={2} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Content Management</Text>
                <Text style={styles.settingDescription}>Manage content and settings</Text>
              </View>
              <ChevronRight size={20} color="#666666" strokeWidth={2} />
            </TouchableOpacity>
            
            {isSuperAdmin && (
              <TouchableOpacity 
                style={styles.settingCard}
                onPress={() => router.push('/admin/users')}>
                <View style={styles.settingIcon}>
                  <User size={20} color="#c9a961" strokeWidth={2} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>User Management</Text>
                  <Text style={styles.settingDescription}>Assign admin roles and manage users</Text>
                </View>
                <ChevronRight size={20} color="#666666" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        )}


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Bell size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>Get notified about new content</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#333333', true: '#c9a961' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#666666'}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Moon size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#333333', true: '#c9a961' }}
              thumbColor={darkModeEnabled ? '#ffffff' : '#666666'}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Download size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Download over WiFi</Text>
              <Text style={styles.settingDescription}>Only download when connected to WiFi</Text>
            </View>
            <Switch
              value={downloadOverWifi}
              onValueChange={setDownloadOverWifi}
              trackColor={{ false: '#333333', true: '#c9a961' }}
              thumbColor={downloadOverWifi ? '#ffffff' : '#666666'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => router.push('/settings/support')}>
            <View style={styles.settingIcon}>
              <HelpCircle size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help & Support</Text>
              <Text style={styles.settingDescription}>Get help and contact support</Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => router.push('/settings/about')}>
            <View style={styles.settingIcon}>
              <Info size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>About</Text>
              <Text style={styles.settingDescription}>App version and information</Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => router.push('/settings/legal')}>
            <View style={styles.settingIcon}>
              <Globe size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Legal</Text>
              <Text style={styles.settingDescription}>Terms of service and privacy policy</Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => router.push('/profile/edit')}>
            <View style={styles.settingIcon}>
              <User size={20} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Edit Profile</Text>
              <Text style={styles.settingDescription}>Update your personal information</Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await signOut();
                        router.replace('/auth/login');
                      } catch (error) {
                        console.error('Sign out error:', error);
                        // Fallback to direct logout
                        directLogout();
                      }
                    },
                  },
                ]
              );
            }}>
            <View style={styles.settingIcon}>
              <LogOut size={20} color="#ff6b6b" strokeWidth={2} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: '#ff6b6b' }]}>Sign Out</Text>
              <Text style={styles.settingDescription}>Sign out of your account</Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  profileEditButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  profileEditText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
});