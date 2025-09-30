# HealthReach - App Icon & Splash Screen Guide

## 📱 Required Images

Your app needs these images in the `assets/images/` folder:

### **1. App Icon (iOS & Android)**
- **File**: `icon.png`
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Usage**: Main app icon

### **2. Android Adaptive Icons**
- **Foreground**: `android-icon-foreground.png` (1024x1024)
- **Background**: `android-icon-background.png` (1024x1024)
- **Monochrome**: `android-icon-monochrome.png` (1024x1024)

### **3. Splash Screen**
- **File**: `splash-icon.png`
- **Size**: 1024x1024 pixels (or larger)
- **Format**: PNG with transparency
- **Background**: White (#ffffff)

### **4. Favicon (Web)**
- **File**: `favicon.png`
- **Size**: 48x48 pixels
- **Format**: PNG

## 🎨 Design Recommendations

### **HealthReach Icon Design Ideas:**

1. **Medical Cross + Heart**
   - Blue/teal color scheme (#4A90E2)
   - Modern, clean design
   - Represents healthcare and care

2. **Stethoscope Icon**
   - Simple, recognizable
   - Professional medical look

3. **Health + Technology**
   - Combine medical symbol with tech elements
   - Shows modern healthcare app

### **Color Scheme:**
- Primary: `#4A90E2` (Blue)
- Secondary: `#28a745` (Green - for health workers)
- Background: `#E6F4FE` (Light blue)

## 🛠️ How to Create Icons

### **Option 1: Use Online Tools (Easiest)**

1. **Create Icon**: https://www.canva.com
   - Search "app icon template"
   - Design 1024x1024 icon
   - Download as PNG

2. **Generate Adaptive Icons**: https://easyappicon.com
   - Upload your 1024x1024 icon
   - Download Android adaptive icons

3. **Create Splash Screen**: https://www.figma.com
   - Create 1024x1024 design
   - Center your logo
   - Export as PNG

### **Option 2: Use AI Tools**

Use DALL-E, Midjourney, or similar:
```
Prompt: "Modern minimalist app icon for healthcare appointment booking app called HealthReach, 
medical cross, blue and teal colors, flat design, professional, 1024x1024"
```

### **Option 3: Hire a Designer**

- Fiverr: $5-$50
- Upwork: $50-$200
- 99designs: $299+ (contest)

## 📁 File Structure

```
HealthReach/
└── assets/
    └── images/
        ├── icon.png                          (1024x1024)
        ├── android-icon-foreground.png       (1024x1024)
        ├── android-icon-background.png       (1024x1024)
        ├── android-icon-monochrome.png       (1024x1024)
        ├── splash-icon.png                   (1024x1024)
        └── favicon.png                       (48x48)
```

## 🚀 After Adding Images

### **1. Rebuild Your App**
```bash
cd HealthReach
eas build --profile preview --platform android
```

### **2. Test Locally**
```bash
npx expo start
```

## 🎨 Quick Start - Use Placeholder Icons

If you want to test first, create simple placeholder icons:

### **Using ImageMagick (if installed):**
```bash
# Create a simple blue icon with "HR" text
convert -size 1024x1024 xc:#4A90E2 -gravity center -pointsize 400 -fill white -annotate +0+0 "HR" assets/images/icon.png
```

### **Using Online Tool:**
1. Go to: https://www.favicon-generator.org/
2. Upload any image or create text-based icon
3. Download and rename files

## 📝 Current Configuration

Your `app.json` is already configured:

```json
{
  "icon": "./assets/images/icon.png",
  "android": {
    "adaptiveIcon": {
      "backgroundColor": "#E6F4FE",
      "foregroundImage": "./assets/images/android-icon-foreground.png",
      "backgroundImage": "./assets/images/android-icon-background.png",
      "monochromeImage": "./assets/images/android-icon-monochrome.png"
    }
  },
  "splash": {
    "image": "./assets/images/splash-icon.png",
    "backgroundColor": "#ffffff"
  }
}
```

## 🎯 Recommended Workflow

1. **Create main icon** (1024x1024) - Your logo/brand
2. **Use icon generator** to create adaptive icons
3. **Create splash screen** - Same logo, centered
4. **Add to assets/images/** folder
5. **Rebuild app** with EAS Build
6. **Test on device**

## 🔍 Verify Icons

After building, check:
- App drawer icon (Android home screen)
- Recent apps icon
- Splash screen on app launch
- Notification icon

## 💡 Pro Tips

1. **Keep it simple** - Icons should be recognizable at small sizes
2. **Use high contrast** - Easy to see on any background
3. **Avoid text** - Unless it's very large and clear
4. **Test on device** - Icons look different on actual phones
5. **Follow guidelines**:
   - Android: https://developer.android.com/develop/ui/views/launch/icon_design_adaptive
   - iOS: https://developer.apple.com/design/human-interface-guidelines/app-icons

## 🆘 Need Help?

If you need custom icons designed, I can:
1. Provide more specific design recommendations
2. Help you use free design tools
3. Review your icon designs before building

---

**Note**: The app will use default Expo icons until you add custom ones. The app will still work perfectly!
