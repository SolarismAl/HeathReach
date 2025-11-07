# Production Build Guide for HealthReach

## Issue Fixed: Login Works Locally But Fails in Production APK

### Root Cause
Firebase Auth Web SDK's component registration fails in React Native production builds because:
1. Production APKs don't have real browser APIs
2. Mocked `window`/`document` objects are insufficient for Firebase Auth
3. The "component auth has not been registered yet" error occurs

### Solution Implemented
**Backend-Only Authentication** - Completely bypass Firebase Auth initialization in production builds.

## Changes Made

### 1. AuthContext.tsx
- **Production Mode**: Skips Firebase Auth initialization completely
- **Development Mode**: Still attempts Firebase Auth for web testing
- **Result**: Instant app startup, no 40-second timeout, no Firebase errors

### 2. api.ts
- Enhanced error handling with specific error messages
- Better logging for production debugging
- Network/timeout error detection

## Building for Production

### Step 1: Clean Build
```bash
# Clear Metro bundler cache
npx expo start --clear

# Or clear all caches
npm run clean
```

### Step 2: Build Preview APK
```bash
# Build preview APK for testing
eas build --platform android --profile preview

# Or build production
eas build --platform android --profile production
```

### Step 3: Verify Environment Variables
Check that `eas.json` has the correct API URL:

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://healthreach-api.onrender.com/api"
      }
    }
  }
}
```

## Testing Checklist

### Local Testing (Web)
- [ ] Login works with email/password
- [ ] Dashboard loads correctly
- [ ] API calls succeed
- [ ] Token refresh works

### Production APK Testing
- [ ] App starts quickly (no 40-second delay)
- [ ] Login screen appears immediately
- [ ] Email/password login succeeds
- [ ] User is redirected to correct dashboard
- [ ] API calls work with stored tokens
- [ ] No "component auth not registered" errors

## Authentication Flow (Production)

```
1. User opens app
   ↓
2. AuthContext initializes (skips Firebase Auth in production)
   ↓
3. User enters email/password
   ↓
4. Frontend sends to: POST /auth/login-with-password
   ↓
5. Backend verifies with Firebase Admin SDK
   ↓
6. Backend returns: { user, token, firebase_token }
   ↓
7. Frontend stores tokens in AsyncStorage
   ↓
8. User redirected to dashboard
   ↓
9. All API calls use stored Firebase ID token
```

## Environment Variables

### Required in eas.json
```json
{
  "EXPO_PUBLIC_API_URL": "https://healthreach-api.onrender.com/api",
  "EXPO_PUBLIC_FIREBASE_API_KEY": "AIzaSyCLviE9L1ihRAafW14XH-li4M67CjyFbBc",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN": "healthreach-9167b.firebaseapp.com",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "healthreach-9167b",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET": "healthreach-9167b.firebasestorage.app",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "1035041170898",
  "EXPO_PUBLIC_FIREBASE_APP_ID": "1:1035041170898:web:5dd9a3435662835d15940b"
}
```

### Fallback in app.json
The `app.json` extra config provides fallback values if env vars don't load.

## Troubleshooting

### Issue: "Login failed" with no details
**Solution**: Check console logs for specific error:
- Network error → Check internet connection
- Timeout → Backend may be slow (Render cold start)
- 401/403 → Invalid credentials
- 500 → Backend error

### Issue: App takes long to start
**Solution**: 
- Verify production build (not development)
- Check that Firebase Auth init is skipped in production
- Look for "🚀 PRODUCTION MODE" log message

### Issue: API calls fail after login
**Solution**:
- Verify tokens are stored: Check AsyncStorage
- Verify backend is running: Test API endpoint
- Check token expiration: Firebase tokens expire after 1 hour

### Issue: Backend returns 401 Unauthorized
**Solution**:
- Backend expects Firebase ID token in Authorization header
- Check that token is being sent: Look for "Authorization header set" log
- Verify token is valid: Check token length (should be ~900+ chars)

## Backend Requirements

### Endpoint: POST /auth/login-with-password
```php
// Required request body
{
  "email": "user@example.com",
  "password": "password123"
}

// Expected response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": "...",
      "name": "...",
      "email": "...",
      "role": "patient|health_worker|admin"
    },
    "token": "custom_token_for_api",
    "firebase_token": "firebase_id_token"
  }
}
```

### Backend Must:
1. Verify credentials with Firebase Admin SDK
2. Fetch user from Firestore
3. Generate Firebase ID token
4. Return both user data and tokens

## Performance Optimizations

### Production Build
- ✅ No Firebase Auth initialization (instant startup)
- ✅ Backend-only authentication (reliable)
- ✅ Proper error handling (user-friendly messages)
- ✅ Token caching (fast subsequent requests)

### Development Build
- Still attempts Firebase Auth (for web testing)
- Falls back to backend-only if Firebase fails
- More verbose logging for debugging

## Next Steps After Build

1. **Install APK on device**
   ```bash
   # Download from EAS build page
   # Install on Android device
   ```

2. **Test login flow**
   - Open app
   - Enter credentials
   - Verify successful login
   - Check dashboard loads

3. **Monitor logs**
   ```bash
   # View device logs
   adb logcat | grep -i "healthreach\|firebase\|auth"
   ```

4. **Verify backend**
   ```bash
   # Test backend endpoint
   curl -X POST https://healthreach-api.onrender.com/api/auth/login-with-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

## Success Indicators

### App Startup
- ✅ "🚀 PRODUCTION MODE - Skipping Firebase Auth initialization"
- ✅ "Using backend-only authentication for reliability"
- ✅ App ready in < 5 seconds

### Login
- ✅ "✅ Login successful, token stored"
- ✅ "✅ User role: patient"
- ✅ Navigation to dashboard

### API Calls
- ✅ "Authorization header set with token"
- ✅ "API Response /appointments: 200"
- ✅ Data loads correctly

## Contact & Support

If issues persist:
1. Check backend logs (Laravel)
2. Check device logs (adb logcat)
3. Verify network connectivity
4. Test backend endpoint directly
5. Review this guide's troubleshooting section
