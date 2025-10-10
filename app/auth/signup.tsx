import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, HelpCircle, Lock, Mail, Phone, User } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Notification from '../../components/Notification';
import { useAuth } from '../../contexts/AuthContext';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayNameError, setDisplayNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [selectedSecurityQuestion, setSelectedSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [securityQuestionError, setSecurityQuestionError] = useState('');
  const [securityAnswerError, setSecurityAnswerError] = useState('');
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // Security questions options
  const securityQuestions = [
    "What was the name of your first pet?",
    "What city were you born in?",
    "What was your mother's maiden name?"
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if it's a valid phone number (10-15 digits)
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const validateForm = () => {
    let isValid = true;
    setDisplayNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setSecurityQuestionError('');
    setSecurityAnswerError('');

    if (!displayName.trim()) {
      setDisplayNameError('Full name is required');
      isValid = false;
    } else if (displayName.trim().length < 2) {
      setDisplayNameError('Name must be at least 2 characters');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      isValid = false;
    } else if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    if (!selectedSecurityQuestion) {
      setSecurityQuestionError('Please select a security question');
      isValid = false;
    }

    if (!securityAnswer.trim()) {
      setSecurityAnswerError('Please provide an answer to the security question');
      isValid = false;
    } else if (securityAnswer.trim().length < 2) {
      setSecurityAnswerError('Answer must be at least 2 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔐 Attempting to create user account:', email.trim());
      await signUp(email.trim(), password, displayName.trim());
      console.log('✅ Sign up successful - user created in Firebase');
      
      // Show success notification
      setNotification({
        visible: true,
        message: 'Success!',
        type: 'success',
      });
      
      // Add a small delay to show the notification before redirect
      setTimeout(() => {
        console.log('🔄 Redirecting to main app...');
        router.replace('/(tabs)');
      }, 1500);
    } catch (error: any) {
      console.error('❌ Sign up failed:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Unable to Sign-Up!';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled';
      } else if (error.message) {
        errorMessage = error.message;
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

  const navigateToLogin = () => {
    router.push('/auth/login');
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
      <LinearGradient
        colors={['#0f0f0f', '#1a1a1a']}
        style={styles.gradient}>
          
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}>
            
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={navigateToLogin}>
                  <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join our community today</Text>
              </View>

              {/* Sign Up Form */}
              <View style={styles.form}>
                {/* Display Name Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, displayNameError && styles.inputWrapperError]}>
                    <User size={20} color={displayNameError ? "#ff6b6b" : "#c9a961"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full name"
                      placeholderTextColor="#666666"
                      value={displayName}
                      onChangeText={(text) => {
                        setDisplayName(text);
                        if (displayNameError) setDisplayNameError('');
                      }}
                      autoCapitalize="words"
                      autoCorrect={false}
                      underlineColorAndroid="transparent"
                      selectionColor="#c9a961"
                    />
                  </View>
                  {displayNameError && <Text style={styles.errorText}>{displayNameError}</Text>}
                </View>

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
                    />
                  </View>
                  {emailError && <Text style={styles.errorText}>{emailError}</Text>}
                </View>

                {/* Phone Number Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, phoneError && styles.inputWrapperError]}>
                    <Phone size={20} color={phoneError ? "#ff6b6b" : "#c9a961"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone number"
                      placeholderTextColor="#666666"
                      value={phoneNumber}
                      onChangeText={(text) => {
                        setPhoneNumber(text);
                        if (phoneError) setPhoneError('');
                      }}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      underlineColorAndroid="transparent"
                      selectionColor="#c9a961"
                    />
                  </View>
                  {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
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
                        setPasswordStrength(calculatePasswordStrength(text));
                        if (passwordError) setPasswordError('');
                      }}
                      secureTextEntry={!showPassword}
                      underlineColorAndroid="transparent"
                      selectionColor="#c9a961"
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
                  
                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <View style={styles.passwordStrengthContainer}>
                      <Text style={styles.passwordStrengthText}>
                        Password Strength: {passwordStrength < 3 ? 'Weak' : passwordStrength < 5 ? 'Medium' : 'Strong'}
                      </Text>
                      <View style={styles.passwordStrengthBar}>
                        <View 
                          style={[
                            styles.passwordStrengthFill, 
                            { 
                              width: `${(passwordStrength / 6) * 100}%`,
                              backgroundColor: passwordStrength < 3 ? '#ff6b6b' : passwordStrength < 5 ? '#ffa726' : '#4caf50'
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, confirmPasswordError && styles.inputWrapperError]}>
                    <Lock size={20} color={confirmPasswordError ? "#ff6b6b" : "#c9a961"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm password"
                      placeholderTextColor="#666666"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (confirmPasswordError) setConfirmPasswordError('');
                      }}
                      secureTextEntry={!showConfirmPassword}
                      underlineColorAndroid="transparent"
                      selectionColor="#c9a961"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? (
                        <EyeOff size={20} color="#666666" />
                      ) : (
                        <Eye size={20} color="#666666" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}
                </View>

                {/* Security Question Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.sectionLabel}>Security Question</Text>
                  <View style={[styles.inputWrapper, securityQuestionError && styles.inputWrapperError]}>
                    <HelpCircle size={20} color={securityQuestionError ? "#ff6b6b" : "#c9a961"} style={styles.inputIcon} />
                    <View style={styles.pickerContainer}>
                      {securityQuestions.map((question, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.questionOption,
                            selectedSecurityQuestion === question && styles.questionOptionSelected
                          ]}
                          onPress={() => {
                            setSelectedSecurityQuestion(question);
                            if (securityQuestionError) setSecurityQuestionError('');
                          }}>
                          <Text style={[
                            styles.questionOptionText,
                            selectedSecurityQuestion === question && styles.questionOptionTextSelected
                          ]}>
                            {question}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  {securityQuestionError && <Text style={styles.errorText}>{securityQuestionError}</Text>}
                </View>

                {/* Security Answer Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, securityAnswerError && styles.inputWrapperError]}>
                    <HelpCircle size={20} color={securityAnswerError ? "#ff6b6b" : "#c9a961"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Your answer"
                      placeholderTextColor="#666666"
                      value={securityAnswer}
                      onChangeText={(text) => {
                        setSecurityAnswer(text);
                        if (securityAnswerError) setSecurityAnswerError('');
                      }}
                      autoCapitalize="words"
                      autoCorrect={false}
                      underlineColorAndroid="transparent"
                      selectionColor="#c9a961"
                    />
                  </View>
                  {securityAnswerError && <Text style={styles.errorText}>{securityAnswerError}</Text>}
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={[styles.signUpButton, (isLoading || loading) && styles.signUpButtonDisabled]}
                  onPress={handleSignUp}
                  disabled={isLoading || loading}>
                  {isLoading || loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={navigateToLogin}>
                    <Text style={styles.loginLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  gradient: {
    flex: 1,
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
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },
  inputWrapperError: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
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
  },
  eyeIcon: {
    padding: 4,
  },
  signUpButton: {
    backgroundColor: '#c9a961',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  signUpButtonDisabled: {
    backgroundColor: 'rgba(201, 169, 97, 0.5)',
  },
  signUpButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffffff',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
  },
  loginLink: {
    fontFamily: 'Inter-Bold',
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
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 4,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  sectionLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#c9a961',
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerContainer: {
    flex: 1,
  },
  questionOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  questionOptionSelected: {
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
    borderColor: '#c9a961',
  },
  questionOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
  },
  questionOptionTextSelected: {
    color: '#c9a961',
    fontFamily: 'Inter-Medium',
  },
});
