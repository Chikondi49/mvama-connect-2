import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface CreateSuperAdminData {
  email: string;
  displayName: string;
  uid: string;
}

export async function createFirstSuperAdmin(data: CreateSuperAdminData): Promise<boolean> {
  try {
    console.log('🔐 Creating first super admin...');
    console.log('📧 Email:', data.email);
    console.log('👤 Name:', data.displayName);
    console.log('🆔 UID:', data.uid);

    // Create user document in users collection
    const userRef = doc(db, 'users', data.uid);
    const userData = {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      role: 'super_admin',
      permissions: ['*'],
      isActive: true,
      createdAt: new Date().toISOString(),
      assignedBy: 'system',
      assignedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    console.log('📝 Creating user document with data:', userData);
    await setDoc(userRef, userData);
    console.log('✅ User document created successfully');

    // Create admin assignment record
    const adminAssignmentRef = doc(db, 'adminAssignments');
    const assignmentData = {
      userEmail: data.email,
      userUid: data.uid,
      role: 'super_admin',
      permissions: ['*'],
      assignedBy: 'system',
      assignedAt: new Date().toISOString(),
      isActive: true
    };

    console.log('📝 Creating admin assignment with data:', assignmentData);
    await setDoc(adminAssignmentRef, assignmentData);
    console.log('✅ Admin assignment created successfully');

    console.log('🎉 First super admin created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error creating first super admin:', error);
    throw error;
  }
}

export async function checkIfSuperAdminExists(): Promise<boolean> {
  try {
    console.log('🔍 Checking if super admin exists...');
    
    // Check users collection for super_admin role
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'super_admin'));
    const querySnapshot = await getDocs(q);
    
    const exists = !querySnapshot.empty;
    console.log('📊 Super admin exists:', exists);
    console.log('📊 Found super admins:', querySnapshot.size);
    
    return exists;
  } catch (error) {
    console.error('❌ Error checking for super admin:', error);
    return false;
  }
}
