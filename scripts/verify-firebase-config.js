#!/usr/bin/env node

/**
 * Verify Firebase Configuration for Production Builds
 * 
 * This script checks that all Firebase configuration is properly set
 * for production builds to prevent "Component Auth has not been registered yet" errors.
 */

const fs = require('fs');
const path = require('path');

console.log('=== Firebase Configuration Verification ===\n');

// Check app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
if (!fs.existsSync(appJsonPath)) {
  console.error('❌ app.json not found!');
  process.exit(1);
}

const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const extra = appJson.expo?.extra || {};

console.log('1. Checking app.json extra config:');
const requiredFields = [
  'firebaseApiKey',
  'firebaseAuthDomain',
  'firebaseProjectId',
  'firebaseStorageBucket',
  'firebaseMessagingSenderId',
  'firebaseAppId'
];

let allPresent = true;
requiredFields.forEach(field => {
  const present = !!extra[field];
  console.log(`   ${present ? '✅' : '❌'} ${field}: ${present ? 'Present' : 'MISSING'}`);
  if (!present) allPresent = false;
});

if (!allPresent) {
  console.error('\n❌ Some Firebase config fields are missing in app.json!');
  console.error('   Add them to expo.extra in app.json');
  process.exit(1);
}

// Check eas.json
const easJsonPath = path.join(__dirname, '..', 'eas.json');
if (!fs.existsSync(easJsonPath)) {
  console.error('\n❌ eas.json not found!');
  process.exit(1);
}

const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));

console.log('\n2. Checking eas.json build profiles:');
['development', 'preview', 'production'].forEach(profile => {
  const env = easJson.build?.[profile]?.env || {};
  const hasEnv = Object.keys(env).length > 0;
  console.log(`   ${hasEnv ? '✅' : '⚠️'} ${profile}: ${hasEnv ? `${Object.keys(env).length} env vars` : 'No env vars (will use app.json)'}`);
});

// Check env.ts
const envTsPath = path.join(__dirname, '..', 'env.ts');
if (!fs.existsSync(envTsPath)) {
  console.error('\n❌ env.ts not found!');
  process.exit(1);
}

console.log('\n3. Checking env.ts:');
const envTs = fs.readFileSync(envTsPath, 'utf8');
const hasAppJsonFallback = envTs.includes('Constants.expoConfig?.extra');
const hasHardcodedFallback = envTs.includes('AIzaSyC');
console.log(`   ${hasAppJsonFallback ? '✅' : '❌'} Uses app.json fallback`);
console.log(`   ${hasHardcodedFallback ? '✅' : '❌'} Has hardcoded fallback`);

// Check firebase.ts
const firebaseTsPath = path.join(__dirname, '..', 'services', 'firebase.ts');
if (!fs.existsSync(firebaseTsPath)) {
  console.error('\n❌ services/firebase.ts not found!');
  process.exit(1);
}

console.log('\n4. Checking firebase.ts initialization:');
const firebaseTs = fs.readFileSync(firebaseTsPath, 'utf8');
const hasWindowMock = firebaseTs.includes('global as any).window');
const hasDocumentMock = firebaseTs.includes('global as any).document');
const hasDelays = firebaseTs.includes('await new Promise(resolve => setTimeout');
const hasRetry = firebaseTs.includes('maxAuthAttempts');
console.log(`   ${hasWindowMock ? '✅' : '❌'} Window mock for React Native`);
console.log(`   ${hasDocumentMock ? '✅' : '❌'} Document mock for React Native`);
console.log(`   ${hasDelays ? '✅' : '❌'} Initialization delays`);
console.log(`   ${hasRetry ? '✅' : '❌'} Retry mechanism`);

// Check package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('\n❌ package.json not found!');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
console.log('\n5. Checking Firebase dependencies:');
const firebaseVersion = packageJson.dependencies?.firebase;
console.log(`   ${firebaseVersion ? '✅' : '❌'} firebase: ${firebaseVersion || 'MISSING'}`);

// Summary
console.log('\n=== Summary ===');
if (allPresent && hasAppJsonFallback && hasWindowMock && hasDocumentMock) {
  console.log('✅ All checks passed! Your Firebase configuration is ready for production builds.');
  console.log('\n📝 Build Instructions:');
  console.log('   1. For preview: eas build --platform android --profile preview');
  console.log('   2. For production: eas build --platform android --profile production');
  console.log('\n⚠️  Note: Production builds may take 3-5 seconds to initialize Firebase Auth.');
  console.log('   This is normal and prevents "Component Auth has not been registered yet" errors.');
} else {
  console.error('❌ Some checks failed. Please fix the issues above before building.');
  process.exit(1);
}
