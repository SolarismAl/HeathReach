# Why It Works Locally But Fails in Production Build

## The Critical Difference

### **Local Development (Works ✅)**
```bash
npx expo start
# or
npm start
```

**What Happens:**
1. Expo Dev Client runs with **Metro bundler**
2. Environment variables loaded from `.env` file **in real-time**
3. Firebase initialized with correct config
4. Token exchange works because Firebase SDK has full access
5. Hot reload allows immediate testing of changes

### **Production Build (Fails ❌)**
```bash
eas build --platform android --profile production
```

**What Happens:**
1. App compiled into **standalone binary** (APK/AAB)
2. Environment variables **MUST be embedded at build time**
3. `.env` file **NOT included** in production build
4. Firebase config might be missing or incorrect
5. Token exchange fails silently

---

## Root Causes

### 1. **Environment Variables Not Embedded**

**Problem:**
```typescript
// services/api.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
```

**Local:** `.env` file is read → `EXPO_PUBLIC_API_URL` = your deployed API  
**Build:** `.env` not included → Falls back to `http://127.0.0.1:8000/api` ❌

**Result:** App tries to connect to `localhost` which doesn't exist on mobile device!

### 2. **Firebase Configuration Missing**

**Problem:**
```typescript
// services/firebase.ts
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ... other config
};
```

**Local:** All Firebase env vars loaded from `.env`  
**Build:** Env vars undefined → Firebase initialization fails ❌

**Result:** Token exchange fails because Firebase SDK can't initialize!

### 3. **AsyncStorage Timing Issues**

**Problem:**
On production builds, AsyncStorage operations are slower due to:
- No Metro bundler optimization
- Real device storage I/O
- Background app state management

**Local:** Fast storage access, immediate token retrieval  
**Build:** Slower storage, token might not be ready when API call happens ❌

### 4. **Network Security Policies**

**Problem:**
Android/iOS have strict network security policies in production:

**Local:** Development mode allows all HTTP/HTTPS connections  
**Build:** Production enforces:
- HTTPS only (no HTTP)
- Certificate validation
- Network security config

**Result:** If your API uses HTTP or has SSL issues, it fails in production!

---

## How to Fix

### **Fix 1: Embed Environment Variables in Build**

Update `eas.json` to include environment variables:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://healthreach-api.onrender.com/api",
        "EXPO_PUBLIC_FIREBASE_API_KEY": "your-api-key",
        "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN": "your-project.firebaseapp.com",
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "your-project-id",
        "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET": "your-project.appspot.com",
        "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "your-sender-id",
        "EXPO_PUBLIC_FIREBASE_APP_ID": "your-app-id"
      }
    }
  }
}
```

**Or use EAS Secrets (Recommended):**

```bash
# Set secrets in EAS
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://healthreach-api.onrender.com/api"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your-api-key"
# ... repeat for all Firebase config vars

# Then reference in eas.json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "$EXPO_PUBLIC_API_URL",
        "EXPO_PUBLIC_FIREBASE_API_KEY": "$EXPO_PUBLIC_FIREBASE_API_KEY"
        // ... etc
      }
    }
  }
}
```

### **Fix 2: Add Fallback Configuration**

Update `services/api.ts` with production fallbacks:

```typescript
constructor() {
  // PRODUCTION FALLBACK: Hardcode production API URL
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
                       'https://healthreach-api.onrender.com/api'; // ✅ Production URL
  
  console.log('API Base URL:', API_BASE_URL);
  
  // Verify we're not using localhost in production
  if (API_BASE_URL.includes('127.0.0.1') || API_BASE_URL.includes('localhost')) {
    console.error('⚠️ WARNING: Using localhost in production build!');
  }
  
  this.baseURL = API_BASE_URL;
  // ... rest of constructor
}
```

### **Fix 3: Add Firebase Config Validation**

Update `services/firebase.ts`:

```typescript
// Validate Firebase config before initialization
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_PRODUCTION_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'your-sender-id',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'your-app-id',
};

// Validate config
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
  console.error('❌ Firebase API Key missing! Check environment variables.');
}

console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✅ Present' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Present' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Present' : '❌ Missing',
});
```

### **Fix 4: Improve Token Retrieval Reliability**

Already implemented in the previous fix, but here's why it helps:

```typescript
// PRIORITY 1: Check stored token first (most reliable)
const firebaseToken = await AsyncStorage.getItem('firebase_id_token');
if (firebaseToken) {
  return firebaseToken; // ✅ Fast, reliable, works in production
}

// PRIORITY 2: Try to get fresh token (might fail in production)
const currentUser = await CustomAuthService.getCurrentUser();
if (currentUser) {
  const freshToken = await currentUser.getIdToken();
  return freshToken;
}
```

**Why this helps:**
- Stored tokens are immediately available (no Firebase SDK dependency)
- Reduces reliance on Firebase initialization timing
- Works even if Firebase SDK has issues in production

---

## Testing Strategy

### **1. Test with Preview Build First**

```bash
# Build preview APK (faster than production)
eas build --platform android --profile preview

# Install and test on real device
# Check console logs via adb logcat or Expo dev tools
```

### **2. Add Debug Logging**

Add this to your app startup:

```typescript
// app/_layout.tsx
useEffect(() => {
  const debugEnvironment = async () => {
    console.log('=== ENVIRONMENT DEBUG ===');
    console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
    console.log('Firebase API Key:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing');
    
    const storedToken = await AsyncStorage.getItem('firebase_id_token');
    console.log('Stored Token:', storedToken ? 'Present' : 'Missing');
  };
  
  debugEnvironment();
}, []);
```

### **3. Use Remote Debugging**

```bash
# Connect device via USB
adb devices

# View logs in real-time
adb logcat | grep -i "healthreach\|firebase\|token"
```

---

## Quick Checklist

Before building for production:

- [ ] Environment variables defined in `eas.json` or as EAS secrets
- [ ] API URL points to production backend (not localhost)
- [ ] Firebase config has all required fields
- [ ] Tested with preview build first
- [ ] Verified token storage after login
- [ ] Checked console logs for errors
- [ ] Backend API is accessible via HTTPS
- [ ] Firebase project allows your app's package name

---

## Common Symptoms & Solutions

### Symptom: "Authorization token is required"
**Cause:** Token not stored or retrieved properly  
**Solution:** Check token storage priority (use stored token first)

### Symptom: "Network request failed"
**Cause:** API URL is localhost or unreachable  
**Solution:** Verify `EXPO_PUBLIC_API_URL` in build config

### Symptom: "Firebase initialization failed"
**Cause:** Firebase config missing or incorrect  
**Solution:** Add Firebase env vars to `eas.json`

### Symptom: Works in Expo Go, fails in standalone
**Cause:** Expo Go has different environment handling  
**Solution:** Always test with preview/production builds

---

## The Bottom Line

**Local Development:**
- `.env` file loaded dynamically ✅
- Metro bundler optimizations ✅
- Fast iteration and debugging ✅
- Lenient network policies ✅

**Production Build:**
- Environment variables must be embedded at build time ⚠️
- No `.env` file in binary ⚠️
- Strict network security ⚠️
- Slower storage operations ⚠️

**Solution:** Explicitly configure environment variables in `eas.json` and add production fallbacks in code.
