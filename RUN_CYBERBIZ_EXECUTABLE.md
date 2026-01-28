# 📦 Cyberbiz 可執行檔方案說明

## 📋 三種執行方式

### 方式 1️⃣ ：批處理檔案（推薦 - 最簡單）

**檔案**：`run-Cyberbiz.bat`

**執行方式**：
- 直接雙擊 `run-Cyberbiz.bat`
- 或在命令行執行：`run-Cyberbiz.bat`

**優點**：
- ✅ 最簡單，無需額外配置
- ✅ 可以看到執行過程（有命令行窗口）
- ✅ 便於除錯

**缺點**：
- ❌ 執行時會顯示命令行窗口

---

### 方式 2️⃣ ：VBS 隱藏執行（推薦 - 專業）

**檔案**：`run-Cyberbiz-hidden.vbs`

**執行方式**：
- 直接雙擊 `run-Cyberbiz-hidden.vbs`
- 或在命令行執行：`cscript run-Cyberbiz-hidden.vbs`

**優點**：
- ✅ 不顯示命令行窗口
- ✅ 看起來像普通應用
- ✅ 可以設定開機自動執行

**缺點**：
- ❌ 執行過程看不到（無法即時除錯）

**進階**：建立快捷方式
1. 右鍵 → 發送到 → 桌面（建立快捷方式）
2. 右鍵快捷方式 → 內容 → 開始位置 → 設定為 `C:\Users\AndyZeng\Desktop\playwrightAutoReport\playwright`
3. 雙擊快捷方式執行

---

### 方式 3️⃣ ：直接執行 JS（開發人員）

**執行方式**：
```bash
node run-Cyberbiz.js
```

**優點**：
- ✅ 最靈活
- ✅ 可以傳遞命令行參數

**缺點**：
- ❌ 需要 Node.js 環境
- ❌ 命令行使用

---

## 🎯 推薦使用流程

### 日常使用
→ 使用 **方式 1**（`run-Cyberbiz.bat`）

### 部署到伺服器或其他電腦
→ 使用 **方式 2**（`run-Cyberbiz-hidden.vbs`）

### 開發或除錯
→ 使用 **方式 3**（`node run-Cyberbiz.js`）

---

## 📂 檔案說明

```
playwright/
├── run-Cyberbiz.js           # 原始 JavaScript 腳本
├── run-Cyberbiz.bat          # 🟢 批處理包裝器（推薦）
├── run-Cyberbiz-hidden.vbs   # 🟢 VBS 包裝器（隱藏窗口）
├── run-Cyberbiz-cli.js       # CLI 入口（備用）
├── credentials-cyberbiz.txt  # ⚠️ 認證檔案（需要配置）
└── ...
```

---

## ⚙️ 配置說明

### 必須設定
確保 `credentials-cyberbiz.txt` 檔案存在且格式正確：

```
店名,URL,帳號,密碼
shop1,https://cyberbiz.com.tw,admin@shop.com,password123
shop2,https://cyberbiz.com.tw,admin2@shop.com,password456
```

### 儲存路徑
已配置為：`E:\SOB\trans\cyberbiz\`

確保目錄存在或 Windows 有權限建立。

---

## 🚀 快速開始

### 最簡單的方式（推薦）

1. **雙擊** `run-Cyberbiz.bat`
2. **等待執行完成**（通常 10-30 分鐘）
3. **按任意鍵關閉** 命令行窗口
4. **查看結果** 在 `E:\SOB\trans\cyberbiz\` 目錄

### 隱藏執行方式

1. **雙擊** `run-Cyberbiz-hidden.vbs`
2. **等待執行完成**（後台執行，看不到窗口）
3. **查看結果** 在 `E:\SOB\trans\cyberbiz\` 目錄

---

## 🔧 開機自動執行

### 方式 A：使用任務排程器

1. 按 Win + R → 輸入 `taskschd.msc`
2. 建立基本工作
3. **名稱**：`Run Cyberbiz Auto`
4. **觸發器**：電腦啟動時
5. **操作**：
   - **程式/指令碼**：`C:\Windows\System32\wscript.exe`
   - **新增引數**：`"E:\full\path\to\run-Cyberbiz-hidden.vbs"`
   - **起始位置**：`c:\Users\AndyZeng\Desktop\playwrightAutoReport\playwright`

### 方式 B：啟動資料夾

1. 按 Win + R → 輸入 `shell:startup`
2. 將 `run-Cyberbiz-hidden.vbs` 的快捷方式放入
3. 下次開機時自動執行

---

## 🐛 故障排除

### 問題 1：執行 .bat 檔案說找不到 node

**解決方案**：
- 確認 Node.js 已安裝
- 重啟命令行
- 檢查 PATH 環境變數

```bash
# 驗證
node --version
npm --version
```

### 問題 2：VBS 無法執行

**解決方案**：
- 確保 Windows 未禁用 VBS 指令碼
- 嘗試右鍵 → 以系統管理員身份執行
- 或使用批處理檔案替代

### 問題 3：下載的檔案位置不對

**檢查**：
- 開啟 `run-Cyberbiz.js`
- 查看第 50 行：`const savePath = 'E:\\SOB\\trans\\cyberbiz\\';`
- 確認該路徑存在

### 問題 4：認證檔案無法讀取

**檢查清單**：
- 檔案名稱必須是 `credentials-cyberbiz.txt`
- 檔案位置在 playwright 專案目錄
- 檔案編碼為 UTF-8
- 格式嚴格：逗號分隔，無空格

### 問題 5：Cyberbiz 登入失敗

**可能原因**：
- 帳號密碼錯誤
- 網站頁面結構已更改
- 瀏覽器自動化被偵測

**解決方案**：
- 驗證帳號密碼
- 查看命令行的詳細錯誤訊息
- 檢查 Cyberbiz 網站是否有安全提示

---

## 💡 高級用法

### 傳遞參數（如果需要自訂邏輯）

修改 `run-Cyberbiz.bat`：
```batch
@echo off
cd /d "%~dp0"
node run-Cyberbiz.js --custom-param value
pause
```

### 記錄執行日誌

修改 `run-Cyberbiz.bat`：
```batch
@echo off
cd /d "%~dp0"
node run-Cyberbiz.js > cyberbiz-log-%date%.txt 2>&1
pause
```

### 靜默執行（不暫停）

修改 `run-Cyberbiz.bat`：
```batch
@echo off
cd /d "%~dp0"
node run-Cyberbiz.js
REM 移除下一行的 pause 使其靜默執行
```

---

## 📋 真正的可執行檔（.exe）

如果必須要 .exe 檔案，有以下選項：

### 選項 1：使用 pkg（需要特定 Node.js 版本）
```bash
npm install -g pkg
pkg run-Cyberbiz.js --targets win-x64 --output run-Cyberbiz.exe
```

### 選項 2：使用 PyInstaller（需要 Python）
可以將 Node.js 應用包裝成 Python，再打包成 .exe

### 選項 3：使用商業工具
- Advanced Installer
- NSIS（Nullsoft Scriptable Install System）
- InstallShield

---

## ✅ 驗證清單

- [ ] `credentials-cyberbiz.txt` 已正確配置
- [ ] `E:\SOB\trans\cyberbiz\` 目錄存在或可自動建立
- [ ] 測試執行 `run-Cyberbiz.bat` 無錯誤
- [ ] 檢查輸出路徑確認檔案已下載
- [ ] （可選）設定開機自動執行

---

## 📞 總結

| 方式 | 檔案 | 優點 | 缺點 | 推薦場景 |
|------|------|------|------|--------|
| 批處理 | `.bat` | 簡單、可除錯 | 顯示窗口 | 日常使用 |
| VBS | `.vbs` | 隱藏、專業 | 難除錯 | 部署、自動化 |
| Node.js | `.js` | 靈活 | 需要環境 | 開發 |
| 真 EXE | `.exe` | 獨立、專業 | 複雜、大檔案 | 商業發布 |

---

**推薦方案**：使用 `run-Cyberbiz.bat`，簡單又實用！

版本：1.0.0 | 更新時間：2026-01-28
