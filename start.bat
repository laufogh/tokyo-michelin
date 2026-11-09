@echo off
title Tokyo Michelin Explorer - Live Dev Console
chcp 65001 >nul

echo ===================================================================
echo   🥢 Tokyo Michelin & Tabelog Guide Explorer - Live Dev Console
echo ===================================================================
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Check dependencies
if not exist "node_modules\" (
    echo [*] node_modules not detected. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

echo [*] Starting Vite Dev Server with Live Watcher and Browser Auto-Refresh...
echo [*] Any changes made to the codebase will automatically:
echo       1. Be registered and logged in this console
echo       2. Instantly reload/refresh the browser (HMR)
echo [*] Local URL: http://localhost:5173
echo.
echo Press Ctrl+C in this console to stop the server anytime.
echo ===================================================================
echo.

call npm run dev
