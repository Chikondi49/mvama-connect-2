import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Image as ImageIcon, Upload, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { storage } from '../config/firebase';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageSelected: (imageUrl: string) => void;
  placeholder?: string;
  aspectRatio?: [number, number];
  maxWidth?: number;
  maxHeight?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageSelected,
  placeholder = "Enter image URL or upload from device",
  aspectRatio = [1, 1],
  maxWidth = 800,
  maxHeight = 800,
}) => {
  console.log('🚀 ImageUploader component rendering with props:', {
    currentImageUrl,
    placeholder,
    aspectRatio,
    maxWidth,
    maxHeight
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  // Test Firebase storage on component mount
  React.useEffect(() => {
    console.log('🔧 ImageUploader mounted');
    console.log('📁 Storage object available:', !!storage);
    if (storage) {
      console.log('✅ Firebase Storage is ready');
    } else {
      console.error('❌ Firebase Storage is not available');
    }
  }, []);

  const handleImagePicker = async () => {
    try {
      console.log('🖼️ Image picker button pressed');
      console.log('🖼️ Button press registered successfully!');
      
      // Test basic functionality first
      Alert.alert('Test', 'Button press detected! This means the component is working.');
      
      // Request permissions
      console.log('🔐 Requesting media library permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📋 Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
        return;
      }

      // Show action sheet
      console.log('📱 Showing image source selection...');
      Alert.alert(
        'Select Image Source',
        'Choose how you want to add an image',
        [
          { text: 'Camera', onPress: () => openCamera() },
          { text: 'Photo Library', onPress: () => openImageLibrary() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const openCamera = async () => {
    try {
      console.log('📸 Opening camera...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      console.log('📸 Camera result:', { canceled: result.canceled, assets: result.assets?.length });
      
      if (!result.canceled && result.assets[0]) {
        console.log('📸 Image selected from camera:', result.assets[0].uri);
        await processAndUploadImage(result.assets[0].uri);
      } else {
        console.log('📸 Camera cancelled or no image selected');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const openImageLibrary = async () => {
    try {
      console.log('🖼️ Opening image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      console.log('🖼️ Library result:', { canceled: result.canceled, assets: result.assets?.length });
      
      if (!result.canceled && result.assets[0]) {
        console.log('🖼️ Image selected from library:', result.assets[0].uri);
        await processAndUploadImage(result.assets[0].uri);
      } else {
        console.log('🖼️ Library cancelled or no image selected');
      }
    } catch (error) {
      console.error('❌ Image library error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const processAndUploadImage = async (imageUri: string) => {
    try {
      console.log('🔄 Processing and uploading image...');
      console.log('🖼️ Original image URI:', imageUri);
      setIsUploading(true);

      // Crop and resize the image
      console.log('✂️ Manipulating image...');
      console.log('📏 Target size:', { maxWidth, maxHeight });
      
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: maxWidth,
              height: maxHeight,
            },
          },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('✅ Image manipulation completed:', manipulatedImage.uri);

      // Upload to Firebase Storage
      console.log('☁️ Starting Firebase upload...');
      const downloadUrl = await uploadToFirebase(manipulatedImage.uri);
      
      // Update preview and call callback
      console.log('🔄 Updating preview and calling callback...');
      setPreviewUrl(downloadUrl);
      onImageSelected(downloadUrl);
      
      console.log('✅ Image upload process completed successfully!');
      Alert.alert('Success', 'Image uploaded successfully!');
    } catch (error) {
      console.error('❌ Error processing image:', error);
      console.error('❌ Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      Alert.alert('Error', 'Failed to process and upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadToFirebase = async (imageUri: string): Promise<string> => {
    try {
      console.log('🔄 Starting Firebase upload...');
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
      console.log('✅ Image uploaded successfully:', downloadURL);
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

  console.log('🎨 ImageUploader rendering JSX');
  
  return (
    <View style={styles.container}>
      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => {
          console.log('👆 TouchableOpacity onPress triggered!');
          handleImagePicker();
        }}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#c9a961" />
        ) : (
          <Upload size={20} color="#c9a961" />
        )}
        <Text style={styles.uploadButtonText}>
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Text>
      </TouchableOpacity>

      {/* Image Preview */}
      {previewUrl && (
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewLabel}>Image Preview</Text>
            <TouchableOpacity onPress={clearImage} style={styles.clearButton}>
              <X size={16} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
          <Image source={{ uri: previewUrl }} style={styles.previewImage} />
        </View>
      )}

      {/* Placeholder when no image */}
      {!previewUrl && (
        <View style={styles.placeholderContainer}>
          <ImageIcon size={32} color="#666" />
          <Text style={styles.placeholderText}>{placeholder}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#c9a961',
    borderStyle: 'dashed',
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
  placeholderContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
});
