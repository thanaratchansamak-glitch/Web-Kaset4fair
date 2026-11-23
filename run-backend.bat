@echo off
title Kasetfair Backend Server
color 0A
echo ===============
echo            Kasetfair - BACKEND SERVER
echo ===============
echo.
cd /d "%~dp0backend"
echo [INFO] Starting backend on http://localhost:4001/kasetfair/
echo.
node server.js
pause
