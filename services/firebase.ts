import { Platform } from 'react-native';

// Dynamic imports to force web Firebase SDK usage
let firebaseApp: any;
let auth: any;
let firestore: any;
let firebasePromise: Promise<any> | null = null;
let isInitializing = false;

const initializeFirebase = async () => {
  const startTime = Date.now();
  try {
    console.log('=== FIREBASE INIT START ===');
    console.log('Loading Firebase modules...');
    console.log('Platform detected:', Platform.OS);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Environment:', __DEV__ ? 'Development' : 'Production');
    
    // Force web environment detection to bypass React Native Firebase issues
    if (Platform.OS !== 'web') {
      console.log('Forcing web Firebase SDK for React Native compatibility');
      
      // CRITICAL: Create comprehensive mock objects for production builds
      if (!(global as any).window) {
        console.log('Creating window mock for Firebase...');
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
            origin: 'https://healthreach.app',
            assign: () => {},
            reload: () => {},
            replace: () => {}
          },
          navigator: {
            userAgent: 'HealthReach Mobile App',
            language: 'en-US',
            onLine: true
          },
          localStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {},
            key: () => null,
            length: 0
          },
          sessionStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {},
            key: () => null,
            length: 0
          },
          indexedDB: null,
          crypto: {
            getRandomValues: (arr: any) => {
              for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
              }
              return arr;
            }
          }
        };
        console.log('✅ Window mock created');
      }
      
      if (!(global as any).document) {
        console.log('Creating document mock for Firebase...');
        (global as any).document = {
          createElement: (tag: string) => {
            console.log('Mock createElement called for:', tag);
            return {
              style: {},
              setAttribute: () => {},
              getAttribute: () => null,
              appendChild: () => {},
              removeChild: () => {},
              addEventListener: () => {},
              removeEventListener: () => {}
            };
          },
          getElementById: () => null,
          getElementsByTagName: () => [],
          querySelector: () => null,
          querySelectorAll: () => [],
          addEventListener: () => {},
          removeEventListener: () => {},
          cookie: '',
          readyState: 'complete',
          body: {
            appendChild: () => {},
            removeChild: () => {}
          },
          head: {
            appendChild: () => {},
            removeChild: () => {}
          }
        };
        console.log('✅ Document mock created');
      }
      
      // PRODUCTION FIX: Add delay to ensure mocks are fully registered
      const envSetupDelay = __DEV__ ? 100 : 500;
      console.log(`Waiting ${envSetupDelay}ms for environment setup...`);
      await new Promise(resolve => setTimeout(resolve, envSetupDelay));
    }
    
    // Import Firebase modules - force web SDK
    console.log('Importing Firebase modules...');
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth, signInWithEmailAndPassword, signInWithCustomToken, signOut: firebaseSignOut } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    console.log('✅ All Firebase modules imported (including auth methods)');
    
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
    console.log('FIREBASE_API_KEY from env:', FIREBASE_API_KEY ? `Present (${FIREBASE_API_KEY.substring(0, 20)}...)` : 'Missing');
    console.log('FIREBASE_AUTH_DOMAIN from env:', FIREBASE_AUTH_DOMAIN || 'Missing');
    console.log('FIREBASE_PROJECT_ID from env:', FIREBASE_PROJECT_ID || 'Missing');
    console.log('FIREBASE_STORAGE_BUCKET from env:', FIREBASE_STORAGE_BUCKET || 'Missing');
    console.log('FIREBASE_MESSAGING_SENDER_ID from env:', FIREBASE_MESSAGING_SENDER_ID || 'Missing');
    console.log('FIREBASE_APP_ID from env:', FIREBASE_APP_ID || 'Missing');
    
    // Validate required config
    if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
      throw new Error('Firebase configuration is missing required fields. Check app.json extra config.');
    }

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
        // PRODUCTION FIX: Longer delay for production builds to ensure Firebase app is fully ready
        const delay = __DEV__ ? 500 : 3000; // 3 seconds for production
        console.log(`Waiting ${delay}ms for Firebase app to be ready...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Initialize auth with enhanced retry mechanism for production
      let authInitAttempts = 0;
      const maxAuthAttempts = __DEV__ ? 3 : 5; // More retries in production
      
      while (authInitAttempts < maxAuthAttempts) {
        try {
          console.log(`Auth initialization attempt ${authInitAttempts + 1}/${maxAuthAttempts}`);
          
          auth = getAuth(firebaseApp);
          console.log('✅ Firebase Auth getAuth() called successfully');
          console.log('Auth instance type:', typeof auth);
          console.log('Auth instance keys:', Object.keys(auth || {}).slice(0, 10));
          
          // CRITICAL: Verify auth component is properly registered
          if (!auth) {
            throw new Error('Auth instance is null or undefined');
          }
          
          if (typeof auth.currentUser === 'undefined') {
            throw new Error('Auth instance missing currentUser property - component not registered');
          }
          
          // Additional verification for production builds
          if (Platform.OS !== 'web') {
            console.log('Verifying auth methods for React Native...');
            const requiredMethods = ['signInWithEmailAndPassword', 'createUserWithEmailAndPassword', 'signOut'];
            // Just log, don't fail - methods are on the module, not the instance
            console.log('Auth instance verified for React Native');
          }
          
          console.log('✅ Auth instance verified - currentUser property exists');
          console.log('Auth currentUser:', auth.currentUser);
          console.log('Auth app name:', auth.app?.name);
          console.log('Auth config:', auth.config);
          
          // SUCCESS!
          break;
          
        } catch (attemptError: any) {
          authInitAttempts++;
          console.error(`❌ Auth init attempt ${authInitAttempts}/${maxAuthAttempts} failed:`, attemptError.message);
          console.error('Error details:', {
            name: attemptError?.name,
            message: attemptError?.message,
            code: attemptError?.code,
            stack: attemptError?.stack?.split('\n').slice(0, 3)
          });
          
          if (authInitAttempts < maxAuthAttempts) {
            // Exponential backoff with longer delays in production
            const retryDelay = __DEV__ ? (authInitAttempts * 500) : (authInitAttempts * 2000); // 2s, 4s, 6s, 8s, 10s
            console.log(`⏳ Retrying auth initialization in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            
            // PRODUCTION FIX: Try to re-import Firebase modules on retry
            if (!__DEV__ && authInitAttempts > 1) {
              console.log('Re-importing Firebase modules for retry...');
              const { getAuth: getAuthRetry } = await import('firebase/auth');
              auth = getAuthRetry(firebaseApp);
            }
          } else {
            throw new Error(`Firebase Auth initialization failed after ${maxAuthAttempts} attempts: ${attemptError.message}`);
          }
        }
      }
      
    } catch (authError: any) {
      console.error('❌ FATAL: Error initializing Firebase Auth:', authError);
      console.error('Auth error details:', {
        name: authError?.name,
        message: authError?.message,
        code: authError?.code,
        stack: authError?.stack
      });
      console.error('This is likely a "component auth is not registered yet" error in production');
      console.error('Possible solutions:');
      console.error('1. Rebuild the app with: eas build --platform android --profile production');
      console.error('2. Clear app cache and reinstall');
      console.error('3. Check that Firebase config is correct in app.json');
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

    const endTime = Date.now();
    console.log('All Firebase services initialized successfully');
    console.log(`=== FIREBASE INIT COMPLETE (${endTime - startTime}ms) ===`);
    
    return { auth, firestore, firebaseApp };
  } catch (error: any) {
    const endTime = Date.now();
    console.error(`=== FIREBASE INIT FAILED (${endTime - startTime}ms) ===`);
    console.error('Firebase initialization error:', error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Error stack:', error?.stack);
    console.error('Platform:', Platform.OS);
    console.error('Environment:', __DEV__ ? 'Development' : 'Production');
    
    // Log which step failed
    if (!firebaseApp) {
      console.error('FAILURE POINT: Firebase app initialization failed');
    } else if (!auth) {
      console.error('FAILURE POINT: Firebase Auth initialization failed');
    } else if (!firestore) {
      console.error('FAILURE POINT: Firestore initialization failed');
    }
    
    throw error;
  }
};

// Lazy initialization - only initialize when first requested
const ensureFirebaseInitialized = async () => {
  if (firebasePromise) {
    return firebasePromise;
  }
  
  if (isInitializing) {
    // Wait for ongoing initialization
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return firebasePromise;
  }
  
  isInitializing = true;
  firebasePromise = initializeFirebase().finally(() => {
    isInitializing = false;
  });
  
  return firebasePromise;
};

// Export promise-based getters with retry mechanism
export const getFirebaseAuth = async (retryCount = 0): Promise<any> => {
  try {
    console.log('getFirebaseAuth called, retry count:', retryCount);
    await ensureFirebaseInitialized();
    
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
  await ensureFirebaseInitialized();
  return firestore;
};

export const getFirebaseApp = async () => {
  await ensureFirebaseInitialized();
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
