@echo off
title Burnout App

echo.
echo  ==========================================
echo    BURNOUT - Car Culture App
echo  ==========================================
echo.

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo  Installing dependencies...
    echo.
    call npm install
    echo.
)

echo  Starting Expo dev server...
echo  Scan the QR code with Expo Go on your phone
echo  or press 'i' for iOS simulator / 'a' for Android
echo.

call npx expo start

pause
