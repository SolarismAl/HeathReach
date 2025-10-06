# Production Build Checklist

## Issue
Production APK stuck on splash screen (works fine in local development)

## Root Cause
1. Splash screen was never being hidden in production builds
2. Missing `react-native-reanimated/plugin` in babel config
3. Environment variables need to be embedded in app.json extra config

## Fixes Applied

### ✅ 1. Splash Screen Management (`app/_layout.tsx`)
- Added `expo-splash-screen` import
- Added `SplashScreen.preventAutoHideAsync()`
- Added `SplashScreen.hideAsync()` when fonts load
- Added 3-second timeout fallback to force hide
- Added comprehensive logging

### ✅ 2. Babel Configuration (`babel.config.js`)
- Added `react-native-reanimated/plugin` (must be last in plugins array)
- Critical for production builds with Hermes engine

### ✅ 3. Environment Variables (`app.json`)
- Added Firebase config to `extra` field
- Config now embedded in production build
- Falls back from process.env → app.json extra → hardcoded defaults

### ✅ 4. Enhanced Error Handling (`contexts/AuthContext.tsx`)
- Added 8-second timeout to prevent infinite loading
- Added mounted flag to prevent state updates after unmount
- Firebase errors are non-fatal, app continues loading

### ✅ 5. Hermes Engine (`app.json`)
- Explicitly set `"jsEngine": "hermes"` for Android

## Build Commands

### Clean Build (Recommended)
```bash
# Clear all caches
npx expo start --clear

# Clean prebuild
npx expo prebuild --clean

# Build APK
eas build --platform android --profile preview
```

### Quick Rebuild
```bash
# Just rebuild
eas build --platform android --profile preview
```

## Testing the New Build

### 1. Install APK on Device
```bash
adb install path/to/healthreach.apk
```

### 2. Monitor Logs
```bash
adb logcat | findstr "APP LAYOUT\|RootLayout\|Splash\|Firebase\|AuthContext"
```

### Expected Log Output
```
=== APP LAYOUT LOADING ===
=== RootLayout RENDER ===
RootLayout: Fonts loaded: true
RootLayout: Splash screen hidden
env.ts: Configuration loaded
=== FIREBASE INIT START ===
=== FIREBASE INIT COMPLETE (XXXms) ===
AuthContext: Initializing auth state
AuthContext: Initialization complete
```

### 3. Expected Behavior
- ✅ Splash screen shows for 1-3 seconds
- ✅ Transitions to landing page (blue background with "HealthReach" logo)
- ✅ Shows "Get Started" button
- ✅ No infinite loading

## If Still Stuck on Splash Screen

### Debug Steps
1. Check if JavaScript bundle is loading:
   ```bash
   adb logcat | findstr "ReactNativeJS"
   ```

2. Check for JavaScript errors:
   ```bash
   adb logcat | findstr "ERROR\|FATAL"
   ```

3. Verify environment variables loaded:
   ```bash
   adb logcat | findstr "env.ts"
   ```

4. Check splash screen hide attempts:
   ```bash
   adb logcat | findstr "Splash"
   ```

## Common Issues

### Issue: Still showing splash after 10 seconds
**Solution**: JavaScript bundle not loading or crashing
- Check for errors in logcat
- Verify all dependencies are installed
- Try clearing node_modules and reinstalling

### Issue: Black screen after splash
**Solution**: Rendering error in root component
- Check ErrorBoundary logs
- Verify all imports are correct
- Check for missing assets

### Issue: Environment variables not found
**Solution**: app.json extra config not embedded
- Verify app.json has `extra` field with Firebase config
- Run `npx expo prebuild --clean` before building
- Check env.ts logs for configuration source

## Version Info
- Expo SDK: ~54.0.7
- React Native: 0.81.4
- expo-splash-screen: ~31.0.10
- react-native-reanimated: ~4.1.0

## Last Updated
2025-10-06 12:55 PM
