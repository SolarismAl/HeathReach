# Quick Fix: "Cannot read property 'href' of undefined" Error

## 🔴 Error Summary
Your app crashes on startup with:
```
TypeError: Cannot read property 'href' of undefined
```

This is a **React Navigation/expo-router cache issue**.

---

## ✅ Quick Fix (2 Minutes)

### Option 1: Clear Cache & Rebuild (Recommended)
```bash
# 1. Clear all caches
.\scripts\clear-cache.ps1

# 2. Rebuild the app
eas build --platform android --profile preview --clear-cache
```

### Option 2: Manual Cache Clear
```bash
# Clear Metro cache
npx expo start --clear

# If that doesn't work:
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear
```

### Option 3: Nuclear Option (If nothing else works)
```bash
# Full reset
rm -rf node_modules
rm -rf .expo
rm -rf node_modules/.cache
npm install
eas build --platform android --profile preview --clear-cache
```

---

## 🔧 What Was Fixed

### 1. Enhanced Navigation Configuration
- Added explicit animations to all routes
- Improved screen options in `_layout.tsx`
- Added font loading error handling

### 2. Metro Config Update
- Added support for `.mjs` and `.cjs` files
- Improved module resolution

### 3. Error Boundary
- Already in place to catch navigation errors
- Provides user-friendly error messages

---

## 📱 Steps to Apply Fix

### Step 1: Uninstall Current App
```bash
# On your Android device, uninstall HealthReach
# Or via ADB:
adb uninstall com.anonymous.HealthReach
```

### Step 2: Clear Cache
```bash
# Run the cache clearing script
.\scripts\clear-cache.ps1

# Or manually:
npx expo start --clear
```

### Step 3: Rebuild
```bash
# Build with cleared cache
eas build --platform android --profile preview --clear-cache
```

### Step 4: Install & Test
- Download the new APK from EAS
- Install on your device
- Test the app

---

## 🎯 Expected Result

After applying the fix:
- ✅ App launches without errors
- ✅ Landing page displays
- ✅ Navigation works smoothly
- ✅ No crash on startup

---

## 🔍 Why This Happens

**Root Cause:** Metro bundler cached an old version of the navigation configuration that has a broken reference to `href`.

**Common Triggers:**
1. Updating expo-router or React Navigation
2. Changing route structure
3. Stale cache after code changes
4. Building without clearing cache

**The Fix:** Clearing all caches forces Metro to rebuild with the current, correct configuration.

---

## 💡 Prevention

### Always Clear Cache Before Building
Add to your workflow:
```bash
# Before every build:
npx expo start --clear

# Or use the script:
.\scripts\clear-cache.ps1
```

### Update Build Commands
```json
// package.json
{
  "scripts": {
    "build:preview": "npx expo start --clear && eas build --platform android --profile preview --clear-cache",
    "build:production": "npx expo start --clear && eas build --platform android --profile production --clear-cache"
  }
}
```

---

## 🆘 If Error Still Persists

### Check 1: Verify All Route Files Exist
```bash
# Make sure these exist:
app/index.tsx
app/auth/
app/(patient)/
app/(health-worker)/
app/(admin)/
app/not-available.tsx
app/about.tsx
app/modal.tsx
```

### Check 2: Verify Dependencies
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Check 3: Check Expo Version
```bash
# Update Expo
npx expo install expo@latest
```

### Check 4: View Logs
```bash
# While app is running
adb logcat | grep -i "healthreach\|react\|expo"
```

---

## 📋 Files Modified

✅ **app/_layout.tsx**
- Enhanced Stack.Screen configuration
- Added explicit animations
- Added font error handling

✅ **metro.config.js**
- Added `.mjs` and `.cjs` support
- Improved module resolution

✅ **scripts/clear-cache.ps1**
- New script to clear all caches
- Interactive cache clearing

---

## 🚀 Quick Commands

```bash
# Clear cache and start dev server
npx expo start --clear

# Clear cache and rebuild
eas build --platform android --profile preview --clear-cache

# Full reset (if needed)
rm -rf node_modules .expo node_modules/.cache && npm install
```

---

## ✅ Checklist

- [ ] Uninstall old app from device
- [ ] Run `.\scripts\clear-cache.ps1`
- [ ] Rebuild: `eas build --platform android --profile preview --clear-cache`
- [ ] Install new APK
- [ ] Test app launch
- [ ] Verify navigation works

---

**Status:** Fixes applied, requires rebuild to take effect

**Next Command:**
```bash
.\scripts\clear-cache.ps1
```

Then rebuild your app!
