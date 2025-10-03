# Debug Google OAuth Redirect URI Issue

## Current Situation

- ✅ **Was working before** on local web
- ❌ **Broken now** after changes
- ❌ **Mobile build** shows "Something went wrong" error

## Quick Debug Steps

### 1. Check Console Logs

When you open the app and click "Continue with Google", look for:

```
=== GOOGLE OAUTH DEBUG ===
Platform: web
Redirect URI: [LOOK HERE] ← This is the key!
Client ID: Present
```

**Copy that exact Redirect URI!**

### 2. Common Redirect URIs

| Platform | Expected Redirect URI |
|----------|----------------------|
| **Local Web** | `http://localhost:19006` or `http://localhost:8081` |
| **Mobile Build** | `com.anonymous.HealthReach:/oauthredirect` |
| **Expo Go** | `exp://127.0.0.1:19000` |

### 3. Add to Google Console

1. Go to [Google Console](https://console.cloud.google.com/apis/credentials)
2. Find your **Web Client ID**
3. Click **Edit**
4. In **Authorized redirect URIs**, add the EXACT URI from console logs
5. Click **SAVE**
6. Wait 5 minutes

---

## If Local Web Was Working Before

The redirect URI was probably already in Google Console. Let's check what changed:

### Option A: Revert to Original Code (Quick Fix)

If you want to get local working immediately, temporarily revert:

**File: `components/GoogleSignInModal.tsx` (lines 23-30)**

```typescript
// TEMPORARY: Use the old code that was working
const redirectUri = makeRedirectUri({
  preferLocalhost: true,
  native: 'https://auth.expo.io/@alfonso_solar/HealthReach',
});
```

This will make local work again, but mobile build will still fail.

### Option B: Add Both URIs to Google Console (Proper Fix)

Keep the new code and add BOTH redirect URIs to Google Console:

```
http://localhost:19006          ← For local web
http://localhost:8081           ← Alternative local port
com.anonymous.HealthReach:/oauthredirect  ← For mobile build
https://auth.expo.io/@alfonso_solar/HealthReach  ← For Expo dev
```

---

## Why It Broke

**Before**: 
- Code used `preferLocalhost: true` for all platforms
- Google Console had `http://localhost:19006` registered
- Local web worked ✅

**After**:
- Code now uses `Platform.OS === 'web'` check
- Might be generating a different URI
- Google Console doesn't have the new URI
- Local web fails ❌

---

## The Real Fix

### Step 1: Check What URI Is Generated

Run the app and check console logs:
```bash
cd HealthReach
npx expo start
# Press 'w' for web
# Click "Continue with Google"
# Check console for "Redirect URI: ???"
```

### Step 2: Add That Exact URI to Google Console

Whatever URI you see in the console, add it to Google Console.

### Step 3: Test Both Environments

**Local Web:**
```bash
npx expo start
# Press 'w'
# Try Google Sign-In
```

**Mobile Build:**
```bash
# After adding URIs to Google Console
eas build --platform android --profile preview
# Install and test
```

---

## Expected Console Output

### ✅ Working (Local Web):
```
=== GOOGLE OAUTH DEBUG ===
Platform: web
Redirect URI: http://localhost:19006
Client ID: Present

Google Auth Response: { type: 'success' }
```

### ❌ Not Working:
```
=== GOOGLE OAUTH DEBUG ===
Platform: web
Redirect URI: http://localhost:19006
Client ID: Present

Google Auth Error: { error: 'redirect_uri_mismatch' }
```

---

## Quick Action Plan

1. **Right now**: Run `npx expo start`, press 'w', check console logs
2. **Copy the Redirect URI** from console
3. **Add to Google Console** (takes 2 minutes)
4. **Wait 5 minutes** for Google to update
5. **Test again** - should work!

---

## For Mobile Build

The mobile build needs:
```
com.anonymous.HealthReach:/oauthredirect
```

Add this to Google Console, then rebuild:
```bash
eas build --platform android --profile preview
```

---

## Summary

**Problem**: Redirect URI changed, Google Console doesn't recognize it  
**Solution**: Check console logs, add exact URI to Google Console  
**Time**: 5 minutes to add + 5 minutes for Google to update  
**Result**: Both local and mobile will work! 🎉
