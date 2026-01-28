# 🚀 開機自動啟動設定 - 完整指南

## 📌 概述

本指南說明如何設定服務在電腦開機時自動啟動。有 **三種方式** 可選，建議使用方式 1。

---

## ✅ 方式 1：一鍵自動設定（推薦）

### 步驟

1. **右鍵點擊** `enable-autostart-simple.bat`
2. **選擇** "以系統管理員身份執行"
3. **等待** 設定完成（通常 5-10 秒）
4. **重啟電腦** 驗證自動啟動

### 驗證

重啟後，打開瀏覽器訪問：`http://localhost:3000`

如果網頁能訪問，則表示設定成功！

---

## ❌ 禁用自動啟動

如需禁用開機自動啟動，執行以下命令（以管理員身份）：

```bash
schtasks /delete /tn "AutomationWebServer" /f
```

或在命令行運行：
```bash
REM 打開命令行（以管理員身份）
schtasks /delete /tn "AutomationWebServer" /f
```

---

## 📋 方式 2：手動設定（工作排程器）

適合不想執行批處理檔案的情況。

### 步驟

1. **打開「工作排程器」**
   - 按 Win + R
   - 輸入 `taskschd.msc`
   - 按 Enter

2. **建立基本工作**
   - 右側點擊「建立基本工作」
   - **名稱**：`AutomationWebServer`
   - **描述**：開機自動啟動 Web 自動化任務執行器
   - 點擊「下一步」

3. **設定觸發器**
   - 選擇「電腦啟動時」
   - 點擊「下一步」

4. **設定操作**
   - 選擇「啟動程式」
   - **程式或指令碼**：
     ```
     C:\Users\AndyZeng\Desktop\playwrightAutoReport\playwright\start-web.bat
     ```
   - **起始位置**：
     ```
     C:\Users\AndyZeng\Desktop\playwrightAutoReport\playwright
     ```
   - 點擊「下一步」

5. **完成**
   - 確認設定無誤
   - 點擊「完成」

### 驗證

- 在工作排程器中找到 `AutomationWebServer`
- 右鍵 → 執行，測試是否正常啟動

---

## 📋 方式 3：啟動資料夾快捷方式

最簡單但最不可靠的方式。

### 步驟

1. **複製啟動檔案**
   ```bash
   copy start-web.bat startup.bat
   ```

2. **打開啟動資料夾**
   - 按 Win + R
   - 輸入 `shell:startup`
   - 按 Enter

3. **建立快捷方式**
   - 到原檔案位置
   - 右鍵 → 發送到 → 桌面（建立快捷方式）
   - 將快捷方式移到啟動資料夾

4. **重啟測試**

### ⚠️ 注意

此方式在某些系統上可能無效，建議使用方式 1。

---

## 📊 方式對比

| 方式 | 難度 | 可靠性 | 推薦度 | 備註 |
|------|------|-------|-------|------|
| 一鍵設定 | ⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 最簡單最可靠 |
| 工作排程器 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 更靈活 |
| 啟動資料夾 | ⭐ | ⭐ | ⭐ | 不穩定 |

---

## 🔍 故障排除

### 問題 1：設定後仍未自動啟動

**檢查清單**：
1. 確認已以管理員身份執行批處理檔案
2. 重啟電腦（關機重啟，不是睡眠）
3. 等待 1-2 分鐘讓服務啟動
4. 檢查 http://localhost:3000 是否可訪問

### 問題 2：開機後無法訪問網頁

**可能原因**：
- 服務未啟動成功
- 防火牆阻止了連接
- 端口 3000 被其他程式佔用

**解決方案**：
```bash
REM 檢查端口佔用
netstat -ano | findstr :3000

REM 檢查工作排程狀態
schtasks /query /tn "AutomationWebServer"

REM 手動啟動服務測試
cd c:\Users\AndyZeng\Desktop\playwrightAutoReport\playwright
npm start
```

### 問題 3：不知道是否成功

**驗證方法**：

```bash
REM 查看工作排程
schtasks /query /tn "AutomationWebServer" /v

REM 執行一次測試
schtasks /run /tn "AutomationWebServer"

REM 查看事件日誌
eventvwr.msc  (在 Windows 日誌 → 系統 中查看)
```

### 問題 4：想要禁用自動啟動

```bash
REM 方法 1：命令行（管理員）
schtasks /delete /tn "AutomationWebServer" /f

REM 方法 2：工作排程器
REM 右鍵刪除 "AutomationWebServer" 工作
```

---

## 📝 包含的檔案說明

| 檔案 | 用途 | 執行方式 |
|------|------|--------|
| `enable-autostart-simple.bat` | 一鍵設定自動啟動 | 右鍵 → 管理員執行 |
| `start-web.bat` | 啟動服務 | 雙擊或命令行執行 |
| `disable-autostart.bat` | 禁用自動啟動 | 右鍵 → 管理員執行 |
| `launcher.vbs` | 隱藏窗口啟動（輔助） | 系統自動調用 |

---

## ✨ 進階設定

### 修改啟動延遲（可選）

若開機時啟動服務有問題，可添加延遲。編輯 `start-web.bat`：

```batch
@echo off
timeout /t 30
REM 等待 30 秒後再啟動

call npm start
```

### 修改監聽端口

編輯 `server.js`，找到 `const PORT = 3000;` 改為其他端口。

### 查看啟動日誌

設定後，在以下位置可找到系統日誌：
- 事件檢視器 → Windows 日誌 → 系統

搜索 `AutomationWebServer` 相關事件。

---

## 🎯 設定完成清單

- [ ] 已執行 `enable-autostart-simple.bat`（管理員）
- [ ] 批處理檔案未顯示錯誤
- [ ] 重啟電腦
- [ ] 開機後 1-2 分鐘訪問 http://localhost:3000
- [ ] 網頁正常顯示
- [ ] ✅ 設定完成！

---

## 📞 快速參考

```bash
REM 檢查工作是否已建立
schtasks /query /tn "AutomationWebServer"

REM 立即執行一次
schtasks /run /tn "AutomationWebServer"

REM 禁用此工作
schtasks /change /tn "AutomationWebServer" /disable

REM 重新啟用此工作
schtasks /change /tn "AutomationWebServer" /enable

REM 刪除此工作
schtasks /delete /tn "AutomationWebServer" /f
```

---

## 💡 常見問題

**Q：設定需要管理員權限嗎？**
A：是的，設定工作排程需要管理員權限。

**Q：之後開機會自動顯示命令窗口嗎？**
A：會在後台執行，但可能會簡短地閃現窗口。

**Q：能否完全隱藏啟動窗口？**
A：可以，但需要額外的 VBS 包裝器（已包含在 `launcher.vbs`）。

**Q：重啟頻率如何？**
A：通常只在電腦開機時執行一次。

**Q：服務損毀會自動重啟嗎？**
A：Windows 工作排程器不會，但服務本身有內部守護機制。

---

**版本**：2.0.0 | **更新時間**：2026-01-27 | **方式**：Windows 工作排程器
