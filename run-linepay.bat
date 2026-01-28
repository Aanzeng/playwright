@echo off
REM LinePay 交易記錄自動下載 - 可執行包裝器
REM 此檔案將自動執行 run-linepay.js

cd /d "%~dp0"
node run-linepay.js %*
pause
