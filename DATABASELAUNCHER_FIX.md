# DatabaseLauncher Error Fix

## Problem
The app crashes on production builds with the error:
```
java.lang.AssertionError: DatabaseLauncher has already started. 
Create a new instance in order to launch a new version.
```

This error occurs in the `expo-updates` module when the app tries to initialize the DatabaseLauncher multiple times.

## Root Cause
- **expo-updates** package was included in the project
- In production builds, expo-updates initializes its internal database (DatabaseLauncher)
- The app was attempting to re-initialize or hot-reload, causing the DatabaseLauncher to be started twice
- This doesn't happen in local development because expo-updates is disabled in dev mode

## Why It Works Locally But Not in Production
| Environment | expo-updates Status | DatabaseLauncher |
|-------------|-------------------|------------------|
| **Local Dev (Expo Go)** | Disabled | Not initialized |
| **Production Build** | Active | Initialized on startup |

## Solution Applied
We removed `expo-updates` completely since OTA (Over-The-Air) updates are not currently needed:

### Changes Made:

1. **Removed expo-updates from package.json**
   - Deleted `"expo-updates": "~29.0.12"` from dependencies

2. **Removed updates config from app.json**
   - Removed `runtimeVersion` and `updates` configuration

3. **Ran npm install**
   - Cleaned up the package and removed expo-updates

## Alternative Solutions (If You Need OTA Updates)

### Option A: Disable Updates in Config
Add `"enabled": false` to the updates section in `app.json`:
```json
"updates": {
  "enabled": false,
  "url": "https://u.expo.dev/..."
}
```

### Option B: Safe Initialization Guard
Use the `utils/updates.ts` file (already created) to prevent double initialization:
```typescript
// In app/_layout.tsx
import { initializeUpdates } from "../utils/updates";

initializeUpdates().catch((err) => {
  console.warn('Updates initialization failed:', err);
});
```

## Testing
1. Clean build the app: `npm run build:preview`
2. Install the APK on a device
3. The DatabaseLauncher error should no longer occur

## Next Steps
- Rebuild the app with `eas build --profile preview --platform android`
- Test the installed APK to verify the fix
- If you need OTA updates in the future, use Option B above

## Related Files
- `package.json` - Removed expo-updates dependency
- `app.json` - Removed updates configuration
- `utils/updates.ts` - Safe initialization helper (for future use)
