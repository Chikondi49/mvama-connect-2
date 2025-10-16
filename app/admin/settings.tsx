import { Bell, Database, Globe, Shield, Smartphone } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface AppSettings {
  notifications: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    sermonUpdates: boolean;
    eventReminders: boolean;
  };
  content: {
    autoSync: boolean;
    cacheSize: string;
    dataUsage: string;
  };
  security: {
    requireAuth: boolean;
    sessionTimeout: number;
    twoFactor: boolean;
  };
  api: {
    youtubeEnabled: boolean;
    bibleEnabled: boolean;
    firebaseConnected: boolean;
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Mock settings data
      const mockSettings: AppSettings = {
        notifications: {
          pushEnabled: true,
          emailEnabled: true,
          sermonUpdates: true,
          eventReminders: true,
        },
        content: {
          autoSync: true,
          cacheSize: '245 MB',
          dataUsage: '1.2 GB',
        },
        security: {
          requireAuth: true,
          sessionTimeout: 30,
          twoFactor: false,
        },
        api: {
          youtubeEnabled: true,
          bibleEnabled: true,
          firebaseConnected: true,
        },
      };

      setSettings(mockSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category: keyof AppSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [key]: value,
      },
    }));
  };

  const handleResetCache = () => {
    Alert.alert(
      'Reset Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            console.log('Cache reset');
            // Implement cache reset
          },
        },
      ]
    );
  };

  const handleTestConnection = (service: string) => {
    Alert.alert(
      'Test Connection',
      `Testing ${service} connection...`,
      [
        {
          text: 'OK',
          onPress: () => {
            console.log(`Testing ${service} connection`);
            // Implement connection test
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a961" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load settings</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Settings</Text>
        <Text style={styles.headerSubtitle}>Configure app settings and preferences</Text>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color="#c9a961" />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Enable push notifications for updates</Text>
          </View>
          <Switch
            value={settings.notifications.pushEnabled}
            onValueChange={(value) => updateSetting('notifications', 'pushEnabled', value)}
            trackColor={{ false: '#2a2a2a', true: '#c9a961' }}
            thumbColor={settings.notifications.pushEnabled ? '#ffffff' : '#666666'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Text style={styles.settingDescription}>Send email notifications</Text>
          </View>
          <Switch
            value={settings.notifications.emailEnabled}
            onValueChange={(value) => updateSetting('notifications', 'emailEnabled', value)}
            trackColor={{ false: '#2a2a2a', true: '#c9a961' }}
            thumbColor={settings.notifications.emailEnabled ? '#ffffff' : '#666666'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sermon Updates</Text>
            <Text style={styles.settingDescription}>Notify when new sermons are available</Text>
          </View>
          <Switch
            value={settings.notifications.sermonUpdates}
            onValueChange={(value) => updateSetting('notifications', 'sermonUpdates', value)}
            trackColor={{ false: '#2a2a2a', true: '#c9a961' }}
            thumbColor={settings.notifications.sermonUpdates ? '#ffffff' : '#666666'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Event Reminders</Text>
            <Text style={styles.settingDescription}>Remind users about upcoming events</Text>
          </View>
          <Switch
            value={settings.notifications.eventReminders}
            onValueChange={(value) => updateSetting('notifications', 'eventReminders', value)}
            trackColor={{ false: '#2a2a2a', true: '#c9a961' }}
            thumbColor={settings.notifications.eventReminders ? '#ffffff' : '#666666'}
          />
        </View>
      </View>

      {/* Content Management */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Database size={20} color="#c9a961" />
          <Text style={styles.sectionTitle}>Content Management</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto Sync</Text>
            <Text style={styles.settingDescription}>Automatically sync content in background</Text>
          </View>
          <Switch
            value={settings.content.autoSync}
            onValueChange={(value) => updateSetting('content', 'autoSync', value)}
            trackColor={{ false: '#2a2a2a', true: '#c9a961' }}
            thumbColor={settings.content.autoSync ? '#ffffff' : '#666666'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Cache Size</Text>
            <Text style={styles.settingDescription}>Current cache size: {settings.content.cacheSize}</Text>
          </View>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleResetCache}>
            <Text style={styles.actionButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Data Usage</Text>
            <Text style={styles.settingDescription}>This month: {settings.content.dataUsage}</Text>
          </View>
          <View style={styles.dataUsageBar}>
            <View style={[styles.dataUsageFill, { width: '60%' }]} />
          </View>
        </View>
      </View>

      {/* Security */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color="#c9a961" />
          <Text style={styles.sectionTitle}>Security</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Require Authentication</Text>
            <Text style={styles.settingDescription}>Force login for admin access</Text>
          </View>
          <Switch
            value={settings.security.requireAuth}
            onValueChange={(value) => updateSetting('security', 'requireAuth', value)}
            trackColor={{ false: '#2a2a2a', true: '#c9a961' }}
            thumbColor={settings.security.requireAuth ? '#ffffff' : '#666666'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Session Timeout</Text>
            <Text style={styles.settingDescription}>{settings.security.sessionTimeout} minutes</Text>
          </View>
          <View style={styles.timeoutContainer}>
            <TouchableOpacity style={styles.timeoutButton}>
              <Text style={styles.timeoutButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.timeoutValue}>{settings.security.sessionTimeout}</Text>
            <TouchableOpacity style={styles.timeoutButton}>
              <Text style={styles.timeoutButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
            <Text style={styles.settingDescription}>Add extra security layer</Text>
          </View>
          <Switch
            value={settings.security.twoFactor}
            onValueChange={(value) => updateSetting('security', 'twoFactor', value)}
            trackColor={{ false: '#2a2a2a', true: '#c9a961' }}
            thumbColor={settings.security.twoFactor ? '#ffffff' : '#666666'}
          />
        </View>
      </View>

      {/* API Connections */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Globe size={20} color="#c9a961" />
          <Text style={styles.sectionTitle}>API Connections</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>YouTube API</Text>
            <Text style={styles.settingDescription}>
              {settings.api.youtubeEnabled ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => handleTestConnection('YouTube')}>
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Bible API</Text>
            <Text style={styles.settingDescription}>
              {settings.api.bibleEnabled ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => handleTestConnection('Bible')}>
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Firebase</Text>
            <Text style={styles.settingDescription}>
              {settings.api.firebaseConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => handleTestConnection('Firebase')}>
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* System Info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Smartphone size={20} color="#c9a961" />
          <Text style={styles.sectionTitle}>System Information</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Build Number</Text>
          <Text style={styles.infoValue}>100</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text style={styles.infoValue}>November 10, 2024</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  errorText: {
    color: '#ff6b6b',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 10,
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
    color: '#c9a961',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ff6b6b',
  },
  dataUsageBar: {
    width: 80,
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  dataUsageFill: {
    height: '100%',
    backgroundColor: '#c9a961',
    borderRadius: 2,
  },
  timeoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 4,
  },
  timeoutButton: {
    width: 24,
    height: 24,
    backgroundColor: '#c9a961',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeoutButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  timeoutValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.2)',
  },
  testButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
  },
});
