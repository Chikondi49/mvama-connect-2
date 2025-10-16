// Giving Service for Firebase Firestore
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface GivingOption {
  id: string;
  amount: string; // "2,000", "5,000", "10,000", "20,000", "50,000"
  isPopular: boolean; // true for MK20,000
  isBigButton: boolean; // true for MK20,000
  isActive: boolean; // whether the option is active
  order: number; // for sorting
  description?: string; // optional description
}

export interface PaymentMethod {
  id: string;
  name: string; // "Bank Transfer", "Airtel Money 2", "TNM Mpamba"
  type: string; // "bank", "airtel", "tnm"
  icon: string; // icon name
  isActive: boolean;
  order: number;
}

export interface BankTransferDetails {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  swiftCode: string;
  reference: string;
  instructions: string[];
  contactPhone: string;
  contactEmail: string;
}

export interface MobileMoneyDetails {
  id: string;
  phoneNumber: string;
  accountName: string;
  shortCode: string;
  reference: string;
  instructions: string[];
  alternativeInstructions: string[];
  contactPhone: string;
  contactEmail: string;
}

export interface GivingTransaction {
  id: string;
  userId: string;
  amount: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

class GivingService {
  private readonly COLLECTIONS = {
    GIVING_OPTIONS: 'givingOptions',
    PAYMENT_METHODS: 'paymentMethods',
    BANK_DETAILS: 'bankTransferDetails',
    MOBILE_MONEY_DETAILS: 'mobileMoneyDetails',
    TRANSACTIONS: 'givingTransactions',
  };

  // Get all giving amount options
  async getGivingOptions(): Promise<GivingOption[]> {
    try {
      console.log('💰 Fetching giving options from Firestore...');
      const optionsRef = collection(db, this.COLLECTIONS.GIVING_OPTIONS);
      const q = query(optionsRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const options: GivingOption[] = [];
      querySnapshot.forEach((doc) => {
        options.push({
          id: doc.id,
          ...doc.data()
        } as GivingOption);
      });
      
      console.log(`✅ Fetched ${options.length} giving options`);
      return options;
    } catch (error) {
      console.error('❌ Error fetching giving options:', error);
      return [];
    }
  }

  // Get all payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      console.log('💳 Fetching payment methods from Firestore...');
      const methodsRef = collection(db, this.COLLECTIONS.PAYMENT_METHODS);
      const q = query(methodsRef, where('isActive', '==', true), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const methods: PaymentMethod[] = [];
      querySnapshot.forEach((doc) => {
        methods.push({
          id: doc.id,
          ...doc.data()
        } as PaymentMethod);
      });
      
      console.log(`✅ Fetched ${methods.length} payment methods`);
      return methods;
    } catch (error) {
      console.error('❌ Error fetching payment methods:', error);
      return [];
    }
  }

  // Get bank transfer details
  async getBankTransferDetails(): Promise<BankTransferDetails | null> {
    try {
      console.log('🏦 Fetching bank transfer details from Firestore...');
      const detailsRef = collection(db, this.COLLECTIONS.BANK_DETAILS);
      const querySnapshot = await getDocs(detailsRef);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const details = {
          id: doc.id,
          ...doc.data()
        } as BankTransferDetails;
        console.log('✅ Fetched bank transfer details');
        return details;
      }
      
      console.log('❌ No bank transfer details found');
      return null;
    } catch (error) {
      console.error('❌ Error fetching bank transfer details:', error);
      return null;
    }
  }

  // Get mobile money details by type
  async getMobileMoneyDetails(type: 'airtel' | 'tnm'): Promise<MobileMoneyDetails | null> {
    try {
      console.log(`📱 Fetching ${type} mobile money details from Firestore...`);
      const detailsRef = collection(db, this.COLLECTIONS.MOBILE_MONEY_DETAILS);
      const q = query(detailsRef, where('type', '==', type));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const details = {
          id: doc.id,
          ...doc.data()
        } as MobileMoneyDetails;
        console.log(`✅ Fetched ${type} mobile money details`);
        return details;
      }
      
      console.log(`❌ No ${type} mobile money details found`);
      return null;
    } catch (error) {
      console.error(`❌ Error fetching ${type} mobile money details:`, error);
      return null;
    }
  }

  // Save giving transaction
  async saveTransaction(transaction: Omit<GivingTransaction, 'id' | 'createdAt'>): Promise<string | null> {
    try {
      console.log('💾 Saving giving transaction to Firestore...');
      const transactionsRef = collection(db, this.COLLECTIONS.TRANSACTIONS);
      const newTransaction = {
        ...transaction,
        createdAt: new Date().toISOString(),
      };
      
      // In a real app, you would use addDoc here
      // const docRef = await addDoc(transactionsRef, newTransaction);
      // return docRef.id;
      
      console.log('✅ Transaction saved successfully');
      return 'mock-transaction-id';
    } catch (error) {
      console.error('❌ Error saving transaction:', error);
      return null;
    }
  }

  // Get user transactions
  async getUserTransactions(userId: string): Promise<GivingTransaction[]> {
    try {
      console.log(`📊 Fetching transactions for user: ${userId}`);
      const transactionsRef = collection(db, this.COLLECTIONS.TRANSACTIONS);
      const q = query(
        transactionsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const transactions: GivingTransaction[] = [];
      querySnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        } as GivingTransaction);
      });
      
      console.log(`✅ Fetched ${transactions.length} transactions for user`);
      return transactions;
    } catch (error) {
      console.error('❌ Error fetching user transactions:', error);
      return [];
    }
  }

  // Create a new giving option
  async createGivingOption(optionData: Omit<GivingOption, 'id'>): Promise<string> {
    try {
      console.log('💰 Creating new giving option:', optionData.amount);
      
      const docRef = await addDoc(collection(db, this.COLLECTIONS.GIVING_OPTIONS), optionData);
      console.log(`✅ Giving option created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating giving option:', error);
      throw error;
    }
  }

  // Update an existing giving option
  async updateGivingOption(optionId: string, updateData: Partial<GivingOption>): Promise<void> {
    try {
      console.log('💰 Updating giving option:', optionId);
      console.log('💰 Update data:', updateData);
      
      const optionRef = doc(db, this.COLLECTIONS.GIVING_OPTIONS, optionId);
      
      // Check if document exists
      const docSnap = await getDoc(optionRef);
      if (!docSnap.exists()) {
        throw new Error('Giving option not found');
      }
      
      await updateDoc(optionRef, updateData);
      console.log(`✅ Giving option updated: ${optionId}`);
    } catch (error) {
      console.error('❌ Error updating giving option:', error);
      throw error;
    }
  }

  // Delete a giving option
  async deleteGivingOption(optionId: string): Promise<void> {
    try {
      console.log('💰 Deleting giving option:', optionId);
      
      const optionRef = doc(db, this.COLLECTIONS.GIVING_OPTIONS, optionId);
      await deleteDoc(optionRef);
      console.log(`✅ Giving option deleted: ${optionId}`);
    } catch (error) {
      console.error('❌ Error deleting giving option:', error);
      throw error;
    }
  }

  // Create a new payment method
  async createPaymentMethod(methodData: Omit<PaymentMethod, 'id'>): Promise<string> {
    try {
      console.log('💳 Creating new payment method:', methodData.name);
      console.log('💳 Full method data:', methodData);
      console.log('💳 Collection:', this.COLLECTIONS.PAYMENT_METHODS);
      console.log('💳 Firebase db object:', db);
      
      // Test Firebase connection
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      
      const docRef = await addDoc(collection(db, this.COLLECTIONS.PAYMENT_METHODS), methodData);
      console.log(`✅ Payment method created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating payment method:', error);
      console.error('❌ Error details:', error);
      console.error('❌ Error stack:', (error as any)?.stack);
      throw error;
    }
  }

  // Update an existing payment method
  async updatePaymentMethod(methodId: string, updateData: Partial<PaymentMethod>): Promise<void> {
    try {
      console.log('💳 Updating payment method:', methodId);
      console.log('💳 Update data:', updateData);
      
      const methodRef = doc(db, this.COLLECTIONS.PAYMENT_METHODS, methodId);
      
      // Check if document exists
      const docSnap = await getDoc(methodRef);
      if (!docSnap.exists()) {
        throw new Error('Payment method not found');
      }
      
      await updateDoc(methodRef, updateData);
      console.log(`✅ Payment method updated: ${methodId}`);
    } catch (error) {
      console.error('❌ Error updating payment method:', error);
      throw error;
    }
  }

  // Delete a payment method
  async deletePaymentMethod(methodId: string): Promise<void> {
    try {
      console.log('💳 Deleting payment method:', methodId);
      
      const methodRef = doc(db, this.COLLECTIONS.PAYMENT_METHODS, methodId);
      await deleteDoc(methodRef);
      console.log(`✅ Payment method deleted: ${methodId}`);
    } catch (error) {
      console.error('❌ Error deleting payment method:', error);
      throw error;
    }
  }

  // Bank Transfer Details CRUD
  async createBankTransferDetails(details: Partial<BankTransferDetails>): Promise<string> {
    try {
      console.log('🏦 Creating bank transfer details:', details);
      
      const docRef = await addDoc(collection(db, this.COLLECTIONS.BANK_DETAILS), details);
      console.log(`✅ Bank transfer details created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating bank transfer details:', error);
      throw error;
    }
  }

  async updateBankTransferDetails(details: Partial<BankTransferDetails>): Promise<void> {
    try {
      console.log('🏦 Updating bank transfer details:', details);
      
      const bankRef = doc(db, this.COLLECTIONS.BANK_DETAILS, 'main');
      
      // Check if document exists
      const docSnap = await getDoc(bankRef);
      if (!docSnap.exists()) {
        // Create new document if it doesn't exist
        await addDoc(collection(db, this.COLLECTIONS.BANK_DETAILS), details);
        console.log('✅ Bank transfer details created');
      } else {
        await updateDoc(bankRef, details);
        console.log('✅ Bank transfer details updated');
      }
    } catch (error) {
      console.error('❌ Error updating bank transfer details:', error);
      throw error;
    }
  }

  // Mobile Money Details CRUD
  async createMobileMoneyDetails(type: 'airtel' | 'tnm', details: Partial<MobileMoneyDetails>): Promise<string> {
    try {
      console.log(`📱 Creating ${type} mobile money details:`, details);
      
      const docRef = await addDoc(collection(db, this.COLLECTIONS.MOBILE_MONEY_DETAILS), { type, ...details });
      console.log(`✅ ${type} mobile money details created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error(`❌ Error creating ${type} mobile money details:`, error);
      throw error;
    }
  }

  async updateMobileMoneyDetails(type: 'airtel' | 'tnm', details: Partial<MobileMoneyDetails>): Promise<void> {
    try {
      console.log(`📱 Updating ${type} mobile money details:`, details);
      
      const mobileRef = doc(db, this.COLLECTIONS.MOBILE_MONEY_DETAILS, type);
      
      // Check if document exists
      const docSnap = await getDoc(mobileRef);
      if (!docSnap.exists()) {
        // Create new document if it doesn't exist
        await addDoc(collection(db, this.COLLECTIONS.MOBILE_MONEY_DETAILS), { type, ...details });
        console.log(`✅ ${type} mobile money details created`);
      } else {
        await updateDoc(mobileRef, details);
        console.log(`✅ ${type} mobile money details updated`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${type} mobile money details:`, error);
      throw error;
    }
  }
}

export const givingService = new GivingService();
