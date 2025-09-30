# HealthReach - Quick Start Commands

## 🚀 First Time Setup

```bash
# 1. Navigate to the app directory
cd HealthReach

# 2. Install EAS CLI (if not installed)
npm install -g eas-cli

# 3. Login to Expo
eas login

# 4. Configure EAS (if not done)
eas build:configure
```

## 📱 Build Commands

```bash
# Build for testing (APK - easy to share)
eas build --profile preview --platform android

# Build for production (App Bundle - for Play Store)
eas build --profile production --platform android
```

## 🔄 Update Commands

```bash
# Push update to testers
eas update --branch preview --message "Your update message"

# Push update to production users
eas update --branch production --message "Your update message"
```

## 🎯 Complete Example

```bash
# Step 1: Make your code changes
# ... edit your files ...

# Step 2: Build preview version
eas build --profile preview --platform android

# Step 3: After testing, push updates
eas update --branch preview --message "Fixed notification system"

# Step 4: When ready for production
eas build --profile production --platform android
eas update --branch production --message "v1.0.0 - Initial release"
```

## 📋 Your Environment Variables

Your `.env` file already has all the required variables:
- ✅ EXPO_PUBLIC_API_URL
- ✅ EXPO_PUBLIC_FIREBASE_API_KEY
- ✅ EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
- ✅ EXPO_PUBLIC_FIREBASE_PROJECT_ID
- ✅ EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
- ✅ EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- ✅ EXPO_PUBLIC_FIREBASE_APP_ID
- ✅ EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID

These will be automatically included in your builds!
