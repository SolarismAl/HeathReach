# HealthReach - Clear Cache Script
# Safe version (no emojis, no encoding issues)
# Purpose: Fix navigation and cache-related issues like "Cannot read property 'href' of undefined"

Write-Host "============================================================"
Write-Host "HealthReach Cache Clearing Script" -ForegroundColor Cyan
Write-Host "============================================================"
Write-Host ""

# Check if we're in the project root
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the root of your project." -ForegroundColor Yellow
    exit 1
}

Write-Host "This script will clear all local caches to fix potential build and navigation issues."
Write-Host ""

# Step 1: Clear Metro bundler cache
Write-Host "Step 1: Clearing Metro bundler cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "Cleared node_modules\.cache" -ForegroundColor Green
} else {
    Write-Host "No Metro cache found (already clean)" -ForegroundColor Gray
}

# Step 2: Clear Expo cache
Write-Host ""
Write-Host "Step 2: Clearing Expo cache..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo"
    Write-Host "Cleared .expo directory" -ForegroundColor Green
} else {
    Write-Host "No .expo directory found (already clean)" -ForegroundColor Gray
}

# Step 3: Clear Android build cache
Write-Host ""
Write-Host "Step 3: Clearing Android build cache..." -ForegroundColor Yellow
$androidCleared = $false
if (Test-Path "android\build") {
    Remove-Item -Recurse -Force "android\build"
    Write-Host "Cleared android\build" -ForegroundColor Green
    $androidCleared = $true
}
if (Test-Path "android\app\build") {
    Remove-Item -Recurse -Force "android\app\build"
    Write-Host "Cleared android\app\build" -ForegroundColor Green
    $androidCleared = $true
}
if (-not $androidCleared) {
    Write-Host "No Android build cache found" -ForegroundColor Gray
}

# Step 4: Clear Watchman cache (if available)
Write-Host ""
Write-Host "Step 4: Clearing Watchman cache..." -ForegroundColor Yellow
try {
    $watchmanExists = Get-Command watchman -ErrorAction SilentlyContinue
    if ($watchmanExists) {
        watchman watch-del-all
        Write-Host "Cleared Watchman cache" -ForegroundColor Green
    } else {
        Write-Host "Watchman not installed (skipping)" -ForegroundColor Gray
    }
} catch {
    Write-Host "Watchman not available (skipping)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================"
Write-Host "Cache clearing completed successfully!" -ForegroundColor Green
Write-Host "============================================================"
Write-Host ""

# Ask if user wants to start Expo dev server
$startServer = Read-Host "Start Expo dev server with cleared cache? (y/n)"
if ($startServer -eq 'y' -or $startServer -eq 'Y') {
    Write-Host ""
    Write-Host "Starting Expo with cleared cache..." -ForegroundColor Cyan
    npx expo start --clear
} else {
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: npx expo start --clear" -ForegroundColor White
    Write-Host "  2. Or rebuild: eas build --platform android --profile preview --clear-cache" -ForegroundColor White
    Write-Host ""
    Write-Host "If the error persists:" -ForegroundColor Yellow
    Write-Host "  - Uninstall the app from your device" -ForegroundColor White
    Write-Host "  - Run a fresh build using EAS" -ForegroundColor White
}
