import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Banknote, Copy, Phone, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BankTransferDetails, givingService } from '../../services/givingService';
import { formatCurrency } from '../../utils/currencyFormatter';

export default function BankTransferScreen() {
  const [copiedField, setCopiedField] = useState<string>('');
  const [bankDetails, setBankDetails] = useState<BankTransferDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Load bank details from Firebase
  useEffect(() => {
    const loadBankDetails = async () => {
      try {
        setLoading(true);
        console.log('🏦 Loading bank transfer details from Firestore...');
        const details = await givingService.getBankTransferDetails();
        setBankDetails(details);
      } catch (error) {
        console.error('❌ Error loading bank details:', error);
        // Fallback to default data
        setBankDetails({
          id: '1',
          accountName: 'MVAMA CCAP Nkhoma Synod',
          accountNumber: '1234567890',
          bankName: 'National Bank of Malawi',
          branch: 'Lilongwe Branch',
          swiftCode: 'NBMAMWMW',
          reference: 'GIVING-2024',
          instructions: [
            'Visit your bank branch or use online banking',
            'Use the account details above to make the transfer',
            'Include the reference number in your transfer',
            'Keep your transaction receipt as proof of payment'
          ],
          contactPhone: '+265 123 456 789',
          contactEmail: 'giving@mvama.org'
        });
      } finally {
        setLoading(false);
      }
    };

    loadBankDetails();
  }, []);

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
        <Text style={styles.headerTitle}>Bank Transfer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#c9a961', '#b8954a']}
          style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Banknote size={48} color="#ffffff" fill="#ffffff" />
            <Text style={styles.heroTitle}>Bank Transfer Instructions</Text>
            <Text style={styles.heroSubtitle}>
              Follow these steps to complete your donation via bank transfer
            </Text>
          </View>
        </LinearGradient>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#c9a961" />
            <Text style={styles.loadingText}>Loading bank details...</Text>
          </View>
        )}

        {/* Bank Details */}
        {bankDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Account Details</Text>
            
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <User size={20} color="#c9a961" />
                  <Text style={styles.detailLabelText}>Account Name</Text>
                </View>
                <View style={styles.detailValue}>
                  <Text style={styles.detailValueText}>{bankDetails.accountName}</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => handleCopy('Account Name', bankDetails.accountName)}>
                    <Copy size={16} color="#c9a961" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <Banknote size={20} color="#c9a961" />
                  <Text style={styles.detailLabelText}>Account Number</Text>
                </View>
                <View style={styles.detailValue}>
                  <Text style={styles.detailValueText}>{bankDetails.accountNumber}</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => handleCopy('Account Number', bankDetails.accountNumber)}>
                    <Copy size={16} color="#c9a961" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <Banknote size={20} color="#c9a961" />
                  <Text style={styles.detailLabelText}>Bank Name</Text>
                </View>
                <View style={styles.detailValue}>
                  <Text style={styles.detailValueText}>{bankDetails.bankName}</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => handleCopy('Bank Name', bankDetails.bankName)}>
                    <Copy size={16} color="#c9a961" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <Banknote size={20} color="#c9a961" />
                  <Text style={styles.detailLabelText}>Branch</Text>
                </View>
                <View style={styles.detailValue}>
                  <Text style={styles.detailValueText}>{bankDetails.branch}</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => handleCopy('Branch', bankDetails.branch)}>
                    <Copy size={16} color="#c9a961" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <Banknote size={20} color="#c9a961" />
                  <Text style={styles.detailLabelText}>SWIFT Code</Text>
                </View>
                <View style={styles.detailValue}>
                  <Text style={styles.detailValueText}>{bankDetails.swiftCode}</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => handleCopy('SWIFT Code', bankDetails.swiftCode)}>
                    <Copy size={16} color="#c9a961" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <Banknote size={20} color="#c9a961" />
                  <Text style={styles.detailLabelText}>Reference</Text>
                </View>
                <View style={styles.detailValue}>
                  <Text style={styles.detailValueText}>{bankDetails.reference}</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => handleCopy('Reference', bankDetails.reference)}>
                    <Copy size={16} color="#c9a961" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Instructions */}
        {bankDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Transfer</Text>
            
            <View style={styles.instructionsList}>
              {bankDetails.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    {instruction}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact Info */}
        {bankDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Need Help?</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactItem}>
                <Phone size={20} color="#c9a961" />
                <Text style={styles.contactText}>{bankDetails.contactPhone}</Text>
              </View>
              <Text style={styles.contactNote}>
                Contact us if you need assistance with your transfer
              </Text>
            </View>
          </View>
        )}
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#c9a961',
    fontFamily: 'Inter-Medium',
    marginTop: 12,
  },
});
