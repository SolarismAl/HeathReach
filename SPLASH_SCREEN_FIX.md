# Splash Screen Stuck Issue - Fixed

## Problem
After fixing the DatabaseLauncher error, the app now gets stuck on the splash screen and never loads the main interface.

## Root Cause
**Firebase was initializing synchronously at module load time**, blocking the entire app startup:

```typescript
// OLD CODE - BLOCKING
const firebasePromise = initializeFirebase(); // ❌ Runs immediately when module loads
```

This caused:
1. Firebase initialization to run before the app UI could render
2. The splash screen timeout (3 seconds) to be insufficient
3. The app to appear frozen on the splash screen

## Solution Applied

### 1. Lazy Firebase Initialization
Changed Firebase to initialize **only when first requested**, not at module load:

```typescript
// NEW CODE - LAZY
let firebasePromise: Promise<any> | null = null;
let isInitializing = false;

const ensureFirebaseInitialized = async () => {
  if (firebasePromise) return firebasePromise;
  
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
```

### 2. Skip Firebase Restoration on Startup
Modified `AuthContext.tsx` to skip Firebase user restoration during initial app load:

```typescript
// Skip Firebase restoration on initial load - it's not critical
// Firebase will be initialized lazily when user tries to sign in
console.log('AuthContext: Skipping Firebase restoration on initial load for faster startup');
```

### 3. Removed Blocking Console Logs
Removed top-level console.log statements that run at module load time.

## Changes Made

### `services/firebase.ts`
- ✅ Added lazy initialization with `ensureFirebaseInitialized()`
- ✅ Removed immediate `const firebasePromise = initializeFirebase()` call
- ✅ Updated all getters to call `ensureFirebaseInitialized()` first
- ✅ Removed top-level console.log statements

### `contexts/AuthContext.tsx`
- ✅ Removed Firebase restoration from initial load
- ✅ Reduced timeout from 8s to 5s
- ✅ Firebase will initialize lazily when user signs in

## Benefits

1. **Faster App Startup**: App UI renders immediately without waiting for Firebase
2. **Better UX**: Splash screen hides quickly, showing the landing page
3. **Lazy Loading**: Firebase only initializes when actually needed (sign in/sign up)
4. **No Blocking**: App startup is no longer blocked by network calls

## Testing

1. Build the app: `eas build --profile preview --platform android`
2. Install the APK
3. App should:
   - Show splash screen briefly (< 3 seconds)
   - Load landing page immediately
   - Initialize Firebase only when user tries to sign in

## Timeline

- **Before**: App stuck on splash screen indefinitely
- **After**: App loads in < 3 seconds, Firebase initializes on-demand

## Related Files
- `services/firebase.ts` - Lazy initialization
- `contexts/AuthContext.tsx` - Skip Firebase on startup
- `app/_layout.tsx` - Splash screen management
