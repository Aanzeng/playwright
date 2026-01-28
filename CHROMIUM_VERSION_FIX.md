# Chromium 版本相容性修復說明

## 問題描述
之前程式在執行時會尋找特定版本的 Chromium（例如 chromium-1200），但當系統只有 chromium-1208 時就會找不到，導致程式無法執行。

## 解決方案
已修改所有 run-*.js 檔案，加入 `findChromiumExecutable()` 函數，能夠：

1. **動態搜尋** - 自動在多個可能位置搜尋 Chromium
2. **版本無關** - 找到任何 `chromium-*` 資料夾
3. **智慧選擇** - 如果有多個版本，自動選擇最新版本
4. **向下相容** - 如果找不到，會使用 Playwright 預設設定

## 修改的檔案
- ✅ run-Cyberbiz.js
- ✅ run-linepay.js
- ✅ run-shopee.js
- ✅ run-ipasspay.js
- ✅ run-jkos.js
- ✅ run.js

## Chromium 搜尋位置（按順序）
1. `%LOCALAPPDATA%\ms-playwright` (Windows Playwright 預設安裝位置)
2. `%USERPROFILE%\.cache\ms-playwright` (備用快取位置)
3. `專案目錄\node_modules\@playwright\browser-chromium`
4. `上層目錄\node_modules\@playwright\browser-chromium`
5. `%APPDATA%\npm\node_modules\@playwright\browser-chromium` (全域安裝)

## 使用方式

### 在本地開發環境
無需任何修改，直接執行：
```bash
node run-Cyberbiz.js
```

### 在 Server 上部署

#### 選項 1：使用 Playwright 安裝 Chromium
```bash
# 進入專案目錄
cd playwright

# 安裝 Playwright 和 Chromium
npm install
npx playwright install chromium

# 執行程式（會自動找到安裝的 Chromium）
node run-Cyberbiz.js
```

#### 選項 2：手動指定 Chromium 路徑（進階）
如果需要使用特定的 Chromium，可以透過環境變數設定：

**Windows：**
```bash
set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=C:\path\to\chrome.exe
node run-Cyberbiz.js
```

**Linux/Mac：**
```bash
export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chrome
node run-Cyberbiz.js
```

## 執行時的輸出訊息

### 成功找到 Chromium
```
✓ 找到 Chromium: C:\Users\...\ms-playwright\chromium-1208\chrome-win\chrome.exe
```

### 使用預設設定
```
⚠ 未找到 Chromium 可執行檔，將使用 Playwright 預設設定
```
這不是錯誤！Playwright 會自動下載並使用預設的 Chromium。

## 故障排除

### 問題：仍然出現 "找不到 chromium" 錯誤
**解決方法：**
```bash
# 重新安裝 Playwright 瀏覽器
npx playwright install chromium --force
```

### 問題：執行緩慢或卡住
**可能原因：** Chromium 正在首次下載
**解決方法：** 等待下載完成（大約 100-200MB）

### 問題：權限錯誤
**解決方法：**
```bash
# 確保有權限存取 Chromium 安裝目錄
icacls "%LOCALAPPDATA%\ms-playwright" /grant %USERNAME%:F /T
```

## 技術細節

### findChromiumExecutable() 函數運作原理
1. 遍歷所有可能的安裝路徑
2. 在每個路徑中尋找 `chromium-*` 資料夾
3. 提取版本號並排序（降冪）
4. 檢查 `chrome-win\chrome.exe` 是否存在
5. 回傳第一個找到的有效路徑

### 版本號比較邏輯
```javascript
// chromium-1208 > chromium-1200 > chromium-1150
const version = parseInt(dirName.split('-')[1])
```

## 測試建議

### 本地測試
```bash
# 測試是否能正確找到 Chromium
node run-Cyberbiz.js
# 觀察開頭的輸出訊息
```

### Server 測試
```bash
# 1. 檢查 Chromium 是否已安裝
dir "%LOCALAPPDATA%\ms-playwright\chromium-*"

# 2. 如果沒有，安裝它
npx playwright install chromium

# 3. 執行程式
node run-Cyberbiz.js
```

## 更新日誌
- **2026-01-28**: 加入動態 Chromium 版本搜尋功能，解決版本硬編碼問題

## 注意事項
- ✅ 此修復向下相容，不會影響現有部署
- ✅ 不需要修改任何配置檔案
- ✅ 支援所有 Chromium 版本（1200、1208、1300 等）
- ✅ 自動選擇最新可用版本
