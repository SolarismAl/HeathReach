# Google Console Correct Setup

## The Issue

You're getting:
```
Invalid Origin: must use either http or https as the scheme.
```

This is because **Web Client** credentials only accept `http://` or `https://` URIs, NOT custom schemes like `com.anonymous.HealthReach:/oauthredirect`.

---

## Correct Google Console Setup

### You Need TWO OAuth Clients

1. **Web Client** - For local development (web)
2. **Android Client** - For mobile builds

---

## Setup 1: Web Client (For Local Development)

### Location
Google Console → APIs & Services → Credentials → **Web Client**

### Authorized Redirect URIs (Add These)
```
http://localhost:8081
https://localhost:8081
http://localhost:19006
https://localhost:19006
http://127.0.0.1:8081
https://127.0.0.1:19006
```

**DO NOT add** `com.anonymous.HealthReach:/oauthredirect` here - it will fail!

---

## Setup 2: Android Client (For Mobile Builds)

### Create Android OAuth Client

1. Go to Google Console → APIs & Services → Credentials
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Android**
4. Fill in:
   - **Name**: HealthReach Android
   - **Package name**: `com.anonymous.HealthReach`
   - **SHA-1 certificate fingerprint**: (Get from EAS)

### Get SHA-1 Fingerprint

```bash
eas credentials

# Select:
# → Android
# → Production
# → View keystore
# → Copy the SHA-1 fingerprint
```

Example SHA-1: `A1:B2:C3:D4:E5:F6:...`

### Add SHA-1 to Android Client

Paste the SHA-1 fingerprint into the Android OAuth Client configuration.

---

## How It Works

### Local Development (Web)
- Uses **Web Client ID**
- Redirect URI: `http://localhost:8081`
- Works with `expo start` on web

### Mobile Build (Android)
- Uses **Web Client ID** (yes, same one!)
- But validates against **Android Client** SHA-1
- Custom scheme handled by Android OS
- Works with standalone APK

---

## Your Current Setup

### In `eas.json`:
```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "YOUR_WEB_CLIENT_ID"
      }
    }
  }
}
```

**Use the Web Client ID**, not Android Client ID!

---

## Step-by-Step Fix

### Step 1: Update Web Client

1. Go to Google Console → Credentials
2. Find your **Web Client**
3. Click **Edit**
4. In **Authorized redirect URIs**, add:
   ```
   http://localhost:8081
   https://localhost:8081
   http://localhost:19006
   https://localhost:19006
   ```
5. Click **SAVE**

### Step 2: Create/Update Android Client

1. In Google Console → Credentials
2. Find or create **Android OAuth Client**
3. Set:
   - Package name: `com.anonymous.HealthReach`
   - SHA-1: (from `eas credentials`)
4. Click **SAVE**

### Step 3: Wait 5 Minutes

Google needs time to propagate changes.

### Step 4: Test

**Local Web:**
```bash
cd HealthReach
npx expo start
# Press 'w'
# Try Google Sign-In
```

**Mobile Build:**
```bash
eas build --platform android --profile preview
# Install and test
```

---

## Common Mistakes

❌ **Adding custom scheme to Web Client**
```
com.anonymous.HealthReach:/oauthredirect  ← Will fail!
```

✅ **Correct: Only add http/https to Web Client**
```
http://localhost:8081  ← Works!
```

❌ **Using Android Client ID in code**
```typescript
clientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID  ← Wrong!
```

✅ **Correct: Use Web Client ID in code**
```typescript
clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID  ← Correct!
```

---

## Why This Works

### For Web:
- App uses Web Client ID
- Redirects to `http://localhost:8081`
- Google validates against Web Client redirect URIs
- ✅ Works

### For Mobile:
- App uses Web Client ID (same one!)
- Android OS handles the OAuth flow
- Google validates against Android Client SHA-1
- Custom scheme handled by OS, not Google
- ✅ Works

---

## Summary

**For Web Client (Redirect URIs):**
- ✅ `http://localhost:8081`
- ✅ `http://localhost:19006`
- ❌ `com.anonymous.HealthReach:/oauthredirect` (DON'T ADD THIS!)

**For Android Client:**
- ✅ Package name: `com.anonymous.HealthReach`
- ✅ SHA-1 fingerprint from EAS

**In Code:**
- ✅ Use Web Client ID for both web and mobile

---

## Quick Checklist

- [ ] Web Client has `http://localhost:8081` and `http://localhost:19006`
- [ ] Android Client exists with correct package name
- [ ] Android Client has SHA-1 from EAS credentials
- [ ] Code uses Web Client ID (not Android Client ID)
- [ ] Waited 5 minutes after saving changes
- [ ] Tested local web
- [ ] Rebuilt and tested mobile

After completing these steps, Google Sign-In will work on both local and mobile! 🎉
