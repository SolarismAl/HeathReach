# Google Sign-In Quick Fix Checklist

## The Problem
✅ Works locally  
❌ Fails in production build with: "Something went wrong trying to finish signing in"

## Root Cause
Same as API URL issue: **Environment variables from `.env` are NOT included in production builds**

---

## Quick Fix Steps

### 1️⃣ Get Your Google Web Client ID

```bash
# Go to Google Cloud Console
# https://console.cloud.google.com/

# Navigate to: APIs & Services → Credentials
# Copy your Web Client ID (format: 123456789-abc123.apps.googleusercontent.com)
```

### 2️⃣ Add to eas.json

**File: `eas.json`**

Replace `YOUR_GOOGLE_WEB_CLIENT_ID_HERE` with your actual Client ID:

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://healthreach-api.onrender.com/api",
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "123456789-abc123.apps.googleusercontent.com"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://healthreach-api.onrender.com/api",
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "123456789-abc123.apps.googleusercontent.com"
      }
    }
  }
}
```

### 3️⃣ Get Your Expo Username

```bash
eas whoami
# Output: your-expo-username
```

### 4️⃣ Get Your Android SHA-1 Fingerprint

```bash
eas credentials

# Select:
# → Android
# → Production
# → View keystore
# → Copy the SHA-1 fingerprint
```

### 5️⃣ Configure Google Console

Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials

**Add Android OAuth Client (if not exists):**
- Package name: `com.anonymous.HealthReach`
- SHA-1 fingerprint: (paste from step 4)

**Add Authorized Redirect URIs:**
```
com.anonymous.HealthReach:/oauthredirect
https://auth.expo.io/@your-expo-username/HealthReach
```

Replace `your-expo-username` with your actual Expo username from step 3.

### 6️⃣ Build and Test

```bash
# Build preview version
eas build --platform android --profile preview

# Install on device and test Google Sign-In
```

---

## What Changed in Code

✅ **eas.json** - Added `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`  
✅ **app.json** - Added `googleServicesFile` reference  
✅ **GoogleSignInModal.tsx** - Better redirect URI and validation  

---

## Expected Console Output

### ✅ Success:
```
=== GOOGLE OAUTH DEBUG ===
Redirect URI: com.anonymous.HealthReach:/oauthredirect
Client ID: Present
Platform: android

Google Auth Response: { type: 'success' }
Access Token: ya29.a0AfH6...
ID Token: eyJhbGciOiJSUzI1NiIs...
✅ Successfully exchanged custom token for Firebase ID token
```

### ❌ Failure (Before Fix):
```
=== GOOGLE OAUTH DEBUG ===
Redirect URI: com.anonymous.HealthReach:/oauthredirect
Client ID: ❌ MISSING
Platform: android

Google Auth Error: { error: 'invalid_client' }
```

---

## Troubleshooting

### Still getting error?

**Check these in order:**

1. **Client ID in eas.json?**
   - Open `eas.json`
   - Look for `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - Should NOT be `YOUR_GOOGLE_WEB_CLIENT_ID_HERE`

2. **Redirect URI in Google Console?**
   - Go to Google Console → Credentials
   - Check Authorized redirect URIs
   - Should include: `com.anonymous.HealthReach:/oauthredirect`

3. **SHA-1 in Google Console?**
   - Go to Google Console → Credentials → Android OAuth Client
   - Check if SHA-1 fingerprint is added
   - Should match your EAS build certificate

4. **Package name correct?**
   - Should be: `com.anonymous.HealthReach`
   - Check in Google Console and `app.json`

### Need to rebuild?

```bash
# After changing eas.json, you MUST rebuild
eas build --platform android --profile preview
```

---

## Why This Happens

| Environment | `.env` File | Client ID | Result |
|-------------|-------------|-----------|--------|
| **Local** | ✅ Loaded | From `.env` | **Works** |
| **Production** | ❌ Not included | `undefined` | **Fails** |

**Solution:** Embed environment variables in `eas.json` for production builds.

---

## Summary

Same issue as API URL - environment variables must be explicitly configured in `eas.json` for production builds. After adding your Google Client ID and configuring Google Console, Google Sign-In will work in production! 🎉
