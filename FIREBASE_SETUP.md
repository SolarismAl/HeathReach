# Firebase Setup Guide for HealthReach App

## Required Firebase Services

### 1. **Authentication Setup** ⚠️ CRITICAL
- Go to Firebase Console → Authentication
- Click "Get Started" 
- Enable **Sign-in methods**:
  - ✅ Email/Password
  - ✅ Google (requires OAuth setup)
- **Add your domain** to authorized domains:
  - `localhost` (for development)
  - Your production domain

### 2. **Firestore Database** (Optional but Recommended)
- Go to Firebase Console → Firestore Database
- Click "Create database"
- Choose "Start in test mode" for development
- Select your preferred location

### 3. **Google Sign-In Configuration**
- Go to Google Cloud Console
- Enable Google+ API
- Create OAuth 2.0 credentials:
  - Web client ID (for web)
  - Android client ID (for mobile)
- Add your SHA-1 fingerprint for Android

## Current Configuration Status
✅ Firebase Config Values: All present
✅ API Keys: Configured
❓ Authentication Methods: **NEEDS VERIFICATION**
❓ Authorized Domains: **NEEDS VERIFICATION**

## Steps to Verify Setup

1. **Check Authentication is enabled**:
   - Firebase Console → Authentication → Sign-in method
   - Ensure Email/Password is enabled
   - Ensure Google is enabled (if using)

2. **Verify authorized domains**:
   - Authentication → Settings → Authorized domains
   - Add: localhost, 127.0.0.1, your-domain.com

3. **Test authentication**:
   - Try creating a test user in Firebase Console
   - Verify sign-in methods work

## Common Issues

- **"auth/configuration-not-found"**: Authentication not enabled in console
- **"auth/unauthorized-domain"**: Domain not in authorized list  
- **"auth/invalid-api-key"**: Wrong API key or project ID
- **Google Sign-in fails**: OAuth not configured properly

## Next Steps

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: healthreach-9167b
3. Enable Authentication with Email/Password
4. Add localhost to authorized domains
5. Test the app again
