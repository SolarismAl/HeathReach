import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import GoogleSignInModal from '@/components/GoogleSignInModal';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { neumorphism, colors, spacing, borderRadius, typography, shadows } from '../../styles/neumorphism';
import DebugHelper from '../../utils/debugHelper';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signInWithEmail, signInWithGoogle, loading } = useAuth();
  const { toast, showError, showSuccess, hideToast } = useToast();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showError('Please fill in all fields');
      return;
    }

    // Check if auth context is still loading (Firebase initializing)
    if (loading) {
      showError('Please wait, initializing authentication...');
      console.log('Login blocked: Auth context still loading');
      return;
    }

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password:', password ? 'Present' : 'Missing');
    console.log('Auth loading state:', loading);

    setEmailLoading(true);
    try {
      console.log('Calling signInWithEmail...');
      DebugHelper.logAuth('Login attempt', { email });
      
      await signInWithEmail(email.trim(), password);
      console.log('Login successful!');
      DebugHelper.logAuth('Login successful');
      
      // Check token status after login
      const tokenStatus = await DebugHelper.checkTokenStatus();
      console.log('Token status after login:', tokenStatus);
      
      if (!tokenStatus.hasTokens) {
        DebugHelper.showErrorWithLogs(
          'Warning: No Tokens After Login',
          'Login succeeded but tokens were not stored properly. You may experience authorization issues.'
        );
      } else {
        showSuccess('Successfully signed in!');
      }
      
      // Force navigation to index to trigger the redirect logic
      console.log('Navigating to index...');
      router.replace('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      DebugHelper.logAuth('Login failed', error.message);
      showError(error.message || 'Login failed');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setShowGoogleModal(true);
  };

  const handleGoogleModalClose = () => {
    setShowGoogleModal(false);
    setGoogleLoading(false);
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="medical" size={50} color="#4A90E2" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to HealthReach</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, (emailLoading || loading) && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={emailLoading || loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Initializing...' : emailLoading ? 'Logging In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, googleLoading && styles.googleButtonDisabled]}
              onPress={handleGoogleLogin}
              disabled={googleLoading}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>
                {googleLoading ? 'Connecting...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity> */}

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* <GoogleSignInModal
        visible={showGoogleModal}
        onClose={handleGoogleModalClose}
        mode="signin"
      /> */}
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.elevated,
  },
  inputIcon: {
    marginRight: spacing.md,
    color: colors.primary,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333333',
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md + spacing.xs,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.elevated,
  },
  loginButtonDisabled: {
    backgroundColor: colors.textDisabled,
    ...shadows.subtle,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  forgotPassword: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    ...typography.body2,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  footerText: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  signUpText: {
    ...typography.body2,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: spacing.md,
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md + spacing.xs,
    borderRadius: borderRadius.round,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.elevated,
  },
  googleButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    ...shadows.subtle,
  },
  googleIcon: {
    marginRight: spacing.md,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
});
