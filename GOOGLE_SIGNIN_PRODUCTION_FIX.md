# Google Sign-In Production Build Fix

## The Problem

**Error Message:**
```
Something went wrong trying to finish signing in. 
Please close this screen to go back to the app
```

**Works locally ✅** → **Fails in production build ❌**

---

## Root Causes

### 1. **Google Client ID Not Embedded in Build**

```typescript
// GoogleSignInModal.tsx
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // ❌ undefined in production
  redirectUri: redirectUri,
  scopes: ['openid', 'profile', 'email'],
});
```

**Local:** `.env` file provides `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`  
**Build:** `.env` not included → `clientId` is `undefined` → Google OAuth fails

### 2. **Redirect URI Mismatch**

```typescript
const redirectUri = makeRedirectUri({
  preferLocalhost: true,
  native: 'https://auth.expo.io/@alfonso_solar/HealthReach',
});
```

**Issues:**
- Hardcoded Expo username might not match your actual Expo account
- Google Console must have this exact redirect URI registered
- Production builds use different redirect URIs than development

### 3. **Missing Android Configuration**

Production Android builds need:
- SHA-1 certificate fingerprint registered in Google Console
- `google-services.json` file (if using Firebase)
- Correct package name in Google Console

---

## Complete Fix

### ✅ Step 1: Get Your Google Web Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **APIs & Services** → **Credentials**
4. Find your **Web Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
5. Copy it

### ✅ Step 2: Add Google Client ID to Build Config

**File: `eas.json`**

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://healthreach-api.onrender.com/api",
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://healthreach-api.onrender.com/api",
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com"
      }
    }
  }
}
```

**Replace `YOUR_ACTUAL_CLIENT_ID` with your real Google Web Client ID!**

### ✅ Step 3: Get Your Android SHA-1 Fingerprint

For **EAS Build**, you need to get the SHA-1 from your build credentials:

```bash
# Get your Android credentials
eas credentials

# Select Android → Production → View keystore
# Copy the SHA-1 fingerprint
```

**Or generate it locally:**

```bash
# If you have a local keystore
keytool -list -v -keystore your-keystore.jks -alias your-key-alias
```

### ✅ Step 4: Configure Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Click on your **Android OAuth Client**
4. Add your **SHA-1 fingerprint**
5. Set **Package name**: `com.anonymous.HealthReach`
6. Click **Save**

### ✅ Step 5: Add Authorized Redirect URIs

In Google Console, add these redirect URIs:

```
# For Expo development
https://auth.expo.io/@YOUR_EXPO_USERNAME/HealthReach

# For standalone builds
com.anonymous.HealthReach:/oauthredirect

# For web testing
http://localhost:19006
https://localhost:19006
```

**Replace `YOUR_EXPO_USERNAME` with your actual Expo username!**

To find your Expo username:
```bash
eas whoami
```

### ✅ Step 6: Update GoogleSignInModal Component

**File: `components/GoogleSignInModal.tsx`**

```typescript
// Get your actual Expo username
const redirectUri = makeRedirectUri({
  scheme: 'com.anonymous.HealthReach', // Your app's package name
  path: 'oauthredirect',
});

console.log('Google OAuth Redirect URI:', redirectUri);
console.log('Google Client ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  redirectUri: redirectUri,
  scopes: ['openid', 'profile', 'email'],
  // Add these for better Android support
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, // Optional
  responseType: 'id_token', // Request ID token directly
});
```

### ✅ Step 7: Add Google Services File (Optional but Recommended)

If using Firebase:

1. Download `google-services.json` from Firebase Console
2. Place it in your project root: `HealthReach/google-services.json`
3. Update `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.anonymous.HealthReach",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

---

## Updated Code

### **components/GoogleSignInModal.tsx**

Replace lines 25-38 with:

```typescript
// Dynamic redirect URI that works in all environments
const redirectUri = makeRedirectUri({
  scheme: 'com.anonymous.HealthReach',
  path: 'oauthredirect',
});

console.log('=== GOOGLE OAUTH DEBUG ===');
console.log('Redirect URI:', redirectUri);
console.log('Client ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ? 'Present' : 'MISSING');
console.log('Platform:', Platform.OS);

// Validate client ID
if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
  console.error('❌ EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing!');
  console.error('❌ Add it to eas.json env vars');
}

const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'MISSING_CLIENT_ID',
  redirectUri: redirectUri,
  scopes: ['openid', 'profile', 'email'],
  responseType: 'id_token', // Request ID token directly
});
```

---

## Testing Checklist

### Before Building:

- [ ] Google Web Client ID added to `eas.json`
- [ ] Redirect URIs added to Google Console
- [ ] SHA-1 fingerprint added to Google Console
- [ ] Package name matches in Google Console: `com.anonymous.HealthReach`
- [ ] Expo username correct in redirect URI

### After Building:

```bash
# Build preview version
eas build --platform android --profile preview

# Install on device
# Try Google Sign-In
# Check logs
adb logcat | grep -i "google\|oauth\|redirect"
```

### Expected Console Output (Success):

```
=== GOOGLE OAUTH DEBUG ===
Redirect URI: com.anonymous.HealthReach:/oauthredirect
Client ID: Present
Platform: android

Google Auth Response: { type: 'success', authentication: {...} }
Access Token: ya29.a0AfH6...
ID Token: eyJhbGciOiJSUzI1NiIs...
GoogleSignInModal: Got Firebase ID token from Google credential
AuthContext: Google login successful, user set with role: patient
```

### Expected Console Output (Failure):

```
=== GOOGLE OAUTH DEBUG ===
Redirect URI: com.anonymous.HealthReach:/oauthredirect
Client ID: MISSING ❌
Platform: android

Google Auth Error: { error: 'invalid_client' }
```

---

## Common Issues & Solutions

### Issue: "invalid_client" error

**Cause:** Client ID is missing or incorrect  
**Solution:** 
- Check `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `eas.json`
- Verify it matches your Google Console Web Client ID
- Rebuild the app after adding env var

### Issue: "redirect_uri_mismatch" error

**Cause:** Redirect URI not registered in Google Console  
**Solution:**
- Get actual redirect URI from console logs
- Add it to Google Console → Credentials → Authorized redirect URIs
- Common format: `com.anonymous.HealthReach:/oauthredirect`

### Issue: "Something went wrong" (generic error)

**Cause:** Multiple possible issues  
**Solution:**
1. Check console logs for specific error
2. Verify SHA-1 fingerprint in Google Console
3. Ensure package name matches everywhere
4. Try with preview build first

### Issue: Works in Expo Go, fails in standalone

**Cause:** Expo Go uses different OAuth flow  
**Solution:**
- Always test with preview/production builds
- Expo Go has its own OAuth configuration
- Standalone builds need proper setup

---

## Why Local Works But Production Fails

| Aspect | Local (Expo Go) | Production Build |
|--------|----------------|------------------|
| **Client ID** | From `.env` file ✅ | Must be in `eas.json` |
| **Redirect URI** | Expo's dev URI ✅ | App's custom scheme |
| **SHA-1** | Expo's certificate ✅ | Your build certificate |
| **Package** | Expo's package ✅ | Your app package |

**The Fix:** Configure everything for your actual production app, not Expo's development environment.

---

## Quick Setup Script

```bash
# 1. Get your Expo username
eas whoami

# 2. Get your Android SHA-1
eas credentials
# Select: Android → Production → View keystore → Copy SHA-1

# 3. Update eas.json with your Google Client ID
# (Manual step - edit the file)

# 4. Build and test
eas build --platform android --profile preview

# 5. Check logs after installing
adb logcat | grep -i "google"
```

---

## Final Checklist

✅ Google Web Client ID in `eas.json`  
✅ Redirect URI matches in code and Google Console  
✅ SHA-1 fingerprint added to Google Console  
✅ Package name correct: `com.anonymous.HealthReach`  
✅ Expo username correct in redirect URI  
✅ All redirect URIs added to Google Console  
✅ Tested with preview build  
✅ Console logs show "Client ID: Present"  
✅ Google Sign-In completes successfully  

---

## Summary

The issue is **identical to the API URL problem**: environment variables from `.env` are not included in production builds. You must:

1. Add `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to `eas.json`
2. Configure Google Console with your production app details
3. Use proper redirect URIs for standalone builds

After these changes, Google Sign-In will work in production builds just like it does locally! 🎉
