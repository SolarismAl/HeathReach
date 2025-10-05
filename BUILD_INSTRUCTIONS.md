# HealthReach - Production Build Instructions

## 🚀 Quick Start

### 1. Verify Configuration
```bash
npm run verify-build
```

This will check:
- ✅ All environment variables in `.env`
- ✅ All environment variables in `eas.json` for all profiles
- ✅ Proper mock objects in `firebase.ts`

### 2. Build Preview (Testing)
```bash
npm run build:preview
```

This will:
1. Run verification checks
2. Build APK for internal testing
3. Upload to EAS

### 3. Build Production (Release)
```bash
npm run build:production
```

This will:
1. Run verification checks
2. Build AAB for Google Play Store
3. Upload to EAS

## 📋 Manual Build Steps

### Preview Build (APK)
```bash
# Verify first
npm run verify-build

# Build
eas build --profile preview --platform android

# Download APK from EAS dashboard
# Install on device: adb install app.apk
```

### Production Build (AAB)
```bash
# Verify first
npm run verify-build

# Build
eas build --profile production --platform android

# Download AAB from EAS dashboard
# Upload to Google Play Console
```

## 🔧 Troubleshooting

### Error: "Cannot read property 'href' of undefined"

**Cause:** Empty mock objects in `firebase.ts`

**Fix:** Already applied in `services/firebase.ts` (lines 20-60)
- Proper `window.location` object with all properties
- Proper `document` object with required methods

### Error: Firebase configuration not found

**Cause:** Missing environment variables in build

**Fix:** Already applied in `eas.json`
- All Firebase env vars added to development, preview, and production profiles

### Build works locally but fails in production

**Causes:**
1. Environment variables not in `eas.json`
2. Using localhost URLs in production
3. Missing platform-specific polyfills

**Solutions:**
1. Run `npm run verify-build` before building
2. Check `EXPO_PUBLIC_API_URL` points to production server
3. Ensure all mock objects have required properties

## 📱 Testing Checklist

After building, test on a physical device:

- [ ] App launches without crashing
- [ ] No JavaScript errors in logcat
- [ ] Firebase authentication works
  - [ ] Email/password login
  - [ ] Registration
  - [ ] Password reset
- [ ] Navigation works
  - [ ] Patient dashboard
  - [ ] Health worker dashboard
  - [ ] Admin dashboard
- [ ] API calls succeed
  - [ ] Health centers load
  - [ ] Services load
  - [ ] Appointments work
- [ ] Offline handling works
- [ ] Push notifications work

## 🔍 Debugging Production Builds

### View Logs
```bash
# Android
adb logcat | grep -i "healthreach\|firebase\|javascript"

# Filter for errors only
adb logcat | grep -E "ERROR|FATAL|JavascriptException"
```

### Expected Console Output (Success)
```
=== FIREBASE INITIALIZATION ===
Platform.OS: android
Loading Firebase modules...
Forcing web Firebase SDK for React Native compatibility
Firebase modules loaded successfully
FIREBASE_API_KEY from env: Present
FIREBASE_AUTH_DOMAIN from env: Present
Firebase app initialized successfully
Firebase Auth initialized successfully
Firestore initialized successfully
All Firebase services initialized successfully
```

### Common Issues

#### 1. White Screen on Launch
- Check logcat for JavaScript errors
- Verify environment variables are loaded
- Check Firebase initialization logs

#### 2. Network Errors
- Verify API_URL is correct (not localhost)
- Check device has internet connection
- Verify backend server is running

#### 3. Authentication Fails
- Check Firebase credentials in `eas.json`
- Verify Firebase project settings
- Check token exchange logs

## 🌐 Environment Variables

### Required for All Builds

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API URL | `https://healthreach-api.onrender.com/api` |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | `AIzaSy...` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `healthreach-9167b.firebaseapp.com` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | `healthreach-9167b` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage | `healthreach-9167b.firebasestorage.app` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | `1035041170898` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | `1:1035041170898:web:...` |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth Web | `...apps.googleusercontent.com` |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android | `...apps.googleusercontent.com` |

### Where to Set

1. **Local Development:** `.env` file
2. **EAS Builds:** `eas.json` → `build.[profile].env`
3. **Runtime:** `process.env.EXPO_PUBLIC_*`

## 📦 Build Profiles

### Development
- **Purpose:** Testing with dev client
- **Output:** APK
- **Distribution:** Internal
- **Features:** Hot reload, debugging enabled

### Preview
- **Purpose:** Internal testing
- **Output:** APK
- **Distribution:** Internal
- **Features:** Production-like, easier to distribute

### Production
- **Purpose:** Play Store release
- **Output:** AAB (Android App Bundle)
- **Distribution:** Store
- **Features:** Optimized, signed for release

## 🔐 Security Notes

1. **Never commit:**
   - `.env` file (already in `.gitignore`)
   - Firebase service account keys
   - API keys in code

2. **Use environment variables for:**
   - API endpoints
   - Firebase configuration
   - OAuth client IDs
   - Any sensitive data

3. **Rotate keys if exposed:**
   - Firebase API keys
   - Google OAuth credentials
   - Backend API tokens

## 📊 Build Metrics

### Typical Build Times
- Development: 5-10 minutes
- Preview: 10-15 minutes
- Production: 15-20 minutes

### APK Size
- Expected: 40-60 MB
- With assets: 60-80 MB

### AAB Size
- Expected: 30-50 MB
- Play Store optimizes per device

## 🆘 Support

If issues persist after following this guide:

1. **Check logs:**
   ```bash
   npm run verify-build
   adb logcat | grep -i healthreach
   ```

2. **Clear caches:**
   ```bash
   npx expo start --clear
   rm -rf node_modules
   npm install
   ```

3. **Review documentation:**
   - `PRODUCTION_BUILD_FIX.md` - Detailed fix explanation
   - EAS Build docs: https://docs.expo.dev/build/introduction/

4. **Contact developer with:**
   - Full error logs
   - Build profile used
   - Device/Android version
   - Steps to reproduce
