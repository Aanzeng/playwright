@echo off
REM ============================================
REM  禁用開機自動啟動
REM ============================================

chcp 65001 > nul

echo.
echo ====================================
echo   禁用開機自動啟動
echo ====================================
echo.

cd /d "%~dp0"

echo 正在移除 PM2 開機自動啟動設定...
call pm2 unstartup

echo 停止服務...
call pm2 stop web-automation-server

echo 刪除 PM2 管理的進程...
call pm2 delete web-automation-server

echo.
echo ✓ 已禁用開機自動啟動！
echo.
echo 若要重新啟用，執行 enable-autostart.bat
echo.
pause
