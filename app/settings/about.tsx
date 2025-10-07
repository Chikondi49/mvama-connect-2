import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Globe, Mail, Phone } from 'lucide-react-native';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AboutScreen() {
  const router = useRouter();

  const handlePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#c9a961', '#b8954a']}
          style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>MvamaConnect</Text>
            <Text style={styles.heroSubtitle}>
              Connecting hearts, spreading faith
            </Text>
          </View>
        </LinearGradient>

        {/* App Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This App</Text>
          <Text style={styles.description}>
            MvamaConnect is a comprehensive church community app designed to bring 
            members together through faith, fellowship, and service. Our mission 
            is to create a digital space where the church community can connect, 
            grow spiritually, and make a positive impact in the world.
          </Text>
          
          <Text style={styles.description}>
            Through this app, you can access sermons, participate in events, 
            support our mission through giving, stay connected with church news, 
            and be part of a vibrant faith community that extends beyond the 
            physical walls of our church.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• Audio & Video Sermons</Text>
            <Text style={styles.featureItem}>• Church Events & Activities</Text>
            <Text style={styles.featureItem}>• Secure Online Giving</Text>
            <Text style={styles.featureItem}>• Community News & Updates</Text>
            <Text style={styles.featureItem}>• Prayer Requests & Support</Text>
            <Text style={styles.featureItem}>• Church Directory & Contact</Text>
          </View>
        </View>

        {/* Developer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developed By</Text>
          <View style={styles.developerCard}>
            <Text style={styles.developerName}>Imagination Arts Multimedia</Text>
            <Text style={styles.developerDescription}>
              Creative digital solutions for faith communities
            </Text>
            
            {/* Contact Information */}
            <View style={styles.contactSection}>
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handlePhoneCall('+265999664166')}>
                <Phone size={20} color="#c9a961" />
                <Text style={styles.contactText}>+265 999 664 166</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handlePhoneCall('+265884824220')}>
                <Phone size={20} color="#c9a961" />
                <Text style={styles.contactText}>+265 884 824 220</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handleEmail('imaginationartsmw@gmail.com')}>
                <Mail size={20} color="#c9a961" />
                <Text style={styles.contactText}>imaginationartsmw@gmail.com</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handleWebsite('https://www.imaginationmw.art')}>
                <Globe size={20} color="#c9a961" />
                <Text style={styles.contactText}>www.imaginationmw.art</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>React Native / Expo</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>December 2024</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 MvamaConnect. All rights reserved.
          </Text>
          <Text style={styles.footerSubtext}>
            Built with ❤️ by Imagination Arts Multimedia
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
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
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
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
    marginBottom: 16,
  },
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 8,
    lineHeight: 24,
  },
  developerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  developerName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#c9a961',
    marginBottom: 8,
  },
  developerDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 20,
  },
  contactSection: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 12,
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#cccccc',
  },
  infoValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});
