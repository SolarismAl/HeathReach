import Constants from 'expo-constants';

// Get config from app.json extra field (works in production builds)
const extra = Constants.expoConfig?.extra || {};

// Fallback to environment variables for development, then to app.json extra config
export const API_URL = process.env.EXPO_PUBLIC_API_URL || extra.apiUrl || 'https://healthreach-api.onrender.com/api';
export const FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || extra.firebaseApiKey || 'AIzaSyCLviE9L1ihRAafW14XH-li4M67CjyFbBc';
export const FIREBASE_AUTH_DOMAIN = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || extra.firebaseAuthDomain || 'healthreach-9167b.firebaseapp.com';
export const FIREBASE_PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || extra.firebaseProjectId || 'healthreach-9167b';
export const FIREBASE_STORAGE_BUCKET = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || extra.firebaseStorageBucket || 'healthreach-9167b.firebasestorage.app';
export const FIREBASE_MESSAGING_SENDER_ID = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || extra.firebaseMessagingSenderId || '1035041170898';
export const FIREBASE_APP_ID = process.env.EXPO_PUBLIC_FIREBASE_APP_ID || extra.firebaseAppId || '1:1035041170898:web:5dd9a3435662835d15940b';
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
