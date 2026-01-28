# 🆕 新電腦安裝完整指南

## 📋 安裝前準備

在開始安裝前，確保你的電腦已安裝以下軟體：

### ✅ 必須安裝的軟體

1. **Node.js** （推薦 v18.0.0 或更新）
   - 下載：https://nodejs.org/
   - 選擇 LTS 版本
   - 安裝時勾選「Add to PATH」

2. **Git** （可選，但推薦）
   - 下載：https://git-scm.com/
   - 用於版本控制

### 驗證安裝

打開命令行，執行以下命令驗證：

```bash
node --version   # 應顯示 v18.x.x 或更新
npm --version    # 應顯示 8.x.x 或更新
```

---

## 📦 安裝步驟（共 5 步）

### 第 1 步：下載項目檔案

**方式 A：使用 Git（推薦）**
```bash
git clone https://github.com/Aanzeng/playwright.git
cd playwright
```

**方式 B：下載 ZIP 檔案**
1. 訪問 https://github.com/Aanzeng/playwright
2. 點擊「Code」→「Download ZIP」
3. 解壓至本地目錄
4. 打開命令行，進入該目錄

### 第 2 步：安裝依賴

在項目根目錄打開命令行，執行：

```bash
npm install
```

**耗時**：第一次通常需要 3-10 分鐘（取決於網速）

等待出現：
```
added XX packages in Xs
```

### 第 3 步：配置認證檔案

項目需要以下認證檔案（用於不同平台的登入）：

#### 檔案列表

- `credentials-cyberbiz.txt` - Cyberbiz 平台
- `credentials-linepay.txt` - LinePay 支付平台
- `credentials-shopee.txt` - Shopee 平台（可選）
- `credentials-jkos.txt` - 其他平台（可選）

#### 檔案格式

每個檔案格式均為：
```
店名,網址,帳號,密碼
```

**示例** (`credentials-cyberbiz.txt`)：
```
shop1,https://cyberbiz.com,user@email.com,password123
shop2,https://cyberbiz.com,user2@email.com,password456
```

**⚠️ 重要提示**：
- 每個帳號佔一行
- 逗號分隔（不要有空格）
- 密碼包含特殊字元時要特別注意
- 安全起見，不要上傳至公開 Git 倉庫

### 第 4 步：測試服務啟動

執行以下命令啟動 Web 服務器：

```bash
npm start
```

**預期輸出**：
```
🚀 服務器運行於 http://localhost:3000
可以透過網頁執行 run-Cyberbiz.js 和 run-linepay.js
```

**訪問網頁**：
- 打開瀏覽器
- 訪問 `http://localhost:3000`
- 應該看到中文介面，包含兩個按鈕

### 第 5 步：設定開機自動啟動（可選）

如果希望電腦開機時自動啟動服務：

#### Windows 系統（推薦）

1. **找到設定檔案**
   ```
   enable-autostart-simple.bat
   ```

2. **右鍵點擊** → **以系統管理員身份執行**

3. **等待設定完成** （5-10 秒）

4. **重啟電腦驗證**

#### macOS/Linux 系統

使用 PM2：
```bash
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

---

## ✨ 使用指南

### 啟動服務

**方式 1：命令行**
```bash
npm start
```

**方式 2：雙擊批處理檔案**
```
start-web.bat
```

### 訪問網頁

在瀏覽器中打開：
```
http://localhost:3000
```

### 執行任務

1. **Cyberbiz 訂單爬取**
   - 點擊「開始執行」按鈕
   - 狀態會顯示「執行中...」
   - 等待完成（通常 5-30 分鐘）

2. **LinePay 交易下載**
   - 點擊「開始執行」按鈕
   - 自動下載交易記錄到 `C:\trans\linepay\`

3. **停止任務**
   - 點擊「停止」按鈕隨時終止

---

## 📁 項目結構

```
playwright/
├── server.js              # Web 服務器主檔案
├── run-Cyberbiz.js        # Cyberbiz 爬蟲腳本
├── run-linepay.js         # LinePay 爬蟲腳本
├── public/
│   └── index.html         # 網頁前端界面
├── credentials-*.txt      # 認證檔案（需要配置）
├── start-web.bat          # 快速啟動（Windows）
├── enable-autostart-simple.bat  # 開機自動啟動設定
├── package.json           # 項目配置
├── logs/                  # 日誌目錄
└── README.md              # 原始說明文檔
```

---

## 🔧 常見問題

### Q1：安裝時提示找不到 Node.js

**解決方案**：
1. 確認已安裝 Node.js（https://nodejs.org/）
2. 重啟命令行或電腦
3. 執行 `node --version` 驗證

### Q2：npm install 失敗

**可能原因與解決方案**：
```bash
# 清空 npm 快取
npm cache clean --force

# 重新嘗試安裝
npm install

# 如果還是失敗，嘗試指定 registry
npm install --registry https://registry.npmmirror.com/
```

### Q3：無法訪問 http://localhost:3000

**檢查清單**：
1. 確認服務已啟動（看命令行有無 "🚀 服務器運行")
2. 檢查防火牆設定
3. 檢查端口是否被佔用：
   ```bash
   netstat -ano | findstr :3000
   ```
4. 嘗試訪問 `http://127.0.0.1:3000`

### Q4：run-Cyberbiz.js 執行失敗

**檢查項**：
1. 確認 `credentials-cyberbiz.txt` 已建立
2. 檢查帳號密碼是否正確
3. 查看瀏覽器控制台或命令行的錯誤訊息

### Q5：開機自動啟動未生效

**Windows 系統**：
1. 確認以管理員身份執行了 `enable-autostart-simple.bat`
2. 檢查工作排程器：
   ```bash
   schtasks /query /tn "AutomationWebServer"
   ```
3. 重啟電腦（完全重啟，不是睡眠模式）
4. 開機後等待 1-2 分鐘

---

## 🎯 安裝檢查清單

- [ ] Node.js 已安裝且版本正確（`node --version`）
- [ ] 項目檔案已下載到本地
- [ ] 執行了 `npm install` 且無錯誤
- [ ] 配置了認證檔案 (`credentials-*.txt`)
- [ ] 執行 `npm start` 能看到「🚀 服務器運行」
- [ ] 能訪問 `http://localhost:3000`
- [ ] 網頁能正常顯示中文介面
- [ ] （可選）設定了開機自動啟動

---

## 💻 系統需求

### 最低配置

- **作業系統**：Windows 7+, macOS 10.12+, Linux
- **Node.js**：v14.0.0 或更新
- **RAM**：2GB 以上
- **磁碟空間**：500MB 以上
- **網路連線**：必須（爬蟲需要訪問網站）

### 推薦配置

- **作業系統**：Windows 10/11, macOS 11+, 現代 Linux
- **Node.js**：v18.0.0 或更新
- **RAM**：4GB 以上
- **磁碟空間**：2GB 以上

---

## 📚 其他資源

- [完整說明文檔](WEBUI_README.md)
- [開機自動啟動指南](AUTOSTART_SETUP.md)
- [原始 README](README.md)

---

## 🚨 故障排除流程圖

```
遇到問題
  ↓
檢查 Node.js 是否已安裝
  ├─ 否 → 安裝 Node.js
  └─ 是 ↓
執行 npm install 是否成功
  ├─ 否 → npm cache clean && npm install --registry...
  └─ 是 ↓
執行 npm start 是否正常
  ├─ 否 → 檢查認證檔案
  └─ 是 ↓
能否訪問 http://localhost:3000
  ├─ 否 → 檢查防火牆，檢查端口佔用
  └─ 是 ↓
✅ 安裝成功！
```

---

## 📞 獲得幫助

如遇到問題：

1. **查看日誌**
   ```bash
   # 查看最新的命令行輸出
   # 找出具體的錯誤訊息
   ```

2. **參考其他指南**
   - [開機自動啟動指南](AUTOSTART_SETUP.md)
   - [Web 界面說明](WEBUI_README.md)

3. **提交 Issue**
   - 訪問 https://github.com/Aanzeng/playwright/issues
   - 詳細描述問題和錯誤訊息

---

**文檔版本**：1.0.0 | **最後更新**：2026-01-28 | **適用系統**：Windows / macOS / Linux
