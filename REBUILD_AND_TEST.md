# Rebuild and Test - Debug Features

## What You'll See Now

After rebuilding, you will see **3 visible debug features** on the dashboard:

### 1. **Token Status Text** (Always Visible)
At the top of the dashboard, you'll see:
```
🔍 DEBUG: Tokens: 5/5 stored | ✅ READY
```
or
```
🔍 DEBUG: Tokens: 0/5 stored | ❌ MISSING
```

This shows immediately if tokens are present or not.

### 2. **Red Debug Button**
Below the welcome section:
```
🐛 🔍 DEBUG TOKENS (TAP ME)
```
Tap this to see detailed token information.

### 3. **Blue Quick Check Button**
Below the red button:
```
ℹ️ Quick Token Check
```
Tap this for a simple yes/no token check.

## How to Rebuild

```bash
cd HealthReach

# Option 1: Build with EAS (takes longer, but works on any phone)
eas build --profile preview --platform android

# Option 2: Build locally (faster, requires phone connected)
npx expo run:android --variant release
```

## What to Look For

### ✅ If Tokens Are Working:
```
🔍 DEBUG: Tokens: 5/5 stored | ✅ READY
```
- Dashboard loads data
- No "Authorization token is required" errors
- All API calls work

### ❌ If Tokens Are Missing:
```
🔍 DEBUG: Tokens: 0/5 stored | ❌ MISSING
```
- You'll see this text immediately
- Dashboard won't load data
- Alert: "❌ No Tokens Found"
- Tap "Check Tokens" button to see details

## Testing Steps

1. **Login** to the app
2. **Go to Dashboard**
3. **Look at the top** - you'll see the token status text
4. **Take a screenshot** of what you see
5. **Tap the debug buttons** to get more details
6. **Share screenshots** with me

## If You Still Don't See Debug Features

If after rebuilding you still don't see:
- The token status text
- The red debug button
- The blue quick check button

Then there might be a build error. Try:

```bash
# Clear everything and rebuild
cd HealthReach
rm -rf node_modules
npm install
npx expo prebuild --clean
eas build --profile preview --platform android
```

## Quick Test in Development Mode

To see if the features work before building:

```bash
cd HealthReach
npx expo start

# Scan QR code with Expo Go app
```

You should see the debug features in development mode. If they work there but not in the build, it's a build configuration issue.

## What the Debug Info Tells Us

### "Tokens: 5/5 stored"
All tokens are present:
- firebase_id_token ✅
- userToken ✅
- auth_token ✅
- user_data ✅
- userData ✅

### "Tokens: 3/5 stored"
Some tokens missing - partial storage failure

### "Tokens: 0/5 stored"
No tokens at all - complete storage failure

### "❌ Error checking tokens"
DebugHelper crashed - import or code issue

## Next Steps

After you rebuild and test:

1. **Take screenshot** of the token status text
2. **Tap debug buttons** and screenshot the alerts
3. **Try to load data** and screenshot any errors
4. **Share all screenshots** so we can see exactly what's happening

The token status text is **always visible** on the dashboard, so you can't miss it!
