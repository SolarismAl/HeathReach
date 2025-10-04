#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix expo-auth-session tsconfig.json
const tsconfigPath = path.join(__dirname, '..', 'node_modules', 'expo-auth-session', 'tsconfig.json');

if (fs.existsSync(tsconfigPath)) {
  try {
    let content = fs.readFileSync(tsconfigPath, 'utf8');
    
    // Fix the extends path to include .json extension
    content = content.replace(
      '"expo-module-scripts/tsconfig.base"',
      '"expo-module-scripts/tsconfig.base.json"'
    );
    
    fs.writeFileSync(tsconfigPath, content);
    console.log('✅ Fixed expo-auth-session tsconfig.json');
  } catch (error) {
    console.error('❌ Failed to fix expo-auth-session tsconfig.json:', error.message);
  }
} else {
  console.log('ℹ️  expo-auth-session tsconfig.json not found, skipping fix');
}
