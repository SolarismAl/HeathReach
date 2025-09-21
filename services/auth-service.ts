import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';

console.log('=== CUSTOM AUTH SERVICE INITIALIZATION ===');

// Custom authentication service that bypasses Firebase client-side issues
export class CustomAuthService {
  
  static async signInWithEmail(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      console.log('=== CUSTOM AUTH SIGN-IN ===');
      console.log('Email:', email);
      
      // Make direct API call to Laravel backend for authentication
      const response = await fetch('http://127.0.0.1:8000/api/auth/firebase-login', {
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
        
        // Store the token and user data
        await AsyncStorage.setItem('auth_token', data.data.token);
        await AsyncStorage.setItem('firebase_id_token', data.data.firebase_token || data.data.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
        
        console.log('Backend user data:', data.data.user);
        console.log('User role from backend:', data.data.user.role);
        
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
            idToken: data.data.firebase_token || data.data.token
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
      
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
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
          await fetch('http://127.0.0.1:8000/api/auth/logout', {
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
      throw error;
    }
  }

  static async getCurrentUser(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      const token = await AsyncStorage.getItem('firebase_id_token');
      
      if (userData && token) {
        const user = JSON.parse(userData);
        return {
          uid: user.user_id,
          email: user.email,
          displayName: user.name,
          getIdToken: async () => token
        };
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
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

  // Dummy method for Google sign-in
  static async signInWithGoogle(): Promise<{ user: any; idToken: string }> {
    throw new Error('Google Sign-In is currently only supported on web. Please use email/password authentication.');
  }
}

export default CustomAuthService;
