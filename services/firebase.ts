import { Platform } from 'react-native';

console.log('=== FIREBASE INITIALIZATION ===');
console.log('Platform.OS:', Platform.OS);

// Dynamic imports to force web Firebase SDK usage
let firebaseApp: any;
let auth: any;
let firestore: any;

const initializeFirebase = async () => {
  try {
    console.log('Loading Firebase modules...');
    console.log('Platform detected:', Platform.OS);
    
    // Force web environment detection to bypass React Native Firebase issues
    if (Platform.OS !== 'web') {
      console.log('Forcing web Firebase SDK for React Native compatibility');
      // Create proper mock objects with required properties for Firebase and routing
      if (!(global as any).window) {
        (global as any).window = {
          location: {
            href: 'https://healthreach.app',
            protocol: 'https:',
            host: 'healthreach.app',
            hostname: 'healthreach.app',
            port: '',
            pathname: '/',
            search: '',
            hash: '',
            origin: 'https://healthreach.app'
          },
          navigator: {
            userAgent: 'HealthReach Mobile App'
          },
          localStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {}
          },
          sessionStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {}
          }
        };
      }
      if (!(global as any).document) {
        (global as any).document = {
          createElement: () => ({}),
          getElementById: () => null,
          getElementsByTagName: () => [],
          addEventListener: () => {},
          removeEventListener: () => {},
          cookie: '',
          readyState: 'complete'
        };
      }
    }
    
    // Import Firebase modules - force web SDK
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    
    console.log('Firebase modules loaded successfully');
    const { 
      FIREBASE_API_KEY, 
      FIREBASE_AUTH_DOMAIN, 
      FIREBASE_PROJECT_ID, 
      FIREBASE_STORAGE_BUCKET, 
      FIREBASE_MESSAGING_SENDER_ID, 
      FIREBASE_APP_ID 
    } = await import('../env');

    // Debug environment variables loading
    console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
    console.log('FIREBASE_API_KEY from env:', FIREBASE_API_KEY ? 'Present' : 'Missing');
    console.log('FIREBASE_AUTH_DOMAIN from env:', FIREBASE_AUTH_DOMAIN ? 'Present' : 'Missing');
    console.log('FIREBASE_PROJECT_ID from env:', FIREBASE_PROJECT_ID ? 'Present' : 'Missing');
    console.log('FIREBASE_STORAGE_BUCKET from env:', FIREBASE_STORAGE_BUCKET ? 'Present' : 'Missing');
    console.log('FIREBASE_MESSAGING_SENDER_ID from env:', FIREBASE_MESSAGING_SENDER_ID ? 'Present' : 'Missing');
    console.log('FIREBASE_APP_ID from env:', FIREBASE_APP_ID ? 'Present' : 'Missing');

    // Firebase configuration
    const firebaseConfig = {
      apiKey: FIREBASE_API_KEY || "AIzaSyCLviE9L1ihRAafW14XH-li4M67CjyFbBc",
      authDomain: FIREBASE_AUTH_DOMAIN || "healthreach-9167b.firebaseapp.com",
      projectId: FIREBASE_PROJECT_ID || "healthreach-9167b",
      storageBucket: FIREBASE_STORAGE_BUCKET || "healthreach-9167b.firebasestorage.app",
      messagingSenderId: FIREBASE_MESSAGING_SENDER_ID || "1035041170898",
      appId: FIREBASE_APP_ID || "1:1035041170898:web:5dd9a3435662835d15940b",
    };

    console.log('Final Firebase Config:', {
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey.substring(0, 20) + '...' // Hide full API key
    });

    // Initialize Firebase app
    console.log('Initializing Firebase app...');
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('Firebase app initialized successfully');
    } else {
      firebaseApp = getApps()[0];
      console.log('Using existing Firebase app');
    }

    // Initialize Firebase services with error handling
    console.log('Initializing Firebase Auth...');
    try {
      // For React Native, we need to be more careful about auth initialization
      if (Platform.OS !== 'web') {
        console.log('Initializing Firebase Auth for React Native environment');
        // Add a small delay to ensure proper initialization
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      auth = getAuth(firebaseApp);
      console.log('Firebase Auth initialized successfully');
      console.log('Auth instance created');
      
      // Verify auth is working
      console.log('Auth currentUser:', auth.currentUser);
      
    } catch (authError: any) {
      console.error('Error initializing Firebase Auth:', authError);
      console.error('Auth error details:', {
        name: authError?.name,
        message: authError?.message,
        code: authError?.code
      });
      throw authError;
    }

    console.log('Initializing Firestore...');
    try {
      firestore = getFirestore(firebaseApp);
      console.log('Firestore initialized successfully');
    } catch (firestoreError) {
      console.error('Error initializing Firestore:', firestoreError);
      throw firestoreError;
    }

    console.log('All Firebase services initialized successfully');
    
    return { auth, firestore, firebaseApp };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

// Initialize Firebase immediately
const firebasePromise = initializeFirebase();

// Export promise-based getters with retry mechanism
export const getFirebaseAuth = async (retryCount = 0): Promise<any> => {
  try {
    console.log('getFirebaseAuth called, retry count:', retryCount);
    await firebasePromise;
    
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    console.log('Firebase Auth retrieved successfully');
    return auth;
  } catch (error) {
    console.error('Error getting Firebase Auth:', error);
    
    // Retry up to 3 times with delay
    if (retryCount < 3) {
      console.log(`Retrying Firebase Auth initialization (attempt ${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return getFirebaseAuth(retryCount + 1);
    }
    
    throw error;
  }
};

export const getFirebaseFirestore = async () => {
  await firebasePromise;
  return firestore;
};

export const getFirebaseApp = async () => {
  await firebasePromise;
  return firebaseApp;
};

// Note: Direct exports removed to prevent synchronous Firebase initialization
// Use getFirebaseAuth() and getFirebaseFirestore() instead

// Firebase Auth Service using Web SDK (works for both web and mobile in Expo)
export class FirebaseAuthService {
  static async signInWithGoogle(): Promise<{ user: any; idToken: string }> {
    try {
      if (Platform.OS === 'web') {
        console.log('Running in web environment, using Firebase popup');
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const authInstance = await getFirebaseAuth();
        
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        provider.setCustomParameters({
          prompt: 'select_account',
          access_type: 'offline'
        });
        
        const result = await signInWithPopup(authInstance, provider);
        const idToken = await result.user.getIdToken();
        
        return {
          user: result.user,
          idToken
        };
      } else {
        // For mobile/native environment
        console.log('Running in mobile environment');
        throw new Error('Google Sign-In is currently only supported on web. Please use email/password authentication or try the web version at localhost:8081 in your browser.');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  static async signInWithEmail(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      console.log('=== FIREBASE MOBILE SIGN-IN DEBUG ===');
      console.log('Platform.OS:', Platform.OS);
      console.log('Attempting to sign in with email:', email);
      
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const authInstance = await getFirebaseAuth();
      
      console.log('Firebase auth instance:', authInstance);
      console.log('Firebase app config:', authInstance.app.options);
      
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      const user = userCredential.user;
      
      console.log('Firebase sign-in successful:', user.uid);
      console.log('User email verified:', user.emailVerified);
      console.log('User provider data:', user.providerData);
      
      // Get Firebase ID token with detailed debugging
      console.log('Getting Firebase ID token...');
      const idToken = await user.getIdToken();
      console.log('Got Firebase ID token (length):', idToken.length);
      console.log('Firebase ID token (first 100 chars):', idToken.substring(0, 100) + '...');
      
      // Decode token to check claims (for debugging only)
      try {
        const tokenParts = idToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Token payload (claims):', {
            iss: payload.iss,
            aud: payload.aud,
            sub: payload.sub,
            exp: payload.exp,
            iat: payload.iat,
            firebase: payload.firebase
          });
        }
      } catch (decodeError) {
        console.error('Error decoding token for debugging:', decodeError);
      }
      
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
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async createUserWithEmail(email: string, password: string): Promise<{ user: any; idToken: string }> {
    try {
      console.log('Creating user with email:', email);
      
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const authInstance = await getFirebaseAuth();
      
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      console.log('User created successfully:', userCredential.user.uid);
      
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
      console.log('FirebaseAuthService: Starting Firebase sign out...');
      
      const { signOut } = await import('firebase/auth');
      const authInstance = await getFirebaseAuth();
      
      await signOut(authInstance);
      
      console.log('FirebaseAuthService: Firebase sign out successful');
    } catch (error) {
      console.error('FirebaseAuthService: Sign Out Error:', error);
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
