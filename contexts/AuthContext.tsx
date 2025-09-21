import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import CustomAuthService from '../services/auth-service';
import apiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          }
        } else {
          console.log('AuthContext: No stored auth, showing get started screen');
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking stored auth:', error);
        // Clear any invalid stored data
        await apiService.logout();
        setUser(null);
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
      await AsyncStorage.setItem('userToken', authResult.user.idToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('AuthContext: Login successful, user set with role:', userData.role);
      
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
      // Authenticate with Firebase Google
      const firebaseResult = await CustomAuthService.signInWithGoogle();
      setFirebaseUser(firebaseResult.user);

      // Send ID token to backend
      const response = await apiService.loginWithGoogle(firebaseResult.idToken);
      if (response.success && response.data) {
        setUser(response.data.user);
        console.log('AuthContext: Google login successful', response.data.user.role);
      } else {
        throw new Error(response.message || 'Google login failed');
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
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if API fails, still clear local state
      setUser(null);
      setFirebaseUser(null);
      console.log('AuthContext: Cleared local state despite error');
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
