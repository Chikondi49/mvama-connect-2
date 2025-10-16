# How to Assign Your First Super Admin

## 🚀 Simple Step-by-Step Guide

### **Step 1: Access the Admin Setup**
1. **Open your app** and go to **Settings** tab
2. **Tap "Content Management"** (this will be visible to all users initially)
3. **You'll see a setup screen** if no super admin exists yet

### **Step 2: Create Your First Super Admin**
1. **Enter the display name** (e.g., "Church Administrator")
2. **Enter the email address** of the person who will be the super admin
3. **Tap "Create Super Admin"**

### **Step 3: Important Requirements**
- ✅ **The email must belong to an existing user** in your app
- ✅ **The user must have signed up** in your app first
- ✅ **Only one super admin can be created** through this setup

### **Step 4: After Setup**
- The super admin will have **full access** to the CMS
- They can **assign admin roles** to other users
- They can **manage all content** (sermons, events, news, media)

## 🔄 Alternative Method (For Developers)

If you need to programmatically assign the first super admin:

```typescript
import { assignFirstSuperAdmin } from './utils/assignFirstAdmin';

// After a user signs up, assign them as super admin
await assignFirstSuperAdmin({
  userEmail: 'admin@yourchurch.com',
  displayName: 'Church Administrator',
  assignedBy: 'system' // or current user's ID
});
```

## 🛡️ Security Notes

- **Only one super admin** can be created through the setup screen
- **Super admins have full control** over the entire system
- **Regular admins** can be assigned by super admins through User Management
- **Role hierarchy**: Super Admin > Admin > User

## 🎯 What Happens Next

1. **Super admin gets full access** to all CMS features
2. **They can assign admin roles** to other team members
3. **Content management** becomes available to all admins
4. **Regular users** won't see admin features

## 🆘 Troubleshooting

**"User may not exist" error:**
- Make sure the person has signed up in your app first
- Check the email address is correct
- The user must have a valid account

**"Super admin already exists" error:**
- A super admin has already been created
- Use the User Management section to assign regular admin roles

**Can't access admin features:**
- Make sure you're signed in as the super admin
- Check that the role was assigned correctly
- Try signing out and back in

## 📱 User Experience

- **First time**: Setup screen appears automatically
- **After setup**: Normal admin panel with full CMS access
- **For other users**: Admin features are hidden unless they have admin roles

The system is now ready to use! 🎉
