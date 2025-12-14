@echo off
echo ================================================
echo Hebrew Voice Installer
echo ================================================
echo.
echo This will launch PowerShell to install Hebrew voices.
echo.
echo IMPORTANT: You need Administrator rights!
echo.
pause

PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0install-hebrew-voices.ps1'"

pause
