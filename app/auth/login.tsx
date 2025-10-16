import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Notification from '../../components/Notification';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔐 Attempting to sign in user:', email.trim());
      console.log('🔐 Password length:', password.length);
      console.log('🔐 Auth context loading:', loading);
      
      await signIn(email.trim(), password);
      console.log('✅ Login successful - user authenticated with Firebase');
      
      // Show success notification
      setNotification({
        visible: true,
        message: 'Success!',
        type: 'success',
      });
      
      // Redirect immediately after successful login
      console.log('🔄 Redirecting to main app...');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      
      // Only show specific messages for non-credential related errors
      if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection';
      }
      
      // Show error notification
      setNotification({
        visible: true,
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignUp = () => {
    router.push('/auth/signup');
  };


  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };


  return (
    <View style={styles.container}>
      <Notification
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onHide={hideNotification}
      />
      
      <View style={styles.keyboardAvoid}>
        
        <View style={styles.scrollContent}>
              
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Welcome to Mvama Connect</Text>
                <Text style={styles.subtitle}>Sign in to access your spiritual journey</Text>
              </View>

              {/* Login Form */}
              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
                    <Mail size={20} color={emailError ? "#ff6b6b" : "#c9a961"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email address"
                      placeholderTextColor="#666666"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) setEmailError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      underlineColorAndroid="transparent"
                      selectionColor="#c9a961"
                      cursorColor="#c9a961"
                    />
                  </View>
                  {emailError && <Text style={styles.errorText}>{emailError}</Text>}
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, passwordError && styles.inputWrapperError]}>
                    <Lock size={20} color={passwordError ? "#ff6b6b" : "#c9a961"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#666666"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError('');
                      }}
                      secureTextEntry={!showPassword}
                      underlineColorAndroid="transparent"
                      selectionColor="#c9a961"
                      cursorColor="#c9a961"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff size={20} color="#666666" />
                      ) : (
                        <Eye size={20} color="#666666" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, (isLoading || loading) && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading || loading}>
                  {isLoading || loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                {/* Forgot Password Link */}
                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={navigateToSignUp}>
                    <Text style={styles.signUpLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>


              </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontFamily: 'Playfair-Bold',
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.3)',
  },
  inputWrapperError: {
    backgroundColor: 'transparent',
    borderColor: '#ff6b6b',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#ffffff',
    paddingVertical: 4,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#c9a961',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: 'rgba(201, 169, 97, 0.5)',
  },
  loginButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffffff',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
  },
  signUpLink: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#c9a961',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#c9a961',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 4,
    marginLeft: 4,
  },
});
