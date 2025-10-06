@echo off
echo Fixing AGP version compatibility...
echo.

echo Step 1: Cleaning Gradle cache...
cd android
if exist .gradle rmdir /s /q .gradle
if exist app\build rmdir /s /q app\build
if exist build rmdir /s /q build

echo.
echo Step 2: Forcing AGP version 8.6.0...
echo Updated build.gradle with AGP 8.6.0
echo Added gradle.properties setting

echo.
echo Step 3: Gradle wrapper cleanup...
if exist gradle\wrapper\gradle-wrapper.jar del gradle\wrapper\gradle-wrapper.jar

echo.
echo Step 4: Instructions for Android Studio...
echo.
echo 1. Close Android Studio completely
echo 2. Delete the .idea folder in the android directory
echo 3. Reopen Android Studio
echo 4. Open the android folder as a project
echo 5. Let it sync and download dependencies
echo 6. If prompted, accept the Gradle wrapper download
echo.
echo Alternative: Use EAS Build (cloud build)
echo eas build --platform android --profile preview
echo.
pause
