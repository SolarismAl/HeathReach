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
  
  // For mobile: Use Expo's auth proxy which is already registered in Google Console
  // For web: Use localhost
  const redirectUri = makeRedirectUri({
    preferLocalhost: true,
    native: 'https://auth.expo.io/@alfonso_solar/HealthReach',
  });
  
  console.log('Google OAuth Redirect URI:', redirectUri);
  console.log('Google Client ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
  console.log('Platform:', Platform.OS);
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri: redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  React.useEffect(() => {
    console.log('Google Auth Response:', response);
    
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('Google Authentication object:', authentication);
      console.log('Access Token:', authentication?.accessToken);
      console.log('ID Token:', authentication?.idToken);
      
      // Prefer ID token if available, fallback to access token
      const tokenToUse = authentication?.idToken || authentication?.accessToken;
      console.log('Using token:', tokenToUse ? 'ID Token' : 'Access Token');
      
      handleGoogleAuthSuccess(tokenToUse);
    } else if (response?.type === 'error') {
      console.error('Google Auth Error:', response.error);
      Alert.alert(
        'Google Sign-In Error', 
        `Error: ${response.error?.message || 'Unknown error'}\n\nDetails: ${JSON.stringify(response.error, null, 2)}`
      );
    }
  }, [response]);

  const handleGoogleAuthSuccess = async (accessToken?: string) => {
    if (!accessToken) {
      Alert.alert('Error', 'Failed to get Google access token');
      return;
    }

    setLoading(true);
    try {
      console.log('GoogleSignInModal: Getting Google user info with access token');
      
      // Get user info from Google using the access token
      const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
      const userInfo = await userInfoResponse.json();
      
      console.log('Google user info:', userInfo);
      
      // Use Firebase Auth to sign in with Google and get a proper Firebase ID token
      console.log('GoogleSignInModal: Signing in with Firebase using Google credentials');
      
      try {
        // Import Firebase auth functions
        const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
        const { getFirebaseAuth } = await import('../services/firebase');
        
        // Create Google credential with access token
        const credential = GoogleAuthProvider.credential(null, accessToken);
        
        // Sign in with Firebase using Google credential
        const auth = await getFirebaseAuth();
        const userCredential = await signInWithCredential(auth, credential);
        
        // Get Firebase ID token
        const firebaseIdToken = await userCredential.user.getIdToken();
        console.log('GoogleSignInModal: Got Firebase ID token from Google credential');
        
        // Use the Firebase ID token for backend authentication
        await signInWithGoogle(firebaseIdToken);
        
        // Close modal
        onClose();
        
        // Navigate to appropriate dashboard based on user role
        // The AuthContext will handle setting the user data with role
        // We'll let the app's navigation handle the redirect based on user state
        
      } catch (firebaseError) {
        console.error('Firebase Google sign-in error:', firebaseError);
        // Fallback: try with access token directly
        console.log('GoogleSignInModal: Fallback - using access token directly');
        await signInWithGoogle(accessToken);
        onClose();
      }
      
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
