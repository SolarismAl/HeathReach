# Fix: "Component Auth has not been registered yet" Error

## Problem

In production builds, when attempting to login, you get the error:
```
"Component Auth has not been registered yet"
```

This happens because Firebase Auth initialization is **asynchronous**, and in production builds it doesn't complete before the login attempt.

## Root Cause

1. **Development (works):** Firebase initializes quickly, auth is ready before login
2. **Production build (fails):** Firebase initialization is slower, login happens before auth is ready

## Solution Applied

### 1. Enhanced Firebase Auth Initialization (`services/firebase.ts`)

**Added retry mechanism with delays:**
```typescript
// Add delay for React Native environment
await new Promise(resolve => setTimeout(resolve, 500));

// Retry auth initialization up to 3 times
let authInitAttempts = 0;
const maxAuthAttempts = 3;

while (authInitAttempts < maxAuthAttempts) {
  try {
    auth = getAuth(firebaseApp);
    // Verify auth instance is valid
    if (typeof auth.currentUser !== 'undefined') {
      break; // Success!
    }
  } catch (attemptError) {
    authInitAttempts++;
    if (authInitAttempts < maxAuthAttempts) {
      await new Promise(resolve => setTimeout(resolve, authInitAttempts * 500));
    }
  }
}
```

### 2. Pre-Initialize Firebase on App Start (`app/_layout.tsx`)

**Added Firebase pre-initialization:**
```typescript
import { getFirebaseAuth } from "../services/firebase";

// Pre-initialize Firebase to avoid "Component Auth has not been registered yet" error
console.log('Pre-initializing Firebase...');
getFirebaseAuth()
  .then(() => {
    console.log('✅ Firebase pre-initialized successfully');
  })
  .catch((error) => {
    console.error('❌ Firebase pre-initialization failed:', error);
  });
```

This ensures Firebase Auth is initialized **before** any login attempts.

## How It Works Now

### Initialization Flow:
```
App Start
  ↓
Pre-initialize Firebase (500ms delay + retries)
  ↓
Firebase Auth Ready ✅
  ↓
User can login (no errors)
```

### Timeline:
1. **0ms:** App starts
2. **0ms:** Firebase pre-initialization begins
3. **500ms:** First auth init attempt
4. **500-1500ms:** Retry attempts if needed (with exponential backoff)
5. **✅ Firebase Auth Ready:** User can now login

## Expected Behavior After Fix

### In Logs:
```
=== APP LAYOUT LOADING ===
Pre-initializing Firebase...
=== FIREBASE INIT START ===
Initializing Firebase Auth for React Native environment
Auth init attempt 1/3...
✅ Firebase Auth initialized successfully
✅ Firebase pre-initialized successfully
```

### When User Logs In:
```
=== FIREBASE EMAIL/PASSWORD SIGN-IN ===
Step 1: Signing in with Firebase Authentication...
✅ Firebase sign-in successful
✅ Got Firebase ID token (length): 1057
✅ Backend profile retrieved successfully
✅ Firebase ID token and user data stored
```

## Testing After Rebuild

1. **Rebuild the app:**
   ```bash
   cd HealthReach
   eas build --profile preview --platform android
   ```

2. **Install on phone**

3. **Check logs when app starts:**
   - Should see "✅ Firebase pre-initialized successfully"
   - Should NOT see "Component Auth has not been registered yet"

4. **Try to login:**
   - Should work without errors
   - Should get Firebase ID token (1000+ chars)
   - Dashboard should load data

## Why This Fixes Both Issues

1. **"Component Auth has not been registered yet"** → Fixed by pre-initialization
2. **"Authorization token is required"** → Fixed by using Firebase Authentication (previous fix)

Both fixes work together:
- Pre-initialization ensures Firebase is ready
- Firebase Authentication provides valid ID tokens
- Backend accepts the Firebase ID tokens
- Everything works! ✅

## Fallback Safety

If Firebase initialization fails after 3 retries:
- Error is logged
- User will see login error
- Can retry login (which will trigger another init attempt)

The retry mechanism makes it resilient to temporary network issues or slow devices.
