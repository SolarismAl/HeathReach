# Mobile Phone Debugging Guide (No ADB Required)

## Changes Made for Visible Debugging

I've added comprehensive debugging tools that work WITHOUT needing ADB or USB debugging. You can see everything directly on your phone screen.

### New Features Added:

1. **DebugHelper Utility** (`utils/debugHelper.ts`)
   - Tracks all authentication and API events
   - Stores last 50 log entries
   - Shows token status with visible alerts
   - Displays API request/response information

2. **Debug Button on Dashboard**
   - Red "Debug Tokens" button at the top of patient dashboard
   - Tap it to see current token status
   - Shows all 5 token storage keys
   - Displays token lengths and previews

3. **Login Token Verification**
   - Automatically checks token status after login
   - Shows alert if tokens weren't stored properly
   - Provides "View Logs" and "Check Tokens" options

4. **Enhanced Error Messages**
   - All API errors now show with debug options
   - Tap "View Logs" to see recent activity
   - Tap "Check Tokens" to see token status

## How to Test on Your Phone

### Step 1: Rebuild the App

```bash
cd HealthReach

# Clean build
npx expo prebuild --clean

# Build for Android
eas build --profile preview --platform android

# Download and install the APK on your phone
```

### Step 2: Test Login Flow

1. **Open the app** on your phone
2. **Login** with email/password
3. **Watch for alerts:**
   - ✅ If tokens stored: "Successfully signed in!"
   - ❌ If no tokens: "Warning: No Tokens After Login" with debug options

4. **If you see the warning:**
   - Tap "View Logs" to see what happened during login
   - Tap "Check Tokens" to see which tokens are missing
   - Take screenshots of these alerts

### Step 3: Test Dashboard

1. **Navigate to Dashboard**
2. **Look for the red "Debug Tokens" button** at the top
3. **Tap the button** to see:
   ```
   ✅ firebase_id_token: 957 chars
      eyJhbGciOiJSUzI1NiIs...
   ✅ userToken: 957 chars
      eyJhbGciOiJSUzI1NiIs...
   ✅ auth_token: 957 chars
      eyJhbGciOiJSUzI1NiIs...
   ✅ user_data: 234 chars
      {"user_id":"abc123"...
   ✅ userData: 234 chars
      {"user_id":"abc123"...
   ```

4. **If you see ❌ NULL for any token:**
   - This is the problem!
   - Take a screenshot
   - Tap "Copy Logs" to see what happened

### Step 4: Test API Calls

1. **Try to load dashboard data** (pull down to refresh)
2. **If you get "Authorization token is required":**
   - An alert will appear with debug options
   - Tap "View Logs" to see the API request details
   - You'll see something like:
     ```
     [15:30:45] API GET /appointments: hasToken: false
     [15:30:45] ❌ NO TOKEN for request: /appointments
     [15:30:46] API Response /appointments: status: 401, success: false
     ```

3. **Take screenshots** of these logs

### Step 5: Check Logs Anytime

The debug helper stores the last 50 log entries. You can view them anytime by:

1. Tap the "Debug Tokens" button
2. Tap "Copy Logs"
3. You'll see a chronological list of all events:
   ```
   [15:28:30] AUTH: Login attempt: {"email":"user@example.com"}
   [15:28:32] AUTH: Login successful
   [15:28:32] AUTH: Token storage verified: {"firebase_id_token":"Stored","userToken":"Stored"}
   [15:28:35] API GET /auth/profile: hasToken: true
   [15:28:35] ✅ Token added to request: {"url":"/auth/profile","tokenLength":957}
   [15:28:36] API Response /auth/profile: status: 200, success: true
   ```

## What to Look For

### ✅ GOOD - Tokens Stored Properly

After login, you should see:
```
✅ firebase_id_token: Present (957 chars)
✅ userToken: Present (957 chars)
✅ auth_token: Present (957 chars)
✅ user_data: Present (234 chars)
✅ userData: Present (234 chars)
```

### ❌ BAD - Tokens Missing

If you see:
```
❌ firebase_id_token: NULL
❌ userToken: NULL
❌ auth_token: NULL
```

This means tokens weren't stored during login. Check the logs to see why.

### Common Issues and What Logs Show

#### Issue 1: Token Exchange Failed
```
[15:28:32] ❌ Failed to exchange custom token
[15:28:32] Token error details: Firebase: Error (auth/invalid-custom-token)
[15:28:32] ⚠️ WARNING: Token exchange failed, storing custom token as fallback
```
**Solution:** Backend is returning invalid custom token

#### Issue 2: AsyncStorage Failed
```
[15:28:32] Error storing Firebase ID token: [AsyncStorage] Rejected
```
**Solution:** AsyncStorage permission issue

#### Issue 3: Firebase Auth Not Initialized
```
[15:28:30] CustomAuthService: Error getting Firebase user: Firebase not initialized
[15:28:30] CustomAuthService: No Firebase currentUser, using fallback
[15:28:30] CustomAuthService: Token availability: all NULL
```
**Solution:** Firebase initialization failed in production build

## Google Login Issue

For the "Access Blocked: Authorization Error" with Google login:

### What to Check:

1. **After attempting Google login**, tap "Debug Tokens" button
2. **Check the logs** for Google-specific errors:
   ```
   [15:30:00] AUTH: Google sign-in attempt
   [15:30:02] Error: Access Blocked: Authorization Error
   [15:30:02] OAuth redirect_uri_mismatch
   ```

3. **Common causes:**
   - OAuth redirect URI not configured in Google Console
   - Wrong client ID for production build
   - Google Sign-In not configured for release builds

### Debug Steps:

1. Open the app
2. Tap "Sign in with Google"
3. Note the exact error message
4. Go to Dashboard
5. Tap "Debug Tokens" → "View Logs"
6. Look for Google-related log entries
7. Take screenshots

## Sending Debug Information

When reporting issues, please provide:

1. **Screenshots of:**
   - Token status alert (from "Debug Tokens" button)
   - Error messages with debug options
   - Logs view (from "View Logs" button)

2. **Steps to reproduce:**
   - What you did (login, navigate, etc.)
   - What you expected
   - What actually happened

3. **Token status:**
   - Which tokens are present/missing
   - Token lengths if present

## Quick Reference

| Action | How to Do It |
|--------|-------------|
| Check token status | Dashboard → Tap "Debug Tokens" button |
| View logs | Any error alert → Tap "View Logs" |
| Check tokens after login | Automatic alert if tokens missing |
| See API requests | Logs show all API calls with token status |
| Clear logs | "View Logs" → Tap "Clear" |

## Expected Behavior

### After Successful Login:
1. ✅ Alert: "Successfully signed in!"
2. ✅ Navigate to dashboard
3. ✅ Debug button shows all 5 tokens present
4. ✅ Dashboard loads data without errors

### If Tokens Not Stored:
1. ⚠️ Alert: "Warning: No Tokens After Login"
2. ❌ Dashboard shows "No Tokens Found" error
3. ❌ Debug button shows NULL for tokens
4. ❌ API calls fail with 401 errors

## Next Steps

Based on what you see in the debug alerts and logs, we can:

1. **If tokens are NULL after login:**
   - Check login flow logs
   - Verify AsyncStorage is working
   - Check Firebase initialization

2. **If tokens are present but API fails:**
   - Check token format in logs
   - Verify backend is receiving tokens
   - Check token expiration

3. **If Google login fails:**
   - Check OAuth configuration
   - Verify client IDs
   - Check redirect URIs

Take screenshots of the debug information and share them - we'll be able to pinpoint the exact issue!
