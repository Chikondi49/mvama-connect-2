import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Mail, Phone, User, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
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
import { storageService } from '../../services/storageService';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, userProfile, refreshUserProfile, updateProfile } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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
      setProfileImage(userProfile.photoURL || null);
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

  const handleImagePicker = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setNotification({
          visible: true,
          message: 'Permission to access media library is required!',
          type: 'error',
        });
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('Image picker cancelled');
        return;
      }

      const imageUri = result.assets[0].uri;
      console.log('📷 Selected image:', imageUri);

      // Process and crop the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: 400,
              height: 400,
            },
          },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('✅ Image processed successfully:', manipulatedImage.uri);
      setProfileImage(manipulatedImage.uri);
    } catch (error: any) {
      console.error('❌ Image picker failed:', error);
      setNotification({
        visible: true,
        message: 'Failed to select image. Please try again.',
        type: 'error',
      });
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
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
        profileImage: profileImage,
      });

      let photoURL = userProfile?.photoURL;

      // Upload new profile image if one is selected
      if (profileImage && profileImage !== userProfile?.photoURL) {
        setIsUploadingImage(true);
        console.log('📤 Uploading profile image...');
        
        const uploadResult = await storageService.uploadProfileImage(
          user?.uid || 'unknown',
          profileImage
        );

        if (uploadResult.success && uploadResult.url) {
          photoURL = uploadResult.url;
          console.log('✅ Profile image uploaded successfully:', photoURL);
        } else {
          console.error('❌ Profile image upload failed:', uploadResult.error);
          setNotification({
            visible: true,
            message: `Failed to upload profile image: ${uploadResult.error}`,
            type: 'error',
          });
          return;
        }
        setIsUploadingImage(false);
      }
      
      // Update profile in Firestore
      await updateProfile({
        displayName: displayName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        photoURL: photoURL,
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
      setIsUploadingImage(false);
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

              {/* Profile Picture Section */}
              <View style={styles.profilePictureSection}>
                <Text style={styles.profilePictureLabel}>Profile Picture</Text>
                <View style={styles.profilePictureContainer}>
                  {profileImage ? (
                    <View style={styles.profileImageWrapper}>
                      <Image source={{ uri: profileImage }} style={styles.profileImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={handleRemoveImage}>
                        <X size={16} color="#ffffff" strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <User size={40} color="#c9a961" strokeWidth={2} />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={handleImagePicker}
                    disabled={isUploadingImage}>
                    {isUploadingImage ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Camera size={20} color="#ffffff" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.profilePictureHint}>
                  Tap the camera icon to add or change your profile picture
                </Text>
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
                  style={[styles.saveButton, (isLoading || isUploadingImage) && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={isLoading || isUploadingImage}>
                  {isLoading || isUploadingImage ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {isUploadingImage ? 'Uploading Image...' : 'Save Changes'}
                    </Text>
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
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profilePictureLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
  },
  profilePictureContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#c9a961',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#c9a961',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  addImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#c9a961',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profilePictureHint: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
});
