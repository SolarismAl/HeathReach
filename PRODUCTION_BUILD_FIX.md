# Production Build Error Fix

## Error Description
```
com.facebook.react.common.JavascriptException: TypeError: Cannot read property 'href' of undefined
```

## Root Causes Identified

### 1. **Empty Mock Objects in Firebase Service** ✅ FIXED
**Location:** `services/firebase.ts` lines 20-22

**Problem:** 
- The code was creating empty `window` and `document` objects for React Native
- When Firebase or expo-router tried to access `window.location.href`, it returned `undefined`
- This caused the "Cannot read property 'href' of undefined" error

**Solution Applied:**
- Created proper mock objects with all required properties:
  - `window.location` with href, protocol, host, pathname, etc.
  - `window.navigator` with userAgent
  - `window.localStorage` and `sessionStorage` with mock methods
  - `document` with createElement, getElementById, etc.

### 2. **Missing Firebase Environment Variables in EAS Build** ✅ FIXED
**Location:** `eas.json`

**Problem:**
- Firebase environment variables were NOT included in the EAS build configuration
- Only API_URL and Google client IDs were present
- This caused Firebase to fail initialization in production builds

**Solution Applied:**
- Added all Firebase environment variables to `eas.json`:
  - `EXPO_PUBLIC_FIREBASE_API_KEY`
  - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `EXPO_PUBLIC_FIREBASE_APP_ID`
- Applied to all build profiles: development, preview, and production

## Files Modified

### 1. `services/firebase.ts`
```typescript
// BEFORE (causing error):
if (Platform.OS !== 'web') {
  (global as any).window = (global as any).window || {};
  (global as any).document = (global as any).document || {};
}

// AFTER (fixed):
if (Platform.OS !== 'web') {
  if (!(global as any).window) {
    (global as any).window = {
      location: {
        href: 'https://healthreach.app',
        protocol: 'https:',
        host: 'healthreach.app',
        // ... all required properties
      },
      navigator: { userAgent: 'HealthReach Mobile App' },
      localStorage: { /* mock methods */ },
      sessionStorage: { /* mock methods */ }
    };
  }
  if (!(global as any).document) {
    (global as any).document = {
      createElement: () => ({}),
      getElementById: () => null,
      // ... all required methods
    };
  }
}
```

### 2. `eas.json`
Added Firebase environment variables to all build profiles:
- `development` build
- `preview` build  
- `production` build

## How to Rebuild

### Option 1: EAS Build (Recommended)
```bash
# Preview build (APK for testing)
eas build --profile preview --platform android

# Production build (AAB for Play Store)
eas build --profile production --platform android
```

### Option 2: Local Build
```bash
# Clear cache first
npx expo start --clear

# Build locally
npx expo run:android --variant release
```

## Testing Checklist

After rebuilding, test the following:

- [ ] App launches without crashing
- [ ] Firebase authentication works (login/register)
- [ ] Navigation between screens works
- [ ] API calls to backend succeed
- [ ] No "Cannot read property 'href'" errors in logs
- [ ] Health centers and services load properly
- [ ] Appointment booking works end-to-end

## Additional Notes

### Why It Worked Locally But Failed in Production

1. **Development Mode:**
   - Uses Metro bundler with hot reload
   - Environment variables loaded from `.env` file
   - More lenient error handling

2. **Production Build:**
   - Code is bundled and minified
   - Environment variables must be in `eas.json`
   - Stricter runtime checks
   - Mock objects must have all required properties

### Prevention for Future

1. **Always test production builds** before releasing:
   ```bash
   eas build --profile preview --platform android
   ```

2. **Keep `eas.json` in sync with `.env`:**
   - Any new environment variable must be added to both files

3. **Test on physical devices:**
   - Emulators may behave differently than real devices

4. **Monitor error logs:**
   - Use Sentry or similar for production error tracking

## Verification Steps

1. **Build the app:**
   ```bash
   eas build --profile preview --platform android
   ```

2. **Download and install the APK**

3. **Check logs while app is running:**
   ```bash
   adb logcat | grep -i "healthreach\|firebase\|javascript"
   ```

4. **Verify Firebase initialization:**
   - Look for "Firebase modules loaded successfully" in logs
   - Check "All Firebase services initialized successfully"

5. **Test authentication:**
   - Register a new user
   - Login with existing user
   - Verify token exchange works

## Expected Console Output (Success)

```
=== FIREBASE INITIALIZATION ===
Platform.OS: android
Loading Firebase modules...
Platform detected: android
Forcing web Firebase SDK for React Native compatibility
Firebase modules loaded successfully
=== ENVIRONMENT VARIABLES DEBUG ===
FIREBASE_API_KEY from env: Present
FIREBASE_AUTH_DOMAIN from env: Present
FIREBASE_PROJECT_ID from env: Present
...
Firebase app initialized successfully
Firebase Auth initialized successfully
Firestore initialized successfully
All Firebase services initialized successfully
```

## If Issues Persist

1. **Clear all caches:**
   ```bash
   npx expo start --clear
   rm -rf node_modules
   npm install
   ```

2. **Check environment variables in build:**
   - Download the APK
   - Extract and check if env vars are bundled

3. **Enable verbose logging:**
   - Add more console.log statements in firebase.ts
   - Check what properties are being accessed

4. **Contact support with:**
   - Full error stack trace
   - Build logs from EAS
   - Device/Android version
   - Steps to reproduce
