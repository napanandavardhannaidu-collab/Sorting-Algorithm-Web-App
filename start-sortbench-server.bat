@echo off
REM =====================================================
REM SortBench Server Auto-Start Script
REM =====================================================
REM Instructions:
REM 1. Copy this file to Windows Startup folder:
REM    C:\Users\prash\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
REM 2. Server will auto-start every time you boot Windows
REM 3. To stop: Run "npx pm2 stop sorting-app-server" or "npx pm2 stop all"
REM 4. To check status: Run "npx pm2 status"
REM =====================================================

cd /d "C:\Users\prash\Downloads\sorting algo web app"

REM Start PM2 and resurrect saved processes
npx pm2 resurrect

REM Log startup
echo. >> "%APPDATA%\.pm2\startup.log"
echo ===================================== >> "%APPDATA%\.pm2\startup.log"
echo SortBench Server Started at %date% %time% >> "%APPDATA%\.pm2\startup.log"
echo ===================================== >> "%APPDATA%\.pm2\startup.log"

exit
