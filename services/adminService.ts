// Admin Service for Role Management
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile } from './authService';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'super_admin';
  permissions: string[];
  isActive: boolean;
  assignedBy: string;
  assignedAt: string;
  lastLoginAt: string;
}

export interface AdminAssignment {
  userEmail: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  assignedBy: string;
  assignedAt: string;
}

class AdminService {
  private readonly COLLECTIONS = {
    USERS: 'users',
    ADMIN_ASSIGNMENTS: 'adminAssignments',
  };

  // Check if current user is admin
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTIONS.USERS, userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        return userData.role === 'admin' || userData.role === 'super_admin';
      }
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Check if current user is super admin
  async isUserSuperAdmin(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTIONS.USERS, userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        return userData.role === 'super_admin';
      }
      return false;
    } catch (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
  }

  // Get all admin users
  async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      console.log('🔍 Getting all admin users...');
      console.log('📁 Collection:', this.COLLECTIONS.USERS);
      
      const usersRef = collection(db, this.COLLECTIONS.USERS);
      const q = query(
        usersRef,
        where('role', 'in', ['admin', 'super_admin'])
      );
      
      console.log('🔍 Executing query for admin users...');
      const querySnapshot = await getDocs(q);
      console.log('📊 Query result size:', querySnapshot.size);
      
      const adminUsers: AdminUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('👤 Processing user:', {
          id: doc.id,
          email: data.email,
          role: data.role,
          isPending: data.isPending,
          isActive: data.isActive
        });
        
        adminUsers.push({
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          permissions: data.permissions || [],
          isActive: data.isActive !== false,
          assignedBy: data.assignedBy || 'system',
          assignedAt: data.assignedAt || data.createdAt,
          lastLoginAt: data.lastLoginAt || data.createdAt
        });
      });
      
      console.log(`✅ Found ${adminUsers.length} admin users`);
      return adminUsers;
    } catch (error) {
      console.error('❌ Error fetching admin users:', error);
      console.error('❌ Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      return [];
    }
  }

  // Assign admin role to user
  async assignAdminRole(assignment: AdminAssignment): Promise<boolean> {
    try {
      console.log('🔐 Assigning admin role:', assignment);
      console.log('🔍 Looking for user with email:', assignment.userEmail);
      
      // First, find the user by email
      const usersRef = collection(db, this.COLLECTIONS.USERS);
      const q = query(usersRef, where('email', '==', assignment.userEmail));
      console.log('🔍 Executing query...');
      const querySnapshot = await getDocs(q);
      console.log('📊 Query result size:', querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.error('❌ User not found with email:', assignment.userEmail);
        console.log('💡 Make sure the user has signed up in the app first');
        return false;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      console.log('👤 Found user with ID:', userId);
      
      // Update user role
      console.log('🔄 Updating user role...');
      await updateDoc(doc(db, this.COLLECTIONS.USERS, userId), {
        role: assignment.role,
        permissions: assignment.permissions,
        assignedBy: assignment.assignedBy,
        assignedAt: assignment.assignedAt,
        isActive: true
      });
      console.log('✅ User role updated');
      
      // Record the assignment
      console.log('📝 Recording assignment...');
      await setDoc(doc(db, this.COLLECTIONS.ADMIN_ASSIGNMENTS, `${userId}_${Date.now()}`), {
        userId,
        userEmail: assignment.userEmail,
        role: assignment.role,
        permissions: assignment.permissions,
        assignedBy: assignment.assignedBy,
        assignedAt: assignment.assignedAt
      });
      console.log('✅ Assignment recorded');
      
      console.log('🎉 Admin role assigned successfully');
      return true;
    } catch (error) {
      console.error('❌ Error assigning admin role:', error);
      console.error('❌ Error details:', error);
      return false;
    }
  }

  // Remove admin role from user
  async removeAdminRole(userId: string, removedBy: string): Promise<boolean> {
    try {
      console.log('🔐 Removing admin role from user:', userId);
      
      await updateDoc(doc(db, this.COLLECTIONS.USERS, userId), {
        role: 'user',
        permissions: [],
        removedBy,
        removedAt: new Date().toISOString(),
        isActive: true
      });
      
      console.log('✅ Admin role removed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error removing admin role:', error);
      return false;
    }
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTIONS.USERS, userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        return userData.permissions || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  }

  // Check if user has specific permission
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions.includes(permission) || permissions.includes('*'); // * means all permissions
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Get available permissions
  getAvailablePermissions(): string[] {
    return [
      'content_manage',      // Manage sermons, series, events, news
      'content_create',      // Create new content
      'content_edit',        // Edit existing content
      'content_delete',      // Delete content
      'media_manage',        // Manage media files
      'users_manage',        // Manage user accounts
      'admin_assign',        // Assign admin roles
      'analytics_view',      // View analytics
      'settings_manage',     // Manage app settings
      'giving_manage',       // Manage giving options
      '*'                    // All permissions
    ];
  }

  // Get role hierarchy
  getRoleHierarchy(): { role: string; level: number; description: string }[] {
    return [
      { role: 'user', level: 0, description: 'Regular user with basic access' },
      { role: 'admin', level: 1, description: 'Content manager with limited admin access' },
      { role: 'super_admin', level: 2, description: 'Full system administrator' }
    ];
  }
}

export const adminService = new AdminService();
