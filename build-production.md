# Quick Build Commands for HealthReach Production

## 🚀 Build New Production APK

### Step 1: Clean Everything
```bash
# Clear Metro bundler cache
npx expo start --clear

# Stop any running processes
# Press Ctrl+C if Metro is running
```

### Step 2: Build Preview APK (Recommended for Testing)
```bash
# Build preview APK - faster, for testing
eas build --platform android --profile preview
```

**This will:**
- Use the `preview` profile from `eas.json`
- Include all environment variables
- Create an APK file (not app bundle)
- Take ~10-15 minutes

### Step 3: Download and Install
1. Wait for build to complete
2. Download APK from EAS build page
3. Transfer to Android device
4. Install APK
5. Test login

---

## 🔍 Verify Build Configuration

### Check eas.json
```bash
# View preview profile configuration
cat eas.json
```

Should show:
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://healthreach-api.onrender.com/api",
        "EXPO_PUBLIC_FIREBASE_API_KEY": "AIzaSyCLviE9L1ihRAafW14XH-li4M67CjyFbBc",
        ...
      }
    }
  }
}
```

---

## 📱 Test on Device

### After Installing APK:

1. **Open App**
   - Should start in < 5 seconds
   - No long loading screens

2. **Check Logs (Optional)**
   ```bash
   # Connect device via USB
   # Enable USB debugging
   adb logcat | grep -i "healthreach"
   ```

3. **Test Login**
   - Email: `sample22@gmail.com`
   - Password: `[your password]`
   - Should succeed and redirect to dashboard

4. **Verify Dashboard**
   - Appointments should load
   - Notifications should load
   - Profile should show user data

---

## 🐛 If Login Still Fails

### Check Backend
```bash
# Test backend endpoint directly
curl -X POST https://healthreach-api.onrender.com/api/auth/login-with-password \
  -H "Content-Type: application/json" \
  -d '{"email":"sample22@gmail.com","password":"your_password"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "...",
    "firebase_token": "..."
  }
}
```

### Check Device Logs
```bash
# View detailed logs
adb logcat | grep -E "healthreach|firebase|auth|login"
```

Look for:
- ✅ "🚀 PRODUCTION MODE"
- ✅ "✅ Login successful"
- ❌ Any error messages

---

## 🔄 Rebuild if Needed

### If you need to rebuild:
```bash
# 1. Make sure latest code is committed
git status

# 2. Clear cache
npx expo start --clear

# 3. Build again
eas build --platform android --profile preview

# 4. Wait for build to complete
# 5. Download new APK
# 6. Uninstall old APK from device
# 7. Install new APK
# 8. Test again
```

---

## ✅ Success Indicators

### App Startup Logs:
```
AuthContext: Initializing auth state
🚀 AuthContext: PRODUCTION MODE - Skipping Firebase Auth initialization
🚀 AuthContext: Using backend-only authentication for reliability
AuthContext: Initialization complete
```

### Login Success Logs:
```
=== API SERVICE LOGIN WITH PASSWORD ===
Environment: Production
Login response status: 200
✅ Login successful, token stored
✅ User role: patient
```

### Dashboard Load Logs:
```
Loading dashboard data...
API Response /appointments: 200
API Response /notifications: 200
✅ Appointments loaded: {"count":5}
✅ Notifications loaded: {"count":1}
```

---

## 📊 Build Status

Check build status at:
https://expo.dev/accounts/alfonso_solar/projects/HealthReach/builds

---

## 🎯 Quick Reference

| Command | Purpose |
|---------|---------|
| `npx expo start --clear` | Clear cache |
| `eas build --platform android --profile preview` | Build preview APK |
| `eas build --platform android --profile production` | Build production bundle |
| `adb logcat \| grep healthreach` | View device logs |
| `adb install app.apk` | Install APK via USB |

---

## 💡 Tips

1. **Use Preview Profile**: Faster builds, APK format, easier testing
2. **Clear Cache**: Always clear before building
3. **Check Backend**: Ensure backend is running before testing
4. **Monitor Logs**: Use adb logcat to see what's happening
5. **Test Incrementally**: Test each feature after login

---

## 📞 Need Help?

1. Check `PRODUCTION_BUILD_GUIDE.md` for detailed guide
2. Check `FIXES_APPLIED_PRODUCTION.md` for what was changed
3. Review console logs for specific errors
4. Test backend endpoint directly
5. Verify environment variables in eas.json
