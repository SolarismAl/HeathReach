# Expo Updates Crash Fix

## Error Encountered
```
java.lang.AssertionError: DatabaseLauncher has already started. 
Create a new instance in order to launch a new version.
```

## Root Cause
The app was configured with `expo-updates` pointing to an EAS Updates URL, but the standalone build was trying to initialize the updates database multiple times, causing a crash on startup.

## Solution Applied

### 1. Disabled Expo Updates in `app.json`
```json
// BEFORE:
"updates": {
  "url": "https://u.expo.dev/454389b8-eabe-4a20-9d36-f9c8e53f48e6"
}

// AFTER:
"updates": {
  "enabled": false
}
```

### 2. Removed Channel Configuration from `eas.json`
```json
// BEFORE:
"preview": {
  "channel": "preview",  // ❌ Removed
  "env": { ... }
}

// AFTER:
"preview": {
  "env": { ... }  // ✅ No channel
}
```

## Why This Happened

**Expo Updates** is a feature that allows you to push JavaScript updates to your app without rebuilding. However:

1. It requires proper configuration with EAS Update service
2. Standalone builds need the updates module to be properly initialized
3. The URL in your config was causing initialization conflicts

## When to Re-enable Updates

You can re-enable Expo Updates later if you want OTA (Over-The-Air) updates:

### Step 1: Configure EAS Update
```bash
eas update:configure
```

### Step 2: Update `app.json`
```json
"updates": {
  "enabled": true,
  "url": "https://u.expo.dev/[your-project-id]"
}
```

### Step 3: Add channels back to `eas.json`
```json
"preview": {
  "channel": "preview",
  "env": { ... }
}
```

### Step 4: Rebuild the app
```bash
npm run build:preview
```

### Step 5: Push updates
```bash
eas update --branch preview --message "Update message"
```

## Current Configuration (Updates Disabled)

With updates disabled:
- ✅ App builds and installs without crashes
- ✅ No update database initialization issues
- ❌ Cannot push OTA updates (need full rebuild for changes)
- ✅ Simpler configuration for initial release

## Next Steps

1. **Rebuild the app:**
   ```bash
   npm run build:preview
   ```

2. **Install and test:**
   - Download new APK from EAS
   - Install on device
   - App should launch without crashes

3. **Verify no errors:**
   ```bash
   adb logcat | grep -i "healthreach\|expo\|updates"
   ```

## Files Modified

- ✅ `app.json` - Disabled updates
- ✅ `eas.json` - Removed channel configurations

## Summary

The Expo Updates crash has been fixed by disabling the updates feature. The app will now:
- Launch without database initialization errors
- Work as a standalone app without OTA updates
- Require full rebuilds for any code changes

You can re-enable updates later once the app is stable and you want to push updates without rebuilding.
