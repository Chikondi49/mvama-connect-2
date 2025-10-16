// Utility script to assign the first super admin
// This should be run once to set up the initial admin user

import { adminService } from '../services/adminService';

export interface FirstAdminSetup {
  userEmail: string;
  displayName: string;
  assignedBy: string; // The user ID of who is assigning this role
}

/**
 * Assign the first super admin to the system
 * This should be called after a user has been created and authenticated
 */
export async function assignFirstSuperAdmin(setup: FirstAdminSetup): Promise<boolean> {
  try {
    console.log('🔐 Setting up first super admin...');
    console.log('📧 Email:', setup.userEmail);
    console.log('👤 Display Name:', setup.displayName);
    console.log('🔑 Assigned By:', setup.assignedBy);

    const success = await adminService.assignAdminRole({
      userEmail: setup.userEmail,
      role: 'super_admin',
      permissions: ['*'], // Super admin gets all permissions
      assignedBy: setup.assignedBy,
      assignedAt: new Date().toISOString()
    });

    if (success) {
      console.log('✅ First super admin assigned successfully!');
      console.log('🎉 The user now has full admin access to the CMS');
      return true;
    } else {
      console.error('❌ Failed to assign first super admin');
      return false;
    }
  } catch (error) {
    console.error('❌ Error setting up first super admin:', error);
    return false;
  }
}

/**
 * Check if any super admins exist in the system
 */
export async function hasSuperAdmin(): Promise<boolean> {
  try {
    const adminUsers = await adminService.getAllAdminUsers();
    return adminUsers.some(user => user.role === 'super_admin');
  } catch (error) {
    console.error('Error checking for super admin:', error);
    return false;
  }
}

/**
 * Get setup instructions for first admin
 */
export function getFirstAdminInstructions(): string[] {
  return [
    '1. Create a user account in your app (sign up)',
    '2. Note the user\'s email address',
    '3. Run this utility script with the user\'s email',
    '4. The user will now have super admin access',
    '5. They can then assign admin roles to other users through the CMS'
  ];
}
