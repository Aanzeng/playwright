' LinePay 交易記錄自動下載 - VBS 包裝器
' 用途：以隱藏命令行窗口的方式執行 run-linepay.js

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' 取得目前腳本的目錄
currentDir = FSO.GetParentFolderName(WScript.ScriptFullName)

' 執行 run-linepay.bat（不顯示窗口）
WshShell.Run currentDir & "\run-linepay.bat", 0, False

' 或者直接執行 Node.js（推薦）
' WshShell.Run "node """ & currentDir & "\run-linepay.js""", 0, False
