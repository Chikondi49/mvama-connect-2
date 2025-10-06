# 💰 Firebase Firestore Structure for Giving System

## 📁 **Collection Structure**

### **1. Collection: `givingOptions`**
**Purpose:** Predefined giving amounts

#### **Document Fields:**
```typescript
{
  amount: string;                    // "2,000", "5,000", "10,000", "20,000", "50,000"
  isPopular: boolean;               // true for MK20,000
  isBigButton: boolean;             // true for MK20,000
  order: number;                    // 1, 2, 3, 4, 5 (for sorting)
  isActive: boolean;                // true/false
}
```

### **2. Collection: `paymentMethods`**
**Purpose:** Available payment methods

#### **Document Fields:**
```typescript
{
  name: string;                     // "Bank Transfer", "Airtel Money 2", "TNM Mpamba"
  type: string;                     // "bank", "airtel", "tnm"
  icon: string;                     // "Banknote", "Smartphone", "Smartphone"
  isActive: boolean;                // true/false
  order: number;                    // 1, 2, 3 (for sorting)
  description?: string;             // Optional description
}
```

### **3. Collection: `bankTransferDetails`**
**Purpose:** Bank transfer payment details

#### **Document Fields:**
```typescript
{
  accountName: string;              // "MVAMA CCAP Nkhoma Synod"
  accountNumber: string;            // "1234567890"
  bankName: string;                 // "National Bank of Malawi"
  branch: string;                   // "Lilongwe Branch"
  swiftCode: string;                // "NBMAMWMW"
  reference: string;                // "GIVING-2024"
  instructions: string[];          // ["Visit your bank branch...", "Use the account details..."]
  contactPhone: string;             // "+265 123 456 789"
  contactEmail: string;             // "giving@mvama.org"
  isActive: boolean;                // true/false
}
```

### **4. Collection: `mobileMoneyDetails`**
**Purpose:** Mobile money payment details

#### **Document Fields:**
```typescript
{
  type: string;                     // "airtel" or "tnm"
  phoneNumber: string;               // "+265 123 456 789"
  accountName: string;               // "MVAMA CCAP Nkhoma Synod"
  shortCode: string;                // "*247#"
  reference: string;                // "GIVING-2024"
  instructions: string[];           // ["Dial *247#...", "Select Send Money..."]
  alternativeInstructions: string[]; // ["Open Airtel Money 2 app...", "Select Send Money..."]
  contactPhone: string;             // "+265 123 456 789"
  contactEmail: string;             // "giving@mvama.org"
  isActive: boolean;                // true/false
}
```

### **5. Collection: `givingTransactions`**
**Purpose:** User giving transactions

#### **Document Fields:**
```typescript
{
  userId: string;                    // Firebase Auth user ID
  amount: string;                   // "20,000"
  paymentMethod: string;            // "bank", "airtel", "tnm"
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;           // External transaction ID
  createdAt: string;                // ISO date string
  completedAt?: string;             // ISO date string
  notes?: string;                   // Optional notes
  reference?: string;               // Payment reference
}
```

## 📝 **Sample Data Examples**

### **Sample Giving Options:**
```json
{
  "amount": "2,000",
  "isPopular": false,
  "isBigButton": false,
  "order": 1,
  "isActive": true
}
```

```json
{
  "amount": "20,000",
  "isPopular": true,
  "isBigButton": true,
  "order": 4,
  "isActive": true
}
```

```json
{
  "amount": "50,000",
  "isPopular": false,
  "isBigButton": false,
  "order": 5,
  "isActive": true
}
```

### **Sample Payment Methods:**
```json
{
  "name": "Bank Transfer",
  "type": "bank",
  "icon": "Banknote",
  "isActive": true,
  "order": 1,
  "description": "Transfer directly to our bank account"
}
```

```json
{
  "name": "Airtel Money 2",
  "type": "airtel",
  "icon": "Smartphone",
  "isActive": true,
  "order": 2,
  "description": "Send money via Airtel Money 2"
}
```

```json
{
  "name": "TNM Mpamba",
  "type": "tnm",
  "icon": "Smartphone",
  "isActive": true,
  "order": 3,
  "description": "Send money via TNM Mpamba"
}
```

### **Sample Bank Transfer Details:**
```json
{
  "accountName": "MVAMA CCAP Nkhoma Synod",
  "accountNumber": "1234567890",
  "bankName": "National Bank of Malawi",
  "branch": "Lilongwe Branch",
  "swiftCode": "NBMAMWMW",
  "reference": "GIVING-2024",
  "instructions": [
    "Visit your bank branch or use online banking",
    "Use the account details above to make the transfer",
    "Include the reference number in your transfer",
    "Keep your transaction receipt as proof of payment"
  ],
  "contactPhone": "+265 123 456 789",
  "contactEmail": "giving@mvama.org",
  "isActive": true
}
```

### **Sample Airtel Money 2 Details:**
```json
{
  "type": "airtel",
  "phoneNumber": "+265 123 456 789",
  "accountName": "MVAMA CCAP Nkhoma Synod",
  "shortCode": "*247#",
  "reference": "GIVING-2024",
  "instructions": [
    "Dial *247# on your Airtel phone",
    "Select \"Send Money\" from the menu",
    "Enter the phone number: +265 123 456 789",
    "Enter the amount you want to donate",
    "Enter your Airtel Money 2 PIN to confirm",
    "Save the transaction receipt for your records"
  ],
  "alternativeInstructions": [
    "Open Airtel Money 2 app",
    "Select \"Send Money\"",
    "Enter recipient: +265 123 456 789",
    "Enter amount and confirm"
  ],
  "contactPhone": "+265 123 456 789",
  "contactEmail": "giving@mvama.org",
  "isActive": true
}
```

### **Sample TNM Mpamba Details:**
```json
{
  "type": "tnm",
  "phoneNumber": "+265 987 654 321",
  "accountName": "MVAMA CCAP Nkhoma Synod",
  "shortCode": "*247#",
  "reference": "GIVING-2024",
  "instructions": [
    "Dial *247# on your TNM phone",
    "Select \"Send Money\" from the menu",
    "Enter the phone number: +265 987 654 321",
    "Enter the amount you want to donate",
    "Enter your TNM Mpamba PIN to confirm",
    "Save the transaction receipt for your records"
  ],
  "alternativeInstructions": [
    "Open TNM Mpamba app",
    "Select \"Send Money\"",
    "Enter recipient: +265 987 654 321",
    "Enter amount and confirm"
  ],
  "contactPhone": "+265 123 456 789",
  "contactEmail": "giving@mvama.org",
  "isActive": true
}
```

## 🔧 **Firebase Console Setup**

### **Step 1: Create Collections**
1. Go to Firebase Console → Firestore Database
2. Create these collections:
   - `givingOptions`
   - `paymentMethods`
   - `bankTransferDetails`
   - `mobileMoneyDetails`
   - `givingTransactions`

### **Step 2: Add Sample Documents**
Use the sample data above to populate each collection.

### **Step 3: Set Up Indexes**
Create these composite indexes:

**For `givingOptions` collection:**
- `isActive` (Ascending) + `order` (Ascending)

**For `paymentMethods` collection:**
- `isActive` (Ascending) + `order` (Ascending)

**For `mobileMoneyDetails` collection:**
- `type` (Ascending) + `isActive` (Ascending)

**For `givingTransactions` collection:**
- `userId` (Ascending) + `createdAt` (Descending)
- `status` (Ascending) + `createdAt` (Descending)

## 📱 **Integration with App**

### **Update Give Page:**
```typescript
// In give.tsx
import { givingService } from '../../services/givingService';

const [givingOptions, setGivingOptions] = useState<GivingOption[]>([]);
const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

useEffect(() => {
  loadGivingData();
}, []);

const loadGivingData = async () => {
  try {
    const [options, methods] = await Promise.all([
      givingService.getGivingOptions(),
      givingService.getPaymentMethods()
    ]);
    setGivingOptions(options);
    setPaymentMethods(methods);
  } catch (error) {
    console.error('Error loading giving data:', error);
  }
};
```

## 🎯 **Benefits of This Structure**

1. **Flexible Amounts** - Easy to add/remove giving amounts
2. **Dynamic Payment Methods** - Enable/disable payment methods
3. **Centralized Details** - All payment details in one place
4. **Transaction Tracking** - Track all giving transactions
5. **User History** - Users can see their giving history
6. **Admin Control** - Easy to update payment details
7. **Scalable** - Can add more payment methods easily

## 🔐 **Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Giving options - read only for authenticated users
    match /givingOptions/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Payment methods - read only for authenticated users
    match /paymentMethods/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Bank details - read only for authenticated users
    match /bankTransferDetails/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Mobile money details - read only for authenticated users
    match /mobileMoneyDetails/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Transactions - users can only access their own
    match /givingTransactions/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

This structure will allow your app to display real giving data from Firestore with proper transaction tracking and flexible payment options! 💰✨
