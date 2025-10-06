# Mvama Connect - APK Build Instructions

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Expo CLI** installed globally:
   ```bash
   npm install -g @expo/cli
   ```
3. **EAS CLI** installed globally:
   ```bash
   npm install -g eas-cli
   ```

## Build Methods

### Method 1: EAS Build (Recommended)

1. **Login to Expo:**
   ```bash
   eas login
   ```

2. **Configure the project:**
   ```bash
   eas build:configure
   ```

3. **Build APK:**
   ```bash
   eas build --platform android --profile preview
   ```

### Method 2: Local Build

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Prebuild for Android:**
   ```bash
   npx expo prebuild --platform android
   ```

3. **Build APK locally:**
   ```bash
   npx expo run:android --variant release
   ```

## Configuration Files

- `app.json` - App configuration with Android settings
- `eas.json` - EAS build configuration
- `package.json` - Dependencies and build scripts

## Android Settings

- **Package Name:** `com.mvama.connect`
- **Version Code:** 1
- **Version Name:** 1.0.0
- **Permissions:** Internet and Network State access

## Build Profiles

- **preview** - APK for testing (recommended for APK export)
- **production** - APK for production release

## Output

The APK file will be generated and can be installed on Android devices.

## Troubleshooting

1. **Clear cache if needed:**
   ```bash
   npx expo start --clear
   ```

2. **Check for TypeScript errors:**
   ```bash
   npm run typecheck
   ```

3. **Lint the code:**
   ```bash
   npm run lint
   ```
