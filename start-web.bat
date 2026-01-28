@echo off
chcp 65001 > nul

REM 如果是無窗口模式啟動（開機自動），執行並退出
if "%1"=="--silent" (
    call npm start >nul 2>&1
    exit /b 0
)

echo.
echo ====================================
echo   自動化任務執行器 Web 界面
echo ====================================
echo.

REM 檢查 node_modules 是否存在
if not exist "node_modules" (
    echo 正在安裝依賴...
    call npm install
)

echo.
echo 🚀 啟動服務器...
echo.
echo 🌐 請在瀏覽器中訪問: http://localhost:3000
echo.
echo 按 Ctrl+C 可停止服務器
echo.

call npm start
