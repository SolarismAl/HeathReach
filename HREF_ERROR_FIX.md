# Fix for "Cannot read property 'href' of undefined" Error

## Error Details
**Error:** `com.facebook.react.common.JavascriptException: TypeError: Cannot read property 'href' of undefined`

**Root Cause:** This is a React Navigation/expo-router linking configuration error that occurs when:
1. The app tries to navigate but the route configuration is incomplete
2. There's a mismatch between the linking configuration and actual routes
3. Metro bundler cache has stale data

## Fixes Applied

### 1. Enhanced Stack Screen Configuration
Added explicit animation and options to all Stack.Screen components in `_layout.tsx`:
- Added `animation` property to prevent navigation glitches
- Made each screen configuration explicit
- Added proper error handling for font loading

### 2. Metro Config Update
Updated `metro.config.js` to handle additional source extensions:
```javascript
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];
```

### 3. Font Loading Error Handling
Added error handling for font loading in `_layout.tsx`:
```typescript
const [loaded, error] = useFonts({});

useEffect(() => {
  if (error) {
    console.error('Font loading error:', error);
  }
}, [error]);
```

## Steps to Fix

### Step 1: Clear Cache and Rebuild
```bash
# Clear Metro bundler cache
npx expo start --clear

# Or if that doesn't work:
rm -rf node_modules/.cache
rm -rf .expo
npm start -- --reset-cache
```

### Step 2: Rebuild the App
```bash
# For development
npx expo run:android

# For EAS Build
eas build --platform android --profile preview --clear-cache
```

### Step 3: Verify Routes
Ensure all route files exist:
- ✅ `app/index.tsx`
- ✅ `app/auth/` directory
- ✅ `app/(patient)/` directory
- ✅ `app/(health-worker)/` directory
- ✅ `app/(admin)/` directory
- ✅ `app/not-available.tsx`
- ✅ `app/about.tsx`
- ✅ `app/modal.tsx`

## Common Causes & Solutions

### Cause 1: Stale Metro Cache
**Solution:**
```bash
npx expo start --clear
```

### Cause 2: Missing Route Files
**Solution:** Verify all routes defined in `_layout.tsx` have corresponding files

### Cause 3: Navigation During Initial Load
**Solution:** The app now has proper loading states and prevents navigation until ready

### Cause 4: Conflicting Navigation Calls
**Solution:** Added `hasRedirected` ref in `index.tsx` to prevent multiple redirects

## Testing the Fix

### 1. Test Fresh Install
```bash
# Uninstall the app from device
adb uninstall com.anonymous.HealthReach

# Clear cache
npx expo start --clear

# Rebuild
eas build --platform android --profile preview
```

### 2. Test Navigation Flow
1. Open app → Should show landing page
2. Click "Get Started" → Should navigate to auth
3. Login → Should navigate to appropriate dashboard
4. No errors should appear

### 3. Check Logs
```bash
# View logs while app is running
npx expo start

# Or for built APK
adb logcat | grep -i "healthreach\|react\|expo"
```

## Additional Fixes

### If Error Persists: Option 1 - Simplify Navigation
Temporarily simplify the navigation in `index.tsx`:

```typescript
// Instead of:
router.replace('/(patient)');

// Try:
router.push('/(patient)');
```

### If Error Persists: Option 2 - Add Delay
Add a small delay before navigation:

```typescript
setTimeout(() => {
  router.replace('/(patient)');
}, 100);
```

### If Error Persists: Option 3 - Reset Navigation State
```typescript
import { CommonActions } from '@react-navigation/native';

// Use reset instead of replace
router.replace('/(patient)');
```

## Prevention

### 1. Always Clear Cache Before Building
```bash
# Add to your build script
"build:preview": "npx expo start --clear && eas build --platform android --profile preview"
```

### 2. Verify Routes After Changes
After adding/removing routes, always:
1. Clear cache
2. Restart dev server
3. Test navigation

### 3. Use TypeScript Route Types
Expo Router generates types - use them:
```typescript
import { Href } from 'expo-router';

const route: Href = '/(patient)';
router.push(route);
```

## Quick Fix Commands

```bash
# Full reset and rebuild
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear

# If still failing, reinstall dependencies
rm -rf node_modules
npm install
npx expo start --clear
```

## Expected Behavior After Fix

1. ✅ App launches without errors
2. ✅ Landing page displays correctly
3. ✅ Navigation works smoothly
4. ✅ No "href" errors in logs
5. ✅ All screens load properly

## If Nothing Works

### Nuclear Option: Fresh Build
```bash
# 1. Clear everything
rm -rf node_modules
rm -rf .expo
rm -rf android/build
rm -rf android/app/build

# 2. Reinstall
npm install

# 3. Clear cache and rebuild
npx expo prebuild --clean
eas build --platform android --profile preview --clear-cache
```

## Related Files Modified
- `app/_layout.tsx` - Enhanced screen configuration
- `metro.config.js` - Added source extensions
- `components/ErrorBoundary.tsx` - Already has proper error handling

## Status
- ✅ Configuration fixes applied
- ⚠️ Requires cache clear and rebuild to take effect
- 📱 Test on device after rebuilding

---

**Next Steps:**
1. Clear Metro cache: `npx expo start --clear`
2. Rebuild app: `eas build --platform android --profile preview --clear-cache`
3. Test on device
4. If error persists, try the nuclear option above
