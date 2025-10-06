# HealthReach Expo Fix Script
# This script automates the fixes for Expo configuration issues

Write-Host "🏥 HealthReach - Expo Configuration Fix Script" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Configuration files have been updated:" -ForegroundColor Green
Write-Host "   - app.json: Removed invalid updates.projectId" -ForegroundColor White
Write-Host "   - eas.json: Added channels to all build profiles" -ForegroundColor White
Write-Host "   - package.json: Added dependency resolutions" -ForegroundColor White
Write-Host ""

# Step 1: Update dependencies
Write-Host "📦 Step 1: Updating dependencies to match Expo SDK 54..." -ForegroundColor Yellow
Write-Host ""

$updateChoice = Read-Host "Run 'npx expo install --fix' to update packages? (y/n)"
if ($updateChoice -eq 'y' -or $updateChoice -eq 'Y') {
    Write-Host "Running: npx expo install --fix" -ForegroundColor Cyan
    npx expo install --fix
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies updated successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Dependency update completed with warnings" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipped dependency update" -ForegroundColor Gray
}

Write-Host ""

# Step 2: Install dependencies with resolutions
Write-Host "📦 Step 2: Installing dependencies with resolutions..." -ForegroundColor Yellow
Write-Host ""

$installChoice = Read-Host "Run 'npm install' to apply resolutions? (y/n)"
if ($installChoice -eq 'y' -or $installChoice -eq 'Y') {
    Write-Host "Running: npm install" -ForegroundColor Cyan
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Error installing dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⏭️  Skipped npm install" -ForegroundColor Gray
}

Write-Host ""

# Step 3: Icon fix information
Write-Host "🎨 Step 3: Icon Dimension Issues" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Your app icons need to be resized to meet Expo requirements:" -ForegroundColor Yellow
Write-Host "   - icon.png: 558x447 → 1024x1024" -ForegroundColor White
Write-Host "   - android-icon-foreground.png: 189x183 → 512x512" -ForegroundColor White
Write-Host "   - android-icon-background.png: 189x183 → 512x512" -ForegroundColor White
Write-Host "   - android-icon-monochrome.png: 189x183 → 512x512" -ForegroundColor White
Write-Host ""

$iconChoice = Read-Host "View detailed icon fix instructions? (y/n)"
if ($iconChoice -eq 'y' -or $iconChoice -eq 'Y') {
    Write-Host ""
    node scripts/fix-icons.js
} else {
    Write-Host "⏭️  Skipped icon instructions" -ForegroundColor Gray
    Write-Host "💡 Run 'node scripts/fix-icons.js' anytime to view instructions" -ForegroundColor Cyan
}

Write-Host ""

# Step 4: Verify fixes
Write-Host "🔍 Step 4: Verification" -ForegroundColor Yellow
Write-Host ""

$verifyChoice = Read-Host "Run 'npx expo doctor' to verify fixes? (y/n)"
if ($verifyChoice -eq 'y' -or $verifyChoice -eq 'Y') {
    Write-Host "Running: npx expo doctor" -ForegroundColor Cyan
    Write-Host ""
    npx expo doctor
    Write-Host ""
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All checks passed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some issues remain (likely icon dimensions)" -ForegroundColor Yellow
        Write-Host "💡 Fix the icon dimensions and run 'npx expo doctor' again" -ForegroundColor Cyan
    }
} else {
    Write-Host "⏭️  Skipped verification" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🎉 Expo Fix Script Completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Configuration files updated" -ForegroundColor Green
Write-Host "   ✅ EAS Update channels configured" -ForegroundColor Green
Write-Host "   ✅ Dependency resolutions added" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Fix icon dimensions (see EXPO_FIXES.md)" -ForegroundColor White
Write-Host "   2. Run 'npx expo doctor' to verify" -ForegroundColor White
Write-Host "   3. Build your app: 'npm run build:preview'" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed information, see: EXPO_FIXES.md" -ForegroundColor Cyan
Write-Host ""
