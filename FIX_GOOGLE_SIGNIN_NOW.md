# Fix Google Sign-In Error 400 - Quick Steps

## The Error
```
Error 400: redirect_uri_mismatch
```

## The Fix (5 Minutes)

### 1️⃣ Open Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

### 2️⃣ Find Your Web Client ID

Look for the OAuth 2.0 Client ID that matches your `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

### 3️⃣ Click Edit (Pencil Icon)

### 4️⃣ Add These Redirect URIs

Copy and paste **ALL** of these into "Authorized redirect URIs":

```
http://localhost:19006
https://localhost:19006
http://localhost:8081
https://localhost:8081
http://127.0.0.1:19006
https://127.0.0.1:19006
com.anonymous.HealthReach:/oauthredirect
https://auth.expo.io/@alfonso_solar/HealthReach
exp://127.0.0.1:19000
exp://localhost:19000
```

### 5️⃣ Click SAVE

### 6️⃣ Wait 5 Minutes

Google needs time to propagate the changes.

### 7️⃣ Test Again

```bash
# For local testing
cd HealthReach
npx expo start
# Press 'w' for web, try Google Sign-In

# For production build
eas build --platform android --profile preview
```

---

## What Each URI Does

- `http://localhost:19006` - **Local web development** (what you're testing now)
- `com.anonymous.HealthReach:/oauthredirect` - **Production Android app**
- `https://auth.expo.io/@alfonso_solar/HealthReach` - **Expo development builds**
- Others - Various development scenarios

---

## After Adding URIs

✅ Local web should work immediately (after 5 min wait)  
✅ Production build will work after rebuild  
✅ Both environments will use correct redirect URI  

---

## Verify It's Working

Check console logs:
```
=== GOOGLE OAUTH DEBUG ===
Redirect URI: http://localhost:19006  ← Should match what's in Google Console
Client ID: Present
Platform: web
```

If you see `redirect_uri_mismatch`, that exact URI needs to be in Google Console!

---

## Quick Summary

**Problem**: Google doesn't recognize your redirect URI  
**Solution**: Add all redirect URIs to Google Console  
**Time**: 5 minutes + 5 minute wait for propagation  
**Result**: Google Sign-In works in both local and production! 🎉
