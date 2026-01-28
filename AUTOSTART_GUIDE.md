# ⚙️ 開機自動啟動設定指南

## 📋 概述

安裝完成後，可以設定服務在電腦開機時自動啟動。本指南提供三種設定方式，從簡單到高級。

---

## 🚀 方式 1：使用 PM2（推薦 ⭐⭐⭐）

PM2 是專業的 Node.js 進程管理工具，具有自動重啟、日誌記錄等功能。

### 安裝步驟

1. **打開命令行** (Win + R，輸入 `cmd` 或 `powershell`)

2. **執行自動設定** (推薦)
   ```bash
   # 方式 A：運行自動設定檔案（需要管理員權限）
   cd c:\Users\AndyZeng\Desktop\playwrightAutoReport\playwright
   enable-autostart.bat
   ```

   或手動執行：
   ```bash
   # 方式 B：手動命令
   cd c:\Users\AndyZeng\Desktop\playwrightAutoReport\playwright
   pm2 startup Windows -u %USERNAME% --hp %USERPROFILE%
   pm2 start ecosystem.config.js
   pm2 save
   ```

### 驗證設定

```bash
# 查看 PM2 管理的進程
pm2 list

# 查看服務日誌
pm2 logs web-automation-server

# 查看服務狀態
pm2 status
```

### 常用命令

```bash
# 重啟服務
pm2 restart web-automation-server

# 停止服務
pm2 stop web-automation-server

# 啟動服務
pm2 start web-automation-server

# 查看詳細日誌
pm2 logs web-automation-server --lines 100

# 移除開機自動啟動
pm2 unstartup
```

---

## 🚀 方式 2：使用 Windows 工作排程器

適合只需要開機啟動、不需要進程監控的情況。

### 設定步驟

1. **按 Win + R**，輸入 `taskschd.msc` 打開工作排程器

2. **右側點擊「建立基本工作」**

3. **填寫以下信息**：
   - **名稱**：Web 自動化服務
   - **描述**：開機時啟動 Playwright 自動化任務執行器

4. **觸發器設定**：
   - 選擇「電腦啟動時」

5. **操作設定**：
   - **程式/指令碼**：
     ```
     C:\Windows\System32\cmd.exe
     ```
   - **新增引數**：
     ```
     /c start-web.bat
     ```
   - **起始位置**：
     ```
     c:\Users\AndyZeng\Desktop\playwrightAutoReport\playwright
     ```

6. **完成設定**

### 驗證

重啟電腦後，訪問 `http://localhost:3000` 檢查服務是否已啟動。

---

## 🚀 方式 3：啟動資料夾（最簡單）

將快捷方式放在啟動資料夾，開機時自動執行。

### 設定步驟

1. **建立批處理檔案**
   ```batch
   @echo off
   cd /d "c:\Users\AndyZeng\Desktop\playwrightAutoReport\playwright"
   start-web.bat
   ```
   保存為 `startup.bat`

2. **打開啟動資料夾**
   - 按 Win + R，輸入：
     ```
     shell:startup
     ```

3. **建立快捷方式**
   - 將 `startup.bat` 的快捷方式複製到啟動資料夾

4. **重啟電腦測試**

---

## 📊 三種方式對比

| 方式 | 難度 | 自動重啟 | 日誌記錄 | 進程監控 | 推薦度 |
|------|------|--------|--------|--------|-------|
| PM2 | ⭐⭐ | ✅ | ✅ | ✅ | ⭐⭐⭐ |
| 工作排程器 | ⭐⭐ | ❌ | ❌ | ❌ | ⭐⭐ |
| 啟動資料夾 | ⭐ | ❌ | ❌ | ❌ | ⭐ |

---

## 🔍 故障排除

### 1. 服務未在開機時啟動

**檢查 PM2 狀態**：
```bash
pm2 list
pm2 logs web-automation-server
```

**重新設定**：
```bash
pm2 delete web-automation-server
pm2 start ecosystem.config.js
pm2 save
```

### 2. 端口 3000 已被佔用

查看和終止佔用端口的進程：
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

或修改 `ecosystem.config.js` 中的端口號。

### 3. 無法訪問 http://localhost:3000

- 確認服務正在運行：`pm2 list`
- 檢查防火牆設定
- 查看日誌：`pm2 logs web-automation-server`

### 4. 移除開機自動啟動

執行以下命令：
```bash
pm2 unstartup
pm2 delete web-automation-server
```

或使用批處理檔案：
```bash
disable-autostart.bat
```

---

## 📝 日誌位置

所有日誌保存在 `logs/` 目錄：
- `logs/error.log` - 錯誤日誌
- `logs/out.log` - 輸出日誌
- `logs/combined.log` - 完整日誌

查看實時日誌：
```bash
pm2 logs web-automation-server --lines 50 --follow
```

---

## ✅ 驗證清單

設定完成後，檢查以下項目：

- [ ] PM2 已安裝：`pm2 -v`
- [ ] 服務已啟動：`pm2 list`
- [ ] 開機自動啟動已設定：`pm2 startup status`
- [ ] 可訪問 http://localhost:3000
- [ ] 日誌無錯誤：`pm2 logs`
- [ ] 重啟電腦後服務自動啟動

---

## 🎯 推薦配置流程

1. ✅ 安裝 Express 依賴
2. ✅ 測試服務正常運行
3. ✅ 執行 `enable-autostart.bat`（以管理員權限）
4. ✅ 驗證服務運行狀態
5. ✅ 重啟電腦測試自動啟動
6. ✅ 完成！

---

## 📞 常見問題

**Q：開機多久後服務才會啟動？**
A：通常在開機後 30 秒～2 分鐘內啟動，取決於系統啟動速度。

**Q：服務崩潰會自動重啟嗎？**
A：是的，PM2 會在進程意外終止時自動重啟（配置中設定了 `autorestart: true`）。

**Q：如何臨時停止服務？**
A：執行 `pm2 stop web-automation-server`。若要完全禁用開機自動啟動，執行 `disable-autostart.bat`。

**Q：可以修改自動啟動的端口嗎？**
A：可以。編輯 `ecosystem.config.js` 中的 `env.PORT` 設定。

---

**版本**：1.0.0 | **更新時間**：2026-01-27
