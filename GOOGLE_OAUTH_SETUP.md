# Google OAuth Setup for HealthReach

## 🔐 Google Cloud Console Configuration

### **Step 1: Go to Google Cloud Console**
https://console.cloud.google.com/apis/credentials

### **Step 2: Select Your Project**
Select: `healthreach-9167b` (or your Firebase project)

### **Step 3: Edit OAuth 2.0 Client**
Find your Web client ID: `1035041170898-b68pk1d0hp4pikcr4ml5io281nvonn2a.apps.googleusercontent.com`

## 📝 Add These URIs

### **Authorized JavaScript Origins**
Add these 4 URIs:

```
https://healthreach-api.onrender.com
http://localhost:8000
http://127.0.0.1:8000
https://auth.expo.io
```

**Why these?**
- `healthreach-api.onrender.com` - Your production API
- `localhost:8000` - Local development
- `127.0.0.1:8000` - Alternative local address
- `https://auth.expo.io` - **Expo's OAuth proxy (REQUIRED for mobile)**

### **Authorized Redirect URIs**
Add these 4 URIs:

```
https://healthreach-api.onrender.com/auth/google/callback
http://localhost:8000/auth/google/callback
http://127.0.0.1:8000/auth/google/callback
https://auth.expo.io/@alfonso_solar/HealthReach
```

**Why these?**
- Backend callback URLs for web authentication
- `https://auth.expo.io/@alfonso_solar/HealthReach` - **Expo proxy redirect (REQUIRED for mobile app)**

**IMPORTANT**: Replace `alfonso_solar` with your actual Expo username!

## 🎯 Complete Configuration

Your final setup should look like this:

### **Authorized JavaScript origins:**
1. `https://healthreach-api.onrender.com`
2. `http://localhost:8000`
3. `http://127.0.0.1:8000`
4. `https://auth.expo.io` ⭐ **REQUIRED for mobile**

### **Authorized redirect URIs:**
1. `https://healthreach-api.onrender.com/auth/google/callback`
2. `http://localhost:8000/auth/google/callback`
3. `http://127.0.0.1:8000/auth/google/callback`
4. `https://auth.expo.io/@YOUR_EXPO_USERNAME/HealthReach` ⭐ **REQUIRED for mobile**

**Replace `YOUR_EXPO_USERNAME` with your actual Expo username (e.g., `alfonso_solar`)**

## ⏱️ Important Notes

1. **Changes take 5 minutes to a few hours** to take effect
2. **Test after waiting** - Don't test immediately
3. **Clear browser cache** if issues persist
4. **Use incognito mode** for testing

## 🧪 Testing Google OAuth

### **Test in Mobile App:**
1. Open HealthReach app
2. Click "Sign in with Google"
3. Select Google account
4. Should redirect back to app
5. User should be logged in

### **Test in Web (if applicable):**
1. Go to: `https://healthreach-api.onrender.com/login`
2. Click "Sign in with Google"
3. Select Google account
4. Should redirect to dashboard

## 🐛 Troubleshooting

### **Error: "redirect_uri_mismatch"**
- Check that redirect URIs match exactly
- No trailing slashes
- Correct protocol (http vs https)
- Wait 5-10 minutes after changes

### **Error: "origin_mismatch"**
- Check JavaScript origins
- Must not include path (no /auth/google)
- Must include protocol (https://)

### **Error: "access_denied"**
- User cancelled login
- Or app not verified by Google
- Normal behavior, not a configuration issue

## 📱 Mobile App Configuration

Your `.env` already has the correct Web Client ID:
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=1035041170898-b68pk1d0hp4pikcr4ml5io281nvonn2a.apps.googleusercontent.com
```

This is correct! Don't change it.

## ✅ Verification Checklist

- [ ] Added JavaScript origins (3 URIs)
- [ ] Added redirect URIs (3 URIs)
- [ ] Waited 5-10 minutes
- [ ] Tested in mobile app
- [ ] Google sign-in works

## 🔗 Useful Links

- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Firebase Console**: https://console.firebase.google.com/project/healthreach-9167b
- **OAuth 2.0 Playground**: https://developers.google.com/oauthplayground/

---

**Note**: Your mobile app uses Firebase Authentication with Google Sign-In, which is already configured. These URIs are for the web backend if you add web-based Google login.
