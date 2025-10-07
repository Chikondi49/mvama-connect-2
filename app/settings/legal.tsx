import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, FileText, Shield, Users } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LegalDocument {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: string;
  lastUpdated: string;
}

const legalDocuments: LegalDocument[] = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information',
    icon: Shield,
    lastUpdated: 'December 2024',
    content: `
# Privacy Policy

**Last Updated: December 2024**

## Information We Collect

### Personal Information
- Name and email address when you create an account
- Profile information you choose to provide
- Usage data to improve our services

### Device Information
- Device type and operating system
- App usage statistics
- Crash reports and performance data

## How We Use Your Information

We use your information to:
- Provide and improve our services
- Send you important updates about the app
- Personalize your experience
- Ensure app security and prevent abuse

## Data Protection

We implement industry-standard security measures to protect your data:
- Encryption of sensitive information
- Secure data transmission
- Regular security audits
- Limited access to personal data

## Third-Party Services

We may use third-party services for:
- Analytics and app performance monitoring
- Push notifications
- Content delivery networks

## Your Rights

You have the right to:
- Access your personal data
- Correct inaccurate information
- Delete your account and data
- Opt-out of certain data collection

## Contact Us

For privacy-related questions, contact us at:
- Email: privacy@mvamaconnect.com
- Phone: +265 1 234 567
    `
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    description: 'Rules and guidelines for using Mvama Connect',
    icon: FileText,
    lastUpdated: 'December 2024',
    content: `
# Terms of Service

**Last Updated: December 2024**

## Acceptance of Terms

By using Mvama Connect, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our app.

## Description of Service

Mvama Connect is a mobile application that provides:
- Access to sermons and religious content
- Community features for church members
- Event notifications and updates
- Giving and donation capabilities

## User Responsibilities

### Account Security
- You are responsible for maintaining the security of your account
- Do not share your login credentials
- Notify us immediately of any unauthorized access

### Acceptable Use
- Use the app only for lawful purposes
- Respect other users and community guidelines
- Do not attempt to hack or compromise the app
- Do not share inappropriate or offensive content

## Content and Intellectual Property

### Our Content
- All sermons, images, and content are owned by Mvama Church
- Content is provided for personal, non-commercial use
- You may not redistribute or resell our content

### User-Generated Content
- You retain ownership of content you create
- You grant us a license to use your content within the app
- You are responsible for ensuring you have rights to any content you share

## Privacy and Data

Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.

## Service Availability

We strive to provide reliable service but cannot guarantee:
- Uninterrupted access to the app
- Availability of all features at all times
- Compatibility with all devices

## Limitation of Liability

To the maximum extent permitted by law, Mvama Connect shall not be liable for any indirect, incidental, special, or consequential damages.

## Changes to Terms

We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the new terms.

## Contact Information

For questions about these terms, contact us at:
- Email: legal@mvamaconnect.com
- Phone: +265 1 234 567
    `
  },
  {
    id: 'community',
    title: 'Community Guidelines',
    description: 'Rules for respectful interaction within our community',
    icon: Users,
    lastUpdated: 'December 2024',
    content: `
# Community Guidelines

**Last Updated: December 2024**

## Our Community Values

Mvama Connect is built on Christian values of love, respect, and community. We ask all users to:

### Be Respectful
- Treat all members with kindness and respect
- Use appropriate language in all communications
- Respect different opinions and beliefs
- Avoid personal attacks or harassment

### Be Supportive
- Encourage and uplift fellow community members
- Share constructive feedback
- Help create a positive environment
- Support the church's mission and values

### Be Authentic
- Be genuine in your interactions
- Share your faith journey honestly
- Respect others' privacy and boundaries
- Maintain appropriate relationships

## Prohibited Behavior

The following behaviors are not allowed:

### Inappropriate Content
- Offensive, vulgar, or inappropriate language
- Content that promotes violence or hatred
- Spam or unsolicited promotional content
- Misleading or false information

### Harassment
- Bullying or intimidation of other users
- Unwanted personal contact or messages
- Sharing private information without consent
- Creating fake accounts or impersonation

### Disruptive Behavior
- Spamming or flooding the app with content
- Attempting to hack or compromise the app
- Sharing malicious links or content
- Violating others' privacy or security

## Enforcement

### Reporting
- Report inappropriate behavior using the in-app reporting feature
- Contact support for serious violations
- Provide specific details about the incident

### Consequences
- Warning for minor violations
- Temporary suspension for repeated violations
- Permanent ban for serious or repeated violations
- Legal action for illegal behavior

## Appeals Process

If you believe you've been unfairly penalized:
- Contact support within 30 days
- Provide your account information
- Explain why you believe the action was unfair
- We will review your case and respond within 7 days

## Contact Us

For questions about community guidelines:
- Email: community@mvamaconnect.com
- Phone: +265 1 234 567
    `
  }
];

export default function LegalScreen() {
  const router = useRouter();
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);

  const renderDocumentContent = (document: LegalDocument) => {
    return (
      <View style={styles.documentContainer}>
        <View style={styles.documentHeader}>
          <View style={styles.documentIcon}>
            <document.icon size={24} color="#c9a961" strokeWidth={2} />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>{document.title}</Text>
            <Text style={styles.documentUpdated}>Last updated: {document.lastUpdated}</Text>
          </View>
        </View>
        <ScrollView style={styles.documentContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.documentText}>{document.content}</Text>
        </ScrollView>
      </View>
    );
  };

  if (selectedDocument) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedDocument(null)}>
            <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedDocument.title}</Text>
        </View>
        {renderDocumentContent(selectedDocument)}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Legal & Policies</Text>
          <Text style={styles.headerSubtitle}>Important legal information</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Legal Information</Text>
          <Text style={styles.introDescription}>
            Please review our legal documents to understand your rights and responsibilities when using Mvama Connect.
          </Text>
        </View>

        {/* Legal Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal Documents</Text>
          <View style={styles.documentsList}>
            {legalDocuments.map((document) => (
              <TouchableOpacity
                key={document.id}
                style={styles.documentCard}
                onPress={() => setSelectedDocument(document)}>
                <View style={styles.documentIcon}>
                  <document.icon size={24} color="#c9a961" strokeWidth={2} />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{document.title}</Text>
                  <Text style={styles.documentDescription}>{document.description}</Text>
                  <Text style={styles.documentUpdated}>Updated: {document.lastUpdated}</Text>
                </View>
                <ChevronRight size={20} color="#666666" strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal Contact</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Legal Department</Text>
            <Text style={styles.contactDescription}>
              For legal questions, concerns, or requests regarding your data and privacy rights.
            </Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email:</Text>
              <Text style={styles.contactValue}>legal@mvamaconnect.com</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone:</Text>
              <Text style={styles.contactValue}>+265 1 234 567</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Address:</Text>
              <Text style={styles.contactValue}>
                Mvama Church{'\n'}
                P.O. Box 1234{'\n'}
                Lilongwe, Malawi
              </Text>
            </View>
          </View>
        </View>

        {/* Data Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data Rights</Text>
          <View style={styles.rightsList}>
            <View style={styles.rightItem}>
              <Text style={styles.rightTitle}>Access Your Data</Text>
              <Text style={styles.rightDescription}>
                Request a copy of all personal data we have about you
              </Text>
            </View>
            <View style={styles.rightItem}>
              <Text style={styles.rightTitle}>Correct Information</Text>
              <Text style={styles.rightDescription}>
                Update or correct any inaccurate personal information
              </Text>
            </View>
            <View style={styles.rightItem}>
              <Text style={styles.rightTitle}>Delete Your Data</Text>
              <Text style={styles.rightDescription}>
                Request deletion of your personal data and account
              </Text>
            </View>
            <View style={styles.rightItem}>
              <Text style={styles.rightTitle}>Data Portability</Text>
              <Text style={styles.rightDescription}>
                Export your data in a machine-readable format
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Mvama Connect, you agree to our Terms of Service and Privacy Policy.
          </Text>
          <Text style={styles.footerDate}>
            Last updated: December 2024
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
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  introSection: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  introTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 12,
  },
  introDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#cccccc',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  documentDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 4,
    lineHeight: 18,
  },
  documentUpdated: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
  },
  documentContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  documentContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  documentText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#cccccc',
    lineHeight: 24,
  },
  contactCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  contactTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
  },
  contactDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#c9a961',
    marginBottom: 4,
  },
  contactValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  rightsList: {
    gap: 16,
  },
  rightItem: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  rightTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 6,
  },
  rightDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  footerDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
  },
});
