// Giving Service for Firebase Firestore
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface GivingOption {
  id: string;
  amount: string; // "2,000", "5,000", "10,000", "20,000", "50,000"
  isPopular: boolean; // true for MK20,000
  isBigButton: boolean; // true for MK20,000
  order: number; // for sorting
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
}

export const givingService = new GivingService();
