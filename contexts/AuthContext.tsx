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
    let mounted = true;
    
    const initAuth = async () => {
      // PRODUCTION FIX: Longer timeout for production builds
      const timeoutDuration = __DEV__ ? 5000 : 10000; // 10 seconds for production
      const timeout = setTimeout(() => {
        console.warn(`AuthContext: Initialization timeout after ${timeoutDuration}ms - forcing loading to false`);
        if (mounted) {
          setLoading(false);
        }
      }, timeoutDuration);
      
      // CRITICAL: Pre-initialize Firebase to ensure auth component is registered
      // This prevents "component auth is not registered yet" errors in production
      console.log('AuthContext: Pre-initializing Firebase...');
      try {
        const { getFirebaseAuth } = await import('../services/firebase');
        console.log('AuthContext: Calling getFirebaseAuth to ensure initialization...');
        await getFirebaseAuth();
        console.log('AuthContext: ✅ Firebase Auth pre-initialized successfully');
      } catch (preInitError) {
        console.error('AuthContext: ⚠️ Firebase pre-initialization failed:', preInitError);
        console.error('AuthContext: Continuing anyway, will rely on lazy initialization');
      }
      
      try {
        // Skip Firebase restoration on initial load - it's not critical
        // Firebase will be initialized lazily when user tries to sign in
        console.log('AuthContext: Skipping Firebase restoration on initial load for faster startup');
        
        // Check for stored token and user data
        const token = await apiService.getStoredToken();
        const userData = await apiService.getStoredUserData();
        
        console.log('AuthContext: Stored token exists:', !!token);
        console.log('AuthContext: Stored userData exists:', !!userData);
        console.log('AuthContext: Stored userData role:', userData?.role);
        
        if (token && userData) {
          console.log('AuthContext: Found stored auth, verifying with backend');
          // Verify token is still valid by fetching profile
          try {
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
          } catch (profileError) {
            console.error('AuthContext: Error fetching profile:', profileError);
            // If profile fetch fails, clear stored data
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
        clearTimeout(timeout);
        if (mounted) {
          setLoading(false);
        }
        console.log('AuthContext: Initialization complete');
      }
    };

    initAuth().catch((err) => {
      console.error('AuthContext: Fatal initialization error:', err);
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
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
      
      // CRITICAL: Store token in multiple keys for redundancy in production builds
      if (authResult.user.idToken) {
        await AsyncStorage.setItem('userToken', authResult.user.idToken);
        await AsyncStorage.setItem('firebase_id_token', authResult.user.idToken);
        console.log('AuthContext: Stored idToken in both userToken and firebase_id_token');
      } else if (firebaseIdToken) {
        // Ensure userToken is also set if we have firebase_id_token
        await AsyncStorage.setItem('userToken', firebaseIdToken);
        console.log('AuthContext: Synced firebase_id_token to userToken');
      }
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('AuthContext: Login successful, user set with role:', userData.role);
      console.log('AuthContext: ✅ All tokens stored and ready for API calls');
      
      // Verify tokens are actually stored
      const verifyUserToken = await AsyncStorage.getItem('userToken');
      const verifyFirebaseToken = await AsyncStorage.getItem('firebase_id_token');
      console.log('AuthContext: Token verification - userToken:', verifyUserToken ? 'Present' : 'MISSING');
      console.log('AuthContext: Token verification - firebase_id_token:', verifyFirebaseToken ? 'Present' : 'MISSING');
      
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
      
      // CRITICAL: Store token in multiple keys for redundancy in production builds
      await AsyncStorage.setItem('userToken', authResult.idToken);
      await AsyncStorage.setItem('firebase_id_token', authResult.idToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      console.log('AuthContext: Google login successful, user set with role:', userData.role);
      console.log('AuthContext: Stored tokens in both userToken and firebase_id_token');
      
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
        
        // CRITICAL: Store token in multiple keys for redundancy in production builds
        if (response.data.token) {
          await AsyncStorage.setItem('userToken', response.data.token);
          await AsyncStorage.setItem('firebase_id_token', response.data.token);
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
          console.log('AuthContext: Stored registration tokens in both userToken and firebase_id_token');
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
    try {
      console.log('AuthContext: Starting logout process...');
      
      // Set loading BEFORE clearing user to prevent UI flicker
      setLoading(true);
      
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
      
      // IMPORTANT: Set loading to false BEFORE navigation
      setLoading(false);
      
      // Small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to landing page (index)
      console.log('AuthContext: Redirecting to landing page...');
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if API fails, still clear local state
      setUser(null);
      setFirebaseUser(null);
      console.log('AuthContext: Cleared local state despite error');
      
      // Set loading to false
      setLoading(false);
      
      // Small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Still navigate to landing page
      router.replace('/');
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
