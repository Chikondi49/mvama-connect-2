@echo off
echo Building Mvama Connect APK...
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Running TypeScript check...
call npm run typecheck
if %errorlevel% neq 0 (
    echo Error: TypeScript errors found
    pause
    exit /b 1
)

echo.
echo Step 3: Prebuilding for Android...
call npx expo prebuild --platform android
if %errorlevel% neq 0 (
    echo Error: Prebuild failed
    pause
    exit /b 1
)

echo.
echo Step 4: Building APK...
echo Note: This requires Android Studio and an Android device/emulator
echo.
echo To build APK manually:
echo 1. Open Android Studio
echo 2. Open the 'android' folder in this project
echo 3. Go to Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
echo 4. The APK will be generated in android/app/build/outputs/apk/release/
echo.
echo Alternative: Use EAS Build (cloud build):
echo 1. Run: eas login
echo 2. Run: eas build --platform android --profile preview
echo.
pause
