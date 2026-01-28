# ⚡ 快速開始（5 分鐘版）

## 📌 只需 5 個步驟

### ✅ 1️⃣ 安裝 Node.js
```
訪問：https://nodejs.org/
下載 LTS 版本 → 一路 Next → 完成
```

### ✅ 2️⃣ 下載項目
```
方式 A：Git
$ git clone https://github.com/Aanzeng/playwright.git
$ cd playwright

方式 B：ZIP
下載 ZIP → 解壓 → 打開命令行進入目錄
```

### ✅ 3️⃣ 安裝依賴
```bash
npm install
```
（等待 3-10 分鐘）

### ✅ 4️⃣ 設置認證檔案
在項目目錄建立 `credentials-linepay.txt`：

```
fr,https://linepay.tw,account@email.com,password
nf,https://linepay.tw,account2@email.com,password2
```

### ✅ 5️⃣ 啟動服務
```bash
npm start
```

然後訪問：**http://localhost:3000**

---

## 🎯 常用命令速查

```bash
# 啟動服務
npm start

# 停止服務
Ctrl + C

# 查看服務日誌
npm start

# 檢查 Node 版本
node --version

# 重新安裝依賴
npm install
```

---

## ❌ 遇到問題？

| 問題 | 解決方案 |
|------|--------|
| 找不到 npm | 重裝 Node.js，並勾選「Add to PATH」|
| npm install 失敗 | 執行 `npm cache clean --force` 後重試 |
| 無法訪問 localhost:3000 | 確認服務已啟動（看命令行有無綠色 🚀） |
| Cyberbiz 登入失敗 | 檢查 credentials 檔案格式和帳密 |

---

## 📂 需要設定的檔案

把以下內容放到對應的 `.txt` 檔案：

### `credentials-linepay.txt`
```
店名,URL,帳號,密碼
shop1,https://linepay.tw,email1@example.com,pass123
shop2,https://linepay.tw,email2@example.com,pass456
```

### `credentials-cyberbiz.txt`
```
shopname,https://cyberbiz.com.tw,admin@shop.com,password123
```

---

## 🚀 就這樣！

1. 安裝完後，每次都只需：
   ```bash
   npm start
   ```

2. 打開 http://localhost:3000

3. 點擊按鈕執行任務

💡 **要自動開機啟動？**
右鍵執行 `enable-autostart-simple.bat` （需管理員）

---

## 📚 需要幫助？

- 詳細步驟 → 看 [FRESH_INSTALL_GUIDE.md](FRESH_INSTALL_GUIDE.md)
- 開機自動啟動 → 看 [AUTOSTART_SETUP.md](AUTOSTART_SETUP.md)
- Web 界面說明 → 看 [WEBUI_README.md](WEBUI_README.md)

---

**享受自動化！** 🎉
