import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Banknote, CheckCircle, Heart, Smartphone } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GivingOption, givingService, PaymentMethod } from '../services/givingService';
import { formatCurrency } from '../utils/currencyFormatter';

export default function GiveScreen() {
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [givingOptions, setGivingOptions] = useState<GivingOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmount = (amount: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanAmount = amount.replace(/[^\d.]/g, '');
    setCustomAmount(cleanAmount);
    setSelectedAmount('');
  };

  const handlePaymentMethod = (method: string) => {
    setSelectedMethod(method);
  };

  // Load giving data from Firebase
  const loadGivingData = async () => {
    try {
      setLoading(true);
      console.log('💰 Loading giving data from Firestore...');
      
      const [options, methods] = await Promise.all([
        givingService.getGivingOptions(),
        givingService.getPaymentMethods()
      ]);
      
      console.log(`✅ Loaded ${options.length} giving options and ${methods.length} payment methods`);
      console.log('📊 Payment methods:', methods);
      setGivingOptions(options);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('❌ Error loading giving data:', error);
      // Fallback to default data if Firebase fails
      setGivingOptions([
        { id: '1', amount: '2000', isPopular: false, isBigButton: false, order: 1 },
        { id: '2', amount: '5000', isPopular: false, isBigButton: false, order: 2 },
        { id: '3', amount: '10000', isPopular: false, isBigButton: false, order: 3 },
        { id: '4', amount: '20000', isPopular: true, isBigButton: true, order: 4 },
        { id: '5', amount: '50000', isPopular: false, isBigButton: false, order: 5 },
      ]);
      const fallbackMethods = [
        { id: '1', name: 'Bank Transfer', type: 'bank', icon: 'Banknote', isActive: true, order: 1 },
        { id: '2', name: 'Airtel Money 2', type: 'airtel', icon: 'Smartphone', isActive: true, order: 2 },
        { id: '3', name: 'TNM Mpamba', type: 'tnm', icon: 'Smartphone', isActive: true, order: 3 },
      ];
      console.log('📊 Using fallback payment methods:', fallbackMethods);
      setPaymentMethods(fallbackMethods);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGivingData();
  }, []);


  const handleGive = () => {
    const amount = selectedAmount || customAmount;
    if (!amount || !selectedMethod) {
      Alert.alert('Missing Information', 'Please select an amount and payment method.');
      return;
    }
    
    // Navigate to payment instruction page based on selected method
    if (selectedMethod === 'bank') {
      router.push('/payment/bank-transfer');
    } else if (selectedMethod === 'airtel') {
      router.push('/payment/airtel-money');
    } else if (selectedMethod === 'tnm') {
      router.push('/payment/tnm-mpamba');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Give</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#c9a961', '#b8954a']}
          style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Heart size={48} color="#ffffff" fill="#ffffff" />
            <Text style={styles.heroTitle}>Support Our Mission</Text>
            <Text style={styles.heroSubtitle}>
              Your generous giving helps us spread the Gospel and serve our community
            </Text>
          </View>
        </LinearGradient>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#c9a961" />
            <Text style={styles.loadingText}>Loading giving options...</Text>
          </View>
        )}

        {/* Amount Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Amount</Text>
          
          <View style={styles.amountGrid}>
            {givingOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.amountButton,
                  option.isBigButton && styles.bigAmountButton,
                  selectedAmount === option.amount && styles.selectedAmountButton
                ]}
                onPress={() => handleAmountSelect(option.amount)}>
                <Text style={[
                  styles.amountText,
                  option.isBigButton && styles.bigAmountText,
                  selectedAmount === option.amount && styles.selectedAmountText
                ]}>
                  {formatCurrency(option.amount)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customAmountContainer}>
            <Text style={styles.customAmountLabel}>Custom Amount</Text>
            <View style={styles.customAmountInput}>
              <Text style={styles.dollarSign}>MK</Text>
              <TextInput
                style={styles.customAmountField}
                placeholder="0.00"
                placeholderTextColor="#666666"
                value={customAmount}
                onChangeText={handleCustomAmount}
                keyboardType="numeric"
              />
            </View>
            {customAmount && (
              <Text style={styles.formattedAmount}>
                {formatCurrency(customAmount)}
              </Text>
            )}
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {paymentMethods.length > 0 ? paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedMethod === method.type && styles.selectedPaymentMethod
              ]}
              onPress={() => handlePaymentMethod(method.type)}>
              {method.icon === 'Banknote' ? (
                <Banknote size={24} color={selectedMethod === method.type ? '#c9a961' : '#666666'} />
              ) : (
                <Smartphone size={24} color={selectedMethod === method.type ? '#c9a961' : '#666666'} />
              )}
              <Text style={[
                styles.paymentMethodText,
                selectedMethod === method.type && styles.selectedPaymentMethodText
              ]}>
                {method.name}
              </Text>
              {selectedMethod === method.type && <CheckCircle size={20} color="#c9a961" />}
            </TouchableOpacity>
          )) : (
            <View style={styles.noPaymentMethods}>
              <Text style={styles.noPaymentMethodsText}>Loading payment methods...</Text>
            </View>
          )}
        </View>

        {/* Give Button */}
        <TouchableOpacity style={styles.giveButton} onPress={handleGive}>
          <Text style={styles.giveButtonText}>Give Now</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Your Giving Makes a Difference</Text>
          <Text style={styles.infoText}>
            • Supporting local missions and outreach programs{'\n'}
            • Maintaining our church facilities and ministries{'\n'}
            • Providing resources for community development{'\n'}
            • Spreading the Gospel through various initiatives
          </Text>
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
    marginBottom: 16,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  amountButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  selectedAmountButton: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
  },
  amountText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  selectedAmountText: {
    color: '#000000',
  },
  bigAmountButton: {
    flex: 2,
    minWidth: '60%',
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#c9a961',
  },
  bigAmountText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  customAmountContainer: {
    marginTop: 8,
  },
  customAmountLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
  },
  customAmountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 16,
    minHeight: 48,
  },
  dollarSign: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#c9a961',
    marginRight: 8,
  },
  customAmountField: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#ffffff',
    paddingVertical: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    minHeight: 56,
  },
  selectedPaymentMethod: {
    borderColor: '#c9a961',
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
  },
  paymentMethodText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
  },
  selectedPaymentMethodText: {
    color: '#c9a961',
  },
  giveButton: {
    backgroundColor: '#c9a961',
    borderRadius: 12,
    padding: 18,
    margin: 20,
    alignItems: 'center',
  },
  giveButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#000000',
  },
  infoSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 12,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 22,
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
  formattedAmount: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#c9a961',
    textAlign: 'center',
    marginTop: 8,
  },
  noPaymentMethods: {
    padding: 20,
    alignItems: 'center',
  },
  noPaymentMethodsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
});
