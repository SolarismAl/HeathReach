# Production Build Token Debugging Guide

## Critical Changes Made

### Issue: "Authorization token is required" in production builds

The problem was that tokens weren't being stored or retrieved properly in production builds, even though login worked.

## Changes Applied

### 1. Enhanced Token Storage in `auth-service.ts`

**Login (Lines 55-69):**
```typescript
// Store tokens in MULTIPLE keys for maximum redundancy
await AsyncStorage.setItem('auth_token', customToken);
await AsyncStorage.setItem('firebase_id_token', idToken);
await AsyncStorage.setItem('userToken', idToken);
await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));

// Verify storage
const verify1 = await AsyncStorage.getItem('firebase_id_token');
const verify2 = await AsyncStorage.getItem('userToken');
console.log('Token storage verification:', {
  firebase_id_token: verify1 ? 'Stored' : 'FAILED',
  userToken: verify2 ? 'Stored' : 'FAILED'
});
```

**Google Login (Lines 323-329):**
```typescript
// Store tokens in MULTIPLE keys for maximum redundancy
await AsyncStorage.setItem('auth_token', data.data.token);
await AsyncStorage.setItem('firebase_id_token', freshIdToken);
await AsyncStorage.setItem('userToken', freshIdToken);
await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));
```

### 2. Improved `getCurrentUser()` Method (Lines 198-261)

**Enhanced Fallback for Production:**
```typescript
// CRITICAL FALLBACK for production builds where Firebase auth might not persist
const firebaseIdToken = await AsyncStorage.getItem('firebase_id_token');
const userToken = await AsyncStorage.getItem('userToken');
const authToken = await AsyncStorage.getItem('auth_token');
const userData = await AsyncStorage.getItem('user_data');

console.log('CustomAuthService: Token availability:', {
  firebase_id_token: firebaseIdToken ? 'Present' : 'NULL',
  userToken: userToken ? 'Present' : 'NULL',
  auth_token: authToken ? 'Present' : 'NULL',
  user_data: userData ? 'Present' : 'NULL'
});

// Use the first available token
const token = firebaseIdToken || userToken || authToken;

if (userData && token) {
  return {
    ...user,
    uid: user.user_id || user.uid,
    email: user.email,
    getIdToken: async (forceRefresh?: boolean) => {
      console.log('Mock getIdToken called, forceRefresh:', forceRefresh);
      return token;
    }
  };
}
```

### 3. Token Retrieval in `api.ts` (Already Fixed)

**Removed `__DEV__` check** so token refresh works in production:
```typescript
// PRIORITY 3: Try to get fresh Firebase ID token (works in both dev and production)
console.log('Attempting to get fresh token from current user...');
try {
  const { default: CustomAuthService } = await import('./auth-service');
  const currentUser = await CustomAuthService.getCurrentUser();
  
  if (currentUser) {
    const freshIdToken = await currentUser.getIdToken();
    if (freshIdToken) {
      await this.setFirebaseIdToken(freshIdToken);
      return freshIdToken;
    }
  }
} catch (importError) {
  console.error('Error importing auth-service:', importError);
}
```

## How to Debug on Your Phone

### Step 1: Enable ADB Logging

```bash
# Connect your phone via USB
adb devices

# View logs in real-time
adb logcat | grep -E "CustomAuthService|GET TOKEN|Token storage|Token verification"
```

### Step 2: Look for These Success Messages

After login, you should see:
```
✅ Successfully exchanged custom token for Firebase ID token
Firebase ID token length: 957
✅ All tokens stored successfully in multiple keys
Token storage verification: { firebase_id_token: 'Stored', userToken: 'Stored' }
```

When making API calls, you should see:
```
=== GET TOKEN DEBUG ===
Stored Firebase ID token: Present (length: 957)
✅ Using stored Firebase ID token for API call
```

### Step 3: Check for Errors

**If you see:**
```
❌ No valid token found - returning NULL
```

**Then check:**
```
CustomAuthService: Token availability: {
  firebase_id_token: 'NULL',
  userToken: 'NULL',
  auth_token: 'NULL',
  user_data: 'NULL'
}
```

This means tokens weren't stored during login!

### Step 4: Manual Token Check

Add this to any screen to debug:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugTokens = async () => {
  const tokens = {
    firebase_id_token: await AsyncStorage.getItem('firebase_id_token'),
    userToken: await AsyncStorage.getItem('userToken'),
    auth_token: await AsyncStorage.getItem('auth_token'),
    user_data: await AsyncStorage.getItem('user_data'),
    userData: await AsyncStorage.getItem('userData')
  };
  
  console.log('=== MANUAL TOKEN CHECK ===');
  Object.entries(tokens).forEach(([key, value]) => {
    console.log(`${key}:`, value ? `Present (${value.length} chars)` : 'NULL');
  });
};

// Call it in useEffect
useEffect(() => {
  debugTokens();
}, []);
```

## Rebuild Instructions

```bash
cd HealthReach

# Clean everything
npx expo prebuild --clean
rm -rf node_modules
npm install

# Build for Android
eas build --profile preview --platform android

# Or build locally
npx expo run:android --variant release
```

## Testing Checklist

After installing on phone:

1. **Login:**
   - [ ] Login with email/password
   - [ ] Check logs for "✅ All tokens stored successfully"
   - [ ] Check logs for "Token storage verification"

2. **Navigate to Dashboard:**
   - [ ] Should see "=== GET TOKEN DEBUG ===" in logs
   - [ ] Should see "✅ Using stored Firebase ID token"
   - [ ] Dashboard should load data (no "Authorization token is required")

3. **Navigate to Book Appointment:**
   - [ ] Should load health centers
   - [ ] Should load services
   - [ ] No authorization errors

4. **Navigate to Appointments:**
   - [ ] Should load appointment history
   - [ ] No authorization errors

5. **Navigate to Notifications:**
   - [ ] Should load notifications
   - [ ] No authorization errors

## If Still Failing

### Option 1: Force Clear and Re-login

```bash
# Clear app data
adb shell pm clear com.anonymous.HealthReach

# Or manually: Settings → Apps → HealthReach → Clear Data
```

Then login again and check logs.

### Option 2: Check Backend

```bash
# Test backend is accessible
curl https://healthreach-api.onrender.com/api/health

# Should return: {"status":"ok"}
```

### Option 3: Add More Logging

In `api.ts`, add this after line 55:

```typescript
config.headers.Authorization = `Bearer ${token}`;
console.log('✅ Authorization header set');
console.log('Token (first 50 chars):', token.substring(0, 50));
console.log('Token (last 50 chars):', token.substring(token.length - 50));
```

This will show if the token is being sent correctly.

## Expected Behavior

### Development (works):
- Firebase Auth persists user session
- `auth.currentUser` is available
- Tokens retrieved from Firebase user directly

### Production (now fixed):
- Firebase Auth might not persist properly
- Falls back to AsyncStorage tokens
- Mock user object with `getIdToken()` method
- Returns stored token from AsyncStorage
- Works exactly like development

## Summary

The fix ensures tokens are:
1. ✅ Stored in multiple AsyncStorage keys during login
2. ✅ Retrieved from multiple sources in priority order
3. ✅ Available even when Firebase Auth doesn't persist
4. ✅ Used correctly for all API calls
5. ✅ Verified with comprehensive logging

**Result:** Authorization should work on all screens in production builds.
