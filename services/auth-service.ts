import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';
import { getFirebaseAuth } from './firebase';
import { signInWithCustomToken } from 'firebase/auth';

console.log('=== CUSTOM AUTH SERVICE INITIALIZATION ===');

// Custom authentication service that bypasses Firebase client-side issues
export class CustomAuthService {
  
  static async signInWithEmail(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      console.log('=== CUSTOM AUTH SIGN-IN ===');
      console.log('Email:', email);
      
      // Make direct API call to Laravel backend for authentication
      const response = await fetch('https://healthreach-api.onrender.com/api/auth/firebase-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      console.log('Auth response status:', response.status);
      const data = await response.json();
      console.log('Auth response data:', data);

      if (data.success && data.data?.token) {
        console.log('Authentication successful');
        console.log('Backend token type:', data.data.firebase_token ? 'Firebase ID Token' : 'Custom Token');
        
        // The backend returns a Firebase custom token
        // We MUST exchange it for a Firebase ID token for API calls to work
        const customToken = data.data.firebase_token || data.data.token;
        console.log('Custom token received from backend (length):', customToken.length);
        
        try {
          console.log('Exchanging custom token for Firebase ID token...');
          const { signInWithCustomToken } = await import('firebase/auth');
          const { getFirebaseAuth } = await import('./firebase');
          
          // Sign in with the custom token to get an ID token
          const auth = await getFirebaseAuth();
          const userCredential = await signInWithCustomToken(auth, customToken);
          const idToken = await userCredential.user.getIdToken();
          
          console.log('✅ Successfully exchanged custom token for Firebase ID token');
          console.log('Firebase ID token length:', idToken.length);
          
          // Store both tokens
          await AsyncStorage.setItem('auth_token', customToken); // Custom token
          await AsyncStorage.setItem('firebase_id_token', idToken); // ID token for API calls
          await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
          console.log('✅ All tokens stored successfully');
          
        } catch (tokenError: any) {
          console.error('❌ Failed to exchange custom token:', tokenError);
          console.error('Token error details:', tokenError?.message || 'Unknown error');
          
          // CRITICAL: If token exchange fails, we cannot make authenticated API calls
          // Store the custom token as fallback but warn the user
          await AsyncStorage.setItem('auth_token', customToken);
          await AsyncStorage.setItem('firebase_id_token', customToken);
          await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
          console.log('⚠️ WARNING: Stored custom token as fallback - API calls may fail');
        }
        
        console.log('Backend user data:', data.data.user);
        console.log('User role from backend:', data.data.user.role);
        
        // Get the stored Firebase ID token to return
        const storedIdToken = await AsyncStorage.getItem('firebase_id_token');
        console.log('Returning user with stored ID token:', storedIdToken ? 'Present' : 'NULL');
        
        return {
          success: true,
          user: {
            user_id: data.data.user.user_id,
            name: data.data.user.name,
            email: data.data.user.email,
            role: data.data.user.role,
            contact_number: data.data.user.contact_number,
            address: data.data.user.address,
            is_active: data.data.user.is_active,
            created_at: data.data.user.created_at,
            updated_at: data.data.user.updated_at,
            // Also include Firebase-style fields for compatibility
            uid: data.data.user.user_id,
            displayName: data.data.user.name,
            idToken: storedIdToken || data.data.firebase_token || data.data.token
          }
        };
      } else {
        return {
          success: false,
          error: data.message || 'Authentication failed'
        };
      }
    } catch (error: any) {
      console.error('Custom auth error:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }

  static async createUserWithEmail(email: string, password: string): Promise<{ user: any; idToken: string }> {
    try {
      console.log('=== CUSTOM AUTH REGISTRATION ===');
      
      const response = await fetch('https://healthreach-api.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: 'New User',
          email: email,
          password: password,
          password_confirmation: password,
          role: 'patient'
        })
      });

      const data = await response.json();
      
      if (data.success && data.data?.token) {
        await AsyncStorage.setItem('auth_token', data.data.token);
        await AsyncStorage.setItem('firebase_id_token', data.data.firebase_token || data.data.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
        
        return {
          user: data.data.user,
          idToken: data.data.firebase_token || data.data.token
        };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      console.log('=== CUSTOM AUTH SIGN-OUT ===');
      
      // Call backend logout
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        try {
          await fetch('https://healthreach-api.onrender.com/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          });
        } catch (logoutError) {
          console.error('Backend logout error:', logoutError);
        }
      }
      
      // Clear local storage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('firebase_id_token');
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      console.log('Sign out completed');
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  }

  static async getCurrentUser(): Promise<any | null> {
    try {
      // First try to get the current Firebase user
      try {
        const { getFirebaseAuth } = await import('./firebase');
        const auth = await getFirebaseAuth();
        const firebaseUser = auth.currentUser;
        
        if (firebaseUser) {
          console.log('CustomAuthService: Found Firebase user:', firebaseUser.uid);
          return firebaseUser;
        }
      } catch (firebaseError) {
        console.error('CustomAuthService: Error getting Firebase user:', firebaseError);
      }
      
      // Fallback to stored user data with mock getIdToken method
      const userData = await AsyncStorage.getItem('user_data');
      const token = await AsyncStorage.getItem('firebase_id_token');
      
      if (userData && token) {
        const user = JSON.parse(userData);
        return {
          ...user,
          uid: user.user_id || user.uid,
          email: user.email,
          getIdToken: async () => token
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async getIdToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('firebase_id_token');
    } catch (error) {
      console.error('Get ID token error:', error);
      return null;
    }
  }

  static async onAuthStateChanged(callback: (user: any | null) => void) {
    // Simple implementation - check for stored user
    const user = await this.getCurrentUser();
    callback(user);
    
    // Return a dummy unsubscribe function
    return () => {};
  }

  // Google sign-in method
  static async signInWithGoogle(accessToken?: string): Promise<{ user: any; idToken: string }> {
    try {
      console.log('=== CUSTOM AUTH GOOGLE SIGN-IN ===');
      console.log('Access token provided:', !!accessToken);
      
      if (!accessToken) {
        throw new Error('Google access token is required');
      }
      
      // Send Google access token to backend for verification and user creation/login
      const response = await fetch('https://healthreach-api.onrender.com/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          idToken: accessToken  // Backend expects 'idToken' field
        })
      });

      console.log('Google auth response status:', response.status);
      const data = await response.json();
      console.log('Google auth response data:', data);

      if (data.success && data.data?.token) {
        console.log('Google authentication successful');
        
        // IMPORTANT: Sign into Firebase with the custom token to maintain session
        const firebaseToken = data.data.firebase_token || data.data.token;
        console.log('Signing into Firebase with custom token...');
        
        try {
          const auth = await getFirebaseAuth();
          const userCredential = await signInWithCustomToken(auth, firebaseToken);
          console.log('Firebase sign-in successful:', userCredential.user.uid);
          
          // Get fresh Firebase ID token
          const freshIdToken = await userCredential.user.getIdToken();
          console.log('Fresh Firebase ID token obtained');
          
          // Store tokens and user data
          await AsyncStorage.setItem('auth_token', data.data.token);
          await AsyncStorage.setItem('firebase_id_token', freshIdToken);
          await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
          
          console.log('Google user data:', data.data.user);
          console.log('Google user role:', data.data.user.role);
          
          return {
            user: {
              user_id: data.data.user.user_id,
              name: data.data.user.name,
              email: data.data.user.email,
              role: data.data.user.role,
              contact_number: data.data.user.contact_number,
              address: data.data.user.address,
              is_active: data.data.user.is_active,
              created_at: data.data.user.created_at,
              updated_at: data.data.user.updated_at,
              // Firebase-style fields for compatibility
              uid: data.data.user.user_id,
              displayName: data.data.user.name,
            },
            idToken: freshIdToken
          };
        } catch (firebaseError) {
          console.error('Firebase sign-in failed:', firebaseError);
          // Fallback to original token if Firebase sign-in fails
          await AsyncStorage.setItem('auth_token', data.data.token);
          await AsyncStorage.setItem('firebase_id_token', firebaseToken);
          await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
          
          return {
            user: {
              user_id: data.data.user.user_id,
              name: data.data.user.name,
              email: data.data.user.email,
              role: data.data.user.role,
              contact_number: data.data.user.contact_number,
              address: data.data.user.address,
              is_active: data.data.user.is_active,
              created_at: data.data.user.created_at,
              updated_at: data.data.user.updated_at,
              // Firebase-style fields for compatibility
              uid: data.data.user.user_id,
              displayName: data.data.user.name,
            },
            idToken: firebaseToken
          };
        }
      } else {
        throw new Error(data.message || 'Google authentication failed');
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      throw error;
    }
  }
}

export default CustomAuthService;
