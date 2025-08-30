@echo off
echo PHP Build System for Free Image Materials
echo ==========================================

cd /d "%~dp0"

echo Checking PHP installation...
php --version
if %errorlevel% neq 0 (
    echo Error: PHP is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Starting build process...
php scripts/build.php

if %errorlevel% neq 0 (
    echo.
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo You can now view the site by opening index.html
pause
