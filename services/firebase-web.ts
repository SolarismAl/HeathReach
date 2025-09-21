import { Platform } from 'react-native';

console.log('=== FIREBASE WEB SDK INITIALIZATION ===');
console.log('Platform.OS:', Platform.OS);

// Force web environment for Firebase - more aggressive approach
if (typeof window === 'undefined') {
  (global as any).window = {
    location: { hostname: 'localhost' },
    navigator: { userAgent: 'Mozilla/5.0' },
    document: {},
    localStorage: {},
    sessionStorage: {}
  };
}
if (typeof document === 'undefined') {
  (global as any).document = {
    createElement: () => ({}),
    getElementsByTagName: () => [],
    head: { appendChild: () => {} }
  };
}

// Override React Native detection
(global as any).__DEV__ = false;
(global as any).navigator = (global as any).navigator || {
  userAgent: 'Mozilla/5.0 (Web; Firebase Web SDK)',
  product: 'Web'
};

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLviE9L1ihRAafW14XH-li4M67CjyFbBc",
  authDomain: "healthreach-9167b.firebaseapp.com",
  projectId: "healthreach-9167b",
  storageBucket: "healthreach-9167b.firebasestorage.app",
  messagingSenderId: "1035041170898",
  appId: "1:1035041170898:web:5dd9a3435662835d15940b",
};

console.log('Firebase Config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey.substring(0, 20) + '...'
});

let firebaseApp: any;
let auth: any;
let firestore: any;

const initializeFirebaseWeb = async () => {
  try {
    console.log('Initializing Firebase with web SDK...');
    
    // Import Firebase modules
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    
    // Initialize Firebase app
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('Firebase app initialized');
    } else {
      firebaseApp = getApps()[0];
      console.log('Using existing Firebase app');
    }
    
    // Initialize services
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
    
    console.log('Firebase services initialized successfully');
    console.log('Auth instance:', !!auth);
    console.log('Firestore instance:', !!firestore);
    
    return { auth, firestore, firebaseApp };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

// Initialize immediately
const firebasePromise = initializeFirebaseWeb();

export const getFirebaseAuth = async (): Promise<any> => {
  console.log('getFirebaseAuth called');
  await firebasePromise;
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  return auth;
};

export const getFirebaseFirestore = async (): Promise<any> => {
  await firebasePromise;
  return firestore;
};

export const getFirebaseApp = async (): Promise<any> => {
  await firebasePromise;
  return firebaseApp;
};

// Firebase Auth Service using Web SDK
export class FirebaseAuthService {
  static async signInWithGoogle(): Promise<{ user: any; idToken: string }> {
    try {
      console.log('Google Sign-In not implemented in web version');
      throw new Error('Google Sign-In is currently only supported on web. Please use email/password authentication.');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  static async signInWithEmail(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      console.log('=== FIREBASE WEB SIGN-IN ===');
      console.log('Email:', email);
      
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const authInstance = await getFirebaseAuth();
      
      console.log('Auth instance ready, signing in...');
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      const user = userCredential.user;
      
      console.log('Sign-in successful:', user.uid);
      
      // Get ID token
      const idToken = await user.getIdToken();
      console.log('ID token generated (length):', idToken.length);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          idToken: idToken
        }
      };
    } catch (error: any) {
      console.error('Firebase sign-in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async createUserWithEmail(email: string, password: string): Promise<{ user: any; idToken: string }> {
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const authInstance = await getFirebaseAuth();
      
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      return {
        user: userCredential.user,
        idToken
      };
    } catch (error) {
      console.error('Email Registration Error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      const { signOut } = await import('firebase/auth');
      const authInstance = await getFirebaseAuth();
      await signOut(authInstance);
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<any | null> {
    const authInstance = await getFirebaseAuth();
    return authInstance.currentUser;
  }

  static async getIdToken(): Promise<string | null> {
    const authInstance = await getFirebaseAuth();
    const user = authInstance.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  static async onAuthStateChanged(callback: (user: any | null) => void) {
    const { onAuthStateChanged } = await import('firebase/auth');
    const authInstance = await getFirebaseAuth();
    return onAuthStateChanged(authInstance, callback);
  }
}

export default FirebaseAuthService;
