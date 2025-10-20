# Diagnosis: "Component auth has not been registered yet" Error

## Error Location
The error occurs when you try to **login** on your mobile app. Specifically:

1. **Login Screen** (`app/auth/index.tsx` line 49) → Calls `signInWithEmail()`
2. **AuthContext** (`contexts/AuthContext.tsx` line 143) → Calls `CustomAuthService.signInWithEmail()`
3. **CustomAuthService** (`services/auth-service.ts` line 25) → Calls `getFirebaseAuth()`
4. **Firebase Service** (`services/firebase.ts` line 189) → Calls `getAuth(firebaseApp)` ❌ **ERROR HERE**

## Root Cause Analysis

### The Problem
Firebase Web SDK requires the auth component to be **registered synchronously** before you can use it. In production builds, the following happens:

1. App starts → AuthContext pre-initializes Firebase (lines 56-67 in AuthContext)
2. User clicks login → Calls `signInWithEmailAndPassword` 
3. Firebase SDK checks if auth component is registered
4. **ERROR**: Component not registered yet because initialization is still async

### Why It Works Locally But Not in Production

| Environment | Behavior |
|------------|----------|
| **Local/Dev** | Metro bundler keeps Firebase initialized, hot reload maintains state, longer timeouts |
| **Production Build** | Strict timing, no hot reload, minification affects timing, Firebase must initialize from scratch |

## Current Code Flow

```
User Login Attempt
    ↓
signInWithEmail() in AuthContext
    ↓
CustomAuthService.signInWithEmail()
    ↓
await getFirebaseAuth() ← Async initialization
    ↓
const { signInWithEmailAndPassword } = await import('firebase/auth')
    ↓
await signInWithEmailAndPassword(auth, email, password) ← ERROR: auth not registered
```

## Issues Found

### 1. **Race Condition in AuthContext**
- Lines 56-67: Pre-initialization happens but doesn't wait for completion
- The `try-catch` swallows errors and continues anyway
- Login can be triggered before Firebase is ready

### 2. **Async Import in auth-service.ts**
- Line 23: `const { signInWithEmailAndPassword } = await import('firebase/auth')`
- This dynamic import happens AFTER `getFirebaseAuth()` is called
- But Firebase auth component needs to be registered BEFORE using auth methods

### 3. **Production Delays Not Long Enough**
- Line 176 in firebase.ts: 1500ms delay might not be enough for cold starts
- Production builds on physical devices can be slower than emulators

### 4. **No Synchronous Initialization Guard**
- Nothing prevents login from being called before Firebase is ready
- No loading state to disable login button during initialization

## The Fix Strategy

We need to ensure Firebase is **fully initialized and ready** before allowing any login attempts:

1. ✅ **Synchronous initialization check** - Block login until Firebase is ready
2. ✅ **Increase production delays** - Give more time for cold starts
3. ✅ **Add initialization state** - Show loading indicator during setup
4. ✅ **Pre-import auth methods** - Import `signInWithEmailAndPassword` during initialization
5. ✅ **Better error handling** - Catch and display meaningful errors

## Verification Steps

After applying fixes, check these logs in order:

```
✅ AuthContext: Pre-initializing Firebase...
✅ Firebase Auth getAuth() called successfully
✅ Auth instance verified - currentUser property exists
✅ AuthContext: Firebase Auth pre-initialized successfully
✅ Firebase sign-in successful
✅ Got Firebase ID token
✅ Backend profile retrieved successfully
```

If you see this error:
```
❌ Auth init attempt 1/5 failed: component auth is not registered yet
```

Then the issue is still present and needs longer delays or different approach.

## Backend Status

Backend API is correctly configured:
- ✅ FirebaseAuthController exists
- ✅ `/api/auth/login` endpoint accepts Firebase ID tokens
- ✅ Backend verifies tokens and returns user profile
- ✅ Deployed to: https://healthreach-api.onrender.com

## Next Steps

1. Apply the fixes in the next response
2. Rebuild the app: `eas build --platform android --profile production --clear-cache`
3. Test on physical device
4. Check logs for the verification steps above
5. If still failing, increase delays further or use different initialization strategy
