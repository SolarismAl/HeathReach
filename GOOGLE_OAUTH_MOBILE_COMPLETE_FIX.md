# Google OAuth Mobile Complete Fix

## Issues Resolved

### 1. **TypeScript Error: `useProxy` Property**
**Error:** `Object literal may only specify known properties, and 'useProxy' does not exist in type 'AuthSessionRedirectUriOptions'`

**Solution:** Removed the invalid `useProxy` property from `makeRedirectUri()` configuration.

### 2. **Mobile Redirect URI Error**
**Error:** 
- `healthreach://` Invalid Redirect: cannot contain whitespace
- Invalid Redirect: must use a domain that is a valid top private domain

**Root Cause:** Mobile builds were generating custom scheme URIs (`healthreach://`) which Google OAuth doesn't accept.

**Solution:** Use Expo's auth proxy for mobile and localhost for web.

### 3. **Role-Based Navigation After Login**
**Issue:** Users weren't being redirected to their appropriate dashboards after Google login.

**Solution:** Updated landing page navigation to redirect based on user role.

---

## Changes Made

### 1. GoogleSignInModal.tsx
**File:** `components/GoogleSignInModal.tsx`

**Updated redirect URI configuration:**
```tsx
// For mobile: Use Expo's auth proxy which is already registered in Google Console
// For web: Use localhost
const redirectUri = makeRedirectUri({
  preferLocalhost: true,
  native: 'https://auth.expo.io/@alfonso_solar/HealthReach',
});
```

**Key Points:**
- ✅ Uses Expo's auth proxy (`https://auth.expo.io/@alfonso_solar/HealthReach`) for mobile
- ✅ Uses localhost for web development
- ✅ Matches the URIs already configured in Google Console
- ✅ No invalid `useProxy` property

### 2. Landing Page Navigation (index.tsx)
**File:** `app/index.tsx`

**Updated role-based navigation:**
```tsx
switch (user.role) {
  case 'admin':
    router.replace('/(admin)');
    break;
  case 'health_worker':
    router.replace('/(health-worker)');
    break;
  case 'patient':
    router.replace('/(patient)');
    break;
  default:
    router.replace('/auth');
}
```

**Key Points:**
- ✅ Admin users → Admin dashboard
- ✅ Health workers → Health worker dashboard
- ✅ Patients → Patient dashboard
- ✅ Unknown roles → Auth screen

---

## Google Console Configuration

Your Google Console already has the correct redirect URIs configured:

### Authorized Redirect URIs:
1. `https://healthreach-9167b.firebaseapp.com/__/auth/handler`
2. `http://localhost:52657/__/auth/handler`
3. `https://healthreach-api.onrender.com/auth/google/callback`
4. `http://localhost:8081/auth/google/callback`
5. `http://127.0.0.1:8081/auth/google/callback`
6. `http://localhost:8081`
7. **`https://auth.expo.io/@alfonso_solar/HealthReach`** ← Used for mobile

### Authorized JavaScript Origins:
1. `http://localhost:52657`
2. `http://127.0.0.1:52657`
3. `http://localhost:3000`
4. `http://127.0.0.1:3000`
5. `https://healthreach-9167b.firebaseapp.com`
6. `https://localhost:8081`
7. `http://127.0.0.1:8081`
8. `https://healthreach-api.onrender.com`
9. `https://auth.expo.io`

---

## How It Works

### Mobile Flow:
1. User clicks "Continue with Google"
2. App opens Google OAuth with redirect URI: `https://auth.expo.io/@alfonso_solar/HealthReach`
3. User authenticates with Google
4. Google redirects to Expo's auth proxy
5. Expo forwards the auth code back to the app
6. App exchanges code for Google access token
7. App creates Firebase credential with Google token
8. App gets Firebase ID token
9. Backend verifies Firebase ID token and creates/logs in user
10. User is redirected to appropriate dashboard based on role

### Web Flow:
1. User clicks "Continue with Google"
2. App opens Google OAuth with redirect URI: `http://localhost:XXXX`
3. User authenticates with Google
4. Google redirects back to localhost
5. App receives auth code and exchanges for tokens
6. Same Firebase and backend flow as mobile
7. User redirected to appropriate dashboard

---

## Testing

### To Test Mobile Build:
1. Build the app: `npx expo build:android` or `npx expo build:ios`
2. Install on device
3. Click "Continue with Google"
4. Should open Google login
5. After authentication, should redirect to appropriate dashboard

### To Test Web:
1. Run: `npx expo start --web`
2. Open in browser
3. Click "Continue with Google"
4. Should work with localhost redirect

---

## Environment Variables Required

Ensure these are set in your `.env` file:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=1035041170898-b68pk1d0hp4pikcr4ml5io281nvonn2a.apps.googleusercontent.com
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCLviE9L1ihRAafW14XH-li4M67CjyFbBc
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=healthreach-9167b.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=healthreach-9167b
```

---

## Troubleshooting

### If you still get redirect URI errors:
1. Check that `https://auth.expo.io/@alfonso_solar/HealthReach` is in Google Console
2. Verify your Expo username is `alfonso_solar`
3. Verify your app slug is `HealthReach` in `app.json`
4. Clear app cache and rebuild

### If navigation doesn't work:
1. Check console logs for user role
2. Verify AuthContext is setting user data correctly
3. Check that the appropriate dashboard routes exist

### If Firebase errors occur:
1. Verify Firebase config in `.env`
2. Check that Google Sign-In is enabled in Firebase Console
3. Verify the Google Web Client ID matches Firebase

---

## Status

✅ TypeScript error fixed  
✅ Mobile redirect URI configured correctly  
✅ Role-based navigation implemented  
✅ Google Console URIs verified  
✅ Ready for testing

The Google OAuth flow should now work correctly on both mobile and web platforms!
