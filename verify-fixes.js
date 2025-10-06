#!/usr/bin/env node

/**
 * Verification script to check if all production build fixes are in place
 * Run: node verify-fixes.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Production Build Fixes...\n');

let allPassed = true;

// Check 1: Splash Screen Import
console.log('1️⃣  Checking splash screen import...');
const layoutFile = fs.readFileSync(path.join(__dirname, 'app', '_layout.tsx'), 'utf8');
if (layoutFile.includes("import * as SplashScreen from 'expo-splash-screen'")) {
  console.log('   ✅ SplashScreen imported\n');
} else {
  console.log('   ❌ SplashScreen NOT imported\n');
  allPassed = false;
}

// Check 2: Splash Screen Hide
console.log('2️⃣  Checking splash screen hide logic...');
if (layoutFile.includes('SplashScreen.hideAsync()')) {
  const hideCount = (layoutFile.match(/SplashScreen\.hideAsync\(\)/g) || []).length;
  console.log(`   ✅ SplashScreen.hideAsync() found (${hideCount} times)\n`);
} else {
  console.log('   ❌ SplashScreen.hideAsync() NOT found\n');
  allPassed = false;
}

// Check 3: Timeout Fallback
console.log('3️⃣  Checking timeout fallback...');
if (layoutFile.includes('setTimeout') && layoutFile.includes('3000')) {
  console.log('   ✅ 3-second timeout fallback present\n');
} else {
  console.log('   ❌ Timeout fallback NOT found\n');
  allPassed = false;
}

// Check 4: Babel Reanimated Plugin
console.log('4️⃣  Checking babel configuration...');
const babelFile = fs.readFileSync(path.join(__dirname, 'babel.config.js'), 'utf8');
if (babelFile.includes('react-native-reanimated/plugin')) {
  console.log('   ✅ Reanimated plugin configured\n');
} else {
  console.log('   ❌ Reanimated plugin NOT found\n');
  allPassed = false;
}

// Check 5: Hermes Engine
console.log('5️⃣  Checking Hermes configuration...');
const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'app.json'), 'utf8'));
if (appJson.expo.android.jsEngine === 'hermes') {
  console.log('   ✅ Hermes engine configured\n');
} else {
  console.log('   ⚠️  Hermes not explicitly set (will use default)\n');
}

// Check 6: Firebase Config in app.json
console.log('6️⃣  Checking Firebase config in app.json...');
if (appJson.expo.extra && appJson.expo.extra.firebaseApiKey) {
  console.log('   ✅ Firebase config embedded in app.json\n');
} else {
  console.log('   ❌ Firebase config NOT in app.json extra\n');
  allPassed = false;
}

// Check 7: EAS Build Config
console.log('7️⃣  Checking EAS build configuration...');
const easJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'eas.json'), 'utf8'));
if (easJson.build.preview && easJson.build.preview.env) {
  const envVars = easJson.build.preview.env;
  const hasFirebase = envVars.EXPO_PUBLIC_FIREBASE_API_KEY && 
                      envVars.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  if (hasFirebase) {
    console.log('   ✅ EAS build has Firebase environment variables\n');
  } else {
    console.log('   ❌ EAS build missing Firebase env vars\n');
    allPassed = false;
  }
} else {
  console.log('   ❌ EAS preview profile not configured\n');
  allPassed = false;
}

// Check 8: Auth Context Timeout
console.log('8️⃣  Checking AuthContext timeout protection...');
const authFile = fs.readFileSync(path.join(__dirname, 'contexts', 'AuthContext.tsx'), 'utf8');
if (authFile.includes('setTimeout') && authFile.includes('8000')) {
  console.log('   ✅ AuthContext has 8-second timeout\n');
} else {
  console.log('   ⚠️  AuthContext timeout not found (may cause infinite loading)\n');
}

// Final Summary
console.log('═'.repeat(60));
if (allPassed) {
  console.log('✅ ALL CRITICAL CHECKS PASSED!');
  console.log('\nYour code is ready for production build.');
  console.log('Run: eas build --platform android --profile preview');
} else {
  console.log('❌ SOME CHECKS FAILED!');
  console.log('\nPlease fix the issues above before building.');
}
console.log('═'.repeat(60));

process.exit(allPassed ? 0 : 1);
