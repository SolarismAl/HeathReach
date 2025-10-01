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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { neumorphism, colors, spacing, borderRadius, typography, shadows } from '../../styles/neumorphism';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast, showError, showSuccess, hideToast } = useToast();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      showError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.forgotPassword(email.trim());
      
      if (response.success) {
        setEmailSent(true);
        showSuccess('Password reset instructions have been sent to your email address.');
      } else {
        showError(response.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={navigateToLogin} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#4A90E2" />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Ionicons name="mail" size={50} color="#4A90E2" />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password
            </Text>
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
                editable={!emailSent}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.resetButton, 
                (loading || emailSent) && styles.resetButtonDisabled
              ]}
              onPress={handleResetPassword}
              disabled={loading || emailSent}
            >
              <Text style={styles.resetButtonText}>
                {loading ? 'Sending...' : emailSent ? 'Email Sent' : 'Send Reset Instructions'}
              </Text>
            </TouchableOpacity>

            {emailSent && (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.successText}>
                  Check your email for password reset instructions
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
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
    backgroundColor: colors.background,
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: spacing.lg,
    padding: spacing.sm,
    ...neumorphism.iconContainerSmall,
  },
  logoContainer: {
    ...neumorphism.iconContainerLarge,
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body1,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  form: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  inputContainer: {
    ...neumorphism.inputContainer,
    marginBottom: spacing.lg,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.textPrimary,
  },
  resetButton: {
    ...neumorphism.button,
    marginBottom: spacing.lg,
  },
  resetButtonDisabled: {
    backgroundColor: colors.textDisabled,
    ...shadows.subtle,
  },
  resetButtonText: {
    ...neumorphism.buttonText,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSoft,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    ...shadows.subtle,
  },
  successText: {
    ...typography.body2,
    color: colors.success,
    fontWeight: '500',
    marginLeft: spacing.sm,
    textAlign: 'center',
    flex: 1,
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
  },
  signInText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: 'bold',
  },
});
