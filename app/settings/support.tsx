import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Mail, MessageCircle, Phone, Search, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I download sermons for offline listening?',
    answer: 'To download sermons for offline listening, tap the download icon next to any sermon. Downloaded content will be available in the "Downloaded Content" section of your settings.',
    category: 'Downloads'
  },
  {
    id: '2',
    question: 'How can I reset my password?',
    answer: 'To reset your password, go to the login screen and tap "Forgot Password". Enter your email address and follow the instructions sent to your email.',
    category: 'Account'
  },
  {
    id: '3',
    question: 'Why are my notifications not working?',
    answer: 'Check your device notification settings and ensure Mvama Connect has permission to send notifications. Also verify that notifications are enabled in the app settings.',
    category: 'Notifications'
  },
  {
    id: '4',
    question: 'How do I update my profile information?',
    answer: 'Go to Settings > Profile and tap "Edit" to update your personal information, including your name, email, and profile picture.',
    category: 'Profile'
  },
  {
    id: '5',
    question: 'Can I share sermons with others?',
    answer: 'Yes! You can share sermons by tapping the share button on any sermon. This will allow you to share via social media, messaging apps, or copy the link.',
    category: 'Sharing'
  },
  {
    id: '6',
    question: 'How do I give feedback or report an issue?',
    answer: 'You can contact us through the "Contact Support" option below, or email us directly at support@mvamaconnect.com. We appreciate your feedback!',
    category: 'Support'
  }
];

const contactMethods = [
  {
    id: 'email',
    title: 'Email Support',
    description: 'Get help via email',
    icon: Mail,
    action: () => Alert.alert('Email Support', 'Send us an email at support@mvamaconnect.com')
  },
  {
    id: 'phone',
    title: 'Phone Support',
    description: 'Call us directly',
    icon: Phone,
    action: () => Alert.alert('Phone Support', 'Call us at +265 1 234 567')
  },
  {
    id: 'chat',
    title: 'Live Chat',
    description: 'Chat with our team',
    icon: MessageCircle,
    action: () => Alert.alert('Live Chat', 'Live chat is available Monday-Friday, 8AM-5PM')
  }
];

export default function SupportScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const categories = ['All', 'Downloads', 'Account', 'Notifications', 'Profile', 'Sharing', 'Support'];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>Get assistance and find answers</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#666666" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Contact</Text>
          <View style={styles.contactGrid}>
            {contactMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.contactCard}
                onPress={method.action}>
                <View style={styles.contactIcon}>
                  <method.icon size={24} color="#c9a961" strokeWidth={2} />
                </View>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactDescription}>{method.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category === 'All' ? null : category)}>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Frequently Asked Questions
            {filteredFAQs.length > 0 && ` (${filteredFAQs.length})`}
          </Text>
          
          {filteredFAQs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search terms or browse by category
              </Text>
            </View>
          ) : (
            <View style={styles.faqContainer}>
              {filteredFAQs.map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  style={styles.faqItem}
                  onPress={() => toggleFAQ(faq.id)}>
                  <View style={styles.faqHeader}>
                    <View style={styles.faqContent}>
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                      <Text style={styles.faqCategory}>{faq.category}</Text>
                    </View>
                    <ChevronRight 
                      size={20} 
                      color="#666666" 
                      strokeWidth={2}
                      style={[
                        styles.faqChevron,
                        expandedFAQ === faq.id && styles.faqChevronExpanded
                      ]}
                    />
                  </View>
                  {expandedFAQ === faq.id && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Rate App */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.rateCard}
            onPress={() => Alert.alert('Rate App', 'Thank you for your support!')}>
            <View style={styles.rateIcon}>
              <Star size={24} color="#c9a961" strokeWidth={2} />
            </View>
            <View style={styles.rateContent}>
              <Text style={styles.rateTitle}>Rate Mvama Connect</Text>
              <Text style={styles.rateDescription}>
                Help others discover our app by rating us on the App Store
              </Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
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
  contactGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666666',
  },
  categoryTextActive: {
    color: '#000000',
  },
  faqContainer: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqContent: {
    flex: 1,
  },
  faqQuestion: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 20,
  },
  faqCategory: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#c9a961',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqChevron: {
    transform: [{ rotate: '0deg' }],
  },
  faqChevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  faqAnswerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  rateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rateContent: {
    flex: 1,
  },
  rateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  rateDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
});
