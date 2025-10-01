# Google OAuth Mobile Build Fix

## Problem

Google OAuth works on **web** (`http://localhost:8081`) but fails on **mobile builds** because the redirect URI is different.

### Current Status
- ✅ **Web**: Uses `http://localhost:8081` - Works perfectly
- ❌ **Mobile**: Uses `healthreach://` - Not configured in Google Console

## Root Cause

The `makeRedirectUri()` function generates different URIs based on platform:
- **Web**: `http://localhost:8081`
- **Expo Go**: `https://auth.expo.io/@alfonso_solar/HealthReach`
- **Standalone Build**: `healthreach://` ❌ **NOT SUPPORTED by Google OAuth**

**Important**: Google OAuth does NOT accept custom URL schemes like `healthreach://`. You must use HTTPS URLs.

## Solution Options

### Option 1: Use Expo Auth Proxy (Recommended for Development)

This works for both Expo Go and development builds.

**Step 1: Update GoogleSignInModal.tsx** ✅ ALREADY DONE

```typescript
const redirectUri = makeRedirectUri({
  native: 'https://auth.expo.io/@alfonso_solar/HealthReach',
  useProxy: false, // Don't use proxy on web
});
```

**Step 2: Verify Google Console** ✅ ALREADY CONFIGURED

Your Google Console already has:
- ✅ `https://auth.expo.io/@alfonso_solar/HealthReach`
- ✅ `http://localhost:8081`

This should now work on mobile!

### Option 2: Use Native Google Sign-In (Recommended for Production)

For production mobile apps, use the native Google Sign-In package instead of web-based OAuth.

**Step 1: Install Native Package**

```bash
npx expo install @react-native-google-signin/google-signin
```

**Step 2: Get Android/iOS Client IDs**

You need separate client IDs for:
- **Android**: From Google Cloud Console (Android app)
- **iOS**: From Google Cloud Console (iOS app)

**Step 3: Update .env**

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=1035041170898-b68pk1d0hp4pikcr4ml5io281nvonn2a.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

**Step 4: Create Native Google Sign-In Component**

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: true,
});

const handleNativeGoogleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // Get ID token
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens.idToken;
    
    // Use Firebase to sign in
    const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
    const { getFirebaseAuth } = await import('../services/firebase');
    
    const credential = GoogleAuthProvider.credential(idToken);
    const auth = await getFirebaseAuth();
    const userCredential = await signInWithCredential(auth, credential);
    
    // Get Firebase ID token for backend
    const firebaseIdToken = await userCredential.user.getIdToken();
    await signInWithGoogle(firebaseIdToken);
    
  } catch (error) {
    console.error('Native Google Sign-In Error:', error);
  }
};
```

### ~~Option 3: Custom Scheme~~ ❌ NOT SUPPORTED

**Google OAuth does NOT support custom URL schemes like `healthreach://`**

Error: "Invalid Redirect: must use a domain that is a valid top private domain"

You must use HTTPS URLs for Google OAuth redirect URIs.

## Recommended Approach

### For Development & Testing
Use **Option 1** (Expo Auth Proxy) - easiest to set up and test.

### For Production
Use **Option 2** (Native Google Sign-In) - better UX, more reliable, follows platform conventions.

## Current Redirect URIs in Your Google Console

Based on your screenshots, you have:
- ✅ `http://localhost:8081` (Web development) - Working
- ✅ `https://auth.expo.io/@alfonso_solar/HealthReach` (Expo proxy) - Should work for mobile
- ❌ `healthreach://` (Custom scheme) - **NOT SUPPORTED by Google OAuth**

## Quick Test

To verify which redirect URI is being used, check the console logs:
```
Google OAuth Redirect URI: [shows the actual URI being used]
```

- If it shows `http://localhost:8081` → Web (working ✅)
- If it shows `https://auth.expo.io/@alfonso_solar/HealthReach` → Expo proxy (should work ✅)
- If it shows `healthreach://` → Custom scheme (**NOT supported by Google** ❌)

## Implementation Steps

### ✅ ALREADY FIXED!

The code has been updated to use Expo's auth proxy for mobile:
```typescript
const redirectUri = makeRedirectUri({
  native: 'https://auth.expo.io/@alfonso_solar/HealthReach',
  useProxy: false,
});
```

Your Google Console already has the correct redirect URI configured.

### Test Now

1. Clear app cache:
   ```bash
   npx expo start -c
   ```

2. Test Google Sign-In on mobile device

3. Check console logs for:
   ```
   Google OAuth Redirect URI: https://auth.expo.io/@alfonso_solar/HealthReach
   ```

It should now work! 🎉

### Long-term Solution (30 minutes)

Implement native Google Sign-In (Option 2) for better mobile experience.

## Debugging

If it still doesn't work after adding the redirect URI:

1. **Check the actual redirect URI being used:**
   ```javascript
   console.log('Redirect URI:', redirectUri);
   ```

2. **Verify Google Console configuration:**
   - Make sure the redirect URI matches EXACTLY (including trailing slashes)
   - Check that the OAuth client is enabled
   - Verify the client ID is correct

3. **Clear app cache:**
   ```bash
   npx expo start -c
   ```

4. **Check for errors:**
   Look for `redirect_uri_mismatch` errors in the console

## Notes

- Web OAuth uses browser-based flow (works with `http://localhost`)
- Mobile OAuth requires either:
  - Custom URL scheme (`healthreach://`)
  - Expo auth proxy (`https://auth.expo.io/...`)
  - Native Google Sign-In (recommended)

- The `makeRedirectUri()` function automatically detects the platform and generates the appropriate URI
- You need to add ALL possible redirect URIs to your Google Console
