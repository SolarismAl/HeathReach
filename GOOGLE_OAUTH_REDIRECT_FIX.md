# Google OAuth Redirect URI Fix - URGENT

## Error You're Seeing

```
Error 400: redirect_uri_mismatch
Access blocked: HealthReach's request is invalid
```

## Root Cause

Google Console doesn't have your app's redirect URIs registered. Your app is sending:
- **Local/Web**: `http://localhost:19006` or similar
- **Production Build**: `com.anonymous.HealthReach:/oauthredirect`

But Google Console only accepts URIs that are explicitly registered.

---

## IMMEDIATE FIX - Add These URIs to Google Console

### Step 1: Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your **Web Client ID** (the one in your `.env` file)
5. Click **Edit** (pencil icon)

### Step 2: Add ALL These Redirect URIs

In the **Authorized redirect URIs** section, add these **EXACT** URIs:

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

### Step 3: Save Changes

Click **SAVE** at the bottom of the page.

⚠️ **Important**: Changes can take 5-10 minutes to propagate. Wait a bit before testing.

---

## Why You Need All These URIs

| URI | When It's Used |
|-----|----------------|
| `http://localhost:19006` | Web development (Expo web) |
| `http://localhost:8081` | Metro bundler redirect |
| `com.anonymous.HealthReach:/oauthredirect` | **Production Android build** |
| `https://auth.expo.io/@alfonso_solar/HealthReach` | Expo development builds |
| `exp://127.0.0.1:19000` | Expo Go app |

---

## Additional Fix: Update GoogleSignInModal for Better Compatibility

The current code uses a custom scheme that might not work well in all environments. Let me update it:

**File: `components/GoogleSignInModal.tsx`**

Replace lines 23-27 with:

```typescript
// Dynamic redirect URI that works in all environments
const redirectUri = Platform.select({
  web: makeRedirectUri({
    preferLocalhost: true,
  }),
  default: makeRedirectUri({
    scheme: 'com.anonymous.HealthReach',
    path: 'oauthredirect',
  }),
});
```

This ensures:
- **Web**: Uses `localhost` (already works)
- **Mobile**: Uses custom scheme for production builds

---

## Testing After Fix

### Test 1: Local Development (Web)

```bash
cd HealthReach
npx expo start
# Press 'w' for web
# Try Google Sign-In
```

**Expected redirect URI**: `http://localhost:19006`

### Test 2: Production Build

```bash
# After adding URIs to Google Console, rebuild
eas build --platform android --profile preview

# Install and test
# Try Google Sign-In
```

**Expected redirect URI**: `com.anonymous.HealthReach:/oauthredirect`

---

## Verify Current Redirect URI

Check your console logs when you click "Continue with Google":

```
=== GOOGLE OAUTH DEBUG ===
Redirect URI: [LOOK FOR THIS VALUE]
Client ID: Present
Platform: web (or android)
```

**Copy that exact URI and add it to Google Console!**

---

## Common Mistakes to Avoid

❌ **Don't add trailing slashes**: `http://localhost:19006/` (wrong)  
✅ **Correct format**: `http://localhost:19006`

❌ **Don't forget the protocol**: `localhost:19006` (wrong)  
✅ **Include http:// or https://**: `http://localhost:19006`

❌ **Don't mix up Web Client ID and Android Client ID**  
✅ **Use Web Client ID** for both web and mobile in this setup

---

## Quick Checklist

- [ ] Opened Google Cloud Console
- [ ] Found Web Client ID credentials
- [ ] Clicked Edit
- [ ] Added ALL redirect URIs listed above
- [ ] Clicked SAVE
- [ ] Waited 5-10 minutes for changes to propagate
- [ ] Tested local development (web)
- [ ] Rebuilt app with `eas build`
- [ ] Tested production build

---

## Still Getting Error?

### Debug Steps:

1. **Check console logs** - What redirect URI is being used?
   ```
   console.log('Redirect URI:', redirectUri);
   ```

2. **Verify Google Console** - Is that exact URI in the list?

3. **Check Client ID** - Are you using the correct Web Client ID?
   ```
   console.log('Client ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
   ```

4. **Wait longer** - Google changes can take up to 10 minutes

5. **Clear browser cache** - Old OAuth sessions might be cached

---

## Summary

The `redirect_uri_mismatch` error means Google doesn't recognize your app's redirect URI. 

**Fix**: Add all the URIs listed above to your Google Console Web Client credentials.

**After adding**: Wait 5-10 minutes, then test again. Both local and production builds should work! 🎉
