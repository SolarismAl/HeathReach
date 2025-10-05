# 🚀 Quick Fix Reference - Production Build Error

## The Error
```
TypeError: Cannot read property 'href' of undefined
```

## The Fix (2 Changes)

### 1️⃣ Fixed `services/firebase.ts` (Lines 20-60)
**Changed:** Empty mock objects → Proper mock objects with all properties

```typescript
// ❌ BEFORE (broken):
(global as any).window = {};
(global as any).document = {};

// ✅ AFTER (fixed):
(global as any).window = {
  location: { href: 'https://healthreach.app', ... },
  navigator: { userAgent: 'HealthReach Mobile App' },
  localStorage: { getItem: () => null, ... },
  sessionStorage: { getItem: () => null, ... }
};
(global as any).document = {
  createElement: () => ({}),
  getElementById: () => null,
  ...
};
```

### 2️⃣ Fixed `eas.json` (All Build Profiles)
**Added:** Firebase environment variables to development, preview, and production

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_FIREBASE_API_KEY": "...",
        "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN": "...",
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "...",
        // ... all Firebase vars
      }
    }
  }
}
```

## Verify & Build

```bash
# 1. Verify configuration
npm run verify-build

# 2. Build preview APK
npm run build:preview

# 3. Test on device
# Download APK from EAS → Install → Test

# 4. If tests pass, build production
npm run build:production
```

## Quick Test

```bash
# Check if fix worked
adb logcat | grep "Firebase.*initialized successfully"

# Should see:
# ✅ Firebase app initialized successfully
# ✅ Firebase Auth initialized successfully  
# ✅ Firestore initialized successfully
# ✅ All Firebase services initialized successfully
```

## Why It Failed

| Issue | Cause | Fix |
|-------|-------|-----|
| `href` undefined | Empty `window` object | Added proper `window.location` |
| Firebase not found | Missing env vars in build | Added to `eas.json` |

## Files Changed
- ✅ `services/firebase.ts` - Mock objects
- ✅ `eas.json` - Environment variables
- ✅ `package.json` - Build scripts
- ✅ `scripts/verify-build-config.js` - Verification

## That's It! 🎉

The app is now ready for production builds.
