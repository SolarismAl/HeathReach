# Google OAuth Configuration Fix

## Problem
Google OAuth is failing with error: `invalid_request: redirect_uri=healthreach://`

**Root Cause:** Google OAuth doesn't accept custom URI schemes (like `healthreach://`). It requires HTTP/HTTPS URLs.

## ✅ SOLUTION: Use Expo Auth Proxy

This is the recommended approach for Expo apps and **it's already configured in your Google Console!**

You already have this redirect URI: `https://auth.expo.io/@alfonso_solar/HealthReach`

### Step 1: Update GoogleSignInModal.tsx

Change the redirect URI configuration to use automatic detection:

**Find this code (around line 22-24):**
```typescript
const redirectUri = makeRedirectUri({
  scheme: 'healthreach',
});
```

**Replace with:**
```typescript
// Automatically uses Expo proxy in development, custom scheme in production
const redirectUri = makeRedirectUri();
```

**Note:** In `expo-auth-session` v7.x, the `useProxy` option has been removed. The function now automatically detects the environment and uses the appropriate redirect URI.

### Step 2: Verify Your Google Console Has This URI

Your **Authorized redirect URIs** should already include:
- ✅ `https://auth.expo.io/@alfonso_solar/HealthReach`

This is the URI that will be used when `useProxy: true` is set.

### Step 3: Test

After making the change:
1. Save the file
2. Reload your app
3. Try signing in with Google again

The redirect URI will now be: `https://auth.expo.io/@alfonso_solar/HealthReach` which is already authorized!

## How It Works

1. User clicks "Sign in with Google"
2. Opens Google OAuth with redirect URI: `https://auth.expo.io/@alfonso_solar/HealthReach`
3. Google redirects to Expo's proxy server
4. Expo's proxy forwards the auth code back to your app
5. Your app completes the authentication

## Alternative: Web-Based OAuth (For Production)

If you want to use your backend for OAuth (recommended for production):

Use the redirect URI: `https://healthreach-api.onrender.com/auth/google/callback`

This is already in your Google Console and would require backend handling.

## Current Status

Your Google Console **already has** the correct redirect URI configured:
- ✅ `https://auth.expo.io/@alfonso_solar/HealthReach`

You just need to update your app to use it by setting `useProxy: true`.
