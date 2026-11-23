@echo off
title Kasetfair Frontend Dev
color 0B
echo ===============
echo           Kasetfair - FRONTEND DEV SERVER
echo ===============
echo.
cd /d "%~dp0frontend"
echo [INFO] Starting Vite dev server (proxies /api and /kasetfair/api to :4001)...
echo.
call npm.cmd run dev -- --host
pause

