@echo off
REM 開機自動啟動 - Windows 工作排程器設定
REM 用途：使用 Windows 內建的工作排程器設定服務開機自動啟動
REM 使用方式：右鍵 → 以系統管理員身份執行

setlocal enabledelayedexpansion
chcp 65001 > nul

echo.
echo ╔════════════════════════════════════════╗
echo ║    開機自動啟動設定                      ║
echo ╚════════════════════════════════════════╝
echo.

REM 檢查管理員權限
net session >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo [✗] 需要管理員權限！
    echo.
    echo 請按照以下步驟操作：
    echo  1. 右鍵點擊此檔案
    echo  2. 選擇「以系統管理員身份執行」
    echo.
    timeout /t 3 /nobreak
    exit /b 1
)

set "PROJECT_PATH=c:\Users\AndyZeng\Desktop\playwrightAutoReport\playwright"
set "TASK_NAME=AutomationWebServer"

echo [i] 檢查舊工作排程...
schtasks /query /tn "!TASK_NAME!" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo [*] 正在刪除舊排程...
    schtasks /delete /tn "!TASK_NAME!" /f >nul 2>&1
)

echo [*] 建立新的工作排程...
schtasks /create ^
    /tn "!TASK_NAME!" ^
    /tr "cmd /c start \"\" /d \"!PROJECT_PATH!\" \"!PROJECT_PATH!\start-web.bat\"" ^
    /sc onstart ^
    /ru !USERNAME! ^
    /f >nul 2>&1

if !ERRORLEVEL! EQU 0 (
    echo [✓] 工作排程已建立
    echo.
    echo 工作排程詳情：
    echo  • 名稱：!TASK_NAME!
    echo  • 觸發器：電腦啟動時
    echo  • 執行用戶：!USERNAME!
    echo  • 執行命令：start-web.bat
    echo.
    echo [✓] 設定完成！
    echo.
    echo 下次開機時服務將自動啟動。
    echo 訪問 http://localhost:3000 使用網頁界面。
) else (
    echo [✗] 設定失敗！
    echo 錯誤代碼：!ERRORLEVEL!
)

echo.
pause
