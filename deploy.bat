@echo off
cd /d "%~dp0tools\deploy"
for /f "usebackq delims=" %%p in (`powershell -NoProfile -Command "$s=Read-Host 'SFTP password' -AsSecureString; [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))"`) do set "SFTP_PASS=%%p"
node sftp-push.mjs %*
set "SFTP_PASS="
pause

