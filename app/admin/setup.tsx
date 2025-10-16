import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Mail, Shield, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';

export default function AdminSetupScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSuperAdmin, setHasSuperAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');

  // Check if super admin already exists
  useEffect(() => {
    checkForExistingSuperAdmin();
  }, []);

  const checkForExistingSuperAdmin = async () => {
    try {
      setChecking(true);
      const adminUsers = await adminService.getAllAdminUsers();
      const superAdminExists = adminUsers.some(user => user.role === 'super_admin');
      setHasSuperAdmin(superAdminExists);
      
      if (superAdminExists) {
        Alert.alert(
          'Super Admin Exists',
          'A super admin already exists in the system. You cannot create another one.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Error checking for super admin:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleCreateFirstSuperAdmin = async () => {
    console.log('🔐 Creating super admin...');
    console.log('📧 Email:', adminEmail);
    console.log('👤 Name:', adminName);
    console.log('🔑 User:', user?.uid);

    if (!adminEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!adminName.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a super admin');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Starting admin role assignment...');
      
      // Create the super admin assignment
      const success = await adminService.assignAdminRole({
        userEmail: adminEmail.trim(),
        role: 'super_admin',
        permissions: ['*'], // Super admin gets all permissions
        assignedBy: user.uid,
        assignedAt: new Date().toISOString()
      });

      console.log('✅ Admin role assignment result:', success);

      if (success) {
        Alert.alert(
          'Success!',
          `Super admin role assigned to ${adminEmail}. They now have full access to the CMS.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to admin dashboard
                router.push('/admin');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to assign super admin role. Make sure the user exists in the system.'
        );
      }
    } catch (error) {
      console.error('❌ Error creating super admin:', error);
      Alert.alert('Error', `Failed to create super admin: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Admin Setup</Text>
            <Text style={styles.headerSubtitle}>Initial configuration</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c9a961" />
          <Text style={styles.loadingText}>Checking system status...</Text>
        </View>
      </View>
    );
  }

  if (hasSuperAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Admin Setup</Text>
            <Text style={styles.headerSubtitle}>System already configured</Text>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.statusCard}>
            <Check size={48} color="#4CAF50" strokeWidth={2} />
            <Text style={styles.statusTitle}>System Configured</Text>
            <Text style={styles.statusText}>
              A super admin already exists in the system. You can access the admin panel through Settings.
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push('/admin')}>
              <Text style={styles.continueButtonText}>Go to Admin Panel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/admin/dashboard')}>
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Setup</Text>
          <Text style={styles.headerSubtitle}>Create first super admin</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.welcomeCard}>
            <Shield size={48} color="#c9a961" strokeWidth={2} />
            <Text style={styles.welcomeTitle}>Welcome to Admin Setup</Text>
            <Text style={styles.welcomeText}>
              You need to assign a super admin to manage your church app. This person will have full access to the Content Management System.
            </Text>
          </View>

          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>Create Super Admin</Text>
            <Text style={styles.setupSubtitle}>
              Enter the details of the person who will manage the app
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#666666" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="John Doe"
                  placeholderTextColor="#666666"
                  value={adminName}
                  onChangeText={setAdminName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#666666" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="admin@yourchurch.com"
                  placeholderTextColor="#666666"
                  value={adminEmail}
                  onChangeText={setAdminEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.createButton, loading && styles.createButtonDisabled]}
              onPress={handleCreateFirstSuperAdmin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.createButtonText}>Create Super Admin</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Important Notes:</Text>
            <Text style={styles.infoText}>
              • The email must belong to an existing user in the system{'\n'}
              • The super admin will have full control over the app{'\n'}
              • They can assign admin roles to other users{'\n'}
              • This action cannot be undone
            </Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#c9a961',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#cccccc',
    marginTop: 16,
  },
  section: {
    gap: 24,
  },
  welcomeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  welcomeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  setupCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  setupTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
  },
  setupSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  createButton: {
    backgroundColor: '#c9a961',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#666666',
  },
  createButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#000000',
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  statusTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  statusText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#c9a961',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#000000',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#c9a961',
  },
  infoTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
});
