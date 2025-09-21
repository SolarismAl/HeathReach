// Environment variables checker for HealthReach app
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Environment Variables...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 .env file contents:');
  console.log(envContent);
} else {
  console.log('❌ .env file not found');
}

const requiredVars = [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Present (${value.substring(0, 20)}...)`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    allPresent = false;
  }
});

console.log('\n📋 Environment Summary:');
if (allPresent) {
  console.log('✅ All required environment variables are present');
} else {
  console.log('❌ Some environment variables are missing');
}

// Test Firebase config loading
console.log('\n🔥 Testing Firebase Config Loading...');
try {
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  
  console.log('✅ Firebase config object created successfully');
  console.log('Config:', JSON.stringify(firebaseConfig, null, 2));
} catch (error) {
  console.log('❌ Error creating Firebase config:', error.message);
}
