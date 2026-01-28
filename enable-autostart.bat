@echo off
REM ============================================
REM  開機自動啟動 Web 服務器
REM ============================================
REM 右鍵 → 以系統管理員身份執行此檔案

chcp 65001 > nul

echo.
echo ====================================
echo   設定開機自動啟動
echo ====================================
echo.

REM 檢查管理員權限
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  需要系統管理員權限！
    echo 請右鍵此檔案 → 以系統管理員身份執行
    pause
    exit /b 1
)

REM 確保 PM2 已安裝
echo 檢查 PM2...
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 正在安裝 PM2...
    call npm install -g pm2
)

cd /d "%~dp0"

REM 使用 PM2 設定開機自動啟動
echo 設定 PM2 開機自動啟動...
call pm2 startup Windows -u %USERNAME% --hp %USERPROFILE%

echo.
echo 啟動服務...
call pm2 start ecosystem.config.js
call pm2 save

echo.
echo ✓ 設定完成！
echo.
echo 📝 說明：
echo   • 服務將在下次開機時自動啟動
echo   • 若進程出現意外終止，PM2 會自動重啟
echo.
echo 🔧 管理命令：
echo   - pm2 list              查看運行狀態
echo   - pm2 logs web-automation-server  查看服務日誌
echo   - pm2 stop web-automation-server  手動停止
echo   - pm2 unstartup         移除開機自動啟動設定
echo.
echo 🌐 訪問：http://localhost:3000
echo.
pause
