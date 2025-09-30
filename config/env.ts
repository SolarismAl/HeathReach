/**
 * Environment Configuration
 * Access environment variables safely throughout the app
 */

export const ENV = {
  // API Configuration
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  
  // Firebase Configuration
  FIREBASE: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  },
  
  // Google OAuth
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  
  // Environment Detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate required environment variables
export const validateEnv = () => {
  const required = [
    'EXPO_PUBLIC_API_URL',
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', missing);
  }
  
  return missing.length === 0;
};

// Usage example:
// import { ENV } from './config/env';
// const apiUrl = ENV.API_URL;
// const firebaseConfig = ENV.FIREBASE;
