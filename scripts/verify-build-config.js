#!/usr/bin/env node

/**
 * Verification script to check if all required environment variables
 * are properly configured for production builds
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Production Build Configuration...\n');

// Required environment variables
const requiredEnvVars = [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
  'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'
];

let hasErrors = false;

// Check .env file
console.log('📄 Checking .env file...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim());
  
  requiredEnvVars.forEach(varName => {
    if (envVars.includes(varName)) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ❌ ${varName} - MISSING`);
      hasErrors = true;
    }
  });
} else {
  console.log('  ❌ .env file not found!');
  hasErrors = true;
}

// Check eas.json
console.log('\n📄 Checking eas.json...');
const easPath = path.join(__dirname, '..', 'eas.json');
if (fs.existsSync(easPath)) {
  const easConfig = JSON.parse(fs.readFileSync(easPath, 'utf8'));
  
  const profiles = ['development', 'preview', 'production'];
  
  profiles.forEach(profile => {
    console.log(`\n  Profile: ${profile}`);
    const profileConfig = easConfig.build[profile];
    
    if (!profileConfig) {
      console.log(`    ❌ Profile not found`);
      hasErrors = true;
      return;
    }
    
    if (!profileConfig.env) {
      console.log(`    ❌ No env section found`);
      hasErrors = true;
      return;
    }
    
    requiredEnvVars.forEach(varName => {
      if (profileConfig.env[varName]) {
        console.log(`    ✅ ${varName}`);
      } else {
        console.log(`    ❌ ${varName} - MISSING`);
        hasErrors = true;
      }
    });
  });
} else {
  console.log('  ❌ eas.json file not found!');
  hasErrors = true;
}

// Check firebase.ts for proper mock objects
console.log('\n📄 Checking services/firebase.ts...');
const firebasePath = path.join(__dirname, '..', 'services', 'firebase.ts');
if (fs.existsSync(firebasePath)) {
  const firebaseContent = fs.readFileSync(firebasePath, 'utf8');
  
  const requiredMocks = [
    { name: 'window.location', patterns: ['location:', 'location: {', 'href:'] },
    { name: 'window.navigator', patterns: ['navigator:', 'navigator: {', 'userAgent:'] },
    { name: 'window.localStorage', patterns: ['localStorage:', 'localStorage: {'] },
    { name: 'document.createElement', patterns: ['createElement:', 'createElement: '] }
  ];
  
  requiredMocks.forEach(mock => {
    const found = mock.patterns.some(pattern => firebaseContent.includes(pattern));
    if (found) {
      console.log(`  ✅ ${mock.name} mock exists`);
    } else {
      console.log(`  ❌ ${mock.name} mock - MISSING`);
      hasErrors = true;
    }
  });
  
  // Check for empty object assignment (the bug)
  if (firebaseContent.includes('window = {}') || firebaseContent.includes('document = {}')) {
    console.log(`  ⚠️  WARNING: Found empty object assignment - this may cause issues!`);
    hasErrors = true;
  }
} else {
  console.log('  ❌ services/firebase.ts not found!');
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ VERIFICATION FAILED - Please fix the issues above');
  process.exit(1);
} else {
  console.log('✅ ALL CHECKS PASSED - Ready for production build!');
  console.log('\nNext steps:');
  console.log('  1. Run: eas build --profile preview --platform android');
  console.log('  2. Download and test the APK');
  console.log('  3. If successful, run: eas build --profile production --platform android');
  process.exit(0);
}
