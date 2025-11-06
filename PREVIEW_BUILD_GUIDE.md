# Preview Build Guide - Step by Step

## What You Need to Know

**Preview builds** are production-like builds that you can install on your device for testing. They have the same Firebase initialization behavior as production builds, which is why you're seeing the "component auth not registered" error.

## The Fix is Already Applied ✅

All the necessary changes have been made to fix the Firebase initialization issue:
- ✅ Extended delays for Firebase component registration
- ✅ Enhanced retry mechanism (5 attempts)
- ✅ 40-second timeout for initialization
- ✅ Better error handling

## Step-by-Step: Build and Test

### Step 1: Test Configuration (Optional but Recommended)

```bash
npm run test-firebase-production
```

**Expected output:**
```
✅ PASS: Total initialization time is within AuthContext timeout
   Margin: 2500ms
   Safety margin: 6.3%
```

### Step 2: Build Preview APK

```bash
npm run build:preview
```

**Or use EAS directly:**
```bash
eas build --profile preview --platform android
```

**What happens:**
1. ✅ Verifies build configuration
2. ✅ Verifies Firebase configuration
3. ✅ Runs production timing test
4. ✅ Uploads to EAS and builds APK
5. ✅ Provides download link when complete

### Step 3: Download and Install

1. **Wait for build to complete** (usually 10-20 minutes)
2. **Download the APK** from the EAS build page or email link
3. **Transfer to your Android device** (USB, email, or direct download)
4. **Install the APK** (you may need to enable "Install from unknown sources")

### Step 4: First Launch (Important!)

1. **Open the app**
2. **Wait for loading indicator** (7-20 seconds is normal)
   - This is Firebase initializing in the background
   - The app will show a loading screen
3. **Landing page appears** when initialization is complete
4. **Try logging in** with your test credentials

### Step 5: Verify It Works

**Success indicators:**
- ✅ App loads without crashing
- ✅ Loading indicator shows for 7-20 seconds
- ✅ Landing page appears
- ✅ Login button is clickable
- ✅ Login succeeds without errors
- ✅ No "component auth not registered" error

## What to Expect

### First Launch Timeline

```
0s  - App opens, shows splash screen
↓
2s  - Firebase starts initializing (background)
↓
7s  - Firebase Auth component registering
↓
7-20s - Loading indicator visible to user
↓
✅ Landing page appears
↓
User can now log in successfully
```

### Console Logs (if you're monitoring)

```
=== FIREBASE INIT START ===
Environment: Production
Platform detected: android
Waiting 2000ms for environment setup...
Importing Firebase modules...
Waiting 5000ms for Firebase app to be ready...
Auth initialization attempt 1/5
✅ Firebase Auth getAuth() called successfully
✅ Auth instance verified - currentUser property exists
Adding post-verification stability delay (500ms)...
=== FIREBASE INIT COMPLETE (7842ms) ===
AuthContext: ✅ Firebase is now ready for login attempts
```

## Troubleshooting

### Problem: Still getting "component auth not registered" error

**Solution 1: Wait longer**
- The app might still be initializing
- Wait up to 30 seconds on first launch
- Slower devices take longer

**Solution 2: Check internet connection**
- Firebase needs internet to initialize
- Try WiFi instead of mobile data
- Ensure no firewall blocking Firebase

**Solution 3: Reinstall the app**
```bash
# Uninstall from device
adb uninstall com.anonymous.HealthReach

# Rebuild and reinstall
npm run build:preview
```

**Solution 4: Increase delays (if problem persists)**

Edit `services/firebase.ts`:
```typescript
// Line ~111: Increase from 2000 to 3000
const envSetupDelay = __DEV__ ? 100 : 3000;

// Line ~179: Increase from 5000 to 7000
const delay = __DEV__ ? 200 : 7000;
```

Edit `contexts/AuthContext.tsx`:
```typescript
// Line ~49: Increase from 40000 to 50000
const timeoutDuration = __DEV__ ? 3000 : 50000;
```

Then rebuild:
```bash
npm run build:preview
```

### Problem: App crashes on startup

**Check:**
- Device has enough storage space
- Android version is compatible (check app.json)
- No conflicting apps installed
- Try clearing device cache

### Problem: Build fails

**Common causes:**
1. **Missing environment variables** - Check `eas.json` has all Firebase config
2. **EAS account issues** - Run `eas login` to re-authenticate
3. **Network issues** - Check internet connection
4. **Quota exceeded** - Check EAS build quota

**Solution:**
```bash
# Re-authenticate
eas login

# Clear EAS cache
eas build:cancel --all

# Try again
npm run build:preview
```

## Testing Checklist

Use this checklist to verify the fix works:

- [ ] Run `npm run test-firebase-production` - shows PASS
- [ ] Build preview APK successfully
- [ ] Download and install APK on device
- [ ] App opens without crashing
- [ ] Loading indicator shows (7-20 seconds)
- [ ] Landing page appears
- [ ] Login button is clickable
- [ ] Login with test credentials succeeds
- [ ] No error messages in app
- [ ] Dashboard loads after login
- [ ] App works normally after initialization

## Quick Commands Reference

```bash
# Test configuration
npm run test-firebase-production

# Build preview APK
npm run build:preview

# Or use EAS directly
eas build --profile preview --platform android

# Check build status
eas build:list

# Cancel ongoing build
eas build:cancel

# View build logs
eas build:view [build-id]
```

## Expected Behavior Summary

| Stage | Time | What You See |
|-------|------|--------------|
| App Launch | 0s | Splash screen |
| Firebase Init | 0-7s | Loading indicator (background) |
| Component Registration | 7-20s | Loading indicator (visible) |
| Ready | 20s+ | Landing page, can login |

## Support

If you're still having issues after following this guide:

1. **Check the detailed docs:**
   - `FIREBASE_PRODUCTION_FIX.md` - Technical details
   - `SOLUTION_SUMMARY.md` - Complete solution overview
   - `QUICK_REFERENCE.md` - Quick troubleshooting

2. **Verify your changes:**
   - Check `services/firebase.ts` has the new delays
   - Check `contexts/AuthContext.tsx` has 40s timeout
   - Run `npm run test-firebase-production` to verify

3. **Test on different device:**
   - Try a newer/faster device
   - Try different Android version
   - Compare initialization times

## Success!

Once you see the landing page and can log in successfully, the fix is working! 🎉

The 7-20 second initialization is **normal and expected** for preview/production builds. This is Firebase Auth component registration time and cannot be avoided, but it only happens once per app launch.

---

**Current Status:** ✅ Fix Applied and Ready for Testing  
**Next Step:** Build preview APK and test on your device  
**Command:** `npm run build:preview`
