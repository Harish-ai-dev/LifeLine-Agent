@echo off
title LifeLine Agent — Autonomous Emergency Dispatch & ADK Swarm
setlocal enabledelayedexpansion

echo ===================================================================
echo 🚑 LifeLine Agent — Autonomous Emergency Dispatch System
echo    Next.js (3000) + FastAPI (8000) + Google ADK Web (8501)
echo ===================================================================
echo.

:: Ensure working directory is project root
cd /d "%~dp0"

:: Add Python Scripts directories to PATH
set "PATH=%PATH%;%APPDATA%\Python\Python314\Scripts;C:\Python314\Scripts;C:\Python313\Scripts;C:\Python312\Scripts;C:\Python311\Scripts"

:: 1. Check Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python not found in PATH. Please install Python 3.11+.
    pause
    exit /b 1
)

:: 2. Check Node / npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js / npm not found in PATH. Please install Node.js 18+.
    pause
    exit /b 1
)

:: 3. Check frontend directory
if not exist "frontend\package.json" (
    echo [ERROR] frontend\package.json not found.
    pause
    exit /b 1
)

:: 4. Ensure production build exists
if not exist "frontend\.next\BUILD_ID" (
    echo [INFO] Building frontend production bundle...
    cd frontend && call npm run build && cd ..
)

echo.
echo [1/3] Starting FastAPI Backend on port 8000...
start "LifeLine-Backend" /B python -m uvicorn lifeline.main:app --host 0.0.0.0 --port 8000

echo [2/3] Starting Next.js Frontend on port 3000...
start "LifeLine-Frontend" /B cmd /c "cd frontend && npm run start"

echo [3/3] Starting Google ADK Visual Web UI on port 8501...
where adk >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start "LifeLine-ADK-Web" /B adk web --port 8501 lifeline_adk
) else (
    if exist "%APPDATA%\Python\Python314\Scripts\adk.exe" (
        start "LifeLine-ADK-Web" /B "%APPDATA%\Python\Python314\Scripts\adk.exe" web --port 8501 lifeline_adk
    ) else (
        start "LifeLine-ADK-Web" /B python -m google.adk.cli.cli web --port 8501 lifeline_adk
    )
)

echo.
echo ===================================================================
echo ✅ LifeLine Agent is now LIVE!
echo    • Web Showcase:          http://localhost:3000
echo    • Secret Admin & Demo:   http://localhost:3000/og/admin
echo    • Login Portal:          http://localhost:3000/login
echo    • Backend API:           http://localhost:8000
echo    • Google ADK Web UI:     http://localhost:8501
echo    • Swagger Docs:          http://localhost:8000/docs
echo    • Health Check:          http://localhost:8000/health
echo ===================================================================
echo.

:: Launch default URL in default browser
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo Press CTRL+C or close this window to stop all services.
echo.

pause >nul
