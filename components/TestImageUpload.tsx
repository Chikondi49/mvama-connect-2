import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const TestImageUpload: React.FC = () => {
  console.log('🧪 TestImageUpload component rendering');

  const handleTest = async () => {
    console.log('🧪 Test button pressed');
    Alert.alert('Test', 'Button works! Now testing image picker...');
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('🧪 Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission', 'Permission denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      console.log('🧪 Image picker result:', result);
      
      if (!result.canceled && result.assets[0]) {
        Alert.alert('Success', `Image selected: ${result.assets[0].uri}`);
      } else {
        Alert.alert('Cancelled', 'No image selected');
      }
    } catch (error) {
      console.error('🧪 Test error:', error);
      Alert.alert('Error', `Test failed: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Upload Test</Text>
      <TouchableOpacity style={styles.button} onPress={handleTest}>
        <Text style={styles.buttonText}>Test Image Picker</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 10,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#c9a961',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});
