import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AddAdminUserData {
  email: string;
  displayName: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  assignedBy: string;
}

export async function addAdminUser(data: AddAdminUserData): Promise<boolean> {
  try {
    console.log('🔐 Adding admin user...');
    console.log('📧 Email:', data.email);
    console.log('👤 Name:', data.displayName);
    console.log('🔑 Role:', data.role);
    console.log('🔑 Permissions:', data.permissions);
    console.log('🔑 Assigned by:', data.assignedBy);

    // Check if Firebase is available
    if (!db) {
      console.error('❌ Firebase database not initialized');
      throw new Error('Firebase database not initialized');
    }

    console.log('✅ Firebase database is available');
    console.log('🔍 Testing Firebase connection...');
    
    // Test Firebase connection by trying to access a collection
    try {
      const testRef = collection(db, 'users');
      console.log('✅ Firebase collection access successful');
    } catch (firebaseError) {
      console.error('❌ Firebase connection test failed:', firebaseError);
      throw new Error(`Firebase connection failed: ${(firebaseError as any)?.message}`);
    }

    // Generate a temporary UID for the user (they'll get a real one when they sign up)
    const tempUid = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆔 Generated temp UID:', tempUid);
    
    // Create user document in users collection
    const userRef = doc(db, 'users', tempUid);
    const userData = {
      uid: tempUid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      permissions: data.permissions,
      isActive: true,
      isPending: true, // Mark as pending until they sign up
      createdAt: new Date().toISOString(),
      assignedBy: data.assignedBy,
      assignedAt: new Date().toISOString(),
      lastLoginAt: null
    };

    console.log('📝 Creating user document with data:', userData);
    console.log('📁 Document path: users/', tempUid);
    
    await setDoc(userRef, userData);
    console.log('✅ User document created successfully');

    // Create admin assignment record
    const adminAssignmentRef = collection(db, 'adminAssignments');
    const assignmentData = {
      userEmail: data.email,
      userUid: tempUid,
      role: data.role,
      permissions: data.permissions,
      assignedBy: data.assignedBy,
      assignedAt: new Date().toISOString(),
      isActive: true,
      isPending: true
    };

    console.log('📝 Creating admin assignment with data:', assignmentData);
    console.log('📁 Collection: adminAssignments');
    
    const assignmentDocRef = await addDoc(adminAssignmentRef, assignmentData);
    console.log('✅ Admin assignment created successfully with ID:', assignmentDocRef.id);

    console.log('🎉 Admin user added successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error adding admin user:', error);
    console.error('❌ Error details:', {
      message: (error as any)?.message,
      code: (error as any)?.code,
      stack: (error as any)?.stack
    });
    throw error;
  }
}

export async function updatePendingUserToActive(uid: string, realUid: string): Promise<boolean> {
  try {
    console.log('🔄 Updating pending user to active...');
    console.log('🆔 Temp UID:', uid);
    console.log('🆔 Real UID:', realUid);

    // Update the user document
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      uid: realUid,
      isPending: false,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });

    // Also create a new document with the real UID
    const realUserRef = doc(db, 'users', realUid);
    const userData = await userRef.get();
    if (userData.exists()) {
      const data = userData.data();
      await setDoc(realUserRef, {
        ...data,
        uid: realUid,
        isPending: false,
        lastLoginAt: new Date().toISOString()
      });
    }

    console.log('✅ User updated to active status');
    return true;
  } catch (error) {
    console.error('❌ Error updating pending user:', error);
    throw error;
  }
}

