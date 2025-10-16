import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Upload, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { storage } from '../config/firebase';

interface SimpleImageUploaderProps {
  currentImageUrl?: string;
  onImageSelected: (imageUrl: string) => void;
  placeholder?: string;
}

export const SimpleImageUploader: React.FC<SimpleImageUploaderProps> = ({
  currentImageUrl,
  onImageSelected,
  placeholder = "Upload image or enter URL manually",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  console.log('🚀 SimpleImageUploader rendering');
  
  // Test Firebase storage on component mount
  useEffect(() => {
    console.log('🔧 SimpleImageUploader mounted');
    console.log('📁 Storage object available:', !!storage);
    if (storage) {
      console.log('✅ Firebase Storage is ready');
    } else {
      console.error('❌ Firebase Storage is not available');
    }
  }, []);

  const handleImagePicker = async () => {
    console.log('📱 SimpleImageUploader button pressed');
    
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
        return;
      }

      // Show simple picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('📱 Image picker result:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('📱 Image selected:', result.assets[0].uri);
        
        // Upload to Firebase Storage
        setIsUploading(true);
        try {
          const downloadUrl = await uploadToFirebase(result.assets[0].uri);
          console.log('✅ Firebase upload successful:', downloadUrl);
          
          setPreviewUrl(downloadUrl);
          onImageSelected(downloadUrl);
          
          Alert.alert('Success', 'Image uploaded to Firebase successfully!');
        } catch (uploadError) {
          console.error('❌ Firebase upload failed:', uploadError);
          Alert.alert('Upload Error', 'Failed to upload image to Firebase Storage');
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error('❌ SimpleImageUploader error:', error);
      Alert.alert('Error', 'Failed to select image');
      setIsUploading(false);
    }
  };

  const uploadToFirebase = async (imageUri: string): Promise<string> => {
    try {
      console.log('🔥 Starting Firebase upload...');
      console.log('📁 Storage object:', !!storage);
      console.log('🖼️ Image URI:', imageUri);
      
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `thumbnails/${timestamp}_${Math.random().toString(36).substring(7)}.jpg`;
      console.log('📝 Filename:', filename);
      
      // Create storage reference
      const storageRef = ref(storage, filename);
      console.log('🔗 Storage reference created:', !!storageRef);
      
      // Convert URI to blob
      console.log('🔄 Converting URI to blob...');
      const response = await fetch(imageUri);
      const blob = await response.blob();
      console.log('📦 Blob created, size:', blob.size);
      
      // Upload file
      console.log('☁️ Uploading to Firebase Storage...');
      const snapshot = await uploadBytes(storageRef, blob);
      console.log('✅ Upload completed:', snapshot.metadata.name);
      
      // Get download URL
      console.log('🔗 Getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Firebase upload successful:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('❌ Firebase upload error:', error);
      console.error('❌ Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      throw new Error('Failed to upload image to Firebase Storage');
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    onImageSelected('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Image Upload</Text>
      
      {/* Simple Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleImagePicker}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#c9a961" />
        ) : (
          <Upload size={20} color="#c9a961" />
        )}
        <Text style={styles.uploadButtonText}>
          {isUploading ? 'Processing...' : 'Select Image'}
        </Text>
      </TouchableOpacity>

      {/* Image Preview */}
      {previewUrl && (
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewLabel}>Selected Image</Text>
            <TouchableOpacity onPress={clearImage} style={styles.clearButton}>
              <X size={16} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
          <Image source={{ uri: previewUrl }} style={styles.previewImage} />
        </View>
      )}

      {/* Manual URL Input */}
      <View style={styles.urlContainer}>
        <Text style={styles.urlLabel}>Or enter image URL:</Text>
        <Text style={styles.urlText}>{currentImageUrl || 'No image URL'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#c9a961',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  uploadButtonText: {
    color: '#c9a961',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  previewContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  clearButton: {
    padding: 4,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  urlContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  urlLabel: {
    color: '#c9a961',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  urlText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});
