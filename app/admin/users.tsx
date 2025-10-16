import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Shield, User, UserCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { adminService, AdminUser } from '../../services/adminService';
import { addAdminUser } from '../../utils/addAdminUser';

export default function AdminUsersScreen() {
  console.log('🚀 AdminUsersScreen component loaded');
  
  const router = useRouter();
  const { user, isSuperAdmin } = useAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'super_admin'>('admin');

  // Test Firebase connection
  const testFirebase = async () => {
    try {
      console.log('🧪 Testing Firebase connection...');
      const { db } = await import('../../config/firebase');
      console.log('📁 Firebase db object:', db);
      
      if (!db) {
        Alert.alert('Firebase Test', '❌ Firebase database not initialized');
        return;
      }
      
      Alert.alert('Firebase Test', '✅ Firebase database is available');
    } catch (error) {
      console.error('❌ Firebase test failed:', error);
      Alert.alert('Firebase Test', `❌ Firebase test failed: ${(error as any)?.message}`);
    }
  };

  useEffect(() => {
    console.log('🔐 User Management - Checking access...');
    console.log('👤 isSuperAdmin:', isSuperAdmin);
    console.log('👤 user:', user?.uid);
    
    loadAdminUsers();
  }, [isSuperAdmin]);

  const loadAdminUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading admin users...');
      
      const users = await adminService.getAllAdminUsers();
      console.log(`✅ Loaded ${users.length} admin users:`, users);
      
      setAdminUsers(users);
    } catch (error) {
      console.error('❌ Error loading admin users:', error);
      Alert.alert('Error', `Failed to load admin users: ${(error as any)?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAdmin = async () => {
    console.log('🔘 Assign Admin button pressed');
    console.log('📧 Email:', newAdminEmail);
    console.log('👤 Name:', newAdminName);
    console.log('🔑 Role:', selectedRole);
    console.log('👤 Current user:', user?.uid);

    if (!newAdminEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!newAdminName.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to assign admin roles');
      return;
    }

    try {
      setAssigning(true);
      console.log('🔐 Starting admin user assignment...');

      const adminData = {
        email: newAdminEmail.trim(),
        displayName: newAdminName.trim(),
        role: selectedRole,
        permissions: selectedRole === 'super_admin' 
          ? ['*'] // Super admin gets all permissions
          : ['content_manage', 'content_create', 'content_edit', 'media_manage', 'analytics_view'],
        assignedBy: user.uid
      };

      console.log('📝 Admin data to be saved:', adminData);

      const success = await addAdminUser(adminData);
      console.log('📊 Add admin result:', success);

      if (success) {
        console.log('✅ Admin role assigned successfully');
        Alert.alert('Success', `Admin role assigned to ${newAdminEmail}. They will receive their permissions when they sign up.`);
        setNewAdminEmail('');
        setNewAdminName('');
        setSelectedRole('admin');
        loadAdminUsers(); // Refresh the list
      } else {
        console.log('❌ Admin role assignment failed');
        Alert.alert('Error', 'Failed to assign admin role.');
      }
    } catch (error) {
      console.error('❌ Error assigning admin role:', error);
      Alert.alert('Error', `Failed to assign admin role: ${(error as any)?.message || 'Unknown error'}`);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/admin/dashboard')}>
            <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>User Management</Text>
            <Text style={styles.headerSubtitle}>Manage admin roles</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c9a961" />
          <Text style={styles.loadingText}>Loading admin users...</Text>
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
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>Manage admin roles</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Debug Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Info</Text>
          <View style={styles.assignCard}>
            <Text style={styles.inputLabel}>
              isSuperAdmin: {isSuperAdmin ? 'Yes' : 'No'} | 
              User ID: {user?.uid || 'Not loaded'}
            </Text>
            <TouchableOpacity
              style={[styles.assignButton, { backgroundColor: '#666666', marginTop: 10 }]}
              onPress={testFirebase}>
              <Text style={styles.assignButtonText}>Test Firebase</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Assign New Admin */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assign Admin Role</Text>
          
          <View style={styles.assignCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#666666" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="user@example.com"
                  placeholderTextColor="#666666"
                  value={newAdminEmail}
                  onChangeText={setNewAdminEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#666666" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="John Doe"
                  placeholderTextColor="#666666"
                  value={newAdminName}
                  onChangeText={setNewAdminName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Role</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[styles.roleOption, selectedRole === 'admin' && styles.roleOptionSelected]}
                  onPress={() => setSelectedRole('admin')}>
                  <Shield size={20} color={selectedRole === 'admin' ? '#c9a961' : '#666666'} strokeWidth={2} />
                  <Text style={[styles.roleText, selectedRole === 'admin' && styles.roleTextSelected]}>
                    Admin
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.roleOption, selectedRole === 'super_admin' && styles.roleOptionSelected]}
                  onPress={() => setSelectedRole('super_admin')}>
                  <UserCheck size={20} color={selectedRole === 'super_admin' ? '#c9a961' : '#666666'} strokeWidth={2} />
                  <Text style={[styles.roleText, selectedRole === 'super_admin' && styles.roleTextSelected]}>
                    Super Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.assignButton, assigning && styles.assignButtonDisabled]}
              onPress={handleAssignAdmin}
              disabled={assigning}>
              {assigning ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.assignButtonText}>Assign Role</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Admin Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Admins ({adminUsers.length})</Text>
          
          {adminUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <User size={48} color="#666666" strokeWidth={1.5} />
              <Text style={styles.emptyText}>No admin users found</Text>
              <Text style={styles.emptySubtext}>Assign admin roles to get started</Text>
            </View>
          ) : (
            adminUsers.map((adminUser) => (
              <View key={adminUser.uid} style={styles.adminCard}>
                <View style={styles.adminInfo}>
                  <View style={styles.adminAvatar}>
                    <User size={20} color="#c9a961" strokeWidth={2} />
                  </View>
                  <View style={styles.adminDetails}>
                    <Text style={styles.adminName}>{adminUser.displayName}</Text>
                    <Text style={styles.adminEmail}>{adminUser.email}</Text>
                    <View style={styles.adminRole}>
                      <Shield size={14} color="#c9a961" strokeWidth={2} />
                      <Text style={styles.adminRoleText}>
                        {adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
  },
  assignCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
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
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  roleOptionSelected: {
    backgroundColor: '#1a1a1a',
    borderColor: '#c9a961',
  },
  roleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  roleTextSelected: {
    color: '#c9a961',
  },
  assignButton: {
    backgroundColor: '#c9a961',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignButtonDisabled: {
    backgroundColor: '#666666',
  },
  assignButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#000000',
  },
  adminCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminDetails: {
    flex: 1,
  },
  adminName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 2,
  },
  adminEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 4,
  },
  adminRole: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminRoleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#c9a961',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#cccccc',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
});