@echo off
title Burnout App
echo.
echo  ==========================================
echo    BURNOUT - Car Culture App
echo  ==========================================
echo.
echo  What do you want to do?
echo  [1] Start web dev server (browser)
echo  [2] Build APK for Android (installs on phone)
echo  [3] Start with Expo Go (scan QR on phone)
echo.
set /p choice="Enter 1, 2, or 3: "

if not exist "node_modules\" (
    echo.
    echo  Installing dependencies...
    call npm install
    echo.
)

if "%choice%"=="1" (
    echo  Opening in browser at http://localhost:8081
    call npx expo start --web
)

if "%choice%"=="2" (
    echo.
    echo  Building APK via EAS...
    echo  You need an Expo account: expo.dev (free)
    echo  Run this once to log in: npx eas-cli login
    echo.
    call npx eas-cli build --platform android --profile preview
    echo.
    echo  When done, scan the QR code on expo.dev to download the APK.
)

if "%choice%"=="3" (
    echo  Install Expo Go on your phone, then scan the QR code below.
    call npx expo start
)

pause
