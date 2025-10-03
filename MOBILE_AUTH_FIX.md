# Mobile Authentication Token Fix

## Problem Identified

After successful login on the deployed mobile app, patients were seeing "Authorization token is required" errors when trying to:
- View appointments
- View appointment history  
- Book new appointments

**Root Cause:**
The Firebase ID token was not being properly stored or retrieved after login, causing API requests to be sent without the required Authorization header.

## Changes Made

### 1. **API Service Token Retrieval (`services/api.ts`)**

**Changed Priority Order:**
```typescript
// OLD: Try to get fresh token first (could fail on mobile)
// NEW: Check stored token first (most reliable)

PRIORITY 1: Stored Firebase ID token ✅ (Most reliable for mobile)
PRIORITY 2: Fresh token from current user
PRIORITY 3: Custom JWT token (fallback)
```

**Why This Fixes It:**
- On mobile, Firebase auth state might not be immediately available after login
- Stored tokens are more reliable and faster to retrieve
- Prevents unnecessary Firebase auth calls that could fail

### 2. **Auth Service Token Exchange (`services/auth-service.ts`)**

**Enhanced Token Handling:**
```typescript
// Backend returns custom token
// MUST exchange for Firebase ID token
const customToken = data.data.firebase_token || data.data.token;

try {
  // Exchange custom token for Firebase ID token
  const userCredential = await signInWithCustomToken(auth, customToken);
  const idToken = await userCredential.user.getIdToken();
  
  // Store BOTH tokens
  await AsyncStorage.setItem('auth_token', customToken);
  await AsyncStorage.setItem('firebase_id_token', idToken); // ✅ This is what API needs
  
} catch (error) {
  // Fallback: store custom token (may not work with backend)
  console.warn('Token exchange failed - API calls may fail');
}
```

**Why This Fixes It:**
- Backend returns a Firebase **custom token** (not an ID token)
- Custom tokens cannot be used directly for API authentication
- Must exchange custom token for ID token using `signInWithCustomToken()`
- ID token is what the Laravel backend expects in Authorization header

### 3. **AuthContext Token Storage (`contexts/AuthContext.tsx`)**

**Added Verification:**
```typescript
// After login, verify Firebase ID token is stored
const firebaseIdToken = await AsyncStorage.getItem('firebase_id_token');
console.log('Firebase ID token stored:', firebaseIdToken ? 'Yes' : 'No');
```

**Why This Helps:**
- Provides visibility into token storage success
- Helps debug token issues in production
- Confirms tokens are ready before making API calls

## How to Test

### 1. **Build and Deploy New Version**

```bash
cd HealthReach

# Update version
eas build --platform android --profile production

# Or for local testing
npx expo start
```

### 2. **Test Login Flow**

1. **Open app and login** with patient credentials
2. **Check console logs** for these messages:
   ```
   ✅ Successfully exchanged custom token for Firebase ID token
   ✅ All tokens stored successfully
   ✅ Using stored Firebase ID token for API call
   ```

3. **Navigate to dashboard** - should load appointments without errors

4. **Try booking appointment** - should work without "Authorization token required" error

### 3. **Verify Token Storage**

Add this debug code temporarily to check tokens:

```typescript
// In any patient screen
useEffect(() => {
  const checkTokens = async () => {
    const firebaseToken = await AsyncStorage.getItem('firebase_id_token');
    const customToken = await AsyncStorage.getItem('auth_token');
    console.log('🔍 Firebase ID Token:', firebaseToken ? 'Present' : 'Missing');
    console.log('🔍 Custom Token:', customToken ? 'Present' : 'Missing');
  };
  checkTokens();
}, []);
```

## Expected Console Output (Success)

```
=== CUSTOM AUTH SIGN-IN ===
Auth response status: 200
Authentication successful
Custom token received from backend (length): 1234
Exchanging custom token for Firebase ID token...
✅ Successfully exchanged custom token for Firebase ID token
Firebase ID token length: 957
✅ All tokens stored successfully
AuthContext: Firebase ID token stored: Yes
AuthContext: ✅ All tokens stored and ready for API calls

=== GET TOKEN DEBUG ===
Stored Firebase ID token: Present (length: 957)
✅ Using stored Firebase ID token for API call
=== API REQUEST INTERCEPTOR DEBUG ===
Authorization header set with token
```

## Expected Console Output (Failure - Needs Investigation)

```
=== CUSTOM AUTH SIGN-IN ===
❌ Failed to exchange custom token: [error details]
⚠️ WARNING: Stored custom token as fallback - API calls may fail

=== GET TOKEN DEBUG ===
Stored Firebase ID token: Present (length: 1234)
⚠️ Using custom JWT token as fallback (may not work with backend)
```

If you see the failure output, the issue is with Firebase initialization on mobile.

## Backend Requirements

The Laravel backend **MUST** return a Firebase custom token in the response:

```php
// CustomAuthController.php - firebaseLogin()
return response()->json([
    'success' => true,
    'data' => [
        'user' => [...],
        'token' => $customToken->toString(),
        'firebase_token' => $customToken->toString() // ✅ Required
    ]
]);
```

## Troubleshooting

### Issue: Still getting "Authorization token required"

**Check:**
1. Console logs show token exchange success?
2. Firebase ID token stored in AsyncStorage?
3. API interceptor adding Authorization header?

**Solution:**
```typescript
// Add debug logging in api.ts request interceptor
console.log('Request URL:', config.url);
console.log('Authorization header:', config.headers.Authorization);
```

### Issue: Token exchange fails

**Possible Causes:**
- Firebase not properly initialized on mobile
- Network issues preventing Firebase auth
- Custom token format incorrect from backend

**Solution:**
- Check Firebase config in `.env` file
- Verify backend is returning valid custom token
- Test with web version first to isolate mobile-specific issues

### Issue: Appointments still not loading

**Check:**
1. Token is being sent: ✅
2. Backend receiving token: Check Laravel logs
3. Backend validating token: Check middleware logs

**Solution:**
- Check Laravel logs: `storage/logs/laravel.log`
- Look for Firebase token verification errors
- Verify Firestore has appointment data

## Files Modified

1. `services/api.ts` - Token retrieval priority order
2. `services/auth-service.ts` - Token exchange logic
3. `contexts/AuthContext.tsx` - Token verification

## Deployment Checklist

- [ ] Code changes committed
- [ ] App version incremented
- [ ] EAS build created
- [ ] Build deployed to store/TestFlight
- [ ] Test login with patient account
- [ ] Verify appointments load
- [ ] Verify booking works
- [ ] Check console logs for token success messages

## Success Criteria

✅ Patient can login successfully  
✅ Dashboard loads appointments without errors  
✅ Appointment history displays correctly  
✅ Book appointment works without "Authorization token required" error  
✅ Console shows "Using stored Firebase ID token" message  
✅ No 401 Unauthorized errors in API calls

---

**Note:** The key insight is that the backend returns a **custom token**, but the API requires a **Firebase ID token**. The mobile app must exchange the custom token for an ID token immediately after login and store it for all subsequent API calls.
