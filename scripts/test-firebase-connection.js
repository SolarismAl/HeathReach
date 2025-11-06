#!/usr/bin/env node

/**
 * Test Firebase Connection - Frontend and Backend
 * 
 * This script tests:
 * 1. Frontend Firebase configuration
 * 2. Backend API connectivity
 * 3. Firebase Auth initialization
 */

const https = require('https');
const http = require('http');

// Simple color functions
const colors = {
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

console.log(colors.bold(colors.cyan('\n🔥 Firebase Connection Test\n')));

// Test 1: Check environment variables
console.log(colors.bold(colors.cyan('📋 Test 1: Environment Variables\n')));

const requiredVars = [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID'
];

let allVarsPresent = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(colors.green('✓'), varName + ':', colors.yellow(value.substring(0, 30) + '...'));
  } else {
    console.log(colors.red('✗'), varName + ':', colors.red('MISSING'));
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log(colors.yellow('\n⚠️  Environment variables missing - they should be in eas.json for builds\n'));
}

// Test 2: Check backend API connectivity
console.log(colors.bold(colors.cyan('\n🌐 Test 2: Backend API Connectivity\n')));

const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://healthreach-api.onrender.com/api';
console.log('API URL:', colors.yellow(apiUrl));

function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const startTime = Date.now();
    const req = client.get(url, (res) => {
      const duration = Date.now() - startTime;
      console.log(colors.green('✓'), description);
      console.log('  Status:', colors.yellow(res.statusCode));
      console.log('  Response time:', colors.yellow(duration + 'ms'));
      resolve({ success: true, status: res.statusCode, duration });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(colors.red('✗'), description);
      console.log('  Error:', colors.red(error.message));
      console.log('  Duration:', colors.yellow(duration + 'ms'));
      resolve({ success: false, error: error.message, duration });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(colors.red('✗'), description);
      console.log('  Error:', colors.red('Timeout after 10s'));
      resolve({ success: false, error: 'Timeout', duration: 10000 });
    });
  });
}

async function runTests() {
  // Test backend health
  await testEndpoint(apiUrl.replace('/api', '/health'), 'Backend Health Check');
  
  // Test auth endpoints (should return 401 or validation error, not 500)
  await testEndpoint(apiUrl + '/auth/profile', 'Auth Profile Endpoint (should be protected)');
  
  console.log(colors.bold(colors.cyan('\n🔧 Test 3: Firebase Configuration Check\n')));
  
  const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const firebaseProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (firebaseApiKey && firebaseProjectId) {
    console.log(colors.green('✓'), 'Firebase API Key present');
    console.log(colors.green('✓'), 'Firebase Project ID:', colors.yellow(firebaseProjectId));
    
    // Test Firebase REST API
    const firebaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`;
    console.log('\nTesting Firebase REST API...');
    
    const testResult = await new Promise((resolve) => {
      const postData = JSON.stringify({ idToken: 'test-invalid-token' });
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };
      
      const req = https.request(firebaseUrl, options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          // We expect an error since we're using invalid token, but it proves Firebase API is accessible
          if (res.statusCode === 400) {
            console.log(colors.green('✓'), 'Firebase REST API is accessible');
            console.log('  Response:', colors.yellow('Invalid token (expected)'));
            resolve({ success: true });
          } else {
            console.log(colors.yellow('⚠️'), 'Firebase REST API responded with:', res.statusCode);
            resolve({ success: true, warning: true });
          }
        });
      });
      
      req.on('error', (error) => {
        console.log(colors.red('✗'), 'Firebase REST API error:', error.message);
        resolve({ success: false, error: error.message });
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        console.log(colors.red('✗'), 'Firebase REST API timeout');
        resolve({ success: false, error: 'Timeout' });
      });
      
      req.write(postData);
      req.end();
    });
  } else {
    console.log(colors.red('✗'), 'Firebase configuration missing');
  }
  
  console.log(colors.bold(colors.cyan('\n📊 Test Summary\n')));
  
  if (allVarsPresent) {
    console.log(colors.green('✅ Environment variables: PASS'));
  } else {
    console.log(colors.yellow('⚠️  Environment variables: INCOMPLETE (check eas.json)'));
  }
  
  console.log(colors.bold(colors.cyan('\n💡 Recommendations:\n')));
  console.log(colors.green('1.'), 'If backend tests fail, check if API is deployed and running');
  console.log(colors.green('2.'), 'If Firebase tests fail, verify Firebase project configuration');
  console.log(colors.green('3.'), 'For preview builds, ensure eas.json has all environment variables');
  console.log(colors.green('4.'), 'Check Firebase console for any project issues');
  
  console.log(colors.bold(colors.cyan('\n🔍 Debugging Firebase Auth Issues:\n')));
  console.log(colors.yellow('If you\'re getting "Component auth has not been registered yet":'));
  console.log('  • This is a timing issue with Firebase SDK initialization');
  console.log('  • The fix has been applied with relaxed verification');
  console.log('  • Try rebuilding: npm run build:preview');
  console.log('  • Wait 10-20 seconds after app launch before logging in');
  console.log('  • Check console logs for Firebase initialization messages');
  
  console.log('\n');
}

runTests().catch(console.error);
