# HealthReach - EAS Build & Update Guide

## 📋 Prerequisites

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure the project**:
   ```bash
   eas build:configure
   ```

## 🏗️ Building the App

### **Development Build** (for testing with Expo Go alternative)
```bash
eas build --profile development --platform android
```
- Creates a development client APK
- Includes debugging tools
- Can load updates over-the-air

### **Preview Build** (Internal Testing)
```bash
# Android APK (easy to share)
eas build --profile preview --platform android

# iOS (requires Apple Developer account)
eas build --profile preview --platform ios

# Both platforms
eas build --profile preview --platform all
```
- Creates installable APK/IPA
- For internal testing with team
- Includes update capabilities
- **Use this for testing before release**

### **Production Build** (Release)
```bash
# Android App Bundle (for Google Play Store)
eas build --profile production --platform android

# iOS (for App Store)
eas build --profile production --platform ios

# Both platforms
eas build --profile production --platform all
```
- Creates optimized builds
- For store submission
- Production-ready

## 🔄 Publishing Updates (OTA Updates)

### **Preview Updates** (Testing)
```bash
# Publish to preview channel
eas update --branch preview --message "Fixed notification bug"

# Or with auto-generated message
eas update --branch preview --auto
```

### **Production Updates** (Live Users)
```bash
# Publish to production channel
eas update --branch production --message "New features and bug fixes"

# Or with auto-generated message
eas update --branch production --auto
```

## 🚀 Complete Workflow

### **Workflow 1: Testing New Features**

1. **Make code changes** in your app

2. **Test locally**:
   ```bash
   npx expo start
   ```

3. **Build preview version**:
   ```bash
   eas build --profile preview --platform android
   ```

4. **Share APK** with testers (download link provided after build)

5. **Push updates** without rebuilding:
   ```bash
   eas update --branch preview --message "Bug fixes"
   ```

### **Workflow 2: Releasing to Production**

1. **Test thoroughly** with preview build

2. **Build production version**:
   ```bash
   eas build --profile production --platform android
   ```

3. **Submit to Play Store** (optional):
   ```bash
   eas submit --platform android
   ```

4. **Push updates** to live users:
   ```bash
   eas update --branch production --message "v1.2.0 - New appointment features"
   ```

## 📱 Using Environment Variables

### **In Your Code**:

```typescript
// Import the ENV config
import { ENV } from './config/env';

// Use environment variables
const apiUrl = ENV.API_URL;
const firebaseConfig = ENV.FIREBASE;

// Example in API service
export const API_BASE_URL = ENV.API_URL;

// Example in Firebase config
const firebaseConfig = {
  apiKey: ENV.FIREBASE.apiKey,
  authDomain: ENV.FIREBASE.authDomain,
  projectId: ENV.FIREBASE.projectId,
  // ... other config
};
```

### **Direct Access** (if needed):
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const firebaseKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
```

## 🔐 Managing Secrets

### **For Sensitive Values** (not in .env):

1. **Create EAS Secret**:
   ```bash
   eas secret:create --scope project --name SECRET_KEY --value "your-secret-value"
   ```

2. **List secrets**:
   ```bash
   eas secret:list
   ```

3. **Delete secret**:
   ```bash
   eas secret:delete --name SECRET_KEY
   ```

## 📊 Monitoring Builds & Updates

### **Check Build Status**:
```bash
# List all builds
eas build:list

# View specific build
eas build:view [build-id]

# Cancel a build
eas build:cancel [build-id]
```

### **Check Update Status**:
```bash
# List all updates
eas update:list

# View specific update
eas update:view [update-id]

# Rollback to previous update
eas update:rollback --branch production
```

## 🎯 Quick Reference

| Command | Purpose |
|---------|---------|
| `eas build --profile preview --platform android` | Build test APK |
| `eas build --profile production --platform android` | Build release AAB |
| `eas update --branch preview` | Push update to testers |
| `eas update --branch production` | Push update to live users |
| `eas build:list` | View all builds |
| `eas update:list` | View all updates |

## 🔄 Update Channels Explained

- **preview**: For internal testing
  - Testers install preview build
  - Receive updates from preview channel
  - Test new features before production

- **production**: For live users
  - Users install production build from store
  - Receive updates from production channel
  - Stable, tested features only

## 📝 Best Practices

1. **Always test with preview** before production
2. **Use meaningful update messages** for tracking
3. **Keep .env in .gitignore** - never commit secrets
4. **Use EAS secrets** for sensitive values
5. **Version your updates** in commit messages
6. **Test updates** before pushing to production
7. **Monitor build logs** for errors
8. **Keep dependencies updated** regularly

## 🐛 Troubleshooting

### **Build Fails**:
```bash
# Check build logs
eas build:view [build-id]

# Clear cache and retry
eas build --profile preview --platform android --clear-cache
```

### **Update Not Appearing**:
```bash
# Check update status
eas update:list --branch preview

# Force update in app
# Restart the app completely
```

### **Environment Variables Not Working**:
```bash
# Verify .env file exists
# Check variable names start with EXPO_PUBLIC_
# Rebuild the app (updates don't change env vars)
```

## 🎉 Example: Complete Release Process

```bash
# 1. Test locally
npx expo start

# 2. Build preview for testing
eas build --profile preview --platform android

# 3. Test the preview build thoroughly

# 4. Push updates to preview testers
eas update --branch preview --message "Fixed login bug"

# 5. Once stable, build for production
eas build --profile production --platform android

# 6. Submit to Play Store (optional)
eas submit --platform android

# 7. Push updates to live users
eas update --branch production --message "v1.0.1 - Bug fixes and improvements"
```

## 📞 Support

- **EAS Documentation**: https://docs.expo.dev/eas/
- **Expo Forums**: https://forums.expo.dev/
- **Discord**: https://chat.expo.dev/

---

**Note**: The first build takes longer (15-20 minutes). Subsequent builds are faster due to caching.
