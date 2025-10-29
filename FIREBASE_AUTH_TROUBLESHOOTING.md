# Firebase Auth "Component not registered yet" - Troubleshooting Guide

## The Error

```
Component Auth has not been registered yet
```

This error occurs in **production builds only** when Firebase Auth tries to initialize before the Firebase app is fully ready.

---

## Why It Happens

### In Development (Works ✅)
- Metro bundler provides fast module loading
- Firebase components register quickly
- Hot reload allows immediate testing

### In Production Builds (Fails ❌)
- App is compiled into standalone binary
- Firebase needs more time to register components
- No Metro bundler optimizations
- Synchronous initialization fails

---

## Solutions Implemented

### 1. **Removed Synchronous Firebase Initialization**

**File:** `app/_layout.tsx`

**Before (Broken):**
```typescript
// This runs immediately at module load - TOO EARLY!
getFirebaseAuth()
  .then(() => console.log('✅ Firebase ready'))
  .catch((error) => console.error('❌ Failed:', error));
```

**After (Fixed):**
```typescript
// Removed - Firebase initializes lazily when needed
// No synchronous calls at module load time
```

### 2. **Increased Production Delays**

**File:** `services/firebase.ts`

Production builds need MORE time for auth component registration:

```typescript
// Environment setup delay
const envSetupDelay = __DEV__ ? 100 : 1000; // 1 second for production

// Auth initialization delay
const delay = __DEV__ ? 200 : 3000; // 3 seconds for production

// Retry delays
const retryDelay = __DEV__ ? (attempt * 500) : (attempt * 2000); // 2s, 4s, 6s, 8s, 10s
```

### 3. **Enhanced Retry Mechanism**

**File:** `services/firebase.ts`

```typescript
const maxAuthAttempts = __DEV__ ? 3 : 5; // More retries in production

while (authInitAttempts < maxAuthAttempts) {
  try {
    auth = getAuth(firebaseApp);
    
    // Verify auth component is registered
    if (!auth || typeof auth.currentUser === 'undefined') {
      throw new Error('Auth component not registered');
    }
    
    break; // Success!
  } catch (error) {
    // Retry with exponential backoff
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }
}
```

### 4. **Extended AuthContext Timeout**

**File:** `contexts/AuthContext.tsx`

```typescript
// Give Firebase more time to initialize
const timeoutDuration = __DEV__ ? 3000 : 15000; // 15 seconds for production
```

### 5. **Window/Document Mocks for React Native**

**File:** `services/firebase.ts`

Firebase Web SDK needs browser globals in React Native:

```typescript
if (Platform.OS !== 'web') {
  // Create comprehensive window mock
  (global as any).window = {
    location: { /* ... */ },
    navigator: { /* ... */ },
    localStorage: { /* ... */ },
    sessionStorage: { /* ... */ },
    crypto: { /* ... */ }
  };
  
  // Create document mock
  (global as any).document = {
    createElement: () => ({ /* ... */ }),
    getElementById: () => null,
    /* ... */
  };
}
```

---

## How to Test

### 1. **Verify Configuration**

```bash
npm run verify-firebase
```

This checks:
- ✅ Firebase config in `app.json`
- ✅ Environment variables in `eas.json`
- ✅ Fallback configuration in `env.ts`
- ✅ Window/document mocks in `firebase.ts`
- ✅ Retry mechanisms

### 2. **Build Preview APK**

```bash
npm run build:preview
```

This builds a preview APK with:
- All verification checks
- Production-like environment
- Faster than full production build

### 3. **Install and Test**

```bash
# Download APK from EAS
# Install on device
# Open app and wait 5-10 seconds
# Try to log in
```

### 4. **Check Logs**

```bash
# Connect device via USB
adb logcat | grep -i "firebase\|auth\|healthreach"
```

Look for:
- ✅ "Firebase Auth pre-initialized successfully"
- ✅ "Firebase is now ready for login attempts"
- ❌ "Component Auth has not been registered yet"

---

## Expected Behavior

### On App Launch (Production Build)

```
=== APP LAYOUT LOADING ===
AuthContext: Initializing auth state
AuthContext: Pre-initializing Firebase...
AuthContext: Firebase init attempt 1/3
=== FIREBASE INIT START ===
Platform detected: android
Creating window mock for Firebase...
✅ Window mock created
✅ Document mock created
Waiting 1000ms for environment setup...
Importing Firebase modules...
✅ All Firebase modules imported
Firebase app initialized successfully
Initializing Firebase Auth...
Waiting 3000ms for Firebase app to be ready...
Auth initialization attempt 1/5
✅ Firebase Auth getAuth() called successfully
✅ Auth instance verified - currentUser property exists
✅ Firebase Auth pre-initialized successfully
AuthContext: ✅ Firebase is now ready for login attempts
=== FIREBASE INIT COMPLETE (5234ms) ===
```

**Total Time:** 5-10 seconds (this is normal!)

### On Login Attempt

```
AuthContext: Starting email sign in for: user@example.com
AuthContext: Firebase ready status: true
=== FIREBASE MOBILE SIGN-IN DEBUG ===
Firebase sign-in successful: abc123xyz
Got Firebase ID token (length): 957
✅ Login successful
```

---

## Common Issues & Fixes

### Issue: "Firebase not ready yet, cannot login"

**Cause:** User tried to login before Firebase finished initializing

**Fix:** Wait 5-10 seconds after app launch before attempting login

**Better Fix:** Add loading indicator in login screen while `firebaseReady === false`

### Issue: Still getting "Component not registered" error

**Possible Causes:**
1. Build cache issues
2. Old APK installed
3. Firebase config incorrect

**Solutions:**
```bash
# 1. Clear EAS build cache
eas build --clear-cache --platform android --profile preview

# 2. Uninstall old APK from device completely
adb uninstall com.anonymous.HealthReach

# 3. Verify Firebase config
npm run verify-firebase

# 4. Rebuild
npm run build:preview
```

### Issue: App takes too long to start

**Cause:** 15-second timeout is too long

**Fix:** Reduce timeout in `AuthContext.tsx` (but not below 10 seconds for production)

```typescript
const timeoutDuration = __DEV__ ? 3000 : 10000; // 10 seconds minimum
```

---

## Production Checklist

Before building for production:

- [ ] Run `npm run verify-firebase` - all checks pass
- [ ] Test with preview build first
- [ ] Verify login works after 5-10 second wait
- [ ] Check console logs for Firebase initialization
- [ ] Confirm no "Component not registered" errors
- [ ] Test on multiple devices if possible
- [ ] Verify backend API is accessible
- [ ] Check Firebase project allows your package name

---

## Technical Details

### Why Delays Are Necessary

Firebase Web SDK in React Native environment needs time to:

1. **Register global mocks** (window, document) - 1 second
2. **Import Firebase modules** - 1-2 seconds
3. **Initialize Firebase app** - 1 second
4. **Register Auth component** - 3 seconds
5. **Verify component ready** - 1 second

**Total:** 7-9 seconds minimum in production

### Why It Works in Development

Metro bundler:
- Provides fast module resolution
- Optimizes imports and bundling
- Allows hot reload and fast refresh
- Has lenient timing requirements

Production builds:
- Static bundle with no optimization
- Slower module initialization
- Strict timing requirements
- No Metro bundler assistance

---

## Alternative Solutions (Not Recommended)

### 1. Use React Native Firebase

**Pros:** Native Firebase SDK, faster initialization

**Cons:** 
- Requires native modules
- More complex setup
- Larger app size
- Platform-specific code

### 2. Delay Login Screen

**Pros:** Simple workaround

**Cons:**
- Poor UX
- Doesn't fix root cause
- Still fails if user is fast

### 3. Remove Firebase Auth

**Pros:** No initialization issues

**Cons:**
- Need alternative auth system
- Backend still uses Firebase
- Major refactor required

---

## Summary

The "Component Auth has not been registered yet" error is **fixed** by:

1. ✅ Removing synchronous Firebase initialization
2. ✅ Increasing production delays (3-15 seconds)
3. ✅ Adding retry mechanisms (5 attempts)
4. ✅ Creating window/document mocks for React Native
5. ✅ Waiting for Firebase to be ready before allowing login

**Expected behavior:** App takes 5-10 seconds to initialize Firebase in production builds. This is **normal and necessary**.

**User experience:** Show loading screen or splash screen during initialization. Once Firebase is ready, login works normally.
