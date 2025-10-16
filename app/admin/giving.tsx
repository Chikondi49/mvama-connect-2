import { LinearGradient } from 'expo-linear-gradient';
import { Banknote, CreditCard, DollarSign, Edit, Eye, Plus, Search, Smartphone, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { givingService } from '../../services/givingService';

interface GivingStats {
  totalOptions: number;
  totalPaymentMethods: number;
  totalBankDetails: number;
  totalMobileMoney: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon: string;
  isActive: boolean;
  order: number;
  description?: string;
}

interface GivingOption {
  id: string;
  amount: string;
  isPopular: boolean;
  isBigButton: boolean;
  order: number;
  isActive: boolean;
}

export default function GivingManagement() {
  const [stats, setStats] = useState<GivingStats | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [givingOptions, setGivingOptions] = useState<GivingOption[]>([]);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [airtelDetails, setAirtelDetails] = useState<any>(null);
  const [tnmDetails, setTnmDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'options' | 'methods' | 'bank' | 'mobile'>('options');

  useEffect(() => {
    loadGivingData();
  }, []);

  const loadGivingData = async () => {
    try {
      setLoading(true);
      
      const [options, methods, bankData, airtelData, tnmData] = await Promise.all([
        givingService.getGivingOptions(),
        givingService.getPaymentMethods(),
        givingService.getBankTransferDetails(),
        givingService.getMobileMoneyDetails('airtel'),
        givingService.getMobileMoneyDetails('tnm')
      ]);

      setGivingOptions(options);
      setPaymentMethods(methods);
      setBankDetails(bankData);
      setAirtelDetails(airtelData);
      setTnmDetails(tnmData);
      
      console.log('🔍 Loaded Airtel Details:', airtelData);
      console.log('🔍 Loaded TNM Details:', tnmData);
      
      setStats({
        totalOptions: options.length,
        totalPaymentMethods: methods.length,
        totalBankDetails: bankData ? 1 : 0,
        totalMobileMoney: (airtelData ? 1 : 0) + (tnmData ? 1 : 0),
      });
    } catch (error) {
      console.error('Error loading giving data:', error);
      
      // Set fallback data if services fail
      setStats({
        totalOptions: 0,
        totalPaymentMethods: 0,
        totalBankDetails: 0,
        totalMobileMoney: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'option' | 'method' | 'bank' | 'mobile'>('option');
  
  // Form data for giving options
  const [optionFormData, setOptionFormData] = useState({
    id: '',
    amount: '',
    isPopular: false,
    isBigButton: false,
    order: '',
    isActive: true,
    description: ''
  });
  
  // Form data for payment methods
  const [methodFormData, setMethodFormData] = useState({
    id: '',
    name: '',
    type: '',
    icon: '',
    isActive: true,
    order: '',
    description: ''
  });

  // Form data for bank transfer details
  const [bankFormData, setBankFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    branch: '',
    swiftCode: '',
    instructions: [''],
    contactPhone: ''
  });

  // Form data for mobile money details
  const [mobileFormData, setMobileFormData] = useState({
    type: 'airtel' as 'airtel' | 'tnm',
    phoneNumber: '',
    accountName: '',
    instructions: [''],
    contactPhone: '',
    isActive: true
  });

  const handleDeleteOption = async (optionId: string) => {
    Alert.alert(
      'Delete Giving Option',
      'Are you sure you want to delete this giving option?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting giving option:', optionId);
              await givingService.deleteGivingOption(optionId);
              console.log('✅ Giving option deleted successfully');
              Alert.alert('Success', 'Giving option deleted successfully');
              loadGivingData();
            } catch (error) {
              console.error('❌ Error deleting giving option:', error);
              Alert.alert('Error', `Failed to delete giving option: ${(error as any)?.message || 'Unknown error'}`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteMethod = async (methodId: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting payment method:', methodId);
              await givingService.deletePaymentMethod(methodId);
              console.log('✅ Payment method deleted successfully');
              Alert.alert('Success', 'Payment method deleted successfully');
              loadGivingData();
            } catch (error) {
              console.error('❌ Error deleting payment method:', error);
              Alert.alert('Error', `Failed to delete payment method: ${(error as any)?.message || 'Unknown error'}`);
            }
          },
        },
      ]
    );
  };

  const handleAddItem = (type: 'option' | 'method') => {
    console.log('🔧 handleAddItem called with type:', type);
    setEditType(type);
    if (type === 'option') {
      setOptionFormData({
        id: '',
        amount: '',
        isPopular: false,
        isBigButton: false,
        order: '',
        isActive: true,
        description: ''
      });
    } else {
      console.log('🔧 Setting up method form data');
      setMethodFormData({
        id: '',
        name: '',
        type: '',
        icon: '',
        isActive: true,
        order: '',
        description: ''
      });
      console.log('🔧 Method form data reset completed');
    }
    console.log('🔧 Opening add modal');
    setShowAddModal(true);
  };

  const handleEditItem = (item: any, type: 'option' | 'method') => {
    setEditItem(item);
    setEditType(type);
    if (type === 'option') {
      setOptionFormData({
        id: item.id,
        amount: item.amount,
        isPopular: item.isPopular,
        isBigButton: item.isBigButton,
        order: item.order.toString(),
        isActive: item.isActive,
        description: item.description || ''
      });
    } else {
      setMethodFormData({
        id: item.id,
        name: item.name,
        type: item.type,
        icon: item.icon,
        isActive: item.isActive,
        order: item.order.toString(),
        description: item.description || ''
      });
    }
    setShowEditModal(true);
  };

  const handleCreateItem = async () => {
    console.log('🚀 handleCreateItem called with editType:', editType);
    console.log('🚀 Current form data:', { optionFormData, methodFormData, bankFormData, mobileFormData });
    
    if (editType === 'option') {
      if (!optionFormData.amount.trim()) {
        Alert.alert('Error', 'Please enter an amount');
        return;
      }
    } else if (editType === 'method') {
      if (!methodFormData.name.trim() || !methodFormData.type.trim()) {
        Alert.alert('Error', 'Please fill in required fields (name and type)');
        return;
      }
    } else if (editType === 'bank') {
      if (!bankFormData.accountName.trim() || !bankFormData.accountNumber.trim()) {
        Alert.alert('Error', 'Please fill in required fields (Account Name and Account Number)');
        return;
      }
    } else if (editType === 'mobile') {
      if (!mobileFormData.phoneNumber.trim() || !mobileFormData.accountName.trim()) {
        Alert.alert('Error', 'Please fill in required fields (Phone Number and Account Name)');
        return;
      }
    }

    try {
      console.log('💰 Creating new item:', editType);
      
      if (editType === 'option') {
        const optionData = {
          amount: optionFormData.amount,
          isPopular: optionFormData.isPopular,
          isBigButton: optionFormData.isBigButton,
          isActive: optionFormData.isActive,
          order: parseInt(optionFormData.order) || 0,
          description: optionFormData.description
        };
        console.log('💰 Creating giving option:', optionData);
        await givingService.createGivingOption(optionData);
        console.log('✅ Giving option created successfully');
      } else if (editType === 'method') {
        console.log('🔍 Method Form Data:', methodFormData);
        const methodData = {
          name: methodFormData.name,
          type: methodFormData.type,
          icon: methodFormData.icon,
          isActive: methodFormData.isActive,
          order: parseInt(methodFormData.order) || 0,
          description: methodFormData.description
        };
        console.log('💳 Creating payment method:', methodData);
        console.log('💳 Calling givingService.createPaymentMethod...');
        const methodId = await givingService.createPaymentMethod(methodData);
        console.log('✅ Payment method created successfully with ID:', methodId);
      } else if (editType === 'bank') {
        console.log('🏦 Creating bank transfer details:', bankFormData);
        await givingService.createBankTransferDetails(bankFormData);
        console.log('✅ Bank transfer details created successfully');
      } else if (editType === 'mobile') {
        console.log('📱 Creating mobile money details:', mobileFormData);
        await givingService.createMobileMoneyDetails(mobileFormData.type, mobileFormData);
        console.log('✅ Mobile money details created successfully');
      }
      
      const successMessage = editType === 'option' ? 'Giving option' : 
                           editType === 'method' ? 'Payment method' :
                           editType === 'bank' ? 'Bank transfer details' : 'Mobile money details';
      
      Alert.alert('Success', `${successMessage} created successfully!`);
      setShowAddModal(false);
      loadGivingData();
    } catch (error) {
      console.error('❌ Error creating item:', error);
      Alert.alert('Error', `Failed to create ${editType}: ${(error as any)?.message || 'Unknown error'}`);
    }
  };

  const handleUpdateItem = async () => {
    if (editType === 'option') {
      if (!optionFormData.amount.trim()) {
        Alert.alert('Error', 'Please enter an amount');
        return;
      }
    } else if (editType === 'method') {
      if (!methodFormData.name.trim() || !methodFormData.type.trim()) {
        Alert.alert('Error', 'Please fill in required fields (name and type)');
        return;
      }
    } else if (editType === 'bank') {
      if (!bankFormData.accountName.trim() || !bankFormData.accountNumber.trim()) {
        Alert.alert('Error', 'Please fill in required fields (Account Name and Account Number)');
        return;
      }
    } else if (editType === 'mobile') {
      if (!mobileFormData.phoneNumber.trim() || !mobileFormData.accountName.trim()) {
        Alert.alert('Error', 'Please fill in required fields (Phone Number and Account Name)');
        return;
      }
    }

    try {
      console.log('💰 Updating item:', editType);
      
      if (editType === 'option') {
        const updateData = {
          amount: optionFormData.amount,
          isPopular: optionFormData.isPopular,
          isBigButton: optionFormData.isBigButton,
          isActive: optionFormData.isActive,
          order: parseInt(optionFormData.order) || 0,
          description: optionFormData.description
        };
        console.log('💰 Updating giving option:', optionFormData.id, updateData);
        await givingService.updateGivingOption(optionFormData.id, updateData);
        console.log('✅ Giving option updated successfully');
      } else if (editType === 'method') {
        const updateData = {
          name: methodFormData.name,
          type: methodFormData.type,
          icon: methodFormData.icon,
          isActive: methodFormData.isActive,
          order: parseInt(methodFormData.order) || 0,
          description: methodFormData.description
        };
        console.log('💳 Updating payment method:', methodFormData.id, updateData);
        await givingService.updatePaymentMethod(methodFormData.id, updateData);
        console.log('✅ Payment method updated successfully');
      } else if (editType === 'bank') {
        console.log('🏦 Updating bank transfer details:', bankFormData);
        await givingService.updateBankTransferDetails(bankFormData);
        console.log('✅ Bank transfer details updated successfully');
      } else if (editType === 'mobile') {
        console.log('📱 Updating mobile money details:', mobileFormData);
        await givingService.updateMobileMoneyDetails(mobileFormData.type, mobileFormData);
        console.log('✅ Mobile money details updated successfully');
      }
      
      const successMessage = editType === 'option' ? 'Giving option' : 
                           editType === 'method' ? 'Payment method' :
                           editType === 'bank' ? 'Bank transfer details' : 'Mobile money details';
      
      Alert.alert('Success', `${successMessage} updated successfully!`);
      setShowEditModal(false);
      loadGivingData();
    } catch (error) {
      console.error('❌ Error updating item:', error);
      Alert.alert('Error', `Failed to update ${editType}: ${(error as any)?.message || 'Unknown error'}`);
    }
  };

  const handleViewOption = (option: any) => {
    const details = `
Amount: MK ${option.amount}
Popular: ${option.isPopular ? 'Yes' : 'No'}
Big Button: ${option.isBigButton ? 'Yes' : 'No'}
Active: ${option.isActive ? 'Yes' : 'No'}
Order: ${option.order}
Description: ${option.description || 'No description'}
    `.trim();
    
    Alert.alert('Giving Option Details', details);
  };

  const handleViewMethod = (method: any) => {
    const details = `
Name: ${method.name}
Type: ${method.type}
Icon: ${method.icon}
Active: ${method.isActive ? 'Yes' : 'No'}
Order: ${method.order}
Description: ${method.description || 'No description'}
    `.trim();
    
    Alert.alert('Payment Method Details', details);
  };

  const handleEditBank = () => {
    if (bankDetails) {
      setBankFormData({
        accountName: bankDetails.accountName || '',
        accountNumber: bankDetails.accountNumber || '',
        bankName: bankDetails.bankName || '',
        branch: bankDetails.branch || '',
        swiftCode: bankDetails.swiftCode || '',
        instructions: bankDetails.instructions || [''],
        contactPhone: bankDetails.contactPhone || ''
      });
    }
    setEditType('bank');
    setShowEditModal(true);
  };

  const handleEditMobile = (type: 'airtel' | 'tnm') => {
    const details = type === 'airtel' ? airtelDetails : tnmDetails;
    if (details) {
      setMobileFormData({
        type: type,
        phoneNumber: details.phoneNumber || '',
        accountName: details.accountName || '',
        instructions: details.instructions || [''],
        contactPhone: details.contactPhone || '',
        isActive: details.isActive || true
      });
    } else {
      setMobileFormData({
        type: type,
        phoneNumber: '',
        accountName: '',
        instructions: [''],
        contactPhone: '',
        isActive: true
      });
    }
    setEditType('mobile');
    setShowEditModal(true);
  };

  const handleUpdateBank = async () => {
    if (!bankFormData.accountName.trim() || !bankFormData.accountNumber.trim()) {
      Alert.alert('Error', 'Please fill in required fields (Account Name and Account Number)');
      return;
    }

    try {
      console.log('🏦 Updating bank transfer details:', bankFormData);
      await givingService.updateBankTransferDetails(bankFormData);
      console.log('✅ Bank transfer details updated successfully');
      Alert.alert('Success', 'Bank transfer details updated successfully!');
      setShowEditModal(false);
      loadGivingData();
    } catch (error) {
      console.error('❌ Error updating bank details:', error);
      Alert.alert('Error', `Failed to update bank details: ${(error as any)?.message || 'Unknown error'}`);
    }
  };

  const handleUpdateMobile = async () => {
    if (!mobileFormData.phoneNumber.trim() || !mobileFormData.accountName.trim()) {
      Alert.alert('Error', 'Please fill in required fields (Phone Number and Account Name)');
      return;
    }

    try {
      console.log('📱 Updating mobile money details:', mobileFormData);
      await givingService.updateMobileMoneyDetails(mobileFormData.type, mobileFormData);
      console.log('✅ Mobile money details updated successfully');
      Alert.alert('Success', 'Mobile money details updated successfully!');
      setShowEditModal(false);
      loadGivingData();
    } catch (error) {
      console.error('❌ Error updating mobile details:', error);
      Alert.alert('Error', `Failed to update mobile details: ${(error as any)?.message || 'Unknown error'}`);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Banknote size={20} color="#c9a961" />;
      case 'airtel':
        return <Smartphone size={20} color="#c9a961" />;
      case 'tnm':
        return <Smartphone size={20} color="#c9a961" />;
      default:
        return <CreditCard size={20} color="#c9a961" />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a961" />
        <Text style={styles.loadingText}>Loading giving data...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load giving data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giving Management</Text>
        <Text style={styles.headerSubtitle}>Manage giving options and payment methods</Text>
      </View>

      {/* Modern Stats */}
      <View style={styles.modernStatsContainer}>
        <View style={styles.modernStatCard}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.modernStatGradient}>
            <View style={styles.modernStatContent}>
              <View style={styles.modernStatIconContainer}>
                <DollarSign size={28} color="#c9a961" />
              </View>
              <View style={styles.modernStatTextContainer}>
                <Text style={styles.modernStatNumber}>{stats.totalOptions}</Text>
                <Text style={styles.modernStatLabel}>Giving Options</Text>
                <Text style={styles.modernStatSubtext}>Available amounts</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.modernStatCard}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.modernStatGradient}>
            <View style={styles.modernStatContent}>
              <View style={styles.modernStatIconContainer}>
                <CreditCard size={28} color="#4CAF50" />
              </View>
              <View style={styles.modernStatTextContainer}>
                <Text style={styles.modernStatNumber}>{stats.totalPaymentMethods}</Text>
                <Text style={styles.modernStatLabel}>Payment Methods</Text>
                <Text style={styles.modernStatSubtext}>Active methods</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Modern Search */}
      <View style={styles.modernSearchContainer}>
        <Search size={22} color="#c9a961" />
          <TextInput
          style={styles.modernSearchInput}
          placeholder="Search giving options and payment methods..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
      </View>

      {/* Modern Tabs */}
      <View style={styles.modernTabContainer}>
        <TouchableOpacity
          style={[styles.modernTab, selectedTab === 'options' && styles.modernActiveTab]}
          onPress={() => setSelectedTab('options')}>
          <DollarSign size={18} color={selectedTab === 'options' ? '#c9a961' : '#666666'} />
          <Text style={[styles.modernTabText, selectedTab === 'options' && styles.modernActiveTabText]}>
            Options ({stats.totalOptions})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modernTab, selectedTab === 'methods' && styles.modernActiveTab]}
          onPress={() => setSelectedTab('methods')}>
          <CreditCard size={18} color={selectedTab === 'methods' ? '#c9a961' : '#666666'} />
          <Text style={[styles.modernTabText, selectedTab === 'methods' && styles.modernActiveTabText]}>
            Methods ({stats.totalPaymentMethods})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modernTab, selectedTab === 'bank' && styles.modernActiveTab]}
          onPress={() => setSelectedTab('bank')}>
          <Banknote size={18} color={selectedTab === 'bank' ? '#c9a961' : '#666666'} />
          <Text style={[styles.modernTabText, selectedTab === 'bank' && styles.modernActiveTabText]}>
            Bank ({stats.totalBankDetails})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modernTab, selectedTab === 'mobile' && styles.modernActiveTab]}
          onPress={() => setSelectedTab('mobile')}>
          <Smartphone size={18} color={selectedTab === 'mobile' ? '#c9a961' : '#666666'} />
          <Text style={[styles.modernTabText, selectedTab === 'mobile' && styles.modernActiveTabText]}>
            Mobile ({stats.totalMobileMoney})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modern Content */}
      {selectedTab === 'options' && (
        <View style={styles.modernContentList}>
          {givingOptions.map((option) => (
            <View key={option.id} style={styles.modernGivingCard}>
              <LinearGradient
                colors={['#1a1a1a', '#2a2a2a']}
                style={styles.modernCardGradient}>
                <View style={styles.modernCardHeader}>
                  <View style={styles.modernCardInfo}>
                    <View style={styles.modernAmountContainer}>
                      <DollarSign size={24} color="#c9a961" />
                      <Text style={styles.modernAmountText}>MK {option.amount}</Text>
                    </View>
                    <View style={styles.modernBadgeContainer}>
                    {option.isPopular && (
                        <View style={styles.modernPopularBadge}>
                          <Text style={styles.modernBadgeText}>Popular</Text>
                      </View>
                    )}
                    {option.isBigButton && (
                        <View style={styles.modernBigButtonBadge}>
                          <Text style={styles.modernBadgeText}>Big Button</Text>
                      </View>
                    )}
                      <View style={[styles.modernStatusBadge, { backgroundColor: option.isActive ? '#4CAF50' : '#666666' }]}>
                        <Text style={styles.modernStatusText}>{option.isActive ? 'Active' : 'Inactive'}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
                <View style={styles.modernGivingActions}>
                  <TouchableOpacity 
                    style={[styles.modernActionButton, styles.viewAction]}
                    onPress={() => handleViewOption(option)}>
                    <Eye size={18} color="#c9a961" />
                    <Text style={[styles.modernActionText, styles.viewActionText]}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.modernActionButton, styles.editAction]}
                  onPress={() => handleEditItem(option, 'option')}>
                    <Edit size={18} color="#2196F3" />
                    <Text style={[styles.modernActionText, styles.editActionText]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.modernActionButton, styles.deleteAction]}
                  onPress={() => handleDeleteOption(option.id)}>
                    <Trash2 size={18} color="#ff6b6b" />
                    <Text style={[styles.modernActionText, styles.deleteActionText]}>Delete</Text>
                </TouchableOpacity>
              </View>
              </LinearGradient>
            </View>
          ))}
        </View>
      )}

      {selectedTab === 'methods' && (
        <View style={styles.modernContentList}>
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.modernGivingCard}>
              <LinearGradient
                colors={['#1a1a1a', '#2a2a2a']}
                style={styles.modernCardGradient}>
                <View style={styles.modernCardHeader}>
                  <View style={styles.modernCardInfo}>
                    <View style={styles.modernAmountContainer}>
                    {getPaymentIcon(method.type)}
                      <Text style={styles.modernAmountText}>{method.name}</Text>
                  </View>
                    <Text style={styles.modernMethodMeta}>
                    Type: {method.type} • Order: {method.order}
                  </Text>
                  {method.description && (
                      <Text style={styles.modernMethodDescription}>
                      {method.description}
                    </Text>
                  )}
                    <View style={styles.modernBadgeContainer}>
                      <View style={[styles.modernStatusBadge, { backgroundColor: method.isActive ? '#4CAF50' : '#666666' }]}>
                        <Text style={styles.modernStatusText}>{method.isActive ? 'Active' : 'Inactive'}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
                <View style={styles.modernGivingActions}>
                  <TouchableOpacity 
                    style={[styles.modernActionButton, styles.viewAction]}
                    onPress={() => handleViewMethod(method)}>
                    <Eye size={18} color="#c9a961" />
                    <Text style={[styles.modernActionText, styles.viewActionText]}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.modernActionButton, styles.editAction]}
                  onPress={() => handleEditItem(method, 'method')}>
                    <Edit size={18} color="#2196F3" />
                    <Text style={[styles.modernActionText, styles.editActionText]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.modernActionButton, styles.deleteAction]}
                  onPress={() => handleDeleteMethod(method.id)}>
                    <Trash2 size={18} color="#ff6b6b" />
                    <Text style={[styles.modernActionText, styles.deleteActionText]}>Delete</Text>
                </TouchableOpacity>
              </View>
              </LinearGradient>
            </View>
          ))}
        </View>
      )}

      {selectedTab === 'bank' && (
        <View style={styles.modernContentList}>
          <View style={styles.modernGivingCard}>
            <LinearGradient
              colors={['#1a1a1a', '#2a2a2a']}
              style={styles.modernCardGradient}>
              <View style={styles.modernCardHeader}>
                <View style={styles.modernCardInfo}>
                  <View style={styles.modernAmountContainer}>
                    <Banknote size={24} color="#c9a961" />
                    <Text style={styles.modernAmountText}>Bank Transfer Details</Text>
                  </View>
                  <Text style={styles.modernMethodMeta}>
                    {bankDetails ? `${bankDetails.bankName} • Account: ${bankDetails.accountNumber}` : 'No bank details configured'}
                </Text>
                  {bankDetails?.instructions && (
                    <Text style={styles.modernMethodDescription}>
                      {bankDetails.instructions[0] || 'Bank transfer instructions for giving'}
                </Text>
                  )}
                  <View style={styles.modernBadgeContainer}>
                    <View style={[styles.modernStatusBadge, { backgroundColor: bankDetails ? '#4CAF50' : '#666666' }]}>
                      <Text style={styles.modernStatusText}>{bankDetails ? 'Configured' : 'Not Set'}</Text>
              </View>
                  </View>
                </View>
            </View>
            
              <View style={styles.modernGivingActions}>
                <TouchableOpacity 
                  style={[styles.modernActionButton, styles.viewAction]}
                  onPress={() => {
                    if (bankDetails) {
                      const details = `
Account Name: ${bankDetails.accountName}
Account Number: ${bankDetails.accountNumber}
Bank Name: ${bankDetails.bankName}
Branch: ${bankDetails.branch}
SWIFT Code: ${bankDetails.swiftCode}
Contact Phone: ${bankDetails.contactPhone}
                      `.trim();
                      Alert.alert('Bank Transfer Details', details);
                    } else {
                      Alert.alert('Bank Transfer Details', 'No bank details configured yet.');
                    }
                  }}>
                  <Eye size={18} color="#c9a961" />
                  <Text style={[styles.modernActionText, styles.viewActionText]}>View</Text>
              </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modernActionButton, styles.editAction]}
                  onPress={handleEditBank}>
                  <Edit size={18} color="#2196F3" />
                  <Text style={[styles.modernActionText, styles.editActionText]}>Edit</Text>
              </TouchableOpacity>
            </View>
            </LinearGradient>
          </View>
        </View>
      )}

      {selectedTab === 'mobile' && (
        <View style={styles.modernContentList}>
          {/* Airtel Money */}
          <View style={styles.modernGivingCard}>
            <LinearGradient
              colors={['#1a1a1a', '#2a2a2a']}
              style={styles.modernCardGradient}>
              <View style={styles.modernCardHeader}>
                <View style={styles.modernCardInfo}>
                  <View style={styles.modernAmountContainer}>
                    <Smartphone size={24} color="#FF6B35" />
                    <Text style={styles.modernAmountText}>Airtel Money</Text>
                  </View>
                  <Text style={styles.modernMethodMeta}>
                    {airtelDetails ? `Phone: ${airtelDetails.phoneNumber} • Active` : 'No Airtel Money details configured'}
                </Text>
                  {airtelDetails?.instructions && (
                    <Text style={styles.modernMethodDescription}>
                      {airtelDetails.instructions[0] || 'Airtel Money payment instructions for giving'}
                </Text>
                  )}
                  <View style={styles.modernBadgeContainer}>
                    <View style={[styles.modernStatusBadge, { backgroundColor: airtelDetails ? '#4CAF50' : '#666666' }]}>
                      <Text style={styles.modernStatusText}>{airtelDetails ? 'Configured' : 'Not Set'}</Text>
              </View>
                  </View>
                </View>
            </View>
            
              <View style={styles.modernGivingActions}>
                <TouchableOpacity 
                  style={[styles.modernActionButton, styles.viewAction]}
                  onPress={() => {
                    console.log('🔍 Airtel Money View Button Pressed');
                    console.log('🔍 Airtel Details:', airtelDetails);
                    if (airtelDetails) {
                      const details = `
Phone Number: ${airtelDetails.phoneNumber}
Account Name: ${airtelDetails.accountName}
Contact Phone: ${airtelDetails.contactPhone}
                      `.trim();
                      console.log('🔍 Showing Airtel details:', details);
                      Alert.alert('Airtel Money Details', details);
                    } else {
                      console.log('🔍 No Airtel details found');
                      Alert.alert('Airtel Money Details', 'No Airtel Money details configured yet.');
                    }
                  }}>
                  <Eye size={18} color="#c9a961" />
                  <Text style={[styles.modernActionText, styles.viewActionText]}>View</Text>
              </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modernActionButton, styles.editAction]}
                  onPress={() => handleEditMobile('airtel')}>
                  <Edit size={18} color="#2196F3" />
                  <Text style={[styles.modernActionText, styles.editActionText]}>Edit</Text>
              </TouchableOpacity>
            </View>
            </LinearGradient>
          </View>
          
          {/* TNM Mpamba */}
          <View style={styles.modernGivingCard}>
            <LinearGradient
              colors={['#1a1a1a', '#2a2a2a']}
              style={styles.modernCardGradient}>
              <View style={styles.modernCardHeader}>
                <View style={styles.modernCardInfo}>
                  <View style={styles.modernAmountContainer}>
                    <Smartphone size={24} color="#00A651" />
                    <Text style={styles.modernAmountText}>TNM Mpamba</Text>
                  </View>
                  <Text style={styles.modernMethodMeta}>
                    {tnmDetails ? `Phone: ${tnmDetails.phoneNumber} • Active` : 'No TNM Mpamba details configured'}
                </Text>
                  {tnmDetails?.instructions && (
                    <Text style={styles.modernMethodDescription}>
                      {tnmDetails.instructions[0] || 'TNM Mpamba payment instructions for giving'}
                </Text>
                  )}
                  <View style={styles.modernBadgeContainer}>
                    <View style={[styles.modernStatusBadge, { backgroundColor: tnmDetails ? '#4CAF50' : '#666666' }]}>
                      <Text style={styles.modernStatusText}>{tnmDetails ? 'Configured' : 'Not Set'}</Text>
              </View>
                  </View>
                </View>
            </View>
            
              <View style={styles.modernGivingActions}>
                <TouchableOpacity 
                  style={[styles.modernActionButton, styles.viewAction]}
                  onPress={() => {
                    console.log('🔍 TNM Mpamba View Button Pressed');
                    console.log('🔍 TNM Details:', tnmDetails);
                    if (tnmDetails) {
                      const details = `
Phone Number: ${tnmDetails.phoneNumber}
Account Name: ${tnmDetails.accountName}
Contact Phone: ${tnmDetails.contactPhone}
                      `.trim();
                      console.log('🔍 Showing TNM details:', details);
                      Alert.alert('TNM Mpamba Details', details);
                    } else {
                      console.log('🔍 No TNM details found');
                      Alert.alert('TNM Mpamba Details', 'No TNM Mpamba details configured yet.');
                    }
                  }}>
                  <Eye size={18} color="#c9a961" />
                  <Text style={[styles.modernActionText, styles.viewActionText]}>View</Text>
              </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modernActionButton, styles.editAction]}
                  onPress={() => handleEditMobile('tnm')}>
                  <Edit size={18} color="#2196F3" />
                  <Text style={[styles.modernActionText, styles.editActionText]}>Edit</Text>
              </TouchableOpacity>
            </View>
            </LinearGradient>
          </View>
        </View>
      )}

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          if (selectedTab === 'options') {
            handleAddItem('option');
          } else if (selectedTab === 'methods') {
            handleAddItem('method');
          } else if (selectedTab === 'bank') {
            handleEditBank();
          } else if (selectedTab === 'mobile') {
          Alert.alert(
              'Add Mobile Money',
              'Which mobile money provider would you like to configure?',
            [
              { text: 'Cancel', style: 'cancel' },
                { text: 'Airtel Money', onPress: () => handleEditMobile('airtel') },
                { text: 'TNM Mpamba', onPress: () => handleEditMobile('tnm') }
            ]
          );
          }
        }}>
        <LinearGradient
          colors={['#c9a961', '#b8941f']}
          style={styles.addButtonGradient}>
          <Plus size={24} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add New {editType === 'option' ? 'Giving Option' : 
                      editType === 'method' ? 'Payment Method' :
                      editType === 'bank' ? 'Bank Transfer Details' : 'Mobile Money Details'}
            </Text>
            
            {editType === 'option' ? (
              <>
                <TextInput
                  style={styles.modalInput}
                  value={optionFormData.amount}
                  onChangeText={(text) => setOptionFormData({...optionFormData, amount: text})}
                  placeholder="Amount (e.g., 5000) *"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={optionFormData.order}
                  onChangeText={(text) => setOptionFormData({...optionFormData, order: text})}
                  placeholder="Display Order"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                />
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Popular Option</Text>
                  <Switch
                    value={optionFormData.isPopular}
                    onValueChange={(value) => setOptionFormData({...optionFormData, isPopular: value})}
                    trackColor={{ false: '#333333', true: '#c9a961' }}
                    thumbColor={optionFormData.isPopular ? '#ffffff' : '#666666'}
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Big Button</Text>
                  <Switch
                    value={optionFormData.isBigButton}
                    onValueChange={(value) => setOptionFormData({...optionFormData, isBigButton: value})}
                    trackColor={{ false: '#333333', true: '#c9a961' }}
                    thumbColor={optionFormData.isBigButton ? '#ffffff' : '#666666'}
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Active</Text>
                  <Switch
                    value={optionFormData.isActive}
                    onValueChange={(value) => setOptionFormData({...optionFormData, isActive: value})}
                    trackColor={{ false: '#333333', true: '#c9a961' }}
                    thumbColor={optionFormData.isActive ? '#ffffff' : '#666666'}
                  />
                </View>
              </>
            ) : editType === 'bank' ? (
              <>
                <TextInput
                  style={styles.modalInput}
                  value={bankFormData.accountName}
                  onChangeText={(text) => setBankFormData({...bankFormData, accountName: text})}
                  placeholder="Account Name *"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={bankFormData.accountNumber}
                  onChangeText={(text) => setBankFormData({...bankFormData, accountNumber: text})}
                  placeholder="Account Number *"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={bankFormData.bankName}
                  onChangeText={(text) => setBankFormData({...bankFormData, bankName: text})}
                  placeholder="Bank Name"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={bankFormData.branch}
                  onChangeText={(text) => setBankFormData({...bankFormData, branch: text})}
                  placeholder="Branch"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={bankFormData.swiftCode}
                  onChangeText={(text) => setBankFormData({...bankFormData, swiftCode: text})}
                  placeholder="SWIFT Code"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={bankFormData.contactPhone}
                  onChangeText={(text) => setBankFormData({...bankFormData, contactPhone: text})}
                  placeholder="Contact Phone"
                  placeholderTextColor="#666666"
                />
              </>
            ) : editType === 'mobile' ? (
              <>
                <Text style={styles.fieldLabel}>Provider Type</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity 
                    style={[styles.radioOption, mobileFormData.type === 'airtel' && styles.radioSelected]}
                    onPress={() => setMobileFormData({...mobileFormData, type: 'airtel'})}>
                    <Text style={[styles.radioText, mobileFormData.type === 'airtel' && styles.radioTextSelected]}>
                      Airtel Money
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.radioOption, mobileFormData.type === 'tnm' && styles.radioSelected]}
                    onPress={() => setMobileFormData({...mobileFormData, type: 'tnm'})}>
                    <Text style={[styles.radioText, mobileFormData.type === 'tnm' && styles.radioTextSelected]}>
                      TNM Mpamba
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  style={styles.modalInput}
                  value={mobileFormData.phoneNumber}
                  onChangeText={(text) => setMobileFormData({...mobileFormData, phoneNumber: text})}
                  placeholder="Phone Number (e.g., +265 123 456 789) *"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={mobileFormData.accountName}
                  onChangeText={(text) => setMobileFormData({...mobileFormData, accountName: text})}
                  placeholder="Account Name (e.g., MVAMA CCAP Nkhoma Synod) *"
                  placeholderTextColor="#666666"
                />
                
                <Text style={styles.fieldLabel}>Payment Instructions</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={mobileFormData.instructions.join('\n')}
                  onChangeText={(text) => setMobileFormData({...mobileFormData, instructions: text.split('\n').filter(line => line.trim())})}
                  placeholder="Enter step-by-step instructions (one per line):&#10;1. Dial *247# on your phone&#10;2. Select Send Money&#10;3. Enter phone number&#10;4. Enter amount&#10;5. Enter PIN to confirm"
                  placeholderTextColor="#666666"
                  multiline
                  numberOfLines={6}
                />
                
                <TextInput
                  style={styles.modalInput}
                  value={mobileFormData.contactPhone}
                  onChangeText={(text) => setMobileFormData({...mobileFormData, contactPhone: text})}
                  placeholder="Contact Phone (e.g., +265 123 456 789)"
                  placeholderTextColor="#666666"
                />
                
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Active</Text>
                  <Switch
                    value={mobileFormData.isActive}
                    onValueChange={(value) => setMobileFormData({...mobileFormData, isActive: value})}
                    trackColor={{ false: '#333333', true: '#c9a961' }}
                    thumbColor={mobileFormData.isActive ? '#ffffff' : '#666666'}
                  />
                </View>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.modalInput}
                  value={methodFormData.name}
                  onChangeText={(text) => setMethodFormData({...methodFormData, name: text})}
                  placeholder="Method Name (e.g., Credit Card) *"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={methodFormData.type}
                  onChangeText={(text) => setMethodFormData({...methodFormData, type: text})}
                  placeholder="Type (e.g., card, bank, airtel) *"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={methodFormData.icon}
                  onChangeText={(text) => setMethodFormData({...methodFormData, icon: text})}
                  placeholder="Icon Name (lucide-react icon)"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={methodFormData.order}
                  onChangeText={(text) => setMethodFormData({...methodFormData, order: text})}
                  placeholder="Display Order"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={methodFormData.description}
                  onChangeText={(text) => setMethodFormData({...methodFormData, description: text})}
                  placeholder="Description (optional)"
                  placeholderTextColor="#666666"
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Active</Text>
                  <Switch
                    value={methodFormData.isActive}
                    onValueChange={(value) => setMethodFormData({...methodFormData, isActive: value})}
                    trackColor={{ false: '#333333', true: '#c9a961' }}
                    thumbColor={methodFormData.isActive ? '#ffffff' : '#666666'}
                  />
                </View>
              </>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  console.log('🔘 Create button pressed');
                  console.log('🔘 Current editType:', editType);
                  handleCreateItem();
                }}>
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {editType === 'option' ? 'Giving Option' : 
                    editType === 'method' ? 'Payment Method' :
                    editType === 'bank' ? 'Bank Transfer Details' : 'Mobile Money Details'}
            </Text>
            
            {editType === 'option' ? (
              <>
                <TextInput
                  style={styles.modalInput}
                  value={optionFormData.amount}
                  onChangeText={(text) => setOptionFormData({...optionFormData, amount: text})}
                  placeholder="Amount (e.g., 5000) *"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={optionFormData.order}
                  onChangeText={(text) => setOptionFormData({...optionFormData, order: text})}
                  placeholder="Display Order"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                />
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Popular Option</Text>
                  <Switch
                    value={optionFormData.isPopular}
                    onValueChange={(value) => setOptionFormData({...optionFormData, isPopular: value})}
                    trackColor={{ false: '#333333', true: '#c9a961' }}
                    thumbColor={optionFormData.isPopular ? '#ffffff' : '#666666'}
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Big Button</Text>
                  <Switch
                    value={optionFormData.isBigButton}
                    onValueChange={(value) => setOptionFormData({...optionFormData, isBigButton: value})}
                    trackColor={{ false: '#333333', true: '#c9a961' }}
                    thumbColor={optionFormData.isBigButton ? '#ffffff' : '#666666'}
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Active</Text>
                  <Switch
                    value={optionFormData.isActive}
                    onValueChange={(value) => setOptionFormData({...optionFormData, isActive: value})}
                    trackColor={{ false: '#333333', true: '#c9a961' }}
                    thumbColor={optionFormData.isActive ? '#ffffff' : '#666666'}
                  />
                </View>
              </>
            ) : editType === 'bank' ? (
              <>
                <TextInput
                  style={styles.modalInput}
                  value={bankFormData.accountName}
                  onChangeText={(text) => setBankFormData({...bankFormData, accountName: text})}
                  placeholder="Account Name *"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={bankFormData.accountNumber}
                  onChangeText={(text) => setBankFormData({...bankFormData, accountNumber: text})}
                  placeholder="Account Number *"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={bankFormData.bankName}
                  onChangeText={(text) => setBankFormData({...bankFormData, bankName: text})}
                  placeholder="Bank Name"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={bankFormData.branch}
                  onChangeText={(text) => setBankFormData({...bankFormData, branch: text})}
                  placeholder="Branch"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={bankFormData.swiftCode}
                  onChangeText={(text) => setBankFormData({...bankFormData, swiftCode: text})}
                  placeholder="SWIFT Code"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={bankFormData.contactPhone}
                  onChangeText={(text) => setBankFormData({...bankFormData, contactPhone: text})}
                  placeholder="Contact Phone"
                  placeholderTextColor="#666666"
                />
              </>
            ) : editType === 'mobile' ? (
              <>
                <Text style={styles.fieldLabel}>Provider Type</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity 
                    style={[styles.radioOption, mobileFormData.type === 'airtel' && styles.radioSelected]}
                    onPress={() => setMobileFormData({...mobileFormData, type: 'airtel'})}>
                    <Text style={[styles.radioText, mobileFormData.type === 'airtel' && styles.radioTextSelected]}>
                      Airtel Money
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.radioOption, mobileFormData.type === 'tnm' && styles.radioSelected]}
                    onPress={() => setMobileFormData({...mobileFormData, type: 'tnm'})}>
                    <Text style={[styles.radioText, mobileFormData.type === 'tnm' && styles.radioTextSelected]}>
                      TNM Mpamba
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  style={styles.modalInput}
                  value={mobileFormData.phoneNumber}
                  onChangeText={(text) => setMobileFormData({...mobileFormData, phoneNumber: text})}
                  placeholder="Phone Number (e.g., +265 123 456 789) *"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={mobileFormData.accountName}
                  onChangeText={(text) => setMobileFormData({...mobileFormData, accountName: text})}
                  placeholder="Account Name (e.g., MVAMA CCAP Nkhoma Synod) *"
                  placeholderTextColor="#666666"
                />
                
                <Text style={styles.fieldLabel}>Payment Instructions</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={mobileFormData.instructions.join('\n')}
                  onChangeText={(text) => setMobileFormData({...mobileFormData, instructions: text.split('\n').filter(line => line.trim())})}
                  placeholder="Enter step-by-step instructions (one per line):&#10;1. Dial *247# on your phone&#10;2. Select Send Money&#10;3. Enter phone number&#10;4. Enter amount&#10;5. Enter PIN to confirm"
                  placeholderTextColor="#666666"
                  multiline
                  numberOfLines={6}
                />
                
                <TextInput
                  style={styles.modalInput}
                  value={mobileFormData.contactPhone}
                  onChangeText={(text) => setMobileFormData({...mobileFormData, contactPhone: text})}
                  placeholder="Contact Phone (e.g., +265 123 456 789)"
                  placeholderTextColor="#666666"
                />
                
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Active</Text>
                  <Switch
                    value={mobileFormData.isActive}
                    onValueChange={(value) => setMobileFormData({...mobileFormData, isActive: value})}
                    trackColor={{ false: '#333333', true: '#c9a961' }}
                    thumbColor={mobileFormData.isActive ? '#ffffff' : '#666666'}
                  />
                </View>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.modalInput}
                  value={methodFormData.name}
                  onChangeText={(text) => setMethodFormData({...methodFormData, name: text})}
                  placeholder="Method Name (e.g., Credit Card) *"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={methodFormData.type}
                  onChangeText={(text) => setMethodFormData({...methodFormData, type: text})}
                  placeholder="Type (e.g., card, bank, airtel) *"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={methodFormData.icon}
                  onChangeText={(text) => setMethodFormData({...methodFormData, icon: text})}
                  placeholder="Icon Name (lucide-react icon)"
                  placeholderTextColor="#666666"
                />
                <TextInput
                  style={styles.modalInput}
                  value={methodFormData.order}
                  onChangeText={(text) => setMethodFormData({...methodFormData, order: text})}
                  placeholder="Display Order"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={methodFormData.description}
                  onChangeText={(text) => setMethodFormData({...methodFormData, description: text})}
                  placeholder="Description (optional)"
                  placeholderTextColor="#666666"
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Active</Text>
                  <Switch
                    value={methodFormData.isActive}
                    onValueChange={(value) => setMethodFormData({...methodFormData, isActive: value})}
                    trackColor={{ false: '#333333', true: '#c9a961' }}
                    thumbColor={methodFormData.isActive ? '#ffffff' : '#666666'}
                  />
                </View>
              </>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateItem}>
                <Text style={styles.saveButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    color: '#c9a961',
    fontFamily: 'Inter-Medium',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  errorText: {
    color: '#ff6b6b',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statGradient: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#c9a961',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  activeTabText: {
    color: '#ffffff',
  },
  contentList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  contentCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  contentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  contentMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#cccccc',
    marginBottom: 8,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  popularBadge: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.2)',
  },
  bigButtonBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  moreButton: {
    padding: 8,
  },
  contentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.2)',
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  deleteText: {
    color: '#ff6b6b',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#c9a961',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radioOption: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#444444',
    backgroundColor: '#2a2a2a',
  },
  radioSelected: {
    borderColor: '#c9a961',
    backgroundColor: '#3a3a3a',
  },
  radioText: {
    color: '#cccccc',
    textAlign: 'center',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#c9a961',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  saveButton: {
    backgroundColor: '#c9a961',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  // Modern Styles
  modernStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  modernStatCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modernStatGradient: {
    borderRadius: 16,
    padding: 20,
  },
  modernStatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernStatIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modernStatTextContainer: {
    flex: 1,
  },
  modernStatNumber: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  modernStatLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
    marginBottom: 2,
  },
  modernStatSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  modernSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  modernSearchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    marginLeft: 12,
  },
  modernTabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  modernTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  modernActiveTab: {
    backgroundColor: '#c9a961',
  },
  modernTabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  modernActiveTabText: {
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  modernContentList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  modernGivingCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modernCardGradient: {
    padding: 20,
  },
  modernCardHeader: {
    marginBottom: 16,
  },
  modernCardInfo: {
    gap: 12,
  },
  modernAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modernAmountText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  modernBadgeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  modernPopularBadge: {
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.3)',
  },
  modernBigButtonBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  modernBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#c9a961',
  },
  modernStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modernStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  modernGivingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modernActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  viewAction: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.2)',
  },
  editAction: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.2)',
  },
  deleteAction: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  modernActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  viewActionText: {
    color: '#c9a961',
  },
  editActionText: {
    color: '#2196F3',
  },
  deleteActionText: {
    color: '#ff6b6b',
  },
  modernMethodMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginTop: 8,
  },
  modernMethodDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#cccccc',
    marginTop: 8,
    lineHeight: 20,
  },
});
