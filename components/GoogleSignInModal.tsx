import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInModalProps {
  visible: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
}

export default function GoogleSignInModal({ visible, onClose, mode }: GoogleSignInModalProps) {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({
      scheme: 'healthreach',
      path: 'auth'
    }),
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleAuthSuccess(authentication?.accessToken);
    }
  }, [response]);

  const handleGoogleAuthSuccess = async (accessToken?: string) => {
    if (!accessToken) {
      Alert.alert('Error', 'Failed to get Google access token');
      return;
    }

    setLoading(true);
    try {
      // For mobile, we need to use Firebase Auth directly, not the web version
      await signInWithGoogle(); // Don't pass accessToken, let Firebase handle it
      onClose();
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      Alert.alert('Error', error.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await promptAsync();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to initiate Google authentication');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Ionicons name="logo-google" size={48} color="#DB4437" />
            </View>
            
            <Text style={styles.title}>
              {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
            </Text>
            
            <Text style={styles.subtitle}>
              {mode === 'signin' 
                ? 'Continue to your HealthReach account' 
                : 'Create your HealthReach account with Google'
              }
            </Text>

            <TouchableOpacity
              style={[styles.googleButton, loading && styles.googleButtonDisabled]}
              onPress={handleGoogleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#333" />
              ) : (
                <View style={styles.googleButtonContent}>
                  <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.googleIcon} />
                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 24,
    paddingTop: 0,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#D0D0D0',
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    paddingHorizontal: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});
