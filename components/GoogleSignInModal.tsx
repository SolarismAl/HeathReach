import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInModalProps {
  visible: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
}

export default function GoogleSignInModal({ visible, onClose, mode }: GoogleSignInModalProps) {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  
  // Dynamic redirect URI that works in all environments
  // For web: use localhost, for mobile: use custom scheme
  const redirectUri = Platform.OS === 'web' 
    ? makeRedirectUri({ preferLocalhost: true })
    : makeRedirectUri({
        scheme: 'com.anonymous.HealthReach',
        path: 'oauthredirect',
      });
  
  // Use platform-specific client ID
  const clientId = Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
    : process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  
  console.log('=== GOOGLE OAUTH DEBUG ===');
  console.log('Platform:', Platform.OS);
  console.log('Redirect URI:', redirectUri);
  console.log('Using Client ID:', Platform.OS === 'android' ? 'Android' : 'Web');
  console.log('Client ID Present:', clientId ? '✅ Yes' : '❌ MISSING');
  console.log('Actual Client ID:', clientId); // Show the actual ID for verification
  
  // Validate client ID
  if (!clientId) {
    console.error('❌ Google Client ID is missing for platform:', Platform.OS);
    console.error('❌ Add EXPO_PUBLIC_GOOGLE_' + (Platform.OS === 'android' ? 'ANDROID' : 'WEB') + '_CLIENT_ID to .env');
  }
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: clientId || 'MISSING_CLIENT_ID',
    redirectUri: redirectUri,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token', // Request ID token directly
  });

  React.useEffect(() => {
    console.log('Google Auth Response:', response);
    
    if (response?.type === 'success') {
      const { authentication, params } = response;
      console.log('Google Authentication object:', authentication);
      console.log('Google Params:', params);
      
      // IMPORTANT: When using responseType: 'id_token', the token is in params, not authentication
      const idToken = params?.id_token || authentication?.idToken;
      const accessToken = authentication?.accessToken;
      
      console.log('ID Token from params:', idToken ? 'Present' : 'Missing');
      console.log('Access Token:', accessToken ? 'Present' : 'Missing');
      
      // Prefer ID token (from params), fallback to access token
      const tokenToUse = idToken || accessToken;
      console.log('Using token type:', idToken ? 'ID Token' : 'Access Token');
      
      if (tokenToUse) {
        handleGoogleAuthSuccess(tokenToUse);
      } else {
        console.error('No token found in response');
        Alert.alert('Error', 'Failed to get authentication token from Google');
      }
    } else if (response?.type === 'error') {
      console.error('Google Auth Error:', response.error);
      Alert.alert(
        'Google Sign-In Error', 
        `Error: ${response.error?.message || 'Unknown error'}\n\nDetails: ${JSON.stringify(response.error, null, 2)}`
      );
    }
  }, [response]);

  const handleGoogleAuthSuccess = async (idToken?: string) => {
    if (!idToken) {
      Alert.alert('Error', 'Failed to get Google ID token');
      return;
    }

    setLoading(true);
    try {
      console.log('GoogleSignInModal: Received Google ID token');
      
      // The ID token we received is a Google ID token (JWT)
      // We can send it directly to the backend for authentication
      // The backend will verify it with Google and create/login the user
      
      console.log('GoogleSignInModal: Sending ID token to backend');
      await signInWithGoogle(idToken);
      
      // Close modal
      onClose();
      
      console.log('GoogleSignInModal: Google Sign-In completed successfully');
      
      // Navigate to index to trigger role-based redirect
      console.log('GoogleSignInModal: Navigating to index for redirect...');
      router.replace('/');
        
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
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
