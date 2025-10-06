import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Mail, MapPin, Phone, UserPlus, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ConnectScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: ''
  });

  const [selectedInterest, setSelectedInterest] = useState<string>('');

  const interestOptions = [
    'Small Groups',
    'Youth Ministry',
    'Children\'s Ministry',
    'Women\'s Fellowship',
    'Men\'s Fellowship',
    'Music Ministry',
    'Volunteer Opportunities',
    'Bible Study',
    'Prayer Groups',
    'Community Outreach'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestSelect = (interest: string) => {
    setSelectedInterest(interest);
    handleInputChange('interest', interest);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.interest) {
      Alert.alert('Missing Information', 'Please fill in your name, email, and area of interest.');
      return;
    }
    
    Alert.alert(
      'Thank You!', 
      'Your connection request has been submitted. We\'ll get back to you soon!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#c9a961', '#b8954a']}
          style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Users size={48} color="#ffffff" fill="#ffffff" />
            <Text style={styles.heroTitle}>Join Our Community</Text>
            <Text style={styles.heroSubtitle}>
              Connect with fellow believers and grow in your faith journey
            </Text>
          </View>
        </LinearGradient>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Connected</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your full name"
              placeholderTextColor="#666666"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="#666666"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your phone number"
              placeholderTextColor="#666666"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Interest Areas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas of Interest *</Text>
          <Text style={styles.sectionSubtitle}>Select one or more areas you'd like to get involved in</Text>
          
          <View style={styles.interestGrid}>
            {interestOptions.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestButton,
                  selectedInterest === interest && styles.selectedInterestButton
                ]}
                onPress={() => handleInterestSelect(interest)}>
                <Text style={[
                  styles.interestText,
                  selectedInterest === interest && styles.selectedInterestText
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Tell us more about yourself and how you'd like to get involved..."
            placeholderTextColor="#666666"
            value={formData.message}
            onChangeText={(value) => handleInputChange('message', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <UserPlus size={20} color="#000000" />
          <Text style={styles.submitButtonText}>Submit Connection Request</Text>
        </TouchableOpacity>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Other Ways to Connect</Text>
          
          <View style={styles.contactItem}>
            <Mail size={20} color="#c9a961" />
            <Text style={styles.contactText}>info@mvamaccap.org</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Phone size={20} color="#c9a961" />
            <Text style={styles.contactText}>+265 1 234 567</Text>
          </View>
          
          <View style={styles.contactItem}>
            <MapPin size={20} color="#c9a961" />
            <Text style={styles.contactText}>Mvama CCAP, Nkhoma Synod</Text>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>Upcoming Connection Events</Text>
          
          <View style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Calendar size={16} color="#c9a961" />
              <Text style={styles.eventDateText}>Nov 20</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>New Member Orientation</Text>
              <View style={styles.eventTime}>
                <Clock size={14} color="#666666" />
                <Text style={styles.eventTimeText}>2:00 PM - 4:00 PM</Text>
              </View>
            </View>
          </View>

          <View style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Calendar size={16} color="#c9a961" />
              <Text style={styles.eventDateText}>Nov 25</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Small Group Leaders Meeting</Text>
              <View style={styles.eventTime}>
                <Clock size={14} color="#666666" />
                <Text style={styles.eventTimeText}>6:00 PM - 8:00 PM</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    marginTop: 100,
  },
  heroSection: {
    padding: 32,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 28,
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  selectedInterestButton: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
  },
  interestText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ffffff',
  },
  selectedInterestText: {
    color: '#000000',
  },
  messageInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#c9a961',
    borderRadius: 12,
    padding: 18,
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#000000',
  },
  contactSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  contactTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
  },
  eventsSection: {
    padding: 20,
  },
  eventsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  eventDate: {
    alignItems: 'center',
    marginRight: 16,
    gap: 4,
  },
  eventDateText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#c9a961',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTimeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
});
