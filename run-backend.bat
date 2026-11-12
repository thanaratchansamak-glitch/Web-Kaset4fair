@echo off
title Backend Server
color 0A
echo ===================================================
echo               BACKEND API SERVER
echo ===================================================
echo.
cd /d "%~dp0\backend"
echo [INFO] Starting Backend Server on http://localhost:3000 ...
echo.
node index.js
pause
