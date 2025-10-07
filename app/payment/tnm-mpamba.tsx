import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Copy, Phone, Smartphone } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatCurrency } from '../../utils/currencyFormatter';

export default function TNMMpambaScreen() {
  const [copiedField, setCopiedField] = useState<string>('');

  const tnmDetails = {
    phoneNumber: '+265 987 654 321',
    accountName: 'MVAMA CCAP Nkhoma Synod',
    shortCode: '*247#',
    reference: 'GIVING-2024'
  };

  const handleCopy = (field: string, value: string) => {
    setCopiedField(field);
    // In a real app, you would copy to clipboard here
    Alert.alert('Copied!', `${field} copied to clipboard`);
    setTimeout(() => setCopiedField(''), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TNM Mpamba</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#c9a961', '#b8954a']}
          style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Smartphone size={48} color="#ffffff" fill="#ffffff" />
            <Text style={styles.heroTitle}>TNM Mpamba Instructions</Text>
            <Text style={styles.heroSubtitle}>
              Follow these steps to complete your donation via TNM Mpamba
            </Text>
          </View>
        </LinearGradient>

        {/* TNM Mpamba Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TNM Mpamba Details</Text>
          
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Smartphone size={20} color="#c9a961" />
                <Text style={styles.detailLabelText}>Phone Number</Text>
              </View>
              <View style={styles.detailValue}>
                <Text style={styles.detailValueText}>{tnmDetails.phoneNumber}</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => handleCopy('Phone Number', tnmDetails.phoneNumber)}>
                  <Copy size={16} color="#c9a961" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Smartphone size={20} color="#c9a961" />
                <Text style={styles.detailLabelText}>Account Name</Text>
              </View>
              <View style={styles.detailValue}>
                <Text style={styles.detailValueText}>{tnmDetails.accountName}</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => handleCopy('Account Name', tnmDetails.accountName)}>
                  <Copy size={16} color="#c9a961" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Smartphone size={20} color="#c9a961" />
                <Text style={styles.detailLabelText}>USSD Code</Text>
              </View>
              <View style={styles.detailValue}>
                <Text style={styles.detailValueText}>{tnmDetails.shortCode}</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => handleCopy('USSD Code', tnmDetails.shortCode)}>
                  <Copy size={16} color="#c9a961" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Smartphone size={20} color="#c9a961" />
                <Text style={styles.detailLabelText}>Reference</Text>
              </View>
              <View style={styles.detailValue}>
                <Text style={styles.detailValueText}>{tnmDetails.reference}</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => handleCopy('Reference', tnmDetails.reference)}>
                  <Copy size={16} color="#c9a961" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Send Money</Text>
          
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Dial *247# on your TNM phone
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Select "Send Money" from the menu
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Enter the phone number: {tnmDetails.phoneNumber}
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                Enter the amount you want to donate
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>5</Text>
              </View>
              <Text style={styles.instructionText}>
                Enter your TNM Mpamba PIN to confirm
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>6</Text>
              </View>
              <Text style={styles.instructionText}>
                Save the transaction receipt for your records
              </Text>
            </View>
          </View>
        </View>

        {/* Alternative Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alternative: TNM Mpamba App</Text>
          
          <View style={styles.alternativeCard}>
            <Text style={styles.alternativeText}>
              You can also use the TNM Mpamba mobile app:
            </Text>
            <View style={styles.alternativeSteps}>
              <Text style={styles.alternativeStep}>1. Open TNM Mpamba app</Text>
              <Text style={styles.alternativeStep}>2. Select "Send Money"</Text>
              <Text style={styles.alternativeStep}>3. Enter recipient: {tnmDetails.phoneNumber}</Text>
              <Text style={styles.alternativeStep}>4. Enter amount and confirm</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Phone size={20} color="#c9a961" />
              <Text style={styles.contactText}>+265 123 456 789</Text>
            </View>
            <Text style={styles.contactNote}>
              Contact us if you need assistance with your TNM Mpamba transfer
            </Text>
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
    fontSize: 24,
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
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#cccccc',
    marginLeft: 8,
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailValueText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginRight: 8,
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
  },
  instructionsList: {
    marginTop: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#c9a961',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#000000',
  },
  instructionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
    lineHeight: 24,
  },
  alternativeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  alternativeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
    lineHeight: 24,
  },
  alternativeSteps: {
    marginLeft: 16,
  },
  alternativeStep: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  contactNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
});
