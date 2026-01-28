@echo off
REM ============================================
REM  Web 自動化任務執行器 - PM2 設定啟動
REM ============================================
chcp 65001 > nul

cd /d "%~dp0"

echo.
echo ====================================
echo   自動化任務執行器 - PM2 管理
echo ====================================
echo.

REM 檢查是否安裝了 PM2
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  未找到 PM2，正在安裝...
    call npm install -g pm2
)

REM 檢查 node_modules
if not exist "node_modules" (
    echo 正在安裝項目依賴...
    call npm install
)

REM 建立日誌目錄
if not exist "logs" (
    mkdir logs
    echo ✓ 已建立日誌目錄
)

echo.
echo 🚀 使用 PM2 啟動服務器...
echo.

REM 停止舊進程
call pm2 delete web-automation-server 2>nul

REM 啟動服務
call pm2 start ecosystem.config.js

echo.
echo ✓ 服務已啟動！
echo.
echo 📋 可用命令：
echo   - pm2 list          查看運行狀態
echo   - pm2 logs          查看日誌
echo   - pm2 restart web-automation-server  重啟服務
echo   - pm2 stop web-automation-server     停止服務
echo.
echo 🌐 訪問網址：http://localhost:3000
echo.
pause
