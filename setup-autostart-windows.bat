@echo off
REM ============================================
REM  Windows 開機自動啟動設定助手
REM ============================================
REM 使用 Windows 工作排程器設定開機自動啟動
REM 需要以系統管理員身份運行

chcp 65001 > nul
setlocal enabledelayedexpansion

echo.
echo ====================================
echo   開機自動啟動設定助手
echo ====================================
echo.

REM 檢查管理員權限
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 需要以系統管理員身份運行此批處理檔案！
    echo.
    echo 請按照以下步驟操作：
    echo 1. 右鍵點擊此檔案 (setup-autostart-windows.bat)
    echo 2. 選擇「以系統管理員身份執行」
    echo.
    pause
    exit /b 1
)

REM 定義變數
set "PROJECT_PATH=c:\Users\AndyZeng\Desktop\playwrightAutoReport\playwright"
set "BAT_FILE=%PROJECT_PATH%\start-web.bat"
set "TASK_NAME=AutomationWebServer"
set "TASK_DESCRIPTION=開機自動啟動 Web 自動化任務執行器"

echo 正在設定開機自動啟動...
echo.

REM 檢查批處理檔案是否存在
if not exist "%BAT_FILE%" (
    echo ❌ 錯誤：找不到 %BAT_FILE%
    echo 請確保此檔案與 start-web.bat 在同一目錄中
    pause
    exit /b 1
)

echo ✓ 已驗證項目路徑
echo.

REM 刪除舊的工作（如果存在）
echo 檢查是否存在舊的工作排程...
schtasks /query /tn "%TASK_NAME%" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 正在刪除舊的工作排程...
    schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1
    echo ✓ 已刪除舊的工作排程
    echo.
)

REM 建立新的工作排程
echo 正在建立新的工作排程...
echo.

schtasks /create ^
    /tn "%TASK_NAME%" ^
    /tr "cmd /c start \"\" /d \"%PROJECT_PATH%\" \"%BAT_FILE%\"" ^
    /sc onstart ^
    /ru %USERNAME% ^
    /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 工作排程設定成功！
    echo.
    echo 📋 工作詳情：
    echo   • 工作名稱：%TASK_NAME%
    echo   • 執行路徑：%BAT_FILE%
    echo   • 觸發時機：電腦啟動時
    echo   • 執行用戶：%USERNAME%
    echo.
    echo 🔍 管理工作：
    echo   • 打開「工作排程器」可查看和管理此工作
    echo   • 或使用命令：schtasks /query /tn "%TASK_NAME%"
    echo.
    echo 🧪 測試方法：
    echo   1. 重啟電腦
    echo   2. 開機後訪問 http://localhost:3000
    echo.
) else (
    echo.
    echo ❌ 工作排程設定失敗！
    echo 錯誤代碼：%ERRORLEVEL%
    echo.
)

REM 安裝依賴（如果未安裝）
echo.
echo 檢查項目依賴...
cd /d "%PROJECT_PATH%"

if not exist "node_modules" (
    echo 正在安裝依賴（第一次安裝需要時間）...
    call npm install
    echo ✓ 依賴安裝完成
) else (
    echo ✓ 依賴已安裝
)

echo.
echo ====================================
echo   設定完成！
echo ====================================
echo.
echo 💡 提示：
echo   • 下次開機時，服務將自動啟動
echo   • 首次啟動可能需要 30 秒～2 分鐘
echo   • 打開瀏覽器訪問 http://localhost:3000
echo.
echo 🛠️  若要禁用自動啟動，執行：
echo   schtasks /delete /tn "%TASK_NAME%" /f
echo.
pause
