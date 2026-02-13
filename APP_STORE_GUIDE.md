# BCLT Academy - App Store Publishing Guide

## Quick Start Commands

```bash
# Build web assets
npm run build

# Sync to native projects
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode (Mac only)
npx cap open ios
```

---

## Google Play Store

### 1. Developer Account Setup
- Go to [Google Play Console](https://play.google.com/console)
- Pay one-time $25 registration fee
- Complete identity verification (may take 48 hours)

### 2. Create App Listing
- Create new app in Play Console
- Fill in store listing:
  - **App Name**: BCLT Academy - تعلم الفرنسية
  - **Short Description**: تعلم اللغة الفرنسية من الصفر إلى الاحتراف
  - **Category**: Education

### 3. Required Assets
| Asset | Size | Format |
|-------|------|--------|
| App Icon | 512x512 | PNG |
| Feature Graphic | 1024x500 | PNG/JPG |
| Screenshots | Min 2 | PNG/JPG |

### 4. Build Release APK/AAB

```bash
# Open Android Studio
npx cap open android
```

In Android Studio:
1. Build → Generate Signed Bundle / APK
2. Create new keystore (SAVE THE PASSWORD!)
3. Build Android App Bundle (.aab)
4. Upload to Play Console

---

## Apple App Store

### 1. Developer Account Setup
- Go to [Apple Developer](https://developer.apple.com)
- Pay $99/year enrollment fee
- Complete identity verification

### 2. App Store Connect Setup
- Create App ID in Developer Portal
- Create app in [App Store Connect](https://appstoreconnect.apple.com)

### 3. Required Assets
| Asset | Size | Format |
|-------|------|--------|
| App Icon | 1024x1024 | PNG (no alpha) |
| iPhone Screenshots | 6.5" and 5.5" | PNG |
| iPad Screenshots | 12.9" | PNG |

### 4. Build for App Store

```bash
# Open Xcode
npx cap open ios
```

In Xcode:
1. Select "Any iOS Device" as build target
2. Product → Archive
3. Distribute App → App Store Connect
4. Upload and submit for review

---

## Important Files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | App ID and native settings |
| `android/` | Android Studio project |
| `ios/` | Xcode project |
| `public/manifest.webmanifest` | PWA configuration |

---

## Testing Before Publishing

### Android
```bash
npx cap run android
```

### iOS (Mac with Xcode)
```bash
npx cap run ios
```

### PWA
```bash
npm run build && npm run preview
# Open in Chrome DevTools → Application → Manifest
```

---

> **Note**: Keep your signing keys and keystores backed up securely!
