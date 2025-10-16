import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Shield, User, UserCheck, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { adminService, AdminUser } from '../../services/adminService';
import { addAdminUser } from '../../utils/addAdminUser';

export default function AdminUsersScreen() {
  const router = useRouter();
  const { user, isSuperAdmin, userProfile, refreshUserProfile } = useAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'super_admin'>('admin');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [forceSuperAdmin, setForceSuperAdmin] = useState(true); // Keep enabled for now
  const [testUserId, setTestUserId] = useState('');
  const [adminToRemove, setAdminToRemove] = useState<AdminUser | null>(null);


  useEffect(() => {
    loadAdminUsers();
  }, [isSuperAdmin]);

  const loadAdminUsers = async () => {
    try {
      setLoading(true);
      const users = await adminService.getAllAdminUsers();
      setAdminUsers(users);
    } catch (error) {
      console.error('Error loading admin users:', error);
      setMessage(`Failed to load admin users: ${(error as any)?.message || 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAdmin = async () => {
    setMessage('');
    setMessageType('');

    if (!newAdminEmail.trim()) {
      setMessage('Please enter an email address');
      setMessageType('error');
      return;
    }

    if (!newAdminName.trim()) {
      setMessage('Please enter a display name');
      setMessageType('error');
      return;
    }

    if (!user) {
      setMessage('You must be logged in to assign admin roles');
      setMessageType('error');
      return;
    }

    try {
      setAssigning(true);
      setMessage('Assigning admin role...');
      setMessageType('success');

      const adminData = {
        email: newAdminEmail.trim(),
        displayName: newAdminName.trim(),
        role: selectedRole,
        permissions: selectedRole === 'super_admin' 
          ? ['*'] // Super admin gets all permissions
          : ['content_manage', 'content_create', 'content_edit', 'media_manage', 'analytics_view'],
        assignedBy: user.uid
      };

      const success = await addAdminUser(adminData);

      if (success) {
        setMessage(`Admin role assigned to ${newAdminEmail}. They will receive their permissions when they sign up.`);
        setMessageType('success');
        setNewAdminEmail('');
        setNewAdminName('');
        setSelectedRole('admin');
        loadAdminUsers(); // Refresh the list
      } else {
        setMessage('Failed to assign admin role.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error assigning admin role:', error);
      setMessage(`Failed to assign admin role: ${(error as any)?.message || 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAdmin = async (adminUser: AdminUser) => {
    setMessage('');
    setMessageType('');

    if (!forceSuperAdmin && !isSuperAdmin) {
      setMessage('Only super admins can remove admin users');
      setMessageType('error');
      return;
    }

    if (adminUser.uid === user?.uid) {
      setMessage('You cannot remove yourself');
      setMessageType('error');
      return;
    }

    try {
      setRemoving(adminUser.uid);
      setMessage(`Removing admin access for ${adminUser.displayName}...`);
      setMessageType('success');

      const userIdToUse = user?.uid || testUserId;
      
      if (!userIdToUse) {
        setMessage('Error: User not properly authenticated. Please refresh the page.');
        setMessageType('error');
        return;
      }
      
      const result = await adminService.removeAdminRole(adminUser.uid, userIdToUse);

      if (result) {
        setMessage(`Admin access removed for ${adminUser.displayName}`);
        setMessageType('success');
        loadAdminUsers(); // Refresh the list
      } else {
        setMessage('Failed to remove admin role.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error removing admin role:', error);
      setMessage(`Failed to remove admin role: ${(error as any)?.message || 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setRemoving(null);
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
         {/* Message Display */}
         {message && !adminToRemove ? (
           <View style={[styles.messageContainer, messageType === 'success' ? styles.successMessage : styles.errorMessage]}>
             <View style={styles.messageContent}>
               <Text style={[styles.messageText, messageType === 'success' ? styles.successText : styles.errorText]}>
                 {message}
               </Text>
               <TouchableOpacity 
                 style={styles.messageClose}
                 onPress={() => {
                   setMessage('');
                   setMessageType('');
                 }}>
                 <X size={16} color={messageType === 'success' ? '#166534' : '#dc2626'} strokeWidth={2} />
               </TouchableOpacity>
             </View>
           </View>
         ) : null}


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
                
                {/* Remove admin button - Red X without background */}
                {adminUser.uid !== user?.uid && (
                  <TouchableOpacity
                    style={styles.xButton}
                    onPress={() => {
                      setAdminToRemove(adminUser);
                    }}
                    disabled={removing === adminUser.uid}
                    activeOpacity={0.7}>
                    {removing === adminUser.uid ? (
                      <ActivityIndicator size="small" color="#dc2626" />
                    ) : (
                      <X size={16} color="#dc2626" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={!!adminToRemove}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setAdminToRemove(null);
          setMessage('');
          setMessageType('');
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>
                Are you sure you want to remove admin access for{' '}
                <Text style={styles.adminName}>{adminToRemove?.displayName}</Text>?
              </Text>
              <Text style={styles.modalSubtext}>
                This action cannot be undone. The user will lose all admin privileges.
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setAdminToRemove(null);
                  setMessage('');
                  setMessageType('');
                }}>
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.removeModalButton]}
                onPress={() => {
                  if (adminToRemove) {
                    handleRemoveAdmin(adminToRemove);
                    setAdminToRemove(null);
                  }
                }}>
                <Text style={styles.removeModalButtonText}>Remove Admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
   messageContainer: {
     paddingHorizontal: 16,
     paddingVertical: 12,
     borderRadius: 8,
     marginBottom: 16,
     borderLeftWidth: 4,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.1,
     shadowRadius: 2,
     elevation: 2,
   },
   messageContent: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
   },
   messageClose: {
     width: 24,
     height: 24,
     borderRadius: 12,
     backgroundColor: 'rgba(0, 0, 0, 0.05)',
     alignItems: 'center',
     justifyContent: 'center',
     marginLeft: 8,
   },
   successMessage: {
     backgroundColor: '#f0fdf4',
     borderLeftColor: '#22c55e',
   },
   errorMessage: {
     backgroundColor: '#fef2f2',
     borderLeftColor: '#ef4444',
   },
   messageText: {
     fontSize: 14,
     fontWeight: '500',
     textAlign: 'left',
     lineHeight: 20,
   },
   successText: {
     color: '#166534',
   },
   errorText: {
     color: '#dc2626',
   },
   // Modal Styles
   modalOverlay: {
     flex: 1,
     backgroundColor: 'rgba(0, 0, 0, 0.7)',
     justifyContent: 'center',
     alignItems: 'center',
     paddingHorizontal: 20,
   },
   modalContainer: {
     backgroundColor: 'rgba(255, 255, 255, 0.1)',
     borderRadius: 16,
     width: '100%',
     maxWidth: 400,
     borderWidth: 1,
     borderColor: 'rgba(255, 255, 255, 0.2)',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 10 },
     shadowOpacity: 0.3,
     shadowRadius: 20,
     elevation: 10,
     backdropFilter: 'blur(10px)',
   },
   modalContent: {
     paddingHorizontal: 24,
     paddingVertical: 24,
     alignItems: 'center',
   },
   modalMessage: {
     fontSize: 16,
     color: '#ffffff',
     textAlign: 'center',
     lineHeight: 24,
     marginBottom: 8,
     fontFamily: 'Inter-Regular',
   },
   adminName: {
     fontWeight: 'bold',
     color: '#991b1b',
     fontFamily: 'Inter-Bold',
   },
   modalSubtext: {
     fontSize: 14,
     color: '#cccccc',
     textAlign: 'center',
     lineHeight: 20,
     fontFamily: 'Inter-Regular',
   },
   modalActions: {
     flexDirection: 'row',
     paddingHorizontal: 24,
     paddingBottom: 24,
     gap: 12,
   },
   modalButton: {
     flex: 1,
     paddingVertical: 12,
     borderRadius: 8,
     alignItems: 'center',
     justifyContent: 'center',
   },
   cancelModalButton: {
     backgroundColor: '#333333',
     borderWidth: 1,
     borderColor: '#555555',
   },
   removeModalButton: {
     backgroundColor: '#991b1b',
   },
   cancelModalButtonText: {
     fontSize: 16,
     fontWeight: '600',
     color: '#ffffff',
     fontFamily: 'Inter-SemiBold',
   },
   removeModalButtonText: {
     fontSize: 16,
     fontWeight: '600',
     color: '#ffffff',
     fontFamily: 'Inter-SemiBold',
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
  removeButton: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  removeButtonDisabled: {
    backgroundColor: '#666666',
  },
  xButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});