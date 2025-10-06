# Production Build Debugging Guide

## Current Issue
APK shows black screen with splash icon stuck in center - never transitions to app.

## ✅ Code Verification (All Correct)

### 1. Splash Screen Hide Code ✅
**File:** `app/_layout.tsx`
```tsx
// Line 10: Import
import * as SplashScreen from 'expo-splash-screen';

// Line 23: Prevent auto-hide
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn('SplashScreen.preventAutoHideAsync failed:', err);
});

// Line 75: Hide when ready
await SplashScreen.hideAsync();

// Line 92: Fallback timeout (3 seconds)
await SplashScreen.hideAsync();
```
✅ **Status:** Code is present and correct

### 2. Babel Configuration ✅
**File:** `babel.config.js`
```js
plugins: [
  'react-native-reanimated/plugin', // Line 15
]
```
✅ **Status:** Reanimated plugin added (required for Hermes)

### 3. Hermes Engine ✅
**File:** `app.json`
```json
"android": {
  "jsEngine": "hermes" // Line 24
}
```
✅ **Status:** Hermes explicitly configured

### 4. Environment Variables ✅
**File:** `app.json`
```json
"extra": {
  "firebaseApiKey": "AIzaSyCLviE9L1ihRAafW14XH-li4M67CjyFbBc",
  "firebaseAuthDomain": "healthreach-9167b.firebaseapp.com",
  "firebaseProjectId": "healthreach-9167b",
  // ... all Firebase config
}
```
✅ **Status:** All config embedded in app.json

### 5. EAS Build Config ✅
**File:** `eas.json`
```json
"preview": {
  "env": {
    "EXPO_PUBLIC_API_URL": "https://healthreach-api.onrender.com/api",
    "EXPO_PUBLIC_FIREBASE_API_KEY": "AIzaSyCLviE9L1ihRAafW14XH-li4M67CjyFbBc",
    // ... all env vars
  }
}
```
✅ **Status:** Environment variables in build config

## 🔍 Root Cause Analysis

### Why Local Works But Production Doesn't:
1. **Local (Metro Bundler):**
   - Uses development mode
   - Splash screen handled automatically
   - Hot reload keeps everything fresh
   - No Hermes optimization

2. **Production (APK):**
   - Uses Hermes bytecode compilation
   - Requires explicit splash screen management
   - No hot reload
   - Different JavaScript engine behavior

### The Problem:
Your **current installed APK** was built **BEFORE** the splash screen fixes were added. It literally doesn't have the code to hide the splash screen.

## ✅ Solution: Rebuild Required

### Build Status Check:
```bash
# Check if build is complete
eas build:list --limit 1
```

### If Build Not Started or Failed:
```bash
# 1. Clean everything
npx expo start --clear
# Press Ctrl+C after it starts

# 2. Clean prebuild
npx expo prebuild --clean

# 3. Start build
eas build --platform android --profile preview
```

### Build Timeline:
- **Upload:** 1-2 minutes
- **Dependencies:** 3-5 minutes
- **Compilation:** 5-8 minutes
- **Total:** ~10-15 minutes

## 📱 Testing New Build

### 1. Verify Build Completed:
- Check EAS dashboard: https://expo.dev/accounts/alfonso_solar1/projects/health-reach/builds
- Look for "Build finished" status
- Download APK link will appear

### 2. Install New APK:
```bash
# Uninstall old app first
adb uninstall com.anonymous.HealthReach

# Install new APK
adb install path/to/new-healthreach.apk
```

### 3. Monitor Logs While Opening App:
```bash
adb logcat -c  # Clear logs
adb logcat | findstr "APP LAYOUT\|RootLayout\|Splash\|Firebase\|AuthContext"
```

### 4. Expected Logs (New APK):
```
=== APP LAYOUT LOADING ===
=== RootLayout RENDER ===
RootLayout: Fonts loaded: true
RootLayout: Splash screen hidden  ← KEY LOG!
env.ts: Configuration loaded
=== FIREBASE INIT START ===
=== FIREBASE INIT COMPLETE (XXXms) ===
AuthContext: Initializing auth state
AuthContext: Initialization complete
```

### 5. Expected Visual Behavior:
**Timeline:**
- 0s: Black screen with splash icon (normal)
- 1-3s: Splash screen hides
- 3s: Landing page appears with:
  - Blue gradient background
  - HealthReach logo (medical icon)
  - "Your health, our priority" text
  - "Get Started" button

## 🚨 If Still Stuck After New Build

### Diagnostic Steps:

#### 1. Check JavaScript Bundle Loading:
```bash
adb logcat | findstr "ReactNativeJS"
```
**Expected:** Should see JavaScript logs
**If empty:** Bundle not loading - check for errors

#### 2. Check for Crashes:
```bash
adb logcat | findstr "FATAL\|AndroidRuntime"
```
**Expected:** No FATAL errors
**If present:** App is crashing - check error details

#### 3. Check Splash Screen Attempts:
```bash
adb logcat | findstr "SplashScreen"
```
**Expected:** "Splash screen hidden" or "Force hiding splash screen"
**If missing:** Code not executing - JavaScript bundle issue

#### 4. Verify Hermes:
```bash
adb logcat | findstr "Hermes"
```
**Expected:** Hermes engine initialization logs
**If missing:** Hermes not enabled properly

### Common Issues:

#### Issue: Still black screen with icon
**Possible Causes:**
1. Still using old APK (didn't rebuild)
2. Build failed silently
3. JavaScript bundle not loading
4. Hermes compilation error

**Solution:**
- Verify build completed successfully
- Check build logs for errors
- Try development build first: `eas build --profile development`

#### Issue: App crashes immediately
**Possible Causes:**
1. Missing native dependencies
2. Hermes compilation error
3. Firebase initialization crash

**Solution:**
- Check crash logs: `adb logcat | findstr "FATAL"`
- Try without Hermes: Remove `"jsEngine": "hermes"` from app.json
- Rebuild with: `eas build --platform android --profile preview`

#### Issue: White screen (not black)
**Possible Causes:**
1. Splash screen hidden but app not rendering
2. React rendering error
3. Navigation issue

**Solution:**
- Check ErrorBoundary logs
- Verify all imports are correct
- Check for missing assets

## 🔧 Alternative: Development Build

If production build keeps failing, try development build:

```bash
# Build development APK (includes dev tools)
eas build --platform android --profile development

# This includes:
# - React DevTools
# - Better error messages
# - Remote debugging
# - Easier to diagnose issues
```

## 📊 Build Verification Checklist

Before installing new APK, verify:
- [ ] Build shows "Finished" status in EAS
- [ ] APK file size > 50MB (typical size)
- [ ] Build logs show no errors
- [ ] Commit includes splash screen fixes
- [ ] Babel config has Reanimated plugin
- [ ] app.json has Hermes config

## 🎯 Success Criteria

New APK is working when you see:
1. ✅ Splash screen appears (1-3 seconds)
2. ✅ Smooth transition (not stuck)
3. ✅ Landing page with blue background
4. ✅ "Get Started" button visible
5. ✅ Can navigate to login/register

## 📞 Next Steps

1. **Wait for build to complete** (~10-15 min from start)
2. **Download new APK** from EAS dashboard
3. **Uninstall old app** completely
4. **Install new APK**
5. **Test and monitor logs**

If still stuck after new build, we'll need to:
- Check build logs for compilation errors
- Try development build for better debugging
- Verify Hermes compatibility with all dependencies
- Consider disabling Hermes temporarily

## Last Updated
2025-10-06 14:10 PM
