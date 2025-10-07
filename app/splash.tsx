import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      // Logo animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      // Text animation
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Wait a bit then call completion
      setTimeout(() => {
        onAnimationComplete?.();
      }, 1500);
    });
  }, []);

  return (
    <LinearGradient
      colors={['#0f0f0f', '#1a1a1a', '#0f0f0f']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <Svg width={width} height={height} style={styles.patternSvg}>
          <Circle cx={width * 0.2} cy={height * 0.3} r="2" fill="#c9a961" opacity="0.1" />
          <Circle cx={width * 0.8} cy={height * 0.2} r="1.5" fill="#c9a961" opacity="0.08" />
          <Circle cx={width * 0.1} cy={height * 0.7} r="1" fill="#c9a961" opacity="0.06" />
          <Circle cx={width * 0.9} cy={height * 0.8} r="2.5" fill="#c9a961" opacity="0.05" />
          <Circle cx={width * 0.3} cy={height * 0.9} r="1.2" fill="#c9a961" opacity="0.07" />
        </Svg>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}>
          
          {/* App Icon/Logo */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoBackground}>
              <Image 
                source={require('../assets/images/icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textAnim,
              transform: [
                {
                  translateY: textAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}>
          <Text style={styles.appName}>Mvama Connect</Text>
          <Text style={styles.appTagline}>Connecting Hearts, Building Faith</Text>
        </Animated.View>

        {/* Loading Indicator */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: textAnim,
            },
          ]}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, styles.dot1]} />
            <Animated.View style={[styles.dot, styles.dot2]} />
            <Animated.View style={[styles.dot, styles.dot3]} />
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternSvg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#c9a961',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  appTagline: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#c9a961',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c9a961',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
});
