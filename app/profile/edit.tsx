import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Notification from '../../components/Notification';
import { useAuth } from '../../contexts/AuthContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, userProfile, refreshUserProfile, updateProfile } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayNameError, setDisplayNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setEmail(userProfile.email || user?.email || '');
      setPhone(userProfile.phone || '');
      setBio(userProfile.bio || '');
    }
  }, [userProfile, user]);

  const validateForm = () => {
    let isValid = true;
    setDisplayNameError('');
    setEmailError('');
    setPhoneError('');

    if (!displayName.trim()) {
      setDisplayNameError('Display name is required');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (phone.trim() && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('🔐 Starting profile update...');
      console.log('📝 Profile data:', {
        displayName: displayName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      });
      
      // Update profile in Firestore
      await updateProfile({
        displayName: displayName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      });

      console.log('✅ Profile update successful');
      setNotification({
        visible: true,
        message: 'Profile updated successfully!',
        type: 'success',
      });

      // Navigate back immediately after successful update
      router.back();
    } catch (error: any) {
      console.error('❌ Profile update failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      setNotification({
        visible: true,
        message: `Failed to update profile: ${error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateBack = () => {
    console.log('🔙 Back button pressed');
    router.back();
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  return (
    <View style={styles.container}>
      <Notification
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onHide={hideNotification}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
              
               {/* Header */}
               <View style={styles.header}>
                 <TouchableOpacity 
                   style={styles.backButton} 
                   onPress={() => {
                     console.log('🔙 Back button TouchableOpacity pressed');
                     navigateBack();
                   }}
                   activeOpacity={0.7}>
                   <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
                 </TouchableOpacity>
                 <Text style={styles.title}>Edit Profile</Text>
                 <Text style={styles.subtitle}>Update your personal information</Text>
               </View>

              {/* Profile Form */}
              <View style={styles.form}>
                {/* Display Name Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, displayNameError && styles.inputWrapperError]}>
                    <User size={20} color={displayNameError ? "#ff6b6b" : "#c9a961"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Display Name"
                      placeholderTextColor="#666666"
                      value={displayName}
                      onChangeText={(text) => {
                        setDisplayName(text);
                        if (displayNameError) setDisplayNameError('');
                      }}
                      autoCapitalize="words"
                      underlineColorAndroid="transparent"
                      selectionColor="#c9a961"
                      cursorColor="#c9a961"
                    />
                  </View>
                  {displayNameError && <Text style={styles.errorText}>{displayNameError}</Text>}
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
                    <Mail size={20} color={emailError ? "#ff6b6b" : "#c9a961"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor="#666666"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) setEmailError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      underlineColorAndroid="transparent"
                      selectionColor="#c9a961"
                      cursorColor="#c9a961"
                    />
                  </View>
                  {emailError && <Text style={styles.errorText}>{emailError}</Text>}
                </View>

                {/* Phone Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, phoneError && styles.inputWrapperError]}>
                    <Phone size={20} color={phoneError ? "#ff6b6b" : "#c9a961"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number (Optional)"
                      placeholderTextColor="#666666"
                      value={phone}
                      onChangeText={(text) => {
                        setPhone(text);
                        if (phoneError) setPhoneError('');
                      }}
                      keyboardType="phone-pad"
                      underlineColorAndroid="transparent"
                      selectionColor="#c9a961"
                      cursorColor="#c9a961"
                    />
                  </View>
                  {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
                </View>

                {/* Bio Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <User size={20} color="#c9a961" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.bioInput]}
                      placeholder="Bio (Optional)"
                      placeholderTextColor="#666666"
                      value={bio}
                      onChangeText={setBio}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      underlineColorAndroid="transparent"
                      selectionColor="#c9a961"
                      cursorColor="#c9a961"
                    />
                  </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 12,
    zIndex: 10,
  },
  title: {
    fontFamily: 'Playfair-Bold',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.3)',
  },
  inputWrapperError: {
    backgroundColor: 'transparent',
    borderColor: '#ff6b6b',
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 4,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#c9a961',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(201, 169, 97, 0.5)',
  },
  saveButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffffff',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 4,
    marginLeft: 4,
  },
});
