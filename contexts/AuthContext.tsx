import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import CustomAuthService from '../services/auth-service';
import apiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  firebaseUser: any | null; // Firebase user type (avoiding direct import)
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (googleToken?: string) => Promise<void>;
  signUp: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'patient' | 'health_worker';
    contact_number?: string;
    address?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forceLogout: () => Promise<void>;
  checkPasswordStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AuthContext: Initializing auth state');
    
    const initAuth = async () => {
      try {
        // First, try to restore Firebase user session
        console.log('AuthContext: Attempting to restore Firebase user session...');
        try {
          const { getFirebaseAuth } = await import('../services/firebase');
          const auth = await getFirebaseAuth();
          
          // Wait for Firebase auth state to be restored
          await new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
              console.log('AuthContext: Firebase auth state changed:', firebaseUser ? 'User found' : 'No user');
              if (firebaseUser) {
                console.log('AuthContext: Firebase user restored:', firebaseUser.uid);
                setFirebaseUser(firebaseUser);
              }
              unsubscribe();
              resolve(firebaseUser);
            });
          });
        } catch (firebaseError) {
          console.error('AuthContext: Error restoring Firebase user:', firebaseError);
        }
        
        // Check for stored token and user data
        const token = await apiService.getStoredToken();
        const userData = await apiService.getStoredUserData();
        
        console.log('AuthContext: Stored token exists:', !!token);
        console.log('AuthContext: Stored userData exists:', !!userData);
        console.log('AuthContext: Stored userData role:', userData?.role);
        
        if (token && userData) {
          console.log('AuthContext: Found stored auth, verifying with backend');
          // Verify token is still valid by fetching profile
          const profileResponse = await apiService.getProfile();
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data);
            console.log('AuthContext: Restored user session', profileResponse.data.role);
          } else {
            // Token invalid, clear stored data
            console.log('AuthContext: Token invalid, clearing stored data');
            await apiService.logout();
            setUser(null);
            setFirebaseUser(null);
          }
        } else {
          console.log('AuthContext: No stored auth, showing get started screen');
          setUser(null);
          setFirebaseUser(null);
        }
      } catch (error) {
        console.error('Error checking stored auth:', error);
        // Clear any invalid stored data
        await apiService.logout();
        setUser(null);
        setFirebaseUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('AuthContext: Starting email sign in for:', email);

      // Sign in with Custom Auth Service (handles both Firebase auth and backend)
      const authResult = await CustomAuthService.signInWithEmail(email, password);
      console.log('AuthContext: Auth result:', authResult);
      
      if (!authResult.success) {
        console.error('AuthContext: Authentication failed:', authResult.error);
        throw new Error(authResult.error || 'Authentication failed');
      }

      // The custom auth service already handled backend authentication
      // Extract user data from the auth result
      const userData = authResult.user;
      console.log('AuthContext: Raw auth result:', authResult);
      console.log('AuthContext: Setting user data:', userData);
      console.log('AuthContext: User role:', userData.role);
      console.log('AuthContext: User name:', userData.name);
      console.log('AuthContext: User displayName:', userData.displayName);
      
      setUser(userData);
      
      // Store user data and token (already stored by CustomAuthService)
      // Ensure we're using the Firebase ID token for API calls
      const firebaseIdToken = await AsyncStorage.getItem('firebase_id_token');
      console.log('AuthContext: Firebase ID token stored:', firebaseIdToken ? 'Yes' : 'No');
      
      if (authResult.user.idToken) {
        await AsyncStorage.setItem('userToken', authResult.user.idToken);
      }
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('AuthContext: Login successful, user set with role:', userData.role);
      console.log('AuthContext: ✅ All tokens stored and ready for API calls');
      
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (googleToken?: string) => {
    setLoading(true);
    try {
      console.log('AuthContext: Starting Google sign in with token:', !!googleToken);
      
      if (!googleToken) {
        throw new Error('Google access token is required');
      }
      
      // Authenticate with backend using Google access token
      const authResult = await CustomAuthService.signInWithGoogle(googleToken);
      console.log('AuthContext: Google auth result:', authResult);
      
      // Set user data from auth result
      const userData = authResult.user;
      console.log('AuthContext: Setting user data from Google auth result:');
      console.log('AuthContext: userData keys:', Object.keys(userData));
      console.log('AuthContext: userData.user_id:', userData.user_id);
      console.log('AuthContext: Full userData:', userData);
      setUser(userData);
      setFirebaseUser(authResult.user);
      
      // Store user data and token
      await AsyncStorage.setItem('userToken', authResult.idToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      console.log('AuthContext: Google login successful, user set with role:', userData.role);
      
      // IMPORTANT: Refresh user data from backend to get the correct user_id
      console.log('AuthContext: Refreshing user data from backend to sync user_id...');
      try {
        const profileResponse = await apiService.getProfile();
        console.log('AuthContext: Profile response:', profileResponse);
        if (profileResponse.success && profileResponse.data) {
          console.log('AuthContext: Profile response.data:', profileResponse.data);
          console.log('AuthContext: Profile response.data keys:', Object.keys(profileResponse.data));
          
          // Check if data is nested under 'user' key
          const userData = (profileResponse.data as any).user || profileResponse.data;
          console.log('AuthContext: Final user data to set:', userData);
          console.log('AuthContext: Final user data role:', userData.role);
          
          setUser(userData);
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('AuthContext: Failed to refresh user data from backend:', error);
        // Continue with the original user data if refresh fails
      }
      
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'patient' | 'health_worker';
    contact_number?: string;
    address?: string;
  }) => {
    setLoading(true);
    try {
      console.log('AuthContext: Starting registration process');
      console.log('Registration data:', {
        ...data,
        password: 'Hidden',
        password_confirmation: 'Hidden'
      });

      // Send registration data directly to backend (backend creates Firebase user)
      console.log('AuthContext: Sending registration to backend');
      const response = await apiService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        role: data.role,
        contact_number: data.contact_number || '',
        address: data.address || ''
      });
      
      console.log('AuthContext: Registration response:', response);
      
      if (response.success && response.data) {
        // Registration successful, user is automatically logged in
        setUser(response.data.user);
        
        // Store token and user data
        if (response.data.token) {
          await AsyncStorage.setItem('userToken', response.data.token);
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
        
        console.log('AuthContext: Registration successful, user logged in', response.data.user);
      } else {
        console.error('AuthContext: Registration failed:', response.message);
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('AuthContext: Sign up error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('AuthContext: Starting logout process...');
      
      // Logout from backend API first (to revoke tokens)
      console.log('AuthContext: Calling backend logout...');
      await apiService.logout();
      
      // Sign out from Firebase
      console.log('AuthContext: Signing out from Firebase...');
      await CustomAuthService.signOut();
      
      // Clear local state
      setUser(null);
      setFirebaseUser(null);
      console.log('AuthContext: User signed out successfully');
      
      // Navigate to auth page
      console.log('AuthContext: Redirecting to login page...');
      router.replace('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if API fails, still clear local state
      setUser(null);
      setFirebaseUser(null);
      console.log('AuthContext: Cleared local state despite error');
      
      // Still navigate to auth page
      router.replace('/auth');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        console.error('Failed to refresh user profile:', response.message);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const forceLogout = async () => {
    console.log('AuthContext: Force logout - clearing all data');
    try {
      // Clear Firebase auth
      await CustomAuthService.signOut();
    } catch (error) {
      console.error('Firebase signout error:', error);
    }
    
    try {
      // Clear API data
      await apiService.logout();
    } catch (error) {
      console.error('API logout error:', error);
    }
    
    // Clear local state
    setUser(null);
    setFirebaseUser(null);
    console.log('AuthContext: Force logout complete');
  };

  const checkPasswordStatus = async (): Promise<boolean> => {
    try {
      const response = await apiService.hasPassword();
      return response.success && response.data ? response.data.has_password : false;
    } catch (error) {
      console.error('Error checking password status:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    signOut,
    refreshUser,
    forceLogout,
    checkPasswordStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
