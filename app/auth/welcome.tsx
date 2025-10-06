import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Heart, Shield, Users } from 'lucide-react-native';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/church-background.jpg')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}>
        <LinearGradient
          colors={['rgba(15,15,15,0.3)', 'rgba(15,15,15,0.8)']}
          style={styles.gradient}>
          
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to</Text>
              <Text style={styles.appName}>Mvama Connect</Text>
              <Text style={styles.subtitle}>Your spiritual journey starts here</Text>
            </View>

            {/* Features */}
            <View style={styles.features}>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Heart size={24} color="#c9a961" strokeWidth={2} />
                </View>
                <Text style={styles.featureTitle}>Spiritual Growth</Text>
                <Text style={styles.featureDescription}>Access sermons, prayers, and spiritual content</Text>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Users size={24} color="#c9a961" strokeWidth={2} />
                </View>
                <Text style={styles.featureTitle}>Community</Text>
                <Text style={styles.featureDescription}>Connect with fellow believers and events</Text>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Shield size={24} color="#c9a961" strokeWidth={2} />
                </View>
                <Text style={styles.featureTitle}>Secure & Private</Text>
                <Text style={styles.featureDescription}>Your data is protected and secure</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <ArrowRight size={20} color="#ffffff" strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
                <Text style={styles.secondaryButtonText}>I already have an account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontFamily: 'Inter-Regular',
    fontSize: 24,
    color: '#cccccc',
    marginBottom: 8,
  },
  appName: {
    fontFamily: 'Playfair-Bold',
    fontSize: 36,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  features: {
    marginVertical: 40,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 32,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#c9a961',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffffff',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#c9a961',
  },
});
