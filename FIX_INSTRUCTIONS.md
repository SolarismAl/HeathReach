# How to Fix the auth-service.ts File

## The Problem

The `auth-service.ts` file got corrupted during editing. I've created a fixed version for you.

## Quick Fix Steps

### Option 1: Replace the File (Easiest)

1. **Delete the broken file:**
   ```
   Delete: services/auth-service.ts
   ```

2. **Rename the fixed file:**
   ```
   Rename: services/auth-service-FIXED.ts → services/auth-service.ts
   ```

### Option 2: Manual Copy (If rename doesn't work)

1. Open `services/auth-service-FIXED.ts`
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. Open `services/auth-service.ts`
4. Select ALL (Ctrl+A)
5. Paste (Ctrl+V)
6. Save (Ctrl+S)

## What Was Fixed

The new `signInWithEmail` method now:

1. ✅ **Signs in with Firebase Authentication** first
   ```typescript
   const userCredential = await signInWithEmailAndPassword(auth, email, password);
   ```

2. ✅ **Gets Firebase ID token** from Firebase user
   ```typescript
   const firebaseIdToken = await firebaseUser.getIdToken();
   ```

3. ✅ **Sends Firebase ID token to backend**
   ```typescript
   body: JSON.stringify({ idToken: firebaseIdToken })
   ```

4. ✅ **Stores Firebase ID token** (NOT custom token)
   ```typescript
   await AsyncStorage.setItem('firebase_id_token', firebaseIdToken);
   ```

## After Fixing

1. **Rebuild the app:**
   ```bash
   cd HealthReach
   eas build --profile preview --platform android
   ```

2. **Test on your phone:**
   - Login with email/password
   - You should see in debug logs:
     - "✅ Firebase sign-in successful"
     - "✅ Got Firebase ID token (length): 1000+" (not 914!)
     - "✅ Firebase ID token and user data stored"
   - Dashboard should load without "Authorization token is required" errors

## Expected Token Length

- ❌ **Old (wrong)**: 914 chars = Custom JWT token
- ✅ **New (correct)**: 1000+ chars = Firebase ID token

## Why This Fixes It

### Before (Broken):
```
Email/Password → Backend → Custom Token (914 chars) → Store → Send to Backend → ❌ REJECTED
```

### After (Fixed):
```
Email/Password → Firebase Auth → Firebase ID Token (1000+ chars) → Backend → Store → ✅ WORKS
```

The backend expects Firebase ID tokens, and now we're giving it exactly that!
