@REM VBScript 包裝器 - 以隱藏窗口方式執行 batch 檔案
@echo off
if "%1"=="" (
    cscript.exe "%~f0?.vbs" %*
    exit /b
)
WScript.CreateObject("WScript.Shell").Run """" & WScript.Arguments(0) & """", 0, False
