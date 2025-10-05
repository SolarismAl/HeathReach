# Error Flow & Fix Diagram

## ❌ What Was Happening (BEFORE)

```
┌─────────────────────────────────────────────────────────┐
│  Production Build Started                                │
│  (eas build --profile preview)                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  App Initialization                                      │
│  - Load environment variables from eas.json             │
│  - ❌ Firebase vars MISSING (only API_URL present)      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Firebase Service Initialization (services/firebase.ts)  │
│  - Platform.OS = 'android' (not 'web')                  │
│  - Create mock objects for React Native                 │
│  - ❌ (global as any).window = {}  (EMPTY!)            │
│  - ❌ (global as any).document = {}  (EMPTY!)          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Expo Router / Firebase Tries to Access window.location │
│  - Code: const url = window.location.href               │
│  - window = {} (empty object)                           │
│  - window.location = undefined                          │
│  - window.location.href = ❌ ERROR!                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  💥 CRASH                                                │
│  TypeError: Cannot read property 'href' of undefined    │
│  Stack trace points to routing/Firebase initialization  │
└─────────────────────────────────────────────────────────┘
```

## ✅ What Happens Now (AFTER FIX)

```
┌─────────────────────────────────────────────────────────┐
│  Production Build Started                                │
│  (npm run build:preview)                                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Verification Script Runs First                          │
│  - ✅ Check .env has all Firebase vars                  │
│  - ✅ Check eas.json has all Firebase vars              │
│  - ✅ Check firebase.ts has proper mocks                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  App Initialization                                      │
│  - Load environment variables from eas.json             │
│  - ✅ All Firebase vars present and loaded              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Firebase Service Initialization (services/firebase.ts)  │
│  - Platform.OS = 'android' (not 'web')                  │
│  - Create PROPER mock objects:                          │
│    ✅ window = {                                        │
│         location: {                                     │
│           href: 'https://healthreach.app',              │
│           protocol: 'https:', ...                       │
│         },                                              │
│         navigator: { userAgent: '...' },                │
│         localStorage: { getItem: () => null, ... }      │
│       }                                                 │
│    ✅ document = {                                      │
│         createElement: () => ({}),                      │
│         getElementById: () => null, ...                 │
│       }                                                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Expo Router / Firebase Accesses window.location        │
│  - Code: const url = window.location.href               │
│  - window = { location: { href: '...' } }               │
│  - window.location = { href: 'https://healthreach.app' }│
│  - window.location.href = ✅ 'https://healthreach.app'  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Firebase Initialization Continues                       │
│  - ✅ Firebase config loaded from env vars              │
│  - ✅ Firebase app initialized                          │
│  - ✅ Firebase Auth initialized                         │
│  - ✅ Firestore initialized                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  🎉 APP RUNS SUCCESSFULLY                                │
│  - No crashes                                            │
│  - All features work                                     │
│  - Authentication works                                  │
│  - API calls succeed                                     │
└─────────────────────────────────────────────────────────┘
```

## The Two Critical Fixes

### Fix #1: Proper Mock Objects
```typescript
// ❌ BEFORE (Line 20-22):
(global as any).window = {};
(global as any).document = {};

// ✅ AFTER (Line 20-60):
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
```

### Fix #2: Environment Variables in Build
```json
// ❌ BEFORE (eas.json):
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_URL": "..."
        // ❌ Firebase vars missing!
      }
    }
  }
}

// ✅ AFTER (eas.json):
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_URL": "...",
        "EXPO_PUBLIC_FIREBASE_API_KEY": "...",
        "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN": "...",
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "...",
        // ✅ All Firebase vars present!
      }
    }
  }
}
```

## Why Local Worked But Production Failed

```
┌──────────────────────┬─────────────────────┬──────────────────────┐
│                      │   LOCAL DEV         │   PRODUCTION BUILD   │
├──────────────────────┼─────────────────────┼──────────────────────┤
│ Environment Vars     │ .env file           │ eas.json             │
│ Bundler              │ Metro (hot reload)  │ Optimized bundle     │
│ Error Handling       │ Lenient             │ Strict               │
│ Mock Objects         │ Can be empty        │ Must be complete     │
│ Code                 │ Unminified          │ Minified             │
│ Platform Detection   │ Works either way    │ Needs proper mocks   │
└──────────────────────┴─────────────────────┴──────────────────────┘
```

## Build Process Flow

```
Developer → npm run build:preview
              ↓
         Verification Script
         (verify-build-config.js)
              ↓
         ✅ All checks pass?
              ↓
         EAS Build Service
              ↓
         Load env from eas.json
              ↓
         Bundle & Optimize Code
              ↓
         Create APK/AAB
              ↓
         Upload to EAS
              ↓
         Developer Downloads
              ↓
         Install on Device
              ↓
         🎉 App Works!
```

## Key Takeaways

1. **Empty objects ≠ Proper mocks**
   - Empty `{}` causes undefined property access
   - Must provide all expected properties

2. **Environment variables must be in eas.json**
   - `.env` only works in development
   - Production builds need `eas.json`

3. **Always verify before building**
   - Use `npm run verify-build`
   - Catches issues before expensive build process

4. **Test production builds**
   - Local dev ≠ Production behavior
   - Always test APK on real device
