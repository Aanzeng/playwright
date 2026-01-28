@echo off
REM Cyberbiz 訂單爬取 - 可執行包裝器
REM 此檔案將自動執行 run-Cyberbiz.js

cd /d "%~dp0"
node run-Cyberbiz.js %*
pause
